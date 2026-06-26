export default function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  if (total === 0) return null

  return (
    <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid #E5E5E5', background: 'white' }}>
      <span className="text-[13px]" style={{ color: '#636363' }}>
        Hiển thị {from}–{to} / {total} kết quả
      </span>
      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className="w-8 h-8 rounded flex items-center justify-center text-[13px] transition-colors"
            style={{
              border: '1px solid',
              borderColor: p === page ? '#0268C5' : '#E5E5E5',
              background: p === page ? '#0268C5' : 'white',
              color: p === page ? 'white' : '#111827',
              fontWeight: p === page ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
