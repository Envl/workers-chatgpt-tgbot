export async function sendTelegramMessage(input: {
  chat_id: number
  reply_to_message_id: number
  text: string
  botToken: string
}) {
  return fetch(`https://api.telegram.org/bot${input.botToken}/sendMessage?chat_id=${input.chat_id}&text=${input.text}&reply_to_message_id=${input.reply_to_message_id}
`)
}
