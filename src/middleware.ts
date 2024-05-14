import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

//Handles incoming requests with attemp to retrieve JWT token.
export async function middleware(req: NextRequest) {
    const token = await getToken({req})

    if (!token) {
        return NextResponse.redirect(new URL('/sign-in', req.nextUrl))
    }
}
//Defines specific routes that the middleware will handle.
export const config = {
    matcher: ['/r/:path*/submit', '/r/create/'],
}