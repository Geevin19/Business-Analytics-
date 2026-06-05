import styles from './StatCard.module.css'

interface Props {
  label: string
  value: string
  trend?: string
  trendUp?: boolean
  icon: string
  color?: string
}

export default function StatCard({ label, value, trend, trendUp, icon, color = '#6c63ff' }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrap} style={{ background: `${color}18` }}>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
      </div>
      <div className={styles.body}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{value}</div>
        {trend && (
          <div className={`${styles.trend} ${trendUp ? styles.up : styles.down}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>
    </div>
  )
}
