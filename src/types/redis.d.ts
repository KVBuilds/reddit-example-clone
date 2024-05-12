import { Vote, VoteType } from '@prisma/client'


// Identifies what items to cache from the post
export type CachedPost = {
    id: string 
    title: string 
    authorUsername: string 
    content: string 
    currentVote: VoteType | null // from prisma client
    createdAt: Date
}