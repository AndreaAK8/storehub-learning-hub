// Lark Bot API client for sending notifications
// Uses Internal App (Bot) credentials to send messages to chats

const LARK_APP_ID = process.env.LARK_APP_ID!
const LARK_APP_SECRET = process.env.LARK_APP_SECRET!

// Chat IDs
export const LARK_CHAT_ANDREA = process.env.LARK_CHAT_ANDREA! // Andrea's bot chat
export const LARK_CHAT_GROUP = process.env.LARK_CHAT_GROUP!   // Training notifications group

interface TenantTokenResponse {
  code: number
  msg: string
  tenant_access_token: string
  expire: number
}

interface SendMessageResponse {
  code: number
  msg: string
  data?: {
    message_id: string
  }
}

// Cache the tenant token to avoid fetching it on every message
let cachedToken: { token: string; expiresAt: number } | null = null

/**
 * Get a tenant access token for the Lark Bot.
 * Tokens are cached and auto-refreshed 5 minutes before expiry.
 */
export async function getTenantToken(): Promise<string> {
  // Return cached token if still valid (with 5-min buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 5 * 60 * 1000) {
    return cachedToken.token
  }

  const response = await fetch(
    'https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: LARK_APP_ID,
        app_secret: LARK_APP_SECRET,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Lark auth failed: ${response.status} ${response.statusText}`)
  }

  const data: TenantTokenResponse = await response.json()

  if (data.code !== 0) {
    throw new Error(`Lark auth error: ${data.code} ${data.msg}`)
  }

  cachedToken = {
    token: data.tenant_access_token,
    expiresAt: Date.now() + data.expire * 1000,
  }

  return cachedToken.token
}

/**
 * Send a text message to a Lark chat.
 * @param chatId - The chat_id (oc_xxx) to send to
 * @param text - Plain text message content
 */
export async function sendMessage(
  chatId: string,
  text: string
): Promise<SendMessageResponse> {
  const token = await getTenantToken()

  const response = await fetch(
    'https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=chat_id',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        receive_id: chatId,
        msg_type: 'text',
        content: JSON.stringify({ text }),
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Lark send message failed: ${response.status} ${errorText}`)
  }

  const data: SendMessageResponse = await response.json()

  if (data.code !== 0) {
    throw new Error(`Lark message error: ${data.code} ${data.msg}`)
  }

  return data
}

/**
 * Send messages to both Andrea's bot chat and the group chat.
 * Useful for important notifications that need both visibility.
 */
export async function sendToAndreaAndGroup(text: string): Promise<void> {
  const results = await Promise.allSettled([
    sendMessage(LARK_CHAT_ANDREA, text),
    sendMessage(LARK_CHAT_GROUP, text),
  ])

  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('Lark message failed:', result.reason)
    }
  }
}
