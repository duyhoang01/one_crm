import { useState, useMemo } from 'react'
import { TypeBadge, TYPE_COLOR } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Pagination from './Pagination'
import { useDebounce } from '@/hooks/useDebounce'

const PAGE_SIZE = 20

const TH = ({ children, sortKey, sortState, onSort }) => {
  const active = sortState?.key === sortKey
  return (
    <th
      className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[.02em] select-none"
      style={{
        background: 'rgba(39,39,42,.04)',
        borderBottom: '1px solid #E5E5E5',
        color: '#636363',
        whiteSpace: 'nowrap',
        cursor: sortKey ? 'pointer' : 'default',
      }}
      onClick={() => sortKey && onSort(sortKey)}
    >
      {children}
      {sortKey && (
        <span className="ml-1 opacity-60">
          {active ? (sortState.dir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      )}
    </th>
  )
}

export default function CustomerTable({ customers, onRowClick, onEdit, onDelete }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' })

  const debouncedSearch = useDebounce(search, 300)

  function handleSort(key) {
    setSort((s) => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    let list = customers.filter((c) => {
      if (c.deletedAt) return false
      if (typeFilter && c.type !== typeFilter) return false
      if (q.length >= 2) {
        return (
          c.name.toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.tax || '').includes(q) ||
          (c.phone || '').includes(q)
        )
      }
      return true
    })

    list = [...list].sort((a, b) => {
      const va = (a[sort.key] || '').toString().toLowerCase()
      const vb = (b[sort.key] || '').toString().toLowerCase()
      return sort.dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })
    return list
  }, [customers, debouncedSearch, typeFilter, sort])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function clearFilter() { setSearch(''); setTypeFilter(''); setPage(1) }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <div className="relative flex-1" style={{ minWidth: 200 }}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] pointer-events-none" style={{ color: '#9CA3AF' }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Tìm theo tên, email, MST, SĐT..."
            className="w-full"
            style={{
              padding: '9px 12px 9px 36px',
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#0268C5'; e.target.style.boxShadow = '0 0 0 3px rgba(2,104,197,.1)' }}
            onBlur={(e) => { e.target.style.borderColor = '#E5E5E5'; e.target.style.boxShadow = 'none' }}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          style={{
            padding: '9px 32px 9px 12px',
            border: '1px solid #E5E5E5',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'white',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            cursor: 'pointer',
            outline: 'none',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <option value="">Tất cả loại</option>
          {['B2B', 'Reseller', 'B2C', 'Other'].map((t) => <option key={t}>{t}</option>)}
        </select>
        <Button variant="ghost" size="sm" onClick={clearFilter}>Xoá bộ lọc</Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
          <thead>
            <tr>
              <TH sortKey="name" sortState={sort} onSort={handleSort}>Tên khách hàng</TH>
              <TH sortKey="type" sortState={sort} onSort={handleSort}>Loại</TH>
              <TH sortKey="tax" sortState={sort} onSort={handleSort}>MST</TH>
              <TH>Email</TH>
              <TH>Subscription</TH>
              <TH>Thao tác</TH>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center" style={{ color: '#636363' }}>
                  <div className="text-4xl mb-3">🔍</div>
                  <div className="text-base font-semibold" style={{ color: '#111827' }}>Không tìm thấy kết quả</div>
                  <div className="text-sm mt-1">Thử thay đổi từ khoá hoặc bộ lọc</div>
                </td>
              </tr>
            ) : (
              paginated.map((c) => {
                const activeSubs = c.subs.filter((s) => s.status === 'ACTIVE').length
                return (
                  <tr
                    key={c.id}
                    onClick={() => onRowClick(c.id)}
                    className="cursor-pointer transition-colors"
                    style={{ borderTop: '1px solid rgba(39,39,42,.15)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(2,104,197,.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0"
                          style={{ background: TYPE_COLOR[c.type] || '#6B7280' }}
                        >
                          {c.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-medium truncate" style={{ color: '#1F2533', maxWidth: 180 }}>{c.name}</div>
                          <div className="text-[12px] truncate" style={{ color: '#636363', maxWidth: 180 }}>{c.address || '—'}</div>
                        </div>
                      </div>
                    </td>
                    {/* Type */}
                    <td className="px-4 py-3"><TypeBadge type={c.type} /></td>
                    {/* Tax */}
                    <td className="px-4 py-3 text-[13px]" style={{ fontFamily: 'monospace', color: c.tax ? '#111827' : '#9CA3AF' }}>
                      {c.tax || '—'}
                    </td>
                    {/* Email */}
                    <td className="px-4 py-3 text-[13px]" style={{ color: c.email ? '#111827' : '#9CA3AF' }}>
                      {c.email || '—'}
                    </td>
                    {/* Subscription */}
                    <td className="px-4 py-3">
                      {c.subs.length > 0 ? (
                        <>
                          <div className="text-[13px] font-medium" style={{ color: '#111827' }}>{c.subs.length} sub</div>
                          <div className="text-[12px]" style={{ color: '#636363' }}>{activeSubs} active</div>
                        </>
                      ) : (
                        <span className="text-[13px]" style={{ color: '#9CA3AF' }}>Chưa có</span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1.5">
                        <Button variant="secondary" size="sm" onClick={() => onEdit(c.id)}>✏️ Sửa</Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(c.id)}
                          style={{ color: '#FB2C36', borderColor: '#FB2C36' }}
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  )
}
