import { ThemeProvider } from '../features/theme/context/ThemeContext';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { TodoProvider } from '../features/todos/context/TodoContext';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TodoProvider>
          {children}
        </TodoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
