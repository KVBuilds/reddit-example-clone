"use client"

import { FC, startTransition } from 'react'
import { Button } from './ui/Button'
import { SubscribeToSubredditPayload } from '@/lib/validators/subreddit'
import axios, { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useCustomToast } from '@/hooks/use-custom-toast'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface SubscribeLeaveToggle{
    subredditId: string
    subredditName: string
    isSubscribed: boolean 
} 

const SubscribeLeaveToggle: FC<SubscribeLeaveToggle> = ({subredditId, isSubscribed, subredditName,}) => {

    const { loginToast } = useCustomToast()
    const router = useRouter()

    const {mutate: subscribe, isLoading: isSubloading} = useMutation({
        mutationFn: async () => {
            const payload: SubscribeToSubredditPayload = {
                subredditId,
            }
            
            const {data} = await axios.post('/api/subreddit/subscribe', payload)
            return data as string
        },
        // Error handling
        onError: (err) => {
            if(err instanceof AxiosError) {
                if(err.response?.status ===401) {
                    return loginToast()
                }
            }

            return toast({
                title: 'There was a problem.',
                description: 'Something went wrong.',
                variant: 'destructive',
            })
        },
        // Logic around if subscription is successful.
        onSuccess: () => {
            startTransition(() => {
                router.refresh()
            })
            return toast({
                title: 'Subscribed',
                description: `You are now subscribed to /r${subredditName}`,
            })
        },
    })

    // Logic for Unsubscribing 
    const {mutate: unsubscribe, isLoading: isUnsubloading} = useMutation({
        mutationFn: async () => {
            const payload: SubscribeToSubredditPayload = {
                subredditId,
            }
            
            const {data} = await axios.post('/api/subreddit/ubsubscribe', payload)
            return data as string
        },
        
        onError: (err) => {
            if(err instanceof AxiosError) {
                if(err.response?.status ===401) {
                    return loginToast()
                }
            }

            return toast({
                title: 'There was a problem.',
                description: 'Something went wrong.',
                variant: 'destructive',
            })
        },
        // Logic around if subscription is successful.
        onSuccess: () => {
            startTransition(() => {
                router.refresh()
            })
            return toast({
                title: 'Unsubscribed',
                description: `You are now unsubscribed from r/${subredditName}`,
            })
        },
    })

    return isSubscribed ? (
    <Button onClick={() => unsubscribe()} isLoading={isUnsubloading} className='w-full mt-1 mb-4'>Leave Community</Button>
    ) : (
    <Button isLoading={isSubloading} onClick={() => subscribe()} className='w-full mt-1 mb-4'>Join Community</Button>
)
}

export default SubscribeLeaveToggle