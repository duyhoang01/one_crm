import { useEffect } from 'react'
import Button from './Button'

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const maxWidth = size === 'lg' ? '680px' : size === 'sm' ? '440px' : '560px'

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white flex flex-col overflow-hidden"
        style={{
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,.12)',
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          animation: 'modalIn .2s ease',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid #E5E5E5' }}>
          <span className="text-base font-bold" style={{ color: '#1F2533' }}>{title}</span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
            style={{ background: '#F3F4F6', color: '#636363' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#E5E7EB')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#F3F4F6')}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 flex justify-end gap-2.5 flex-shrink-0" style={{ borderTop: '1px solid #E5E5E5' }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(12px) scale(.98) } to { opacity:1; transform:none } }`}</style>
    </div>
  )
}
