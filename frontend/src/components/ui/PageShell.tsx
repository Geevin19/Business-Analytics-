import { ReactNode } from 'react'
import styles from './PageShell.module.css'

interface Props {
  title: string
  subtitle?: string
  children: ReactNode
  actions?: ReactNode
}

export default function PageShell({ title, subtitle, children, actions }: Props) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {actions && <div>{actions}</div>}
      </div>
      {children}
    </div>
  )
}
