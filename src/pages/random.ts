import type { APIRoute } from "astro"
import { getRandomSite } from "../utils";

export const GET: APIRoute = async (context) => {
    const url = await getRandomSite(context.request.referrer);
    return context.redirect(url);
}
