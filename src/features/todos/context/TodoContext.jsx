import { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { generateId } from '../../../shared/utils/helpers';

const TodoContext = createContext(null);

const STORAGE_KEY = 'evo_todos';

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

const initialFilters = {
  priority: 'all',
  category: 'all',
  search: '',
  sort: 'newest',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TODOS':
      return { ...state, todos: action.payload };

    case 'ADD_TODO': {
      const todos = [action.payload, ...state.todos];
      saveTodos(todos);
      return { ...state, todos };
    }

    case 'UPDATE_TODO': {
      const todos = state.todos.map((t) =>
        t.id === action.payload.id
          ? { ...t, ...action.payload.updates, updatedAt: new Date().toISOString() }
          : t
      );
      saveTodos(todos);
      return { ...state, todos };
    }

    case 'DELETE_TODO': {
      const todos = state.todos.filter((t) => t.id !== action.payload);
      saveTodos(todos);
      return { ...state, todos };
    }

    case 'TOGGLE_TODO': {
      const todos = state.todos.map((t) =>
        t.id === action.payload
          ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() }
          : t
      );
      saveTodos(todos);
      return { ...state, todos };
    }

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    default:
      return state;
  }
}

export function TodoProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, {
    todos: [],
    filters: initialFilters,
  });

  // Load todos when user changes
  useEffect(() => {
    if (user) {
      const all = loadTodos();
      dispatch({ type: 'SET_TODOS', payload: all.filter((t) => t.userId === user.id) });
    }
  }, [user]);

  const addTodo = useCallback((todoData) => {
    if (!user) return;
    const todo = {
      id: generateId(),
      userId: user.id,
      title: todoData.title,
      description: todoData.description || '',
      completed: false,
      priority: todoData.priority || 'medium',
      category: todoData.category || 'personal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // We need to save with all todos (including other users)
    const all = loadTodos();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([todo, ...all]));
    dispatch({ type: 'ADD_TODO', payload: todo });
  }, [user]);

  const updateTodo = useCallback((id, updates) => {
    const all = loadTodos();
    const updated = all.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    dispatch({ type: 'UPDATE_TODO', payload: { id, updates } });
  }, []);

  const deleteTodo = useCallback((id) => {
    const all = loadTodos();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all.filter((t) => t.id !== id)));
    dispatch({ type: 'DELETE_TODO', payload: id });
  }, []);

  const toggleTodo = useCallback((id) => {
    const all = loadTodos();
    const updated = all.map((t) =>
      t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    dispatch({ type: 'TOGGLE_TODO', payload: id });
  }, []);

  const setFilters = useCallback((updates) => {
    dispatch({ type: 'SET_FILTERS', payload: updates });
  }, []);

  // Filtered + sorted todos
  const filteredTodos = useMemo(() => {
    let result = [...state.todos];
    const { priority, category, search, sort } = state.filters;

    if (priority !== 'all') {
      result = result.filter((t) => t.priority === priority);
    }
    if (category !== 'all') {
      result = result.filter((t) => t.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    switch (sort) {
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'priority':
        result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [state.todos, state.filters]);

  // Stats
  const stats = useMemo(() => ({
    total: state.todos.length,
    completed: state.todos.filter((t) => t.completed).length,
    inProgress: state.todos.filter((t) => !t.completed).length,
    highPriority: state.todos.filter((t) => t.priority === 'high' && !t.completed).length,
  }), [state.todos]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { personal: 0, work: 0, health: 0, learning: 0, other: 0 };
    state.todos.forEach((t) => {
      if (counts[t.category] !== undefined) counts[t.category]++;
    });
    return counts;
  }, [state.todos]);

  const value = {
    todos: state.todos,
    filteredTodos,
    stats,
    categoryCounts,
    filters: state.filters,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    setFilters,
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodoContext);
  if (!context) throw new Error('useTodos must be used within TodoProvider');
  return context;
}
