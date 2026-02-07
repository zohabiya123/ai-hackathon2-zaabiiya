import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, Minus } from 'lucide-react';
import { useTodos } from '../../todos/context/TodoContext';
import { useAuth } from '../../auth/context/AuthContext';
import { processMessage } from '../engine/chatEngine';
import { generateId } from '../../../shared/utils/helpers';
import styles from '../styles/Chat.module.css';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: "Hey there! 👋 I'm **Evo**, your AI task assistant. I can help you add, complete, delete, and search tasks using natural language!\n\nTry one of the quick actions below or just type a command.",
  timestamp: new Date().toISOString(),
};

const QUICK_CHIPS = [
  { label: 'Show all tasks', message: 'Show all tasks' },
  { label: 'Add a task', message: 'Add ' },
  { label: 'My stats', message: 'Show my stats' },
  { label: 'Help', message: 'Help' },
];

const STORAGE_PREFIX = 'evo_chat_history_';
const MAX_MESSAGES = 100;

function loadChatHistory(userId) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_PREFIX + userId) || '[]');
    return data.length > 0 ? data : [WELCOME_MESSAGE];
  } catch {
    return [WELCOME_MESSAGE];
  }
}

function saveChatHistory(userId, messages) {
  const trimmed = messages.slice(-MAX_MESSAGES);
  localStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(trimmed));
}

export function ChatWidget() {
  const { user } = useAuth();
  const { todos, stats, addTodo, deleteTodo, toggleTodo, updateTodo } = useTodos();

  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showWelcomeChips, setShowWelcomeChips] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history
  useEffect(() => {
    if (user?.id) {
      const history = loadChatHistory(user.id);
      setMessages(history);
    }
  }, [user?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
      setHasNewMessage(false);
    }
  }, [isOpen]);

  const executeAction = useCallback((action) => {
    if (!action) return;

    switch (action.type) {
      case 'add':
        addTodo(action.payload);
        break;
      case 'delete':
        deleteTodo(action.payload.todoId);
        break;
      case 'complete':
        toggleTodo(action.payload.todoId);
        break;
      case 'update':
        updateTodo(action.payload.todoId, action.payload.updates);
        break;
      default:
        break;
    }
  }, [addTodo, deleteTodo, toggleTodo, updateTodo]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    setShowWelcomeChips(false);

    // Add user message
    const userMsg = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    const delay = 400 + Math.random() * 400;
    setTimeout(() => {
      // Process with NLP engine
      const result = processMessage(text, todos, stats);

      // Execute action if present
      if (result.action) {
        executeAction(result.action);
      }

      const botMsg = {
        id: generateId(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
        action: result.action || undefined,
      };

      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);
      setIsTyping(false);

      // Save history
      if (user?.id) {
        saveChatHistory(user.id, finalMessages);
      }

      // Notify if panel is closed
      if (!isOpen) {
        setHasNewMessage(true);
      }
    }, delay);
  }, [input, messages, todos, stats, executeAction, user?.id, isOpen]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleChipClick(message) {
    setInput(message);
    setTimeout(() => inputRef.current?.focus(), 50);
    if (message !== 'Add ') {
      // Auto-send for full commands
      setShowWelcomeChips(false);
      const userMsg = {
        id: generateId(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setIsTyping(true);

      setTimeout(() => {
        const result = processMessage(message, todos, stats);
        if (result.action) executeAction(result.action);
        const botMsg = {
          id: generateId(),
          role: 'assistant',
          content: result.response,
          timestamp: new Date().toISOString(),
          action: result.action || undefined,
        };
        const finalMessages = [...updatedMessages, botMsg];
        setMessages(finalMessages);
        setIsTyping(false);
        if (user?.id) saveChatHistory(user.id, finalMessages);
      }, 500);
    }
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function renderContent(content) {
    // Simple markdown-like bold rendering
    return content.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        // Handle strikethrough
        const strikeParts = part.split(/(~~[^~]+~~)/g).map((sp, k) => {
          if (sp.startsWith('~~') && sp.endsWith('~~')) {
            return <s key={k}>{sp.slice(2, -2)}</s>;
          }
          return sp;
        });
        return <span key={j}>{strikeParts}</span>;
      });
      return (
        <span key={i}>
          {i > 0 && <br />}
          {parts}
        </span>
      );
    });
  }

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className={styles.panel}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerAvatar}>
              <Bot size={18} />
            </div>
            <div className={styles.headerInfo}>
              <div className={styles.headerName}>Evo Assistant</div>
              <div className={styles.headerStatus}>
                <span className={styles.onlineDot} />
                Online — AI Powered
              </div>
            </div>
            <button className={styles.headerClose} onClick={() => setIsOpen(false)} aria-label="Minimize chat">
              <Minus size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.map((msg) => (
              <div key={msg.id}>
                <div className={`${styles.messageRow} ${msg.role === 'user' ? styles.messageRowUser : styles.messageRowBot}`}>
                  {msg.role === 'assistant' && (
                    <div className={styles.botAvatarSmall}>
                      <Bot size={14} />
                    </div>
                  )}
                  <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot}`}>
                    {renderContent(msg.content)}
                  </div>
                </div>
                <div className={`${styles.messageTime} ${msg.role === 'assistant' ? styles.messageTimeBot : ''}`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            ))}

            {/* Quick chips after welcome */}
            {showWelcomeChips && messages.length <= 1 && (
              <div className={styles.chips}>
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    className={styles.chip}
                    onClick={() => handleChipClick(chip.message)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className={styles.messageRow}>
                <div className={styles.botAvatarSmall}>
                  <Bot size={14} />
                </div>
                <div className={styles.typingDots}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.inputArea}>
            <input
              ref={inputRef}
              type="text"
              className={styles.inputField}
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        className={`${styles.fab} ${!isOpen && !hasNewMessage ? styles.fabPulse : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <span className={`${styles.fabIcon} ${isOpen ? styles.fabIconOpen : ''}`}>
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </span>
        {hasNewMessage && !isOpen && <span className={styles.fabBadge} />}
      </button>
    </>
  );
}
