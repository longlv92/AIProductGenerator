import type { Response } from 'express'
import { Router } from 'express'
import { beginOAuthConnect, consumePendingState, exchangeCodeForToken, normalizeStoreDomain, verifySapoHmac } from '../oauth.js'
import { grantStoreSession } from '../session.js'
import { saveConnection } from '../tokenStore.js'

export const oauthRouter = Router()

const SCOPE = 'read_products,write_products,read_content,write_content'

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)
}

type OAuthResult = { ok: true; store: string } | { ok: false; error: string }

/**
 * Trang callback chạy trong popup do ConnectStoreScreen mở — báo kết quả về tab chính (đang mở web tool)
 * qua postMessage rồi tự đóng, để tab chính không bị điều hướng rời khỏi ứng dụng trong lúc duyệt quyền.
 * Fallback: nếu không có window.opener (VD popup bị chặn nên chạy thẳng trên tab hiện tại), hiện thông báo tĩnh.
 */
function renderOAuthPopupResult(res: Response, frontendUrl: string, result: OAuthResult) {
  const payload = JSON.stringify({ source: 'sapo-oauth', ...result }).replace(/</g, '\\u003c')
  const staticMessage = result.ok
    ? 'Kết nối thành công. Bạn có thể đóng cửa sổ này và quay lại tool.'
    : `Lỗi: ${escapeHtml(result.error)}`

  res.status(result.ok ? 200 : 400).send(`<!doctype html>
<html><head><meta charset="utf-8"><title>${result.ok ? 'Kết nối thành công' : 'Kết nối thất bại'}</title></head>
<body style="font-family: system-ui, sans-serif; padding: 24px; color: #334155;">
<p id="msg">${result.ok ? 'Đang hoàn tất kết nối...' : staticMessage}</p>
<script>
(function () {
  var payload = ${payload};
  try {
    if (window.opener) {
      window.opener.postMessage(payload, ${JSON.stringify(frontendUrl)});
      window.close();
      return;
    }
  } catch (e) {}
  document.getElementById('msg').textContent = ${JSON.stringify(staticMessage)};
})();
</script>
</body></html>`)
}

function getOAuthEnv(res: import('express').Response): { clientId: string; clientSecret: string; appUrl: string; frontendUrl: string } | null {
  const clientId = process.env.SAPO_OAUTH_CLIENT_ID
  const clientSecret = process.env.SAPO_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    res.status(500).json({ error: 'Chưa cấu hình SAPO_OAUTH_CLIENT_ID / SAPO_OAUTH_CLIENT_SECRET trong backend/.env' })
    return null
  }
  const appUrl = process.env.APP_URL ?? 'http://localhost:4000'
  const frontendUrl = process.env.CORS_ORIGIN ?? 'http://localhost:5173'
  return { clientId, clientSecret, appUrl, frontendUrl }
}

oauthRouter.get('/oauth/connect', (req, res) => {
  const env = getOAuthEnv(res)
  if (!env) return

  const storeInput = String(req.query.store ?? '').trim()
  const store = normalizeStoreDomain(storeInput)
  if (!store) {
    res.status(400).send('URL store không hợp lệ. VD: shop.mysapo.net')
    return
  }

  const redirectUri = `${env.appUrl}/api/oauth/callback`
  const authorizeUrl = beginOAuthConnect(store, env.clientId, redirectUri, SCOPE)
  res.redirect(authorizeUrl)
})

oauthRouter.get('/oauth/callback', async (req, res) => {
  const env = getOAuthEnv(res)
  if (!env) return

  const query = req.query as Record<string, string>
  const { code, state } = query

  if (!code || !state) {
    renderOAuthPopupResult(res, env.frontendUrl, { ok: false, error: `Thiếu code hoặc state. Query nhận được: ${JSON.stringify(query)}` })
    return
  }

  const store = consumePendingState(state)
  if (!store) {
    renderOAuthPopupResult(res, env.frontendUrl, {
      ok: false,
      error: 'State không hợp lệ hoặc đã hết hạn (quá 10 phút) — vui lòng đóng cửa sổ này và bấm Kết nối lại.',
    })
    return
  }

  // Verify chữ ký trước khi tin bất kỳ tham số nào từ Sapo. Nếu sai, dừng lại và
  // hiện nguyên văn query để chẩn đoán (lần đầu tích hợp thật, chưa chắc 100%
  // tên tham số khớp tài liệu — xem ghi chú trong oauth.ts:verifySapoHmac).
  const isValid = verifySapoHmac(query, env.clientSecret)
  if (!isValid) {
    renderOAuthPopupResult(res, env.frontendUrl, {
      ok: false,
      error: `Chữ ký (hmac) không hợp lệ — dừng lại để an toàn. Query nhận được: ${JSON.stringify(query)}`,
    })
    return
  }

  try {
    const accessToken = await exchangeCodeForToken(store, code, env.clientId, env.clientSecret)
    saveConnection(store, { authType: 'oauth', accessToken, connectedAt: new Date().toISOString() })
    // Cấp cookie phiên NGAY TRÊN response này (popup) — cookie thuộc domain backend nên tab chính
    // (frontend, khác domain) vẫn gửi kèm được khi gọi API sau đó, miễn credentials:'include' + CORS đúng.
    grantStoreSession(req, res, store)
    renderOAuthPopupResult(res, env.frontendUrl, { ok: true, store })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định khi đổi access token'
    renderOAuthPopupResult(res, env.frontendUrl, { ok: false, error: message })
  }
})
