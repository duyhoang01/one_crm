import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const CRUMB_MAP = {
  '/customers':    ['Khách hàng'],
  '/contracts':    ['Hợp Đồng'],
  '/subscriptions':['Subscription'],
  '/products':     ['Sản phẩm'],
  '/packages':     ['Gói sản phẩm'],
}

export default function AppLayout({ children }) {
  const { pathname } = useLocation()
  const crumbs = CRUMB_MAP[pathname] || [pathname.replace('/', '')]

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F2F6FA' }}>
      <Sidebar activePath={pathname} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar crumbs={crumbs} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
