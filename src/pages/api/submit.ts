import type { APIRoute } from "astro";
import { db, sites } from "astro:db";
import { getSiteByURL, normalizeURL } from "../../utils.ts";
import { parse } from 'ultrahtml';
import { querySelector } from "ultrahtml/selector";

const MIME_JSON = 'application/json';
export const POST: APIRoute = async (context) => {
    const accept = context.request.headers.get('accept');
    const isJsonRequest = accept?.split(/[,;]/g).includes(MIME_JSON);

    const formData = await context.request.formData();
    const values = Object.fromEntries(formData.entries())

    let errors: Record<string, string> = {}
    try {
        errors = await validateFromValues(values);
    } catch {}

    const success = Object.keys(errors).length === 0;
    const status = success ? 200 : 400;
    if (success) {
        try {
            await db.insert(sites).values({
                url: normalizeURL(values.url as string),
            })
        } catch (e) {
            if (isJsonRequest) {
                return Response.json({ success: false, errors: {} }, { status: 500 });
            } else {
                context.cookies.set('form', { s: false, v: values.url, e: {} })
                return context.redirect('/');
            }
        }
    }

    if (isJsonRequest) {
        return Response.json({ success, errors }, { status })
    } else {
        if (success) {
            context.cookies.set('form', { s: true }, { path: '/' });
        } else {
            context.cookies.set('form', { s: false, v: values.url, e: errors }, { path: '/' });
        }
        return context.redirect('/');
    }
}

function isValidURL(value: string) {
    try {
        const url = new URL(value);
        if (!url.protocol.startsWith('https')) return false;
        return true;
    } catch (e) {
        return false;
    }
}

export async function validateFromValues(values: Record<string, any>): Promise<Record<string, string>> {
    if (!values.url || !isValidURL(values.url)) {
        return { url: 'Please enter a valid URL starting with https://' }
    }
    const existing = await getSiteByURL(values.url);
    if (!!existing?.createdAt) {
        return { url: 'Looks like this URL is already part of our system!' }
    }
    const res = await fetch(values.url);
    if (!res.ok) {
        return { url: 'This URL could not be accessed. Please enter a public URL!' }
    }
    if (!res.headers.get('content-type')?.includes('text/html')) {
        return { url: 'This URL does not appear to be an HTML page.' }
    }
    const html = await res.text();
    const doc = await parse(html);
    const node = querySelector(doc, 'meta[name="generator"]');
    if (!node) {
        return { url: 'This URL does not include a <meta name="generator" content="Astro"> tag.' }
    }
    const generator = node.attributes.content;
    if (!generator.startsWith('Astro')) {
        return { url: 'This URL does not include a <meta name="generator" content="Astro"> tag.' }
    }

    return {}
}
