const STYLES = {
  success: { bg: '#065F46' },
  error:   { bg: '#991B1B' },
  info:    { bg: '#1F2533' },
}
const ICONS = { success: '✓', error: '✕', info: 'ℹ' }

function ToastItem({ toast, onRemove }) {
  const style = STYLES[toast.type] || STYLES.info
  return (
    <div
      className="flex items-start gap-2.5 rounded-lg pointer-events-auto"
      style={{
        background: style.bg,
        color: '#fff',
        padding: '12px 16px',
        minWidth: '280px',
        maxWidth: '360px',
        boxShadow: '0 4px 12px rgba(0,0,0,.1)',
        animation: 'toastIn .25s ease',
      }}
    >
      <span className="text-base flex-shrink-0 mt-px">{ICONS[toast.type]}</span>
      <div className="flex-1">
        <div className="text-[13px] font-medium">{toast.title}</div>
        {toast.sub && <div className="text-[12px] opacity-80 mt-0.5">{toast.sub}</div>}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="opacity-60 hover:opacity-100 text-xs mt-0.5 flex-shrink-0"
        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
      >
        ✕
      </button>
    </div>
  )
}

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <>
      <div className="fixed top-5 right-5 z-[300] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={onRemove} />
        ))}
      </div>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(12px) } to { opacity:1; transform:none } }`}</style>
    </>
  )
}
