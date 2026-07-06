const VARIANTS = {
  primary:   { bg: '#0268C5', color: '#fff', hover: '#0257A8', border: 'none' },
  secondary: { bg: '#F2F7FD', color: '#0268C5', hover: '#E8F0FB', border: '1px solid #E5E7EB' },
  ghost:     { bg: 'transparent', color: '#636363', hover: '#F3F4F6', border: '1px solid #E5E5E5' },
  danger:    { bg: '#FB2C36', color: '#fff', hover: '#d9242d', border: 'none' },
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled, onClick, type = 'button', ...props }) {
  const v = VARIANTS[variant] || VARIANTS.primary
  const padding = size === 'sm' ? '6px 12px' : '9px 16px'
  const fontSize = size === 'sm' ? '13px' : '14px'

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${className}`}
      style={{ background: v.bg, color: v.color, border: v.border, padding, fontSize, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = v.hover }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = v.bg }}
      {...props}
    >
      {children}
    </button>
  )
}
