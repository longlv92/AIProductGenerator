import { useState } from 'react'
import { BACKEND_URL } from '../sapoApi'

interface ConnectStoreScreenProps {
  onConnect: (storeUrl: string, apiKey: string, apiSecret: string) => void
  isConnecting: boolean
  connectError?: string | null
}

export function ConnectStoreScreen({ onConnect, isConnecting, connectError }: ConnectStoreScreenProps) {
  const [storeUrl, setStoreUrl] = useState('')
  const [showPrivateApp, setShowPrivateApp] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [oauthConnecting, setOauthConnecting] = useState(false)
  const isPrivateAppValid = storeUrl.trim() !== '' && apiKey.trim() !== '' && apiSecret.trim() !== ''

  // Mở bước duyệt quyền Sapo ở 1 popup riêng — tab web tool giữ nguyên, không bị điều hướng đi.
  // Popup tự đóng sau khi báo kết quả về qua postMessage (xem backend routes/oauth.ts).
  function connectViaOAuth() {
    if (!storeUrl.trim()) return
    const url = `${BACKEND_URL}/api/oauth/connect?store=${encodeURIComponent(storeUrl.trim())}`
    const width = 520
    const height = 680
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2)
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2)
    const popup = window.open(url, 'sapo-oauth-connect', `width=${width},height=${height},left=${left},top=${top}`)

    if (!popup) {
      // Trình duyệt chặn popup → fallback điều hướng thẳng tab hiện tại.
      window.location.href = url
      return
    }

    setOauthConnecting(true)
    const timer = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(timer)
        setOauthConnecting(false)
      }
    }, 500)
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="section-card w-full max-w-md flex flex-col gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
          AI
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Kết nối store Sapo</h1>
          <p className="mt-1 text-sm text-slate-400">
            Nhập URL store rồi bấm Kết nối — Sapo sẽ mở 1 cửa sổ riêng để bạn duyệt quyền, không rời khỏi trang này.
          </p>
        </div>

        {connectError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {connectError}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="field-label">
            URL website Sapo <span className="text-red-500">*</span>
          </label>
          <input
            autoFocus
            className="input"
            type="text"
            placeholder="https://shop.mysapo.net"
            value={storeUrl}
            disabled={isConnecting}
            onChange={(e) => setStoreUrl(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={connectViaOAuth}
          disabled={!storeUrl.trim() || isConnecting || oauthConnecting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
        >
          {oauthConnecting && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {oauthConnecting ? 'Đang chờ duyệt quyền ở cửa sổ mới...' : 'Kết nối Sapo'}
        </button>

        <button
          type="button"
          onClick={() => setShowPrivateApp((v) => !v)}
          className="self-start text-xs text-slate-400 underline decoration-dotted hover:text-slate-600 dark:hover:text-slate-300"
        >
          {showPrivateApp ? 'Ẩn tùy chọn nâng cao' : 'Dùng Private App thay thế (nâng cao)'}
        </button>

        {showPrivateApp && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (isPrivateAppValid && !isConnecting) onConnect(storeUrl.trim(), apiKey.trim(), apiSecret.trim())
            }}
            className="flex flex-col gap-4 border-t border-slate-100 pt-4 dark:border-slate-800"
          >
            <p className="text-xs text-slate-400">
              Dùng API Key/Secret của Ứng dụng riêng (Private App) — tạo tại trang quản trị Sapo → Ứng dụng → Ứng
              dụng riêng. Nhớ cấp quyền "Sản phẩm, phiên bản và danh mục" = Đọc và ghi.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="field-label">
                API Key <span className="text-red-500">*</span>
              </label>
              <input
                className="input"
                type="text"
                placeholder="Dán API Key từ Ứng dụng riêng"
                value={apiKey}
                disabled={isConnecting}
                onChange={(e) => setApiKey(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="field-label">
                API Secret <span className="text-red-500">*</span>
              </label>
              <input
                className="input"
                type="password"
                placeholder="Dán API Secret từ Ứng dụng riêng"
                value={apiSecret}
                disabled={isConnecting}
                onChange={(e) => setApiSecret(e.target.value)}
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={!isPrivateAppValid || isConnecting}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {isConnecting && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400/40 border-t-slate-600" />}
              {isConnecting ? 'Đang kết nối...' : 'Kết nối bằng API Key/Secret'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
