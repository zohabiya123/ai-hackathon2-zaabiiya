import { Plus } from 'lucide-react';
import { useTodos } from '../context/TodoContext';
import styles from '../styles/Dashboard.module.css';

const PRIORITIES = ['all', 'low', 'medium', 'high'];

export function FiltersBar({ onAddClick }) {
  const { filters, setFilters } = useTodos();

  return (
    <div className={styles.filtersBar}>
      <div className={styles.filterGroup}>
        {PRIORITIES.map((p) => (
          <button
            key={p}
            className={`${styles.filterPill} ${filters.priority === p ? styles.filterPillActive : ''}`}
            onClick={() => setFilters({ priority: p })}
          >
            {p === 'all' ? 'All Priorities 🌟' : p.charAt(0).toUpperCase() + p.slice(1) + ' Priority 📌'}
          </button>
        ))}
      </div>

      <select
        className={styles.sortSelect}
        value={filters.sort}
        onChange={(e) => setFilters({ sort: e.target.value })}
      >
        <option value="newest">Newest ✨</option>
        <option value="oldest">Oldest 📜</option>
        <option value="priority">Priority 🔥</option>
      </select>

      <button className={styles.addBtn} onClick={onAddClick}>
        <Plus size={18} />
        Add Task ➕
      </button>
    </div>
  );
}
