'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
};

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [useApi, setUseApi] = useState(false); // Toggle between localStorage and API

  // Load todos from localStorage or API on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (useApi) {
        // Fetch from API
        try {
          const response = await fetch('/api/todos');
          if (response.ok) {
            const { todos: apiTodos } = await response.json();
            setTodos(apiTodos);
          }
        } catch (error) {
          console.error('Failed to fetch todos from API:', error);
        }
      } else {
        // Load from localStorage
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
          try {
            const parsedTodos = JSON.parse(savedTodos);
            // Convert date strings back to Date objects
            const todosWithDates = parsedTodos.map((todo: any) => ({
              ...todo,
              createdAt: new Date(todo.createdAt),
            }));
            setTodos(todosWithDates);
          } catch (error) {
            console.error('Failed to parse todos from localStorage:', error);
          }
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, [useApi]);

  // Save todos to localStorage or API whenever they change
  useEffect(() => {
    if (!isLoading) {
      if (!useApi) {
        localStorage.setItem('todos', JSON.stringify(todos));
      }
    }
  }, [todos, isLoading, useApi]);

  const addTodo = async () => {
    if (inputValue.trim() !== '') {
      if (useApi) {
        // Add to API
        try {
          const response = await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: inputValue.trim() }),
          });
          
          if (response.ok) {
            const newTodo = await response.json();
            setTodos([newTodo, ...todos]);
            setInputValue('');
          }
        } catch (error) {
          console.error('Failed to add todo via API:', error);
        }
      } else {
        // Add to localStorage
        const newTodo: Todo = {
          id: Date.now(),
          text: inputValue.trim(),
          completed: false,
          createdAt: new Date(),
        };
        setTodos([newTodo, ...todos]);
        setInputValue('');
      }
    }
  };

  const toggleTodo = async (id: number) => {
    if (useApi) {
      // Update via API
      const todo = todos.find(t => t.id === id);
      if (todo) {
        try {
          const response = await fetch(`/api/todos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !todo.completed }),
          });
          
          if (response.ok) {
            const updatedTodo = await response.json();
            setTodos(
              todos.map((t) =>
                t.id === id ? { ...updatedTodo, createdAt: new Date(updatedTodo.createdAt) } : t
              )
            );
          }
        } catch (error) {
          console.error('Failed to update todo via API:', error);
        }
      }
    } else {
      // Update in localStorage
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
    }
  };

  const deleteTodo = async (id: number) => {
    if (useApi) {
      // Delete via API
      try {
        const response = await fetch(`/api/todos/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          const deletedTodo = await response.json();
          setTodos(todos.filter((todo) => todo.id !== id));
        }
      } catch (error) {
        console.error('Failed to delete todo via API:', error);
      }
    } else {
      // Delete from localStorage
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10 mt-6">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Evolution Todo</h1>
          <p className="text-gray-600 dark:text-gray-300">Stay organized and boost productivity</p>
        </div>

        {/* Toggle between localStorage and API */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                !useApi
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white'
              }`}
              onClick={() => setUseApi(false)}
            >
              Local Storage
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                useApi
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white'
              }`}
              onClick={() => setUseApi(true)}
            >
              API Backend
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyUp={handleKeyPress}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={addTodo}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition duration-200"
            >
              <Plus size={20} />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400">Loading...</p>
            ) : todos.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 dark:text-gray-500 mb-2">No tasks yet</div>
                <p className="text-gray-500 dark:text-gray-400">Add your first task to get started!</p>
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 ${
                    todo.completed ? 'opacity-70' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className="flex-shrink-0"
                      aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {todo.completed ? (
                        <CheckCircle className="text-green-500" size={24} />
                      ) : (
                        <Circle className="text-gray-400 hover:text-blue-500" size={24} />
                      )}
                    </button>
                    <span
                      className={`text-lg ${
                        todo.completed
                          ? 'line-through text-gray-500 dark:text-gray-500'
                          : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {todo.text}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-700 flex-shrink-0"
                    aria-label="Delete task"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>

          {!isLoading && todos.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
              <p>Total tasks: {todos.length}</p>
              <p>
                Completed: {todos.filter((todo) => todo.completed).length} |{' '}
                Pending: {todos.filter((todo) => !todo.completed).length}
              </p>
            </div>
          )}
        </div>

        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>
            {useApi 
              ? 'Using API backend to store your todos' 
              : 'Your todos are saved in localStorage and will persist between visits'}
          </p>
        </div>
      </div>
    </div>
  );
}