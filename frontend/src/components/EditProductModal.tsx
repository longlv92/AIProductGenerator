import { useEffect, useState } from 'react'
import { fetchProductImageUrls, type SapoCollection } from '../sapoApi'
import type { ImageAspectRatio, Product, ProductAttribute } from '../types'

interface EditProductModalProps {
  product: Product
  collections: SapoCollection[]
  imageAspectRatio: ImageAspectRatio
  onSave: (updated: Product) => void
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

export function EditProductModal({ product, collections, imageAspectRatio, onSave, onClose }: EditProductModalProps) {
  const [draft, setDraft] = useState<Product>(product)
  const [tagsInput, setTagsInput] = useState(product.tags.join(', '))
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [galleryLoading, setGalleryLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setGalleryLoading(true)
    fetchProductImageUrls(product.imageKeyword, product.sku, 4, imageAspectRatio).then((urls) => {
      if (!cancelled) {
        setGalleryUrls(urls)
        setGalleryLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [product.imageKeyword, product.sku, imageAspectRatio])

  function updateAttribute(index: number, field: keyof ProductAttribute, value: string) {
    setDraft((d) => ({
      ...d,
      attributes: d.attributes.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    }))
  }

  function removeAttribute(index: number) {
    setDraft((d) => ({ ...d, attributes: d.attributes.filter((_, i) => i !== index) }))
  }

  function addAttribute() {
    setDraft((d) => ({ ...d, attributes: [...d.attributes, { name: '', value: '' }] }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="animate-card-in max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Chỉnh sửa sản phẩm</h3>

        <div className="mt-4 flex flex-col gap-5">
          <Section title="Ảnh sản phẩm">
            {galleryLoading ? (
              <div className="flex h-20 items-center justify-center text-xs text-slate-400">Đang tìm ảnh...</div>
            ) : galleryUrls.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {galleryUrls.map((url, i) => (
                  <img
                    key={url}
                    src={url}
                    alt={`${draft.name} - ảnh ${i + 1}`}
                    className="h-20 w-20 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Chưa tìm được ảnh thật khớp sản phẩm — kiểm tra PEXELS_API_KEY trong backend/.env.
              </p>
            )}
          </Section>

          <Section title="Thông tin sản phẩm">
            <Field label="Tên sản phẩm">
              <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Mã SKU">
                <input className="input" value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} />
              </Field>
              <Field label="Mã vạch / Barcode">
                <input className="input" value={draft.barcode} onChange={(e) => setDraft({ ...draft, barcode: e.target.value })} />
              </Field>
              <Field label="Đơn vị tính">
                <input className="input" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} />
              </Field>
            </div>
            <Field label="Mô tả ngắn">
              <textarea
                className="input min-h-[60px] resize-y"
                value={draft.shortDescription}
                onChange={(e) => setDraft({ ...draft, shortDescription: e.target.value })}
              />
            </Field>
            <Field label="Mô tả chi tiết">
              <textarea
                className="input min-h-[80px] resize-y"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </Field>
          </Section>

          <Section title="Thông tin giá">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Giá bán (đ)">
                <input
                  className="input"
                  type="number"
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label="Giá so sánh (đ)">
                <input
                  className="input"
                  type="number"
                  value={draft.compareAtPrice}
                  onChange={(e) => setDraft({ ...draft, compareAtPrice: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label="Giá vốn (đ)">
                <input
                  className="input"
                  type="number"
                  value={draft.costPrice}
                  onChange={(e) => setDraft({ ...draft, costPrice: Number(e.target.value) || 0 })}
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={draft.applyTax}
                onChange={(e) => setDraft({ ...draft, applyTax: e.target.checked })}
                className="h-4 w-4 cursor-pointer accent-blue-600"
              />
              Áp dụng thuế
            </label>
          </Section>

          <Section title="Phân loại">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Loại sản phẩm">
                <input className="input" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
              </Field>
              <Field label="Nhãn hiệu">
                <input className="input" value={draft.brand} onChange={(e) => setDraft({ ...draft, brand: e.target.value })} />
              </Field>
            </div>
            <Field label="Danh mục (Collection)">
              {collections.length > 0 ? (
                <select className="input" value={draft.collection} onChange={(e) => setDraft({ ...draft, collection: e.target.value })}>
                  <option value="">Không gán danh mục</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="input"
                  placeholder="Kết nối Sapo để chọn từ danh mục có sẵn trong store"
                  value={draft.collection}
                  onChange={(e) => setDraft({ ...draft, collection: e.target.value })}
                />
              )}
            </Field>
            <Field label="Tag (cách nhau bằng dấu phẩy)">
              <input className="input" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
            </Field>
          </Section>

          <Section title="Thông tin kho">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Lưu kho tại">
                <input
                  className="input"
                  value={draft.warehouseLocation}
                  onChange={(e) => setDraft({ ...draft, warehouseLocation: e.target.value })}
                />
              </Field>
              <Field label="Tồn kho">
                <input
                  className="input"
                  type="number"
                  value={draft.stockQuantity}
                  onChange={(e) => setDraft({ ...draft, stockQuantity: Number(e.target.value) || 0 })}
                />
              </Field>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={draft.manageStock}
                  onChange={(e) => setDraft({ ...draft, manageStock: e.target.checked })}
                  className="h-4 w-4 cursor-pointer accent-blue-600"
                />
                Quản lý số lượng tồn kho
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={draft.allowNegativeStock}
                  onChange={(e) => setDraft({ ...draft, allowNegativeStock: e.target.checked })}
                  className="h-4 w-4 cursor-pointer accent-blue-600"
                />
                Cho phép bán âm
              </label>
            </div>
          </Section>

          <Section title="Vận chuyển">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={draft.requiresShipping}
                onChange={(e) => setDraft({ ...draft, requiresShipping: e.target.checked })}
                className="h-4 w-4 cursor-pointer accent-blue-600"
              />
              Sản phẩm yêu cầu vận chuyển
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Khối lượng">
                <input
                  className="input"
                  type="number"
                  value={draft.weight}
                  onChange={(e) => setDraft({ ...draft, weight: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label="Đơn vị">
                <select
                  className="input"
                  value={draft.weightUnit}
                  onChange={(e) => setDraft({ ...draft, weightUnit: e.target.value as Product['weightUnit'] })}
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Thuộc tính">
            <div className="flex flex-col gap-2">
              {draft.attributes.map((attr, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="input"
                    placeholder="Tên thuộc tính (VD: Màu sắc)"
                    value={attr.name}
                    onChange={(e) => updateAttribute(i, 'name', e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder="Giá trị (VD: Đen)"
                    value={attr.value}
                    onChange={(e) => updateAttribute(i, 'value', e.target.value)}
                  />
                  <button
                    onClick={() => removeAttribute(i)}
                    title="Xóa thuộc tính"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addAttribute}
              className="self-start text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              + Thêm thuộc tính
            </button>
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
