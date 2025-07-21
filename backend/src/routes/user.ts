import { Hono } from 'hono'
import zod from 'zod'
import { sign } from 'hono/jwt'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import authMiddleware from '../middlewares/middleware'

type Bindings = {
  DATABASE_URL: string
  JWT_SECRET: string
  SALT_TOKEN: string
}

type Variables = {
    userId: string
}

const userRouter = new Hono<{ Bindings: Bindings, Variables: Variables }>()

async function hashPassword(password: string, salt: string) {
    const hash = new TextEncoder().encode(`${salt}+${password}`)
    const hashBuffer = await crypto.subtle.digest({ name: 'SHA-256' }, hash)

    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((bytes) => bytes.toString(16).padStart(2, '0')).join('')
}

const isUsernameAndEmailAvailable = async (username: string, email: string, DATABASE_URL: string) => {
    const prisma = new PrismaClient({ datasourceUrl: DATABASE_URL }).$extends(withAccelerate())
    const userAva = await prisma.user.findUnique({
        where: {
            username
        }
    })

    const emailAva = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if(userAva != null || emailAva != null) {
        return false
    }
    return true
}

const signUpZodBody = zod.object({
    username: zod.string().min(3).max(30),
    email: zod.string().email(),
    name: zod.string().optional(),
    password: zod.string().min(8)
})

userRouter.post('/signup', async (c) => {
    try {
        const { username, email, name, password } = await c.req.json()
        const user = { username, email, name, password }

        if(!signUpZodBody.safeParse(user).success) {
            c.status(400)
            return c.json({ msg: 'Wrong inputs' })
        }
        
        const isAvailable = await isUsernameAndEmailAvailable(username, email, c.env.DATABASE_URL)
        if(!isAvailable) {
            c.status(409)
            return c.json({ msg: 'Username or email not available' })
        }
        
        const hashedPassword = await hashPassword(password, c.env.SALT_TOKEN)
        const prisma = new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate())
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                name: name == '' ? null : name,
                password: hashedPassword
            },
            select: {
                id: true
            }
        })

        const token = await sign({ userId: newUser.id }, c.env.JWT_SECRET)
        c.status(200)
        return c.json({
            msg: 'Signed up successfully',
            token
        })
    } catch(e) {
        c.status(500)
        return c.json({ msg: 'Something went wrong' })
    }
})

const signInZodBody = zod.object({
    email: zod.string().email(),
    password: zod.string()
})

userRouter.post('/signin', async (c) => {
    try {
        const { email, password } = await c.req.json()
        const credentials = { email, password }
        
        if(!signInZodBody.safeParse(credentials).success) {
            c.status(400)
            return c.json({ msg: 'Wrong inputs' })
        }

        const hashedPassword = await hashPassword(password, c.env.SALT_TOKEN)
        const prisma = new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate())
        
        const user = await prisma.user.findUnique({
            where: {
                email,
                password: hashedPassword
            },
            select: {
                id: true
            }
        })

        if(user == null) {
            c.status(401)
            return c.json({ msg: 'Email or password incorrect' })
        }

        const token = await sign({ userId: user.id }, c.env.JWT_SECRET)
        c.status(200)
        return c.json({
            msg: 'Signed in successfully',
            token
        })
    } catch(e) {
        c.status(500)
        return c.json({ msg: 'Something went wrong' })
    }
})

userRouter.get('/me', authMiddleware, async(c) => {
    try {
        const userId: string = c.get('userId')
        const prisma = new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate())
        const me = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        c.status(200)
        return c.json({ user: me })
    } catch(e) {
        c.status(500)
        return c.json({ msg: 'Something went wrong' })
    }
})

export default userRouter