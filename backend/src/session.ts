import crypto from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { normalizeStoreUrl } from './tokenStore.js'

/**
 * Phiên đăng nhập theo TỪNG STORE, lưu trong 1 cookie ký (HMAC) ở trình duyệt — không cần DB người dùng.
 *
 * Vì sao cần: backend lưu token kết nối (Private App key/secret hoặc OAuth access token) theo store trong
 * 1 file chung (tokenStore.ts) — nếu không có gì chặn thêm, BẤT KỲ ai gõ đúng domain 1 store đã từng được
 * kết nối (qua tool này, bởi bất kỳ ai) đều dùng được token đó luôn, không cần xác thực lại. Với 1 người
 * dùng thì không sao, nhưng khi deploy 1 instance chung cho nhiều người dùng thử thì đây là lỗ hổng thật.
 *
 * Cách chặn: mỗi khi 1 trình duyệt hoàn tất kết nối 1 store (qua OAuth hoặc Private App), cấp cho trình
 * duyệt đó 1 cookie ghi rõ "trình duyệt này được phép dùng (các) store nào" — ký bằng SESSION_SECRET nên
 * không ai giả mạo được. Mọi API động tới dữ liệu store (collections/products/articles/blogs) đều bắt buộc
 * qua middleware requireStoreSession() bên dưới, kiểm tra đúng store đó có trong cookie hay không.
 */

const COOKIE_NAME = 'sapo_session'
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 ngày — đủ dài để khỏi phải kết nối lại liên tục, vẫn có hạn.

interface SessionPayload {
  /** Danh sách store (đã chuẩn hóa qua normalizeStoreUrl) mà trình duyệt này được xác thực để dùng. */
  stores: string[]
  exp: number
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('Chưa cấu hình SESSION_SECRET trong backend/.env — cần thiết để ký phiên đăng nhập theo store.')
  }
  return secret
}

function sign(payloadJson: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payloadJson).digest('base64url')
}

function encode(payload: SessionPayload): string {
  const json = JSON.stringify(payload)
  return `${Buffer.from(json, 'utf-8').toString('base64url')}.${sign(json)}`
}

function decode(token: string): SessionPayload | null {
  const [body, sig] = token.split('.')
  if (!body || !sig) return null

  let json: string
  try {
    json = Buffer.from(body, 'base64url').toString('utf-8')
  } catch {
    return null
  }

  const expected = sign(json)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null

  try {
    const payload = JSON.parse(json) as SessionPayload
    if (!Array.isArray(payload.stores) || typeof payload.exp !== 'number') return null
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

/** Parse thủ công header `Cookie` — tránh thêm dependency `cookie-parser` chỉ để đọc 1 cookie. */
function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    const key = part.slice(0, eq).trim()
    const value = part.slice(eq + 1).trim()
    if (key) out[key] = decodeURIComponent(value)
  }
  return out
}

function getAuthorizedStores(req: Request): string[] {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME]
  if (!token) return []
  return decode(token)?.stores ?? []
}

/**
 * Cấp (hoặc mở rộng) cookie phiên cho trình duyệt hiện tại sau khi kết nối 1 store thành công — gọi ngay
 * trước khi trả response, ở đúng route đã lưu connection (routes/connect.ts, routes/oauth.ts callback).
 *
 * `SameSite=None; Secure` khi production vì frontend/backend deploy ở 2 domain khác nhau (cookie phải gửi
 * kèm được trong fetch cross-site); dev local dùng `Lax` vì Secure cookie không hoạt động qua http thường.
 */
export function grantStoreSession(req: Request, res: Response, storeUrl: string): void {
  const store = normalizeStoreUrl(storeUrl)
  const stores = new Set(getAuthorizedStores(req))
  stores.add(store)

  const isProd = process.env.NODE_ENV === 'production'
  res.cookie(COOKIE_NAME, encode({ stores: [...stores], exp: Date.now() + MAX_AGE_MS }), {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: MAX_AGE_MS,
    path: '/',
  })
}

/** Middleware: chặn mọi request động tới dữ liệu 1 store nếu trình duyệt gọi chưa có phiên hợp lệ cho đúng store đó. */
export function requireStoreSession(req: Request, res: Response, next: NextFunction): void {
  const storeUrl = String(req.query.storeUrl ?? (req.body as { storeUrl?: string } | undefined)?.storeUrl ?? '').trim()
  if (!storeUrl) {
    res.status(400).json({ error: 'Thiếu tham số storeUrl' })
    return
  }

  const authorized = getAuthorizedStores(req).includes(normalizeStoreUrl(storeUrl))
  if (!authorized) {
    res.status(403).json({ error: `Trình duyệt này chưa xác thực với store "${storeUrl}" — vui lòng kết nối lại.` })
    return
  }

  next()
}
