import crypto from 'node:crypto'
import { normalizeStoreUrl } from './tokenStore.js'

const PENDING_TTL_MS = 10 * 60 * 1000 // 10 phút — đủ thời gian người dùng duyệt quyền trên Sapo.

interface PendingConnect {
  store: string
  createdAt: number
}

/**
 * Lưu tạm state OAuth đang chờ duyệt — CHỈ trong bộ nhớ (module-level Map),
 * không cần express-session hay cookie vì backend chạy 1 tiến trình, 1 người
 * dùng. Mất khi restart backend (chấp nhận được — người dùng bấm "Kết nối"
 * lại là xong).
 */
const pending = new Map<string, PendingConnect>()

function cleanupExpired() {
  const now = Date.now()
  for (const [state, entry] of pending) {
    if (now - entry.createdAt > PENDING_TTL_MS) pending.delete(state)
  }
}

/** Chuẩn hóa domain store người dùng gõ vào (`shop`, `shop.mysapo.net`, URL đầy đủ...) → đúng `{store}.mysapo.net`. */
export function normalizeStoreDomain(input: string): string | null {
  let store = normalizeStoreUrl(input)
  if (!store) return null
  if (!store.includes('.')) store += '.mysapo.net'
  if (!/^[a-z0-9-]+\.mysapo\.net$/i.test(store)) return null
  return store
}

/** Bắt đầu luồng OAuth: sinh state chống CSRF, lưu tạm, trả về URL authorize để redirect trình duyệt sang. */
export function beginOAuthConnect(store: string, clientId: string, redirectUri: string, scope: string): string {
  cleanupExpired()
  const state = crypto.randomBytes(16).toString('hex')
  pending.set(state, { store, createdAt: Date.now() })

  const params = new URLSearchParams({ client_id: clientId, scope, redirect_uri: redirectUri, state })
  return `https://${store}/admin/oauth/authorize?${params}`
}

/** Lấy lại store gắn với 1 state (và xóa khỏi bộ nhớ) khi Sapo redirect về callback — trả về null nếu state không hợp lệ/hết hạn. */
export function consumePendingState(state: string): string | null {
  cleanupExpired()
  const entry = pending.get(state)
  if (!entry) return null
  pending.delete(state)
  return entry.store
}

/**
 * Verify chữ ký `hmac` Sapo gửi kèm callback — theo đúng công thức tài liệu
 * Sapo: bỏ tham số `hmac` ra, sắp xếp các tham số còn lại theo alphabet, nối
 * thành `key1=value1&key2=value2...`, HMAC-SHA256 bằng Secret Key, so khớp.
 * Lưu ý: Sapo trả `hmac` dạng base64 (đã test thật với store lofi-organic —
 * KHÔNG phải hex như hay gặp ở Shopify).
 */
export function verifySapoHmac(query: Record<string, string>, clientSecret: string): boolean {
  const { hmac, signature, ...rest } = query
  const provided = hmac ?? signature
  if (!provided) return false

  const message = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join('&')

  const computed = crypto.createHmac('sha256', clientSecret).update(message).digest('base64')

  const a = Buffer.from(computed, 'utf-8')
  const b = Buffer.from(provided, 'utf-8')
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

/** POST /admin/oauth/access_token — đổi authorization code lấy access token thật. */
export async function exchangeCodeForToken(store: string, code: string, clientId: string, clientSecret: string): Promise<string> {
  const response = await fetch(`https://${store}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Sapo trả lỗi khi đổi access token: ${response.status} ${body.slice(0, 300)}`)
  }

  const data = (await response.json()) as { access_token?: string }
  if (!data.access_token) {
    throw new Error('Sapo không trả về access_token.')
  }
  return data.access_token
}
