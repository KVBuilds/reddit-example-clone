'use client'

import { usePathname } from "next/navigation"
import { buttonVariants } from "./ui/Button"
import { ChevronLeft } from "lucide-react"

//Defines function to navigate to the feed or home page
const ToFeedButton = () => {
    const pathname = usePathname()

    const subredditPath = getSubredditPath(pathname)
    
    // Renders link styled as a button with dynamic text based  on current path
    return (
        <a href={subredditPath} className={buttonVariants({ variant: 'ghost'})}>
        <ChevronLeft className="h-4 w-4 mr-1" /> 
        {subredditPath === '/' ? 'Back home' : 'Back to community'}
        </a>
    )
}

    // Helps determine path to return based on current pathname
    const getSubredditPath = (pathname: string) => {
        const splitPath = pathname.split('/')

        if (splitPath.length === 3) return '/'
        else if (splitPath.length > 3) return `/${splitPath[1]}/${splitPath[2]}`

        else return '/'
    }

    export default ToFeedButton