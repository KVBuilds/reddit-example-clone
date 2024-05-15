// API route encapsulates caching data logic such as popular posts and fetch quickly 

import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { CommentVoteValidator } from "@/lib/validators/vote"
import { z } from "zod"

export async function PATCH(req: Request) {
    try {
        const body = await req.json()

        const {commentId, voteType} = CommentVoteValidator.parse(body)

        // You need to be logged in -- this authenticates
        const session = await getAuthSession()

        if(!session?.user) {
            return new Response('Unauthorized', {status: 401})
        }
        

        // The Option to check for existing vote
        const existingVote = await db.commentVote.findFirst({
            where: {
                userId: session.user.id,
                commentId,
            },
        })

        // What to do if the vote handle already exists
        if(existingVote) {
            if(existingVote.type === voteType) {
                await db.commentVote.delete ({
                    where: {
                        userId_commentId: {
                            commentId,
                            userId: session.user.id,
                        },
                    },
                })
              return new Response('OK')
            } else {
                await db.commentVote.update ({
                    where: {
                        userId_commentId: {
                            commentId,
                            userId: session.user.id,
                        },
                    },
                    // Pass on data regarding changes
                    data: {
                        type: voteType,
                    },
                })
            }
            //Stop code execution afterwards
            return new Response('OK')
        }

        //If not existing vote
        await db.commentVote.create({
            data: {
                type: voteType,
                userId: session.user.id,
                commentId
            },
        })

  
        return new Response ('OK')
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, {status: 400 })
        }
        
        return new Response('Could not register your vote, please try again.', { status: 500})
    }
}