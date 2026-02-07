import { Check, Pencil, Trash2, User, Briefcase, Heart, BookOpen, Package } from 'lucide-react';
import { useTodos } from '../context/TodoContext';
import { timeAgo } from '../../../shared/utils/helpers';
import styles from '../styles/Dashboard.module.css';

const CATEGORY_ICONS = {
  personal: User,
  work: Briefcase,
  health: Heart,
  learning: BookOpen,
  other: Package,
};

const PRIORITY_CLASS = {
  low: styles.badgeLow,
  medium: styles.badgeMedium,
  high: styles.badgeHigh,
};

export function TodoItem({ todo, onEdit, onDelete }) {
  const { toggleTodo } = useTodos();
  const CatIcon = CATEGORY_ICONS[todo.category] || Package;

  return (
    <div className={`${styles.todoItem} ${todo.completed ? styles.todoCompleted : ''}`}>
      <button
        className={`${styles.checkbox} ${todo.completed ? styles.checkboxChecked : ''}`}
        onClick={() => toggleTodo(todo.id)}
        aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {todo.completed && <Check size={14} strokeWidth={3} />}
      </button>

      <div className={styles.todoContent}>
        <div className={`${styles.todoTitle} ${todo.completed ? styles.todoTitleDone : ''}`}>
          {todo.title}
        </div>
        {todo.description && (
          <div className={styles.todoDesc}>{todo.description}</div>
        )}
      </div>

      <div className={styles.todoBadges}>
        <span className={`${styles.badge} ${PRIORITY_CLASS[todo.priority]}`}>
          {todo.priority === 'low' ? 'Low Priority 💚' :
           todo.priority === 'medium' ? 'Medium Priority 🟡' :
           'High Priority ❤️'}
        </span>
        <span className={styles.categoryBadge}>
          <CatIcon size={12} />
          {todo.category}
        </span>
      </div>

      <span className={styles.todoTime}>{timeAgo(todo.createdAt)}</span>

      <div className={styles.todoActions}>
        <button
          className={styles.actionBtn}
          onClick={() => onEdit(todo)}
          aria-label="Edit todo"
        >
          <Pencil size={15} />
        </button>
        <button
          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
          onClick={() => onDelete(todo)}
          aria-label="Delete todo"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
