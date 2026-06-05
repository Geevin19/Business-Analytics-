import styles from './StatCard.module.css'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Props {
  label: string
  value: string
  trend?: string
  trendUp?: boolean
  icon: React.ReactNode
}

export default function StatCard({ label, value, trend, trendUp, icon }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrap}>{icon}</div>
      <div className={styles.body}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{value}</div>
        {trend && (
          <div className={`${styles.trend} ${trendUp ? styles.up : styles.down}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  )
}
