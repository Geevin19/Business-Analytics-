import { ReactNode } from 'react'
import s from './admin.module.css'

interface Props {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

export default function AdminPageShell({ title, subtitle, actions, children }: Props) {
  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>{title}</h1>
          {subtitle && <p className={s.subtitle}>{subtitle}</p>}
        </div>
        {actions && <div>{actions}</div>}
      </div>
      {children}
    </div>
  )
}
