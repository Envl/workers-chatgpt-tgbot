const apiURL = 'https://chat.openai.com/backend-api/conversation'

async function getAnswer(input: {
  q: string
  accessToken: string
  parentMsgID?: string
  conversationID?: string
}) {
  const parent_message_id = input.parentMsgID ?? crypto.randomUUID()

  const res = await fetch(apiURL, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.accessToken}`,
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      accept: 'text/event-stream',
    },
    method: 'POST',
    body: JSON.stringify({
      action: 'next',
      messages: [
        {
          id: crypto.randomUUID(),
          role: 'user',
          content: {
            content_type: 'text',
            parts: [input.q],
          },
        },
      ],
      parent_message_id,
      model: 'text-davinci-002-render',
      conversation_id: input.conversationID,
    }),
  })

  if (!res.ok) {
    return {
      error: res.statusText,
    }
  }

  const jsonStr = (await res.text())
    .split('\n')
    .filter(str => str)
    .reduce((longest, cur) => (cur.length > longest.length ? cur : longest), '')
    .substring(5)

  const data: {
    message?: {
      id: string
      role: 'assistant'
      content: { content_type: 'text'; parts: string[] }
    }
    conversation_id: string
  } = JSON.parse(jsonStr.trim())

  return {
    answer: data?.message?.content.parts?.[0],
    message_id: data?.message?.id,
    conversation_id: data.conversation_id,
  }
}

async function fetchAccessToken(cookie: string) {
  const res = await fetch('https://chat.openai.com/api/auth/session', {
    headers: {
      cookie,
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    },
  })

  return (await res.json()) as {
    expires: string
    accessToken: string
    error?: string
  }
}

export const ChatGPTService = { getAnswer, fetchAccessToken }
