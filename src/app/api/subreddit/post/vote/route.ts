// API route encapsulates caching data logic such as popular posts and fetch quickly 

import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { redis } from "@/lib/redis"
import { PostVoteValidator } from "@/lib/validators/vote"
import type { CachedPost } from "@/types/redis" 
import { z } from "zod"

const CACHE_AFTER_UPVOTES = 1

export async function PATCH(req: Request) {
    try {
        const body = await req.json()

        const {postId, voteType} = PostVoteValidator.parse(body)

        const session = await getAuthSession()

        if(!session?.user) {
            return new Response('Unauthorized', {status: 401})
        }
        

        // The Option to change and remove vote
        const existingVote = await db.vote.findFirst({
            where: {
                userId: session.user.id,
                postId,
            },
        })

        const post = await db.post.findUnique({
            where: {
                id: postId
            },
            include: {
                author: true, 
                votes: true,
            },
        })

        if(!post) {
            return new Response('Post not found', {status: 404})
        }

        // What to do if the vote handle already exists
        if(existingVote) {
            if(existingVote.type === voteType) {
                await db.vote.delete ({
                    where: {
                        userId_postId: {
                            postId,
                            userId: session.user.id,
                        },
                    },
                })
              return new Response('OK')
            }
            await db.vote.update ({
                where: {
                    userId_postId: {
                        postId,
                        userId: session.user.id,
                    },
                },
                // Pass on data regarding changes
                data: {
                    type: voteType,
                },
            })

            //Recounting overall votes + the payload you want to store in Reddis
            const votesAmt = post.votes.reduce((acc, vote) => {
                if(vote.type === 'UP') return acc + 1
                if(vote.type === 'DOWN') return acc -1
                return acc
            }, 0)

            if (votesAmt >= CACHE_AFTER_UPVOTES) {
                const cachePayload: CachedPost = {
                authorUsername: post.author.username ?? '',
                content: JSON.stringify(post.content),
                id: post.id,
                title: post.title,
                currentVote: voteType,
                createdAt: post.createdAt,
                }

            await redis.hset(`post:${postId}`, cachePayload)
            }
            return new Response('OK')
        }

        //If not existing vote
        await db.vote.create({
            data: {
                type: voteType,
                userId: session.user.id,
                postId
            },
        })

        //Recounting overall votes + the payload you want to store in Reddis
        const votesAmt = post.votes.reduce((acc, vote) => {
            if(vote.type === 'UP') return acc + 1
            if(vote.type === 'DOWN') return acc -1
            return acc
        }, 0)

        if (votesAmt >= CACHE_AFTER_UPVOTES) {
            const cachePayload: CachedPost = {
            authorUsername: post.author.username ?? '',
            content: JSON.stringify(post.content),
            id: post.id,
            title: post.title,
            currentVote: voteType,
            createdAt: post.createdAt,
            }
            await redis.hset(`post:${postId}`, cachePayload)
        }
        return new Response ('OK')
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid POST request data passed', {status: 422 })
        }
        
        return new Response('Could not register your vote, please try again.', { status: 500})
    }
}