import axios from "axios"

// Getting an href to access, then fetch/ get the meta and return to the client
export async function GET(req: Request) {
    const url = new URL(req.url)
    const href = url.searchParams.get('url')

    if(!href) {
        return new Response('Invalid href', {status: 400})
    }

    const res = await axios.get(href)

    // Getting metadata created 
    //Matching what's in the title and serve back to the client
    const titleMatch = res.data.match(/<title>(.*?)<\/title>/)
    const title = titleMatch ? titleMatch[1] : ''

    //Description match
    const descriptionMatch = res.data.match(/<meta name="description" content="(.*?)"/)

    const description = descriptionMatch ? descriptionMatch[1] : ''

    // Matching the Image 
    const imageMatch = res.data.match(/<meta property="og:image" content="(.*?)" /)
    const imageUrl = imageMatch ? imageMatch[1] : ''

    //Send back in specific format in expected form 
    return new Response(
            JSON.stringify({
                success: 1, 
                meta: {
                    title, 
                    description, 
                    image: {
                        url: imageUrl,
                    },
                },
            })
    )
}