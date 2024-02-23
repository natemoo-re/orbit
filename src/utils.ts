import { db, eq, gt, lt, sql, desc } from 'astro:db'
import { Sites } from 'astro:db';

export function normalizeURL(value: string) {
    const url = new URL(value);
    return `${url.origin}${url.pathname.replace(/\/$/, '')}`;
}

export async function getMostRecentSite(): Promise<string> {
    const [{ url }] = await db.select({ url: Sites.url }).from(Sites).orderBy(desc(Sites.createdAt)).limit(1);
    return url;
}

export async function getOldestSite(): Promise<string> {
    const [{ url }] = await db.select({ url: Sites.url }).from(Sites).orderBy(asc(Sites.createdAt)).limit(1);
    return url;
}

export async function getSiteByURL(url: string) {
    const normalizedURL = normalizeURL(url);
    const [site] = await db.select({ createdAt: Sites.createdAt }).from(Sites).where(eq(Sites.url, normalizedURL)).limit(1);
    return site;
}

export async function getPreviousSite(url: string): Promise<string> {
    if (url === 'about:client' || !url) return getRandomSite();
    const { createdAt } = await getSiteByURL(url);
    const [{ url: previous } = { url: await getMostRecentSite() }] = await db.select({ url: Sites.url }).from(Sites).where(lt(Sites.createdAt, createdAt)).limit(1);
    return previous;
}

export async function getNextSite(url: string): Promise<string> {
    if (url === 'about:client' || !url) return getRandomSite();
    const { createdAt } = await getSiteByURL(url);
    const [{ url: next } = { url: await getOldestSite() }] = await db.select({ url: Sites.url }).from(Sites).where(gt(Sites.createdAt, createdAt)).limit(1);
    return next;
}

export async function getRandomSite(url?: string): Promise<string> {
    const [{ url: random }] = await db.select({ url: Sites.url }).from(Sites).where(url ? ne(Sites.url, url) : undefined).orderBy(sql`RANDOM()`).limit(1)
    return random;
}
