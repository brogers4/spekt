export function Avatar({ name = 'You', src, size = 28, agent = false }) {
  const style = { width: size, height: size, fontSize: size * 0.42 }

  if (agent) {
    return (
      <div
        className="rounded-full shrink-0"
        style={{
          ...style,
          background: 'radial-gradient(circle at 30% 30%, #F1A48E, #E8927C 55%, #C46F58)',
          boxShadow: '0 0 0 3px rgba(232, 146, 124, 0.10)',
        }}
      />
    )
  }

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full shrink-0 object-cover border border-border"
        style={style}
      />
    )
  }

  const initials = name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()
  const hue = (name.charCodeAt(0) * 37) % 360

  return (
    <div
      className="inline-flex items-center justify-center rounded-full shrink-0 font-semibold border border-border"
      style={{
        ...style,
        background: `hsl(${hue} 30% 22%)`,
        color: `hsl(${hue} 35% 75%)`,
      }}
    >
      {initials}
    </div>
  )
}
