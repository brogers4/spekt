const palette = {
  PRFAQ:    { bg: '#2A1C18', fg: '#E8927C' },
  PRD:      { bg: '#2A2317', fg: '#E8C679' },
  EPIC:     { bg: '#1A2522', fg: '#8FB9A8' },
  STORY:    { bg: '#182230', fg: '#8BB3E8' },
  FLOW:     { bg: '#1E232C', fg: '#B3B8C3' },
  SEQUENCE: { bg: '#1E232C', fg: '#B3B8C3' },
  JOURNEY:  { bg: '#1E232C', fg: '#B3B8C3' },
}

export function Tag({ children, kind = 'PRD' }) {
  const { bg, fg } = palette[kind] ?? { bg: '#1E232C', fg: '#B3B8C3' }
  return (
    <span
      style={{ background: bg, color: fg }}
      className="font-mono text-[10.5px] font-semibold tracking-[0.04em] px-[7px] py-[2px] rounded-sm uppercase"
    >
      {children ?? kind}
    </span>
  )
}
