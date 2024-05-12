import { z } from "zod"

// Validates Comment engaement to enforce the correct payload 
export const CommentValidator = z.object ({
    postId: z.string(),
    text: z.string(),
    replyToId: z.string().optional(),
})

export type CommentRequest = z.infer<typeof CommentValidator>