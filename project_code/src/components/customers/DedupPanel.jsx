import Button from '@/components/ui/Button'
import { TypeBadge } from '@/components/ui/Badge'

export default function DedupPanel({ matches, onViewCustomer, onIgnore, onDismiss }) {
  if (!matches.length) return null

  return (
    <div className="rounded-lg p-4 mt-3.5" style={{ border: '1px solid #F59E0B', background: '#FFFBEB' }}>
      <div className="text-[13px] font-semibold mb-2.5" style={{ color: '#D97706' }}>
        ⚠️ Tìm thấy khách hàng tương tự
      </div>
      <div className="flex flex-col gap-1.5">
        {matches.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between px-2.5 py-2 rounded bg-white"
            style={{ border: '1px solid #E5E5E5' }}
          >
            <div>
              <div className="text-[13px] font-medium" style={{ color: '#1F2533' }}>{c.name}</div>
              <div className="text-[12px] mt-0.5 flex items-center gap-1.5" style={{ color: '#636363' }}>
                {c.email || '—'}
                <TypeBadge type={c.type} />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: '#FEE2E2', color: '#FB2C36' }}
              >
                ~{c._score}%
              </span>
              <Button variant="secondary" size="sm" onClick={() => onViewCustomer(c.id)}>
                Xem →
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2.5">
        <Button variant="secondary" size="sm" onClick={onIgnore}>
          Không phải, tạo mới
        </Button>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Xem lại
        </Button>
      </div>
    </div>
  )
}
