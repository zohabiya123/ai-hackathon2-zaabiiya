# Feature Spec: AI Todo Chatbot (Phase III)

## Overview
An intelligent chat assistant embedded inside the dashboard that lets users manage todos through natural language. Works fully client-side with a smart NLP parser, with optional OpenAI API integration for enhanced understanding.

## Architecture
```
┌──────────────────────────────────────────────┐
│  Chat Widget UI (Floating Panel)             │
│  ├── Message History                         │
│  ├── Input Bar                               │
│  └── Typing Indicator                        │
├──────────────────────────────────────────────┤
│  Chat Engine (NLP Command Router)            │
│  ├── Intent Classifier                       │
│  ├── Entity Extractor (title, date, prio)    │
│  └── Response Generator                      │
├──────────────────────────────────────────────┤
│  TodoContext Integration                     │
│  ├── addTodo / updateTodo / deleteTodo       │
│  ├── toggleTodo / setFilters                 │
│  └── Query: search, filter, stats            │
└──────────────────────────────────────────────┘
```

## Supported Intents

| Intent          | Example Commands                                                  |
|-----------------|-------------------------------------------------------------------|
| `add_task`      | "Add meeting tomorrow high priority", "Create a new task: buy groceries" |
| `delete_task`   | "Delete the gym task", "Remove buy groceries"                     |
| `complete_task` | "Mark meeting as done", "Complete the gym task"                   |
| `search_tasks`  | "Show my pending tasks", "Find tasks about work"                  |
| `change_priority` | "Set meeting to high priority", "Change gym task priority to low" |
| `list_tasks`    | "Show all tasks", "What are my tasks?", "List everything"         |
| `show_stats`    | "How many tasks?", "Show my stats", "What's my progress?"        |
| `help`          | "Help", "What can you do?", "Commands"                            |
| `greet`         | "Hello", "Hi", "Hey"                                             |

## NLP Engine — Intent Classification

### Pattern Matching Rules
```
add_task:      /^(add|create|new|make|schedule)\b/i
delete_task:   /^(delete|remove|trash|discard)\b/i
complete_task: /^(complete|finish|done|mark.*done|mark.*complete|check off)\b/i
search_tasks:  /^(search|find|look for|show.*(?:pending|completed|overdue))\b/i
change_priority: /^(change|set|update).*priority|priority.*to\b/i
list_tasks:    /^(list|show|display|what are|view).*task/i
show_stats:    /^(stats|progress|how many|count|summary)\b/i
help:          /^(help|commands?|what can you|how to)\b/i
greet:         /^(hi|hello|hey|yo|sup)\b/i
```

### Entity Extraction
- **Title:** Text after intent keyword, before priority/category/date modifiers
- **Priority:** Extract from "high priority", "low", "medium", "urgent" (urgent→high)
- **Category:** Extract from "personal", "work", "health", "learning"
- **Date keywords:** "today", "tomorrow", "monday"–"sunday" (for display/description)
- **Task matching:** Fuzzy match user input against existing todo titles

## Data Model
```js
ChatMessage {
  id: string,
  role: "user" | "assistant",
  content: string,
  timestamp: string (ISO),
  action?: {              // Only for assistant messages that performed an action
    type: "add" | "delete" | "complete" | "update" | "search" | "list" | "stats",
    todoId?: string,
    result?: any
  }
}

ChatState {
  messages: ChatMessage[],
  isOpen: boolean,
  isTyping: boolean
}
```

**Storage Key:** `evo_chat_history_{userId}`

## UI Components

### 1. Floating Chat Button (FAB)
- **Position:** Bottom-right corner, 24px from edges
- **Size:** 56px circle
- **Icon:** MessageCircle (lucide) when closed, X when open
- **Style:** Gradient background (primary), white icon, shadow-lg
- **Animation:** Pulse on first load, scale on hover, rotate icon on toggle
- **Badge:** Notification dot when bot responds (if panel is closed)
- **Z-index:** 300 (above modals)

