import styles from './StatCard.module.css'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { ReactNode } from 'react'

interface Props {
  label: string
  value: string
  trend?: string
  trendUp?: boolean
  icon: ReactNode
  iconBg?: string
  iconColor?: string
}

export default function StatCard({ label, value, trend, trendUp, icon, iconBg, iconColor }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <div className={styles.icon} style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>
      <div className={styles.value}>{value}</div>
      {trend && (
        <div className={`${styles.trend} ${trendUp ? styles.up : styles.down}`}>
          {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{trend} vs last period</span>
        </div>
      )}
    </div>
  )
}
