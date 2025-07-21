import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'

const authMiddleware = createMiddleware(async (c, next) => {
    try {
        const auth = c.req.header('Authorization')
        if(!auth || !auth.startsWith('Bearer')) {
            c.status(403)
            return c.json({ msg: 'Unauthorized/Forbidden' })
        }

        const token = auth.split(' ')[1]
        const { userId } = await verify(token, c.env.JWT_SECRET)
        c.set('userId', userId)     
        await next()
    } catch(e) {
        c.status(403)
        return c.json({ msg: 'Unauthorized/Forbidden' })
    }
})

export default authMiddleware