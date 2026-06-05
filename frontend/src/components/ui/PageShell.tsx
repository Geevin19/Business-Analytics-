import { ReactNode } from 'react'
import styles from './PageShell.module.css'

interface Props {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function PageShell({ title, subtitle, children }: Props) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
