import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '@/context/CustomerContext'
import { useToast } from '@/hooks/useToast'
import CustomerTable from '@/components/customers/CustomerTable'
import CreateCustomerModal from '@/components/customers/CreateCustomerModal'
import Button from '@/components/ui/Button'
import ToastContainer from '@/components/ui/Toast'

export default function CustomerListPage() {
  const { customers } = useCustomers()
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()
  const [showCreate, setShowCreate] = useState(false)

  function handleCreateSuccess(newCustomer) {
    addToast({ type: 'success', title: 'Tạo thành công', sub: `${newCustomer.name} đã được thêm` })
  }

  return (
    <>
      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1F2533' }}>Danh sách Khách hàng</h1>
          <p className="text-[13px] mt-0.5" style={{ color: '#636363' }}>
            Quản lý toàn bộ hồ sơ khách hàng — B2B, Reseller, B2C, Other
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          ＋ Thêm Khách hàng
        </Button>
      </div>

      {/* Table */}
      <CustomerTable
        customers={customers}
        onRowClick={(id) => navigate(`/customers/${id}`)}
        onEdit={(id) => navigate(`/customers/${id}?tab=edit`)}
        onDelete={(id) => navigate(`/customers/${id}?action=delete`)}
      />

      {/* Create modal */}
      <CreateCustomerModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
