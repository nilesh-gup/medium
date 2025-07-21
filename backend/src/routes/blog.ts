import { Hono } from 'hono'
import zod from 'zod'
import authMiddleware from '../middlewares/middleware'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

type Bindings = {
  DATABASE_URL: string
  JWT_SECRET: string
  SALT_TOKEN: string
}

type Variables = {
    userId: string
}

const blogRouter = new Hono<{ Bindings: Bindings, Variables: Variables }>()

const blogPostZodBody = zod.object({
    title: zod.string().min(1),
    content: zod.string().min(1)
})

blogRouter.post('/', authMiddleware, async (c) => {
    try {
        const { title, content } = await c.req.json()
        const blog = { title, content }

        if(!blogPostZodBody.safeParse(blog).success) {
            c.status(400)
            return c.json({ msg: 'Wrong inputs' })
        }

        const userId: string = c.get('userId')
        const prisma = new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate())
        const newBlog = await prisma.blog.create({
            data: {
                title,
                content,
                authorId: userId
            }
        })
        c.status(200)
        return c.json({
            title,
            blogId: newBlog.id
        })
    } catch(e) {
        c.status(500)
        return c.json({ msg: 'Something went wrong' })
    }
})

const blogUpdateZodBody = zod.object({
    blogId: zod.string(),
    title: zod.string().min(1),
    content: zod.string().min(1)
})

blogRouter.put('/', authMiddleware, async(c) => {
    try {
        const { blogId, title, content } = await c.req.json()
        const blog = { blogId, title, content }

        if(!blogUpdateZodBody.safeParse(blog).success) {
            c.status(400)
            return c.json({ msg: 'Wrong inputs' })
        }

        const userId: string = c.get('userId')
        const prisma = new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate())
        await prisma.blog.update({
            where: {
                id: blogId,
                authorId: userId
            },
            data: {
                title,
                content
            }
        })
        c.status(200)
        return c.json({
            title,
            content,
            blogId
        })
    } catch(e) {
        c.status(500)
        return c.json({ msg: 'Something went wrong' })
    }
})

blogRouter.get('/myblogs', authMiddleware, async(c) => {
    try {
        const userId: string = c.get('userId')
        const prisma = new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate())

        const allBlogs = await prisma.blog.findMany({
            where: {
                authorId: userId
            }
        })
        c.status(200)
        return c.json({
            blogs: allBlogs,
            userId
        })
    } catch(e) {
        c.status(500)
        return c.json({ msg: 'Something went wrong' })
    }
})

blogRouter.get('/otherblogs', authMiddleware, async(c) => {
    try {
        const userId: string = c.get('userId')
        const prisma = new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate())

        const allBlogs = await prisma.blog.findMany({
            where: {
                authorId: {
                    not: userId
                }
            },
            select: {
                id: true,
                title: true,
                content: true,
                published: true,
                author: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        })
        c.status(200)
        return c.json({
            blogs: allBlogs,
            userId
        })
    } catch(e) {
        c.status(500)
        return c.json({ msg: 'Something went wrong' })
    }
})

blogRouter.get('/:id', authMiddleware, async(c) => {
    try {
        const id = c.req.param('id')
        const prisma = new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate())
        const blog = await prisma.blog.findUnique({
            where: {
                id
            }
        })
        c.status(200)
        return c.json({
            blog
        })
    } catch(e) {
        c.status(500)
        return c.json({ msg: 'Something went wrong' })
    }
})

export default blogRouter