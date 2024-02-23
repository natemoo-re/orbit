import type { APIRoute } from "astro"
import { getNextSite } from "../utils";

export const GET: APIRoute = async (context) => {
    console.log(context.request.referrer, context.request.referrerPolicy)
    const url = await getNextSite(context.request.referrer);
    return context.redirect(url);
}
