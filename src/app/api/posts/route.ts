import { getAuthSession } from "@/lib/auth"
import { z } from "zod"

export async function GET(req: Request) {
    const url = new URL(req.url)

    const session = await getAuthSession()

    //Determines the communities they are following.
    let followedCommunitiesIds: string[] = []

    if (session) {
        const followedCommunities = await db.subscription.findMay({
            where: {
                userId: session.user.id,
            },
            include: {
                subreddit: true, 
            },
        })
        //Entire communitites 
        followedCommunitiesIds = followedCommunities.map(({ subreddit }) => subreddit.id
        )
    }

    // See if they are logged in or logged out
    try {
        const { limit, page, subredditName } =  z.object({
            limit: z.string(),
            page: z.string(),
            subredditName: z.string().nullish().optional(),
        }).parse({
            subredditName: url.searchParams.get('subredditName'),
            lmiit: url.searchParams.get('limit'),
            page: url.searchParams.get('page'),
        })

        // Conditional request to Prisma
        let whereClause = {}

            if(subredditName) {
                whereClause = {
                    subreddit: {
                        name: subredditName,
                    },
                }
            } else if (session) {
                whereClause = {
                    subreddit: {
                        id: {
                            in: followedCommunitiesIds,
                        },
                    },
                }
            }

            // Data fetching logic for infinite scrolling on posts
            const posts = await db.post.findMany ({
                take: parseInt(limit), 
                skip: (parseInt(page) - 1) * parseInt(limit), //Giving back post that are already not shown on the page
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    subreddit: true, 
                    votes: true, 
                    author: true, 
                    comments: true, 
                },
                where: whereClause,
            })
            return new Response(JSON.stringify(posts))
        } catch (error) {
                if (error instanceof z.ZodError) {
                    return new Response ('Invalide request data passed.', {status: 422})
                }

                return new Response(
                    'Could not fetch posts.', {
                        status: 500,
                    })
        }
}