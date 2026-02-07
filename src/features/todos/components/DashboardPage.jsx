import { useState, useCallback } from 'react';
import { Search, Menu, ClipboardList } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { ThemeToggle } from '../../theme/components/ThemeToggle';
import { useTodos } from '../context/TodoContext';
import { Sidebar } from './Sidebar';
import { FiltersBar } from './FiltersBar';
import { TodoItem } from './TodoItem';
import { TodoModal } from './TodoModal';
import { DeleteModal } from './DeleteModal';
import { ChatWidget } from '../../chat/components/ChatWidget';
import { getInitials, debounce } from '../../../shared/utils/helpers';
import styles from '../styles/Dashboard.module.css';

export function DashboardPage() {
  const { user } = useAuth();
  const { filteredTodos, setFilters } = useTodos();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [deleteTodo, setDeleteTodo] = useState(null);

  const handleSearch = useCallback(
    debounce((value) => {
      setFilters({ search: value });
    }, 300),
    [setFilters]
  );

  function handleEdit(todo) {
    setEditTodo(todo);
  }

  function handleDelete(todo) {
    setDeleteTodo(todo);
  }

  function closeModal() {
    setShowAddModal(false);
    setEditTodo(null);
    setDeleteTodo(null);
  }

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <button
            className={styles.hamburger}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <h1 className={styles.headerTitle}>Dashboard 📋</h1>

          <div className={styles.welcomeMessage}>
            Welcome back, let's finish your tasks today 💪💖
          </div>

          <div className={styles.searchBar}>
            <span className={styles.searchIcon}>
              <Search size={18} />
            </span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search tasks..."
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className={styles.headerRight}>
            <ThemeToggle />
            <div className={styles.avatar} title={user?.name}>
              {user ? getInitials(user.name) : '?'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>
          <FiltersBar onAddClick={() => setShowAddModal(true)} />

          {/* Todo List */}
          <div className={styles.todoList}>
            {filteredTodos.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <ClipboardList size={32} />
                </div>
                <div className={styles.emptyTitle}>No tasks found ✨</div>
                <div className={styles.emptyDesc}>
                  Create your first task to get started! 💗
                </div>
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {(showAddModal || editTodo) && (
        <TodoModal todo={editTodo} onClose={closeModal} />
      )}
      {deleteTodo && (
        <DeleteModal todo={deleteTodo} onClose={closeModal} />
      )}

      {/* AI Chat Widget */}
      <ChatWidget />
    </div>
  );
}
