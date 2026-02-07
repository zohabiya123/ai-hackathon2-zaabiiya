import { LayoutDashboard, ListTodo, Plus, Settings, User, Heart, BookOpen, Layers, LogOut, Briefcase } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { useTodos } from '../context/TodoContext';
import { getInitials } from '../../../shared/utils/helpers';
import styles from '../styles/Dashboard.module.css';

export function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { categoryCounts, setFilters } = useTodos();

  return (
    <>
      {isOpen && <div className={styles.sidebarOverlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarLogo}>
          <div className={styles.sidebarLogoIcon}>
            <Layers size={22} />
          </div>
          <span className={styles.sidebarLogoText}>Pookie ✨</span>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Navigation</div>
            <button className={`${styles.navItem} ${styles.navItemActive}`}>
              <LayoutDashboard size={18} />
              Dashboard 📊
            </button>
            <button
              className={styles.navItem}
              onClick={() => { setFilters({ priority: 'all', category: 'all' }); onClose(); }}
            >
              <ListTodo size={18} />
              My Tasks 📝
              <span className={styles.navBadge}>{categoryCounts.personal + categoryCounts.work + categoryCounts.health + categoryCounts.learning + categoryCounts.other}</span>
            </button>
            <button className={styles.navItem}>
              <Plus size={18} />
              Add Task ➕
            </button>
            <button className={styles.navItem}>
              <Settings size={18} />
              Settings ⚙️
            </button>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.avatar}>
            {user ? getInitials(user.name) : '?'}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.name || 'User'} 💖</div>
            <div className={styles.userEmail}>{user?.email || ''}</div>
          </div>
          <button className={styles.logoutBtn} onClick={logout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
