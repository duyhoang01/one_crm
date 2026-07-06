import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FormField, { Input, Select } from '@/components/ui/FormField'
import TypeSelector from './TypeSelector'
import DedupPanel from './DedupPanel'
import { useCustomers } from '@/context/CustomerContext'
import { useDebounce } from '@/hooks/useDebounce'
import { INDUSTRIES } from '@/data/customers'
import { useAuth } from '@/context/AuthContext'

const NAME_LABELS = { B2B: 'Tên doanh nghiệp', Reseller: 'Tên đại lý', B2C: 'Họ và tên', Other: 'Tên liên hệ' }

const EMPTY = { type: '', name: '', tax: '', email: '', phone: '', industry: '', parentId: '', address: '' }
const EMPTY_ERR = { type: '', name: '', tax: '', email: '' }

export default function CreateCustomerModal({ open, onClose, onSuccess }) {
  const { customers, addCustomer, getParentOptions } = useCustomers()
  const { user } = useAuth()

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState(EMPTY_ERR)
  const [dedupMatches, setDedupMatches] = useState([])
  const [dedupBypassed, setDedupBypassed] = useState(false)

  const debouncedName = useDebounce(form.name, 300)

  // Reset on open
  useEffect(() => {
    if (open) { setForm(EMPTY); setErrors(EMPTY_ERR); setDedupMatches([]); setDedupBypassed(false) }
  }, [open])

  // Dedup check — PRD BR: min 3 chars, 300ms debounce
  useEffect(() => {
    if (dedupBypassed || debouncedName.length < 3) { setDedupMatches([]); return }
    const q = debouncedName.toLowerCase()
    const found = customers
      .filter((c) => !c.deletedAt && c.name.toLowerCase().includes(q.slice(0, 4)))
      .map((c) => ({ ...c, _score: c.name.toLowerCase().includes(q) ? 100 : 70 }))
    setDedupMatches(found)
  }, [debouncedName, dedupBypassed, customers])

  const showTax      = form.type === 'B2B' || form.type === 'Reseller'
  const showIndustry = form.type === 'B2B' || form.type === 'Reseller'
  const showParent   = form.type !== 'B2C'
  const emailRequired= form.type !== 'Other'

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  function validate() {
    const e = { ...EMPTY_ERR }
    if (!form.type) e.type = 'Vui lòng chọn loại khách hàng'
    if (!form.name.trim()) e.name = 'Tên là bắt buộc'
    if (showTax) {
      if (!form.tax.trim()) e.tax = 'MST là bắt buộc'
      else if (customers.some((c) => !c.deletedAt && c.tax === form.tax.trim())) e.tax = 'MST đã tồn tại'
    }
    if (emailRequired && !form.email.trim()) e.email = 'Email là bắt buộc'
    setErrors(e)
    return !Object.values(e).some(Boolean)
  }

  function handleSubmit() {
    if (!validate()) return
    const nc = addCustomer({
      name: form.name.trim(),
      type: form.type,
      tax: showTax ? form.tax.trim() || null : null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      industry: showIndustry ? form.industry || null : null,
      parentId: showParent ? form.parentId || null : null,
      address: form.address.trim() || null,
      createdBy: user?.name || 'Sales',
    })
    onSuccess(nc)
    onClose()
  }

  const parentOptions = getParentOptions()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="➕ Thêm Khách hàng mới"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button variant="primary" onClick={handleSubmit}>💾 Lưu</Button>
        </>
      }
    >
      {/* Type selector */}
      <div className="mb-1">
        <div className="text-[13px] font-semibold mb-2" style={{ color: '#111827' }}>
          Loại khách hàng <span style={{ color: '#FB2C36' }}>*</span>
        </div>
        <TypeSelector value={form.type} onChange={(t) => { set('type', t); setDedupBypassed(false) }} />
        {errors.type && <p className="text-[12px] -mt-3 mb-3" style={{ color: '#FB2C36' }}>{errors.type}</p>}
      </div>

      {/* Row 1: Name + Tax */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: showTax ? '1fr 1fr' : '1fr' }}>
        <FormField label={form.type ? NAME_LABELS[form.type] : 'Tên'} required error={errors.name}>
          <Input
            type="text"
            placeholder="Nhập tên..."
            value={form.name}
            onChange={(e) => { set('name', e.target.value); setDedupBypassed(false) }}
          />
        </FormField>
        {showTax && (
          <FormField label="Mã số thuế" required error={errors.tax}>
            <Input type="text" placeholder="VD: 0101234567" value={form.tax} onChange={(e) => set('tax', e.target.value)} />
          </FormField>
        )}
      </div>

      {/* Row 2: Email + Phone */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <FormField label="Email" required={emailRequired} error={errors.email}>
          <Input type="email" placeholder="email@domain.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </FormField>
        <FormField label="Số điện thoại">
          <Input type="text" placeholder="0901 234 567" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </FormField>
      </div>

      {/* Row 3: Industry + Parent (conditional) */}
      {(showIndustry || showParent) && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {showIndustry && (
            <FormField label="Lĩnh vực">
              <Select value={form.industry} onChange={(e) => set('industry', e.target.value)}>
                <option value="">▾ Chọn ngành...</option>
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </Select>
            </FormField>
          )}
          {showParent && (
            <FormField label="Thuộc tập đoàn">
              <Select value={form.parentId} onChange={(e) => set('parentId', e.target.value)}>
                <option value="">▾ Chọn...</option>
                {parentOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormField>
          )}
        </div>
      )}

      {/* Row 4: Address */}
      <div className="mb-2">
        <FormField label="Địa chỉ">
          <Input type="text" placeholder="Số nhà, đường, quận, tỉnh/thành phố" value={form.address} onChange={(e) => set('address', e.target.value)} />
        </FormField>
      </div>

      {/* Dedup panel */}
      {dedupMatches.length > 0 && !dedupBypassed && (
        <DedupPanel
          matches={dedupMatches}
          onViewCustomer={(id) => { onClose(); /* parent handles nav */ }}
          onIgnore={() => setDedupBypassed(true)}
          onDismiss={() => setDedupMatches([])}
        />
      )}
    </Modal>
  )
}
