import { ChatGPTService } from '../service/ChatGPTService'

export async function talkToGPT(input: {
  q: string
  env: Env
  parentMsgID?: string
  conversationID?: string
}) {
  let accessToken = await input.env.KV_STORE.get('gpt-token')

  if (!accessToken) {
    const tokenObject = await ChatGPTService.fetchAccessToken(
      input.env.CHAT_GPT_COOKIE
    )

    accessToken = tokenObject.accessToken as string
    await input.env.KV_STORE.put('gpt-token', accessToken, {
      expiration: new Date(tokenObject.expires).getTime() / 1000,
    })
  }

  return ChatGPTService.getAnswer({
    q: input.q,
    parentMsgID: input.parentMsgID,
    accessToken,
    conversationID: input.conversationID,
  })
}
