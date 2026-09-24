import fs from 'node:fs'
import path from 'node:path'

export interface PrivateAppConnection {
  authType: 'private_app'
  apiKey: string
  apiSecret: string
  connectedAt: string
}

export interface OAuthConnection {
  authType: 'oauth'
  accessToken: string
  connectedAt: string
}

export type StoreConnection = PrivateAppConnection | OAuthConnection

/**
 * Lưu thông tin xác thực (Private App key/secret HOẶC OAuth access token) theo
 * từng store bằng file JSON. File nằm trong DATA_DIR (mặc định backend/data/,
 * đã .gitignore) — khi deploy lên Render, DATA_DIR trỏ sang 1 persistent disk
 * (VD /var/data, xem render.yaml) để dữ liệu không mất khi service redeploy/restart.
 *
 * Vẫn là file JSON plaintext, không phải DB thật — chấp nhận được cho quy mô nhỏ
 * (vài người dùng thử), nhưng nếu phục vụ nhiều người dùng thật, nên đổi sang DB
 * + mã hóa khi lưu (mục 9.1, 10.3 spec).
 */
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.resolve(process.cwd(), 'data')
const FILE_PATH = path.join(DATA_DIR, 'store-connections.json')

/** Dữ liệu cũ (trước khi có OAuth) không có field `authType` — mặc định coi là Private App. */
function withDefaultAuthType(raw: unknown): StoreConnection {
  const conn = raw as Record<string, unknown>
  if (conn.authType === 'oauth') return conn as unknown as OAuthConnection
  return { authType: 'private_app', apiKey: conn.apiKey, apiSecret: conn.apiSecret, connectedAt: conn.connectedAt } as PrivateAppConnection
}

function readAll(): Record<string, StoreConnection> {
  try {
    const raw = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8')) as Record<string, unknown>
    return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, withDefaultAuthType(v)]))
  } catch {
    return {}
  }
}

function writeAll(data: Record<string, StoreConnection>) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2))
}

export function normalizeStoreUrl(url: string): string {
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
}

export function getConnection(storeUrl: string): StoreConnection | undefined {
  return readAll()[normalizeStoreUrl(storeUrl)]
}

export function saveConnection(storeUrl: string, connection: StoreConnection): void {
  const all = readAll()
  all[normalizeStoreUrl(storeUrl)] = connection
  writeAll(all)
}

export function removeConnection(storeUrl: string): void {
  const all = readAll()
  delete all[normalizeStoreUrl(storeUrl)]
  writeAll(all)
}