### 2. Chat Panel
- **Position:** Fixed, bottom-right, above FAB
- **Size:** 380px wide × 520px tall (max)
- **Layout:**
  ```
  ┌─ Header ─────────────────────────┐
  │  🤖 Evo Assistant    [minimize]  │
  ├──────────────────────────────────┤
  │                                  │
  │  Message bubbles                 │
  │  (scrollable area)               │
  │                                  │
  │  ┌─ Bot message ───────────┐     │
  │  │  Hello! I can help...   │     │
  │  └─────────────────────────┘     │
  │       ┌─ User message ────┐     │
  │       │  Add gym task      │     │
  │       └────────────────────┘     │
  │  ┌─ Bot message ───────────┐     │
  │  │  ✅ Added "gym task"!   │     │
  │  └─────────────────────────┘     │
  │                                  │
  │  ● ● ● (typing indicator)       │
  ├──────────────────────────────────┤
  │  [💬 Type a message...] [Send]  │
  └──────────────────────────────────┘
  ```
- **Animation:** Slide up + fade in from bottom-right
- **Responsive:** Full-width on mobile (<480px), full-height panel

### 3. Message Bubbles
- **User messages:** Right-aligned, primary gradient bg, white text
- **Bot messages:** Left-aligned, card-bg, text-primary, with bot avatar
- **Action messages:** Include visual confirmation (checkmark, tag colors)
- **Task cards:** When listing/searching, show mini task cards inside chat
- **Timestamp:** Small, muted, below each message group

### 4. Quick Action Chips
- Below welcome message, show clickable suggestion chips:
  - "Show all tasks"
  - "Add a task"
  - "My stats"
  - "Help"

### 5. Typing Indicator
- Three bouncing dots animation
- Shows for 400-800ms before bot response (simulated thinking)

## Chat Engine API
```js
ChatEngine {
  processMessage(input: string, todos: Todo[]) => {
    intent: string,
    response: string,
    action?: { type, payload }
  }
}
```

## Response Templates

### Greetings
- "Hey there! 👋 I'm Evo, your task assistant. Try saying 'add buy groceries' or 'show my tasks'!"

### Add Task Confirmation
- "✅ Added **\"{title}\"** with {priority} priority in {category}!"

### Delete Confirmation
- "🗑️ Deleted **\"{title}\"** from your tasks."

### Complete Confirmation
- "🎉 Marked **\"{title}\"** as complete! Great work!"

### Priority Change
- "🔄 Changed **\"{title}\"** priority to **{priority}**."

### List/Search Results
- "📋 Here are your {filter} tasks:" + mini task cards

### Stats
- "📊 **Task Summary:**\n• Total: {n}\n• Completed: {n}\n• In Progress: {n}\n• High Priority: {n}"

### No Match
- "🤔 I didn't quite get that. Try 'add', 'delete', 'complete', 'show tasks', or type 'help' for all commands."

### Help
- Full command list formatted nicely

## Behavior Rules
1. Chat history persists per user in localStorage
2. Bot simulates "typing" delay (500ms) before responding
3. Chat panel remembers open/closed state per session
4. Pressing Enter sends message, Shift+Enter for newline
5. Empty messages are ignored
6. Chat auto-scrolls to latest message
7. Fuzzy matching for task names (case-insensitive, partial match)
8. Welcome message shown on first open
9. Max 100 messages in history (oldest pruned)

## UI Design
- Panel: card-bg, border, radius-lg, shadow-xl
- Header: gradient-primary bg, white text, 52px height
- User bubble: gradient-primary, white text, radius 16px 16px 4px 16px
- Bot bubble: bg-tertiary, text-primary, radius 16px 16px 16px 4px
- Input: 48px height, border, radius-md, send button with arrow icon
- FAB: gradient, 56px, shadow-lg, z-index 300
- Transitions: all elements use var(--transition)
- Supports dark + light themes via CSS variables
