import { getConnection, normalizeStoreUrl } from './tokenStore.js'

export interface StoreAuthHeader {
  storeUrl: string
  /** Header xác thực gắn thẳng vào mọi request Sapo — tên + giá trị khác nhau tùy kiểu kết nối. */
  header: { name: string; value: string }
}

function buildBasicAuthValue(apiKey: string, apiSecret: string): string {
  return `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
}

/**
 * Lấy header xác thực đã lưu cho 1 store, sau khi store đó đã được kết nối
 * (Private App qua POST /api/connect, hoặc OAuth qua GET /api/oauth/connect).
 * Đây là điểm DUY NHẤT mà sapoClient.ts/sapoArticleClient.ts phụ thuộc vào để
 * biết cách xác thực — 2 file đó không cần biết store đang dùng Private App
 * (`Authorization: Basic ...`) hay OAuth (`X-Sapo-Access-Token: ...`).
 */
export function getStoreAuthHeader(requestedStoreUrl: string): StoreAuthHeader {
  const conn = getConnection(requestedStoreUrl)
  if (!conn) {
    throw new Error(`Store "${requestedStoreUrl}" chưa kết nối. Vui lòng kết nối lại (API Key/Secret hoặc OAuth).`)
  }

  const storeUrl = normalizeStoreUrl(requestedStoreUrl)
  if (conn.authType === 'oauth') {
    return { storeUrl, header: { name: 'X-Sapo-Access-Token', value: conn.accessToken } }
  }
  return { storeUrl, header: { name: 'Authorization', value: buildBasicAuthValue(conn.apiKey, conn.apiSecret) } }
}
