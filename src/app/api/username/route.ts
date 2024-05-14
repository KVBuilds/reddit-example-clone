import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { UsernameValidator } from "@/lib/validators/username"
import { z } from "zod"

export async function PATCH(req: Request) {
    try {
        //Checks if user is logged in.
        const session = await getAuthSession()

        if(!session?.user) {
            return new Response('Unauthorized', {status: 401})
        }
        const body = await req.json()

        //Validates incoming data
        const { name } = UsernameValidator.parse(body)

        //Checks if username is taken before assigning to new user.
         const username = await db.user.findFirst({
            where: {
                username: name,
            },
         })
         
         if(username) {
            return new Response('Username is taken', {status: 409})
         }

         //Let's the username get updated. 
         await db.user.update({
            where: {
                id: session.user.id,
            }, 
            data: {
                username: name,
            },
         })
         return new Response('OK')

    } catch (error) {
        (error)
       
        if (error instanceof z.ZodError) {
            return new Response('Invalid request data passed.', {status: 400})
        }

        return new Response(
            'Could not update username. Please try again layter.',
            {status: 500,
            }
        )
    }
} 