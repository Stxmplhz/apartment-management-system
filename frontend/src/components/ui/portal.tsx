import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"

/**
 * Renders children directly into document.body via a React Portal.
 * This ensures fixed overlays/drawers/modals are never clipped by
 * parent stacking contexts (sticky headers, transformed containers, etc.)
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const el = useRef<HTMLDivElement | null>(null)

  if (!el.current) {
    el.current = document.createElement("div")
  }

  useEffect(() => {
    const container = el.current!
    document.body.appendChild(container)
    return () => {
      document.body.removeChild(container)
    }
  }, [])

  return createPortal(children, el.current)
}
