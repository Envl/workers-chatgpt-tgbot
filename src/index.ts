/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { handleTgBotWebhookPOST } from './routes/tgbot'

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname

    if (pathname.startsWith('/tgbot')) {
      return handleTgBotWebhookPOST(request, env)
    }

    return new Response('Hello World!')
  },
}
