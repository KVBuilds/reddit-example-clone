"use client"

import { ExtendedPost } from '@/types/db'
import { FC, useEffect, useRef } from 'react'
import { useIntersection } from '@mantine/hooks'
import { useInfiniteQuery } from '@tanstack/react-query'
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from '@/config'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import Post from './Post'


interface PostFeedProps {
    initialPosts: ExtendedPost[]
    subredditName?: string
}

const PostFeed: FC<PostFeedProps> = ({initialPosts, subredditName}) => {

    const lastPostRef = useRef<HTMLElement>(null) //Domino refernce to last post on the screen
    const {ref, entry} = useIntersection({
        root: lastPostRef.current,
        threshold: 1
    })

    //Fetch session client-side 
    const {data: session} = useSession()


    // Infinite scrolling functionality
    const {data, fetchNextPage, isFetchingNextPage} = useInfiniteQuery(
        ['infinite-query'],
        async({pageParam = 1}) => {
            //Defining the endpoint that pulls additional posts
            const query = `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}` +
        (!!subredditName ? `&subredditName=${subredditName}` : '')

        const {data} = await axios.get(query)
        return data as ExtendedPost[]
        }, {
            getNextPageParam: (_, pages) => {
                return pages.length + 1
            },
            //Pass initial posts 
            initialData: {pages: [initialPosts], pageParams: [1]}
        }
    )
        //Check if they are currently intersecting with the last post then gets more posts
        useEffect(() => {
            if(entry?.isIntersecting) {
                fetchNextPage()
            }
        }, [entry, fetchNextPage])


        //Determines on the posts to display.
        const posts = data?.pages.flatMap((page) => page) ?? initialPosts

    return ( <ul className='flex flex-col col-span-2 space-y-6'>
        {posts.map((post, index) => {
            //Determines how many votes each post has. 
            const votesAmt = post.votes.reduce((acc, vote) => {
                if(vote.type === 'UP') return acc + 1
                if(vote.type === 'DOWN') return acc - 1
                return acc
            }, 0)

            const currentVote = post.votes.find((vote) => vote.userId === session?.user.id) 

           if(index === posts.length - 1) {
            return (
                <li key={post.id} ref={ref}>
                    <Post
                    currentVote={currentVote}
                    votesAmt={votesAmt}
                    commentAmt={post.comments.length} post={post} subredditName={post.subreddit.name}/>
                </li>
            )
           } else {
                return 
                (  
                <Post 
                key={post.id}
                currentVote={currentVote}
                votesAmt={votesAmt}
                commentAmt={post.comments.length} post={post} subredditName={post.subreddit.name}
                />
         )
        }
        })}
    </ul>
    )
}

export default PostFeed