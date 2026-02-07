import { AlertTriangle } from 'lucide-react';
import { useTodos } from '../context/TodoContext';
import styles from '../styles/Dashboard.module.css';

export function DeleteModal({ todo, onClose }) {
  const { deleteTodo } = useTodos();

  function handleDelete() {
    deleteTodo(todo.id);
    onClose();
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.deleteModal}>
          <div className={styles.deleteIcon}>
            <AlertTriangle size={28} />
          </div>
          <div className={styles.deleteTitle}>Delete Task?</div>
          <div className={styles.deleteDesc}>
            Are you sure you want to delete <strong>"{todo.title}"</strong>? This action cannot be undone.
          </div>
          <div className={styles.modalActions}>
            <button className={styles.btnCancel} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.btnDelete} onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
