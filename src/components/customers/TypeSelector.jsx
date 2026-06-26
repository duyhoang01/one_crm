const TYPES = [
  { key: 'B2B',      icon: '🏢', label: 'B2B',      desc: 'Doanh nghiệp' },
  { key: 'Reseller', icon: '🤝', label: 'Reseller', desc: 'Đại lý' },
  { key: 'B2C',      icon: '👤', label: 'B2C',      desc: 'Cá nhân' },
  { key: 'Other',    icon: '🔗', label: 'Other',    desc: 'Khác' },
]

export default function TypeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2 mb-5">
      {TYPES.map((t) => {
        const selected = value === t.key
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className="flex flex-col items-center text-center py-3 px-2 rounded-lg transition-all"
            style={{
              border: selected ? '2px solid #0268C5' : '2px solid #E5E5E5',
              background: selected ? '#EBF4FD' : 'white',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { if (!selected) e.currentTarget.style.borderColor = '#00ADEE' }}
            onMouseLeave={(e) => { if (!selected) e.currentTarget.style.borderColor = '#E5E5E5' }}
          >
            <span className="text-xl mb-1.5">{t.icon}</span>
            <span className="text-[13px] font-semibold" style={{ color: selected ? '#0268C5' : '#111827' }}>
              {t.label}
            </span>
            <span className="text-[11px] mt-0.5" style={{ color: '#636363' }}>{t.desc}</span>
          </button>
        )
      })}
    </div>
  )
}
