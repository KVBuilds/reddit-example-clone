import { db } from "@/lib/db"

export async function GET(req: Request) {
    const url = new URL(req.url)
    const q = url.searchParams.get('q')

    if (!q) return new Response('Invalid query', { status: 400})

        //Fetches results
        const results = await db.subreddit.findMany({
            where: {
                name: {
                    startsWith: q,  //Want to display subreddits that match the user query.
                },
            },
            include:{
                _count: true,       // Supports pagination 
            },
            take: 5,
        })

        return new Response(JSON.stringify(results))
}