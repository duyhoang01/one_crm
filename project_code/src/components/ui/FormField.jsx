export default function FormField({ label, required, error, children, note }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-medium" style={{ color: '#111827' }}>
          {label}
          {required && <span className="ml-0.5" style={{ color: '#FB2C36' }}>*</span>}
        </label>
      )}
      {children}
      {note && <p className="text-[11px]" style={{ color: '#636363' }}>{note}</p>}
      {error && <p className="text-[12px]" style={{ color: '#FB2C36' }}>{error}</p>}
    </div>
  )
}

const inputBase = {
  padding: '9px 12px',
  border: '1px solid #E5E5E5',
  borderRadius: '8px',
  fontSize: '14px',
  background: 'white',
  width: '100%',
  outline: 'none',
  transition: 'border .15s, box-shadow .15s',
  fontFamily: 'Inter, sans-serif',
}

function focusStyle(e) {
  e.target.style.borderColor = '#0268C5'
  e.target.style.boxShadow = '0 0 0 3px rgba(2,104,197,.1)'
}
function blurStyle(e) {
  e.target.style.borderColor = '#E5E5E5'
  e.target.style.boxShadow = 'none'
}

export function Input({ readOnly, ...props }) {
  return (
    <input
      style={{ ...inputBase, background: readOnly ? '#F9FAFB' : 'white', color: readOnly ? '#636363' : '#111827', cursor: readOnly ? 'not-allowed' : 'text' }}
      readOnly={readOnly}
      onFocus={readOnly ? undefined : focusStyle}
      onBlur={readOnly ? undefined : blurStyle}
      {...props}
    />
  )
}

export function Select({ children, ...props }) {
  return (
    <select
      style={{
        ...inputBase,
        paddingRight: '36px',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        cursor: 'pointer',
      }}
      onFocus={focusStyle}
      onBlur={blurStyle}
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea({ ...props }) {
  return (
    <textarea
      style={{ ...inputBase, minHeight: '80px', resize: 'vertical' }}
      onFocus={focusStyle}
      onBlur={blurStyle}
      {...props}
    />
  )
}
