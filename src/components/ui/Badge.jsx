const TYPE_STYLES = {
  B2B:      { bg: '#EBF4FD', color: '#0268C5' },
  Reseller: { bg: '#F3EFFE', color: '#7C3AED' },
  B2C:      { bg: '#ECFDF5', color: '#059669' },
  Other:    { bg: '#F3F4F6', color: '#4B5563' },
}

const STATUS_STYLES = {
  ACTIVE:            { bg: '#ECFDF5', color: '#059669' },
  PENDING_PROVISION: { bg: '#FFFBEB', color: '#D97706' },
  GRACE:             { bg: '#FFFBEB', color: '#D97706' },
  SUSPENDED:         { bg: '#FFF7ED', color: '#EA580C' },
  REVOKED:           { bg: '#FEF2F2', color: '#FB2C36' },
  EXPIRED:           { bg: '#FEF2F2', color: '#FB2C36' },
  DELETED:           { bg: '#FEF2F2', color: '#FB2C36' },
}

const STATUS_LABELS = {
  ACTIVE: 'Đang hoạt động',
  PENDING_PROVISION: 'Đang triển khai',
  GRACE: 'Trong gia hạn',
  SUSPENDED: 'Tạm dừng',
  REVOKED: 'Đã thu hồi',
  EXPIRED: 'Hết hạn',
  DELETED: 'Đã xóa',
}

export function TypeBadge({ type }) {
  const style = TYPE_STYLES[type] || TYPE_STYLES.Other
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: style.bg, color: style.color }}
    >
      {type}
    </span>
  )
}

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || { bg: '#F3F4F6', color: '#4B5563' }
  const label = STATUS_LABELS[status] || status
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: style.bg, color: style.color }}
    >
      {label}
    </span>
  )
}

export const TYPE_COLOR = {
  B2B: '#0268C5',
  Reseller: '#7C3AED',
  B2C: '#10B981',
  Other: '#6B7280',
}
