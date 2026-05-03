export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export function valueToAngle(value: number): number {
  return value * 360
}

export function angleToValue(angle: number): number {
  return angle / 360
}

export function angleFromPointer(clientX: number, clientY: number, rect: DOMRect): number {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = clientX - cx
  const dy = clientY - cy
  const raw = (Math.atan2(dy, dx) * 180) / Math.PI + 90
  return ((raw % 360) + 360) % 360
}

export function describePie(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  counterClockwise = false
): string {
  if (endAngle - startAngle >= 360) {
    return `M ${cx} ${cy} m -${r} 0 a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0`
  }
  if (counterClockwise) {
    const start = polarToCartesian(cx, cy, r, -startAngle)
    const end = polarToCartesian(cx, cy, r, -endAngle)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
  }
  const start = polarToCartesian(cx, cy, r, startAngle)
  const end = polarToCartesian(cx, cy, r, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
}
