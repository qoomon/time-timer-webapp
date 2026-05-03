import { useCallback, useRef } from 'react'
import { angleFromPointer } from '../utils/geometry'

interface UsePointerDragOptions {
  onDragStart: () => void
  onDrag: (angle: number) => void
  onDragEnd: () => void
}

export function usePointerDrag({ onDragStart, onDrag, onDragEnd }: UsePointerDragOptions) {
  const dragging = useRef(false)
  const containerRef = useRef<SVGSVGElement>(null)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      dragging.current = true
      onDragStart()
      const rect = e.currentTarget.getBoundingClientRect()
      onDrag(angleFromPointer(e.clientX, e.clientY, rect))
    },
    [onDragStart, onDrag]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!dragging.current) return
      const rect = e.currentTarget.getBoundingClientRect()
      onDrag(angleFromPointer(e.clientX, e.clientY, rect))
    },
    [onDrag]
  )

  const handlePointerUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    onDragEnd()
  }, [onDragEnd])

  return {
    containerRef,
    pointerHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    },
  }
}
