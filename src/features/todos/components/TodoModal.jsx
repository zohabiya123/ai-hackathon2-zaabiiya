import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTodos } from '../context/TodoContext';
import styles from '../styles/Dashboard.module.css';

const PRIORITIES = ['low', 'medium', 'high'];
const CATEGORIES = ['personal', 'work', 'health', 'learning', 'other'];

export function TodoModal({ todo, onClose }) {
  const { addTodo, updateTodo } = useTodos();
  const isEditing = !!todo;
  const titleRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'personal',
  });

  useEffect(() => {
    if (todo) {
      setForm({
        title: todo.title,
        description: todo.description || '',
        priority: todo.priority,
        category: todo.category,
      });
    }
    // Auto-focus title
    setTimeout(() => titleRef.current?.focus(), 100);
  }, [todo]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (isEditing) {
      updateTodo(todo.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        category: form.category,
      });
    } else {
      addTodo({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        category: form.category,
      });
    }
    onClose();
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isEditing ? 'Edit Task' : 'New Task'}</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form className={styles.modalForm} onSubmit={handleSubmit}>
          <div className={styles.modalField}>
            <label className={styles.modalLabel}>Title</label>
            <input
              ref={titleRef}
              type="text"
              className={styles.modalInput}
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={100}
            />
          </div>

          <div className={styles.modalField}>
            <label className={styles.modalLabel}>Description (optional)</label>
            <textarea
              className={styles.modalTextarea}
              placeholder="Add more details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={500}
              rows={3}
            />
          </div>

          <div className={styles.modalField}>
            <label className={styles.modalLabel}>Priority</label>
            <div className={styles.radioGroup}>
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.radioOption} ${form.priority === p ? styles.radioOptionActive : ''}`}
                  onClick={() => setForm({ ...form, priority: p })}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.modalField}>
            <label className={styles.modalLabel}>Category</label>
            <select
              className={styles.modalSelect}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnSave} disabled={!form.title.trim()}>
              {isEditing ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
