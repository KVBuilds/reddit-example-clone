import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { PostValidator } from "@/lib/validators/post"
import { z } from "zod"

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if (!session?.user) {
            return new Response('Unauthorized', {status: 401})
        }
        const body = await req.json()
        const {subredditId, title, content} = PostValidator.parse(body)

        const subscription = await db.subscription.findFirst ({   
            where: {
                subredditId, 
                userId: session.user.id,
            },
        })

        // Checks if there is no subscription
        if(!subscription){             
            return new Response ('Subscribe to post.', {status: 403,})
        }

        await db.post.create({
            data:{
                title,
                content,
                authorId: session.user.id,
                subredditId,
            },
        })

        return new Response('OK')
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, {status: 400 })
        }
        
        return new Response('Could not post to subreddit at this time, please try again later.', { status: 500})
    }
}