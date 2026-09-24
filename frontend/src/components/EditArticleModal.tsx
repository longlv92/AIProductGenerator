import { useEffect, useState } from 'react'
import { fetchProductImageUrl, type SapoBlog } from '../sapoApi'
import type { Article, ImageAspectRatio } from '../types'

interface EditArticleModalProps {
  article: Article
  blogs: SapoBlog[]
  imageAspectRatio: ImageAspectRatio
  onSave: (updated: Article) => void
  onClose: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 first:border-0 first:pt-0 dark:border-slate-800">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h4>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>
      {children}
    </div>
  )
}

export function EditArticleModal({ article, blogs, imageAspectRatio, onSave, onClose }: EditArticleModalProps) {
  const [draft, setDraft] = useState<Article>(article)
  const [tagsInput, setTagsInput] = useState(article.tags.join(', '))
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setPreviewLoading(true)
    fetchProductImageUrl(article.imageKeyword, article.id, imageAspectRatio).then((url) => {
      if (!cancelled) {
        setPreviewUrl(url)
        setPreviewLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [article.imageKeyword, article.id, imageAspectRatio])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="animate-card-in max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Chỉnh sửa bài viết</h3>

        <div className="mt-4 flex flex-col gap-5">
          <Section title="Ảnh đại diện bài viết">
            {previewLoading ? (
              <div className="flex h-20 items-center justify-center text-xs text-slate-400">Đang tìm ảnh...</div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt={draft.title}
                className="h-20 w-20 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
              />
            ) : (
              <p className="text-xs text-slate-400">
                Chưa tìm được ảnh thật khớp bài viết — kiểm tra PEXELS_API_KEY trong backend/.env.
              </p>
            )}
          </Section>

          <Section title="Nội dung bài viết">
            <Field label="Tiêu đề">
              <input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </Field>
            <Field label="Tác giả">
              <input className="input" value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} />
            </Field>
            <Field label="Tóm tắt ngắn">
              <textarea
                className="input min-h-[60px] resize-y"
                value={draft.excerpt}
                onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
              />
            </Field>
            <Field label="Nội dung chi tiết (HTML)">
              <textarea
                className="input min-h-[160px] resize-y font-mono text-xs"
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              />
            </Field>
          </Section>

          <Section title="Phân loại">
            <Field label="Đăng vào Blog">
              {blogs.length > 0 ? (
                <select className="input" value={draft.blog} onChange={(e) => setDraft({ ...draft, blog: e.target.value })}>
                  <option value="">Không chọn blog</option>
                  {blogs.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="input"
                  placeholder="Kết nối Sapo để chọn từ blog có sẵn trong store"
                  value={draft.blog}
                  onChange={(e) => setDraft({ ...draft, blog: e.target.value })}
                />
              )}
            </Field>
            <Field label="Tag (cách nhau bằng dấu phẩy)">
              <input className="input" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
            </Field>
          </Section>

          <Section title="Tối ưu SEO">
            <Field label="Tiêu đề SEO">
              <input className="input" value={draft.seoTitle} onChange={(e) => setDraft({ ...draft, seoTitle: e.target.value })} />
            </Field>
            <Field label="Mô tả SEO">
              <textarea
                className="input min-h-[60px] resize-y"
                value={draft.seoDescription}
                onChange={(e) => setDraft({ ...draft, seoDescription: e.target.value })}
              />
            </Field>
          </Section>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Hủy
          </button>
          <button
            onClick={() =>
              onSave({
                ...draft,
                tags: tagsInput
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  )
}
