import type { APIRoute } from "astro"
import { getPreviousSite } from "../utils";

export const GET: APIRoute = async (context) => {
    const url = await getPreviousSite(context.request.referrer);
    return context.redirect(url);
}
