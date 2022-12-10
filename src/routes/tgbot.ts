import { talkToGPT } from '../application/talkToGPT'
import { sendTelegramMessage } from '../application/sendTGMsg'
import { Message, Update } from 'telegram-typings'

export async function handleTgBotWebhookPOST(req: Request, env: Env) {
  const update: Update = await req.json()
  const entities = update.message?.entities
  const maybeAskEntity = entities?.[0]

  const isAsk =
    maybeAskEntity?.type === 'bot_command'
      ? update.message?.text?.substring(
          maybeAskEntity.offset,
          maybeAskEntity.length
        ) === '/ask'
      : false

  const isFollowUp = update.message?.reply_to_message?.message_id !== undefined

  const msg = update.message

  if ((!isAsk && !isFollowUp) || !msg) {
    return new Response('true')
  }

  const maybeReplyToTgMsgID = msg.reply_to_message?.message_id
  let maybeGPTParentMsgIDAndConversationID: string | null = null
  if (maybeReplyToTgMsgID !== undefined) {
    maybeGPTParentMsgIDAndConversationID = await env.KV_STORE.get(
      `tg-gpt-dialog/${msg.chat.id}/${maybeReplyToTgMsgID}`
    )
  }
  const [parentMsgID, conversationID] =
    maybeGPTParentMsgIDAndConversationID?.split('/') ?? ''

  const userMsg = isAsk ? msg.text?.substring(4).trim() : msg.text?.trim()
  if (!userMsg) {
    return new Response('true')
  }

  const {
    answer,
    message_id: gptRspID,
    error,
    conversation_id: gptConversationID,
  } = await talkToGPT({
    q: userMsg,
    env,
    parentMsgID,
    conversationID,
  })

  const finalResponse = answer ?? `GPT API Error, status: ${error}`
  const res = await sendTelegramMessage({
    chat_id: msg.chat.id,
    reply_to_message_id: msg.message_id,
    text: `${!isFollowUp ? '🟢' : '🧵'} ${finalResponse}`,
    botToken: env.TG_BOT_TOKEN,
  })

  const tgData: { result?: Message } = await res.json()
  const maybeTgMsgID = tgData.result?.message_id

  if (gptRspID && maybeTgMsgID) {
    await env.KV_STORE.put(
      `tg-gpt-dialog/${msg.chat.id}/${maybeTgMsgID}`,
      `${gptRspID}/${gptConversationID}`,
      { expirationTtl: 3600 * 24 * 30 }
    )
  }

  return new Response('true')
}
