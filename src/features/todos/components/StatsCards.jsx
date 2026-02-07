import { ListTodo, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useTodos } from '../context/TodoContext';
import styles from '../styles/Dashboard.module.css';

const STATS_CONFIG = [
  {
    key: 'total',
    label: 'Total Tasks',
    icon: ListTodo,
    bg: '#dbeafe',
    color: '#2563eb',
    darkBg: 'rgba(59,130,246,0.15)',
    darkColor: '#60a5fa',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    bg: '#dcfce7',
    color: '#16a34a',
    darkBg: 'rgba(34,197,94,0.15)',
    darkColor: '#4ade80',
  },
  {
    key: 'inProgress',
    label: 'In Progress',
    icon: Clock,
    bg: '#fef3c7',
    color: '#d97706',
    darkBg: 'rgba(245,158,11,0.15)',
    darkColor: '#fbbf24',
  },
  {
    key: 'highPriority',
    label: 'High Priority',
    icon: AlertTriangle,
    bg: '#fee2e2',
    color: '#dc2626',
    darkBg: 'rgba(239,68,68,0.15)',
    darkColor: '#f87171',
  },
];

export function StatsCards() {
  const { stats } = useTodos();
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  return (
    <div className={styles.statsGrid}>
      {STATS_CONFIG.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.key} className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{
                background: isDark ? s.darkBg : s.bg,
                color: isDark ? s.darkColor : s.color,
              }}
            >
              <Icon size={22} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats[s.key]}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
