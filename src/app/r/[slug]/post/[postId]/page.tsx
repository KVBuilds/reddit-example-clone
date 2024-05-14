//Shows the details of the post for each of them
import CommentsSection from '@/components/CommentsSection'
import EditorOutput from '@/components/EditorOutput'
import PostVoteServer from '@/components/post-vote/PostVoteServer'
import { buttonVariants } from '@/components/ui/Button'
import { db } from '@/lib/db'
import { redis } from '@/lib/redis'
import { formatTimeToNow } from '@/lib/utils'
import { CachedPost } from '@/types/redis'
import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Suspense } from 'react' 
import { Post, User, Vote } from '@prisma/client'

interface SubRedditPostPageProps {
    params: {
    postId: string
    }
}
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'  // Hard loads information associated with the post.

const SubRedditPostPage = async ({params}: SubRedditPostPageProps) => {
    const cachedPost = await redis.hgetall(`post:${params.postId}`) as CachedPost

    let post: (Post & { votes: Vote[]; author: User }) | null = null

    // Conditional check to gain necessary information for the post.
        if (!cachedPost) {
            post = await db.post.findFirst({
            where: {
            id: params.postId,
            },
            include: {
            votes: true,
            author: true,
            },
        })
    }

    if(!post && !cachedPost) return notFound()

    return  (
    <div>
        <div className='h-full flex flex-col sm:flex-row items-center sm:items-start justify-between'>
            <Suspense fallback={<PostVoteShell />}>
                {/* @ts-expect-error server component */}
                <PostVoteServer postId={post?.id ?? cachedPost.id} getData={async () => {
                    return await db.post.findUnique({
                        where: {
                           id: params.postId,
                        },
                        include: {
                            votes: true,
                        },
                    })
                }} />
            </Suspense>

                <div className='sm:w-0 w-full flex-1 bg-white p-4 rounded-sm'>
                    <p className='max-h-40 mt-1 truncate text-xs text-gray-500'>
                        Posted By u/{post?.author.username ?? cachedPost.authorUsername}{' '}
                        {formatTimeToNow(new Date(post?.createdAt ?? cachedPost.createdAt))}
                    </p>
                    <h1 className='text-xl font-semibold py-2 leading-6 text-gray-900'>
                        {post?.title ?? cachedPost.title}
                    </h1>
                    <EditorOutput content={post?.content ?? cachedPost.content} /> 
                    <Suspense fallback={<Loader2 className='h-5 w-5 animate-spin text-zinc-500' />}>
                        {/* @ts-expect-error server component */}
                    <CommentsSection postId={post?.id ?? cachedPost.id} />    
                    </Suspense>
                </div>
        </div>
    </div>
)}
    function PostVoteShell() {
        return (
        <div className='flex item-center flex-col pr-6 w-20'>
            {/* Upvotes button */}
            <div className={buttonVariants({ variant: 'ghost' })}>
            <ArrowBigUp className='h-5 w-5 text-zinc-700' />
            </div>

            {/* Current score amount */}
            <div className='text-center py-2 font-medium text-sm text-zinc-900'>
                <Loader2 className='h-3 w-3 animate-spin' /> 
            </div>

            {/* Downvotes button */}
            <div className={buttonVariants({ variant: 'ghost' })}>
            <ArrowBigDown className='h-5 w-5 text-zinc-700' />
            </div>

        </div>
    )
}

export default SubRedditPostPage