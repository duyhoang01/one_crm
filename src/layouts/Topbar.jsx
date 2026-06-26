import { useAuth } from '@/context/AuthContext'

export default function Topbar({ crumbs = [] }) {
  const { user } = useAuth()
  return (
    <div
      className="flex items-center px-6 h-14 flex-shrink-0 gap-3"
      style={{ background: 'white', borderBottom: '1px solid #E5E5E5' }}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px]" style={{ color: '#636363' }}>
        <span>OneCRM</span>
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span>›</span>
            <span style={{ color: i === crumbs.length - 1 ? '#111827' : '#636363', fontWeight: i === crumbs.length - 1 ? 600 : 400 }}>
              {c}
            </span>
          </span>
        ))}
      </nav>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2">
        {['🔔', '❓'].map((icon) => (
          <button
            key={icon}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-base transition-colors"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#636363' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F4F6')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {icon}
          </button>
        ))}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs"
          style={{ background: user?.avatarBg || '#0268C5' }}
        >
          {user?.initials}
        </div>
      </div>
    </div>
  )
}
