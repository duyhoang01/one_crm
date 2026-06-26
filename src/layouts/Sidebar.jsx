import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const NAV = [
  {
    section: 'Thương mại',
    items: [
      { icon: '👥', label: 'Khách hàng', path: '/customers' },
      { icon: '📄', label: 'Hợp Đồng', path: '/contracts' },
      { icon: '🔑', label: 'Subscription', path: '/subscriptions' },
    ],
  },
  {
    section: 'Danh mục',
    items: [
      { icon: '📦', label: 'Sản phẩm', path: '/products' },
      { icon: '🎁', label: 'Gói sản phẩm', path: '/packages' },
    ],
  },
  {
    section: 'Tích hợp',
    items: [
      { icon: '📤', label: 'Outbox Events', path: '/outbox' },
      { icon: '📥', label: 'Webhook Inbox', path: '/webhook' },
    ],
  },
  {
    section: 'Hệ thống',
    items: [
      { icon: '👤', label: 'Người dùng', path: '/users' },
      { icon: '📋', label: 'Audit log', path: '/audit' },
      { icon: '⚙️', label: 'Cấu hình', path: '/settings' },
    ],
  },
]

function NavItem({ icon, label, active, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg mx-2 cursor-pointer text-sm font-medium transition-all"
      style={{
        color: active ? '#0268C5' : hovered ? '#111827' : '#636363',
        background: active ? '#EBF4FD' : hovered ? '#F3F4F6' : 'transparent',
        fontWeight: active ? 600 : 500,
      }}
    >
      <span className="text-base w-[18px] text-center">{icon}</span>
      {label}
    </div>
  )
}

export default function Sidebar({ activePath }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    setMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className="flex flex-col flex-shrink-0 overflow-y-auto"
      style={{ width: 240, background: '#F1F5F9', borderRight: '1px solid #E5E5E5' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-[18px]" style={{ borderBottom: '1px solid #E5E5E5' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0" style={{ background: '#0268C5' }}>
          CM
        </div>
        <div>
          <div className="text-base font-bold" style={{ color: '#1F2533' }}>OneCRM</div>
          <div className="text-[10px]" style={{ color: '#636363' }}>CMC Cyber Security</div>
        </div>
      </div>

      {/* Nav */}
      <div className="py-2 flex-1">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <div className="px-2 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-[.06em]" style={{ color: '#9CA3AF' }}>
              {section}
            </div>
            {items.map((item) => (
              <NavItem
                key={item.path}
                {...item}
                active={activePath === item.path}
                onClick={() => navigate(item.path)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* User area */}
      <div className="relative">
        {menuOpen && (
          <div
            className="absolute bottom-full left-2 right-2 bg-white rounded-xl overflow-hidden z-50"
            style={{ border: '1px solid #E5E5E5', boxShadow: '0 4px 12px rgba(0,0,0,.1)', marginBottom: 4 }}
          >
            <div className="px-3.5 py-3" style={{ borderBottom: '1px solid #E5E5E5', background: '#F9FAFB' }}>
              <div className="text-[13px] font-semibold" style={{ color: '#1F2533' }}>{user?.name}</div>
              <div className="text-[11px]" style={{ color: '#636363' }}>{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3.5 py-2.5 text-[13px] flex items-center gap-2 transition-colors"
              style={{ color: '#FB2C36', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              🚪 Đăng xuất
            </button>
          </div>
        )}

        <div
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 px-4 py-3.5 cursor-pointer transition-colors"
          style={{ borderTop: '1px solid #E5E5E5' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F4F6')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0"
            style={{ background: user?.avatarBg || '#0268C5' }}
          >
            {user?.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold truncate" style={{ color: '#111827' }}>{user?.name}</div>
            <div className="text-[11px]" style={{ color: '#636363' }}>{user?.role}</div>
          </div>
          <span className="text-base" style={{ color: '#636363' }}>⋯</span>
        </div>
      </div>
    </aside>
  )
}
