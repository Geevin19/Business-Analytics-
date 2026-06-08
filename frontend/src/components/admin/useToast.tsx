import { useState, useCallback } from 'react'
import s from './admin.module.css'

export function useToast() {
  const [message, setMessage] = useState<string | null>(null)

  const show = useCallback((msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(null), 3000)
  }, [])

  const Toast = message ? <div className={s.toast}>{message}</div> : null

  return { show, Toast }
}
