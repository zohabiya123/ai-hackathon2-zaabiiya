/**
 * Chat Engine — per FEATURE-AI-CHATBOT.md spec
 * Processes natural language input → intent + action + response
 */

import { classifyIntent } from './intentClassifier';
import { extractEntities, fuzzyMatchTodos } from './entityExtractor';

/**
 * Process a user message and return bot response + optional action
 * @param {string} input - User message
 * @param {Todo[]} todos - Current user's todos
 * @param {object} stats - Current stats { total, completed, inProgress, highPriority }
 * @returns {{ intent, response, action? }}
 */
export function processMessage(input, todos, stats) {
  const intent = classifyIntent(input);
  const entities = extractEntities(input);

  switch (intent) {
    case 'add_task':
      return handleAddTask(entities);

    case 'delete_task':
      return handleDeleteTask(input, entities, todos);

    case 'complete_task':
      return handleCompleteTask(input, entities, todos);

    case 'change_priority':
      return handleChangePriority(input, entities, todos);

    case 'search_tasks':
      return handleSearchTasks(input, entities, todos);

    case 'list_tasks':
      return handleListTasks(todos);

    case 'show_stats':
      return handleShowStats(stats);

    case 'help':
      return handleHelp();

    case 'greet':
      return handleGreet();

    default:
      return handleUnknown();
  }
}

function handleAddTask(entities) {
  const title = entities.title;
  if (!title || title.length < 2) {
    return {
      intent: 'add_task',
      response: "What's the task you'd like to add? Try: **\"Add buy groceries high priority\"**",
    };
  }

  const priority = entities.priority || 'medium';
  const category = entities.category || 'personal';
  const dateInfo = entities.dateHint ? ` (${entities.dateHint}${entities.timeHint ? ' ' + entities.timeHint : ''})` : '';

  const fullTitle = title + dateInfo;

  return {
    intent: 'add_task',
    response: `Added **"${fullTitle}"** with **${priority}** priority in **${category}**!`,
    action: {
      type: 'add',
      payload: {
        title: fullTitle,
        description: entities.dateHint ? `Scheduled: ${entities.dateHint}${entities.timeHint ? ' at ' + entities.timeHint : ''}` : '',
        priority,
        category,
      },
    },
  };
}

function handleDeleteTask(input, entities, todos) {
  const query = extractTaskQuery(input, ['delete', 'remove', 'trash', 'discard', 'drop', 'cancel', 'get rid of']);
  const matches = fuzzyMatchTodos(query, todos);

  if (matches.length === 0) {
    return {
      intent: 'delete_task',
      response: `Couldn't find a task matching **"${query}"**. Try **"show all tasks"** to see your task list.`,
    };
  }

  const target = matches[0];
  return {
    intent: 'delete_task',
    response: `Deleted **"${target.title}"** from your tasks.`,
    action: { type: 'delete', payload: { todoId: target.id } },
  };
}

function handleCompleteTask(input, entities, todos) {
  const query = extractTaskQuery(input, ['complete', 'finish', 'done', 'check off', 'mark', 'i finished', 'i completed', 'i did']);
  const incompleteTodos = todos.filter((t) => !t.completed);
  const matches = fuzzyMatchTodos(query, incompleteTodos);

  if (matches.length === 0) {
    // Try matching all todos
    const allMatches = fuzzyMatchTodos(query, todos);
    if (allMatches.length > 0 && allMatches[0].completed) {
      return {
        intent: 'complete_task',
        response: `**"${allMatches[0].title}"** is already completed! Great job! 🎉`,
      };
    }
    return {
      intent: 'complete_task',
      response: `Couldn't find an incomplete task matching **"${query}"**. Try **"show pending tasks"**.`,
    };
  }

  const target = matches[0];
  return {
    intent: 'complete_task',
    response: `Marked **"${target.title}"** as complete! Great work! 🎉`,
    action: { type: 'complete', payload: { todoId: target.id } },
  };
}

function handleChangePriority(input, entities, todos) {
  // Extract the new priority
  const prioMatch = input.match(/\b(low|medium|high|urgent|critical|important)\b/i);
  const newPriority = prioMatch
    ? { low: 'low', medium: 'medium', high: 'high', urgent: 'high', critical: 'high', important: 'high' }[prioMatch[1].toLowerCase()]
    : null;

  if (!newPriority) {
    return {
      intent: 'change_priority',
      response: "What priority? Try: **\"Change meeting to high priority\"**",
    };
  }

  const query = extractTaskQuery(input, ['change', 'set', 'update', 'modify', 'make', 'priority', 'to', newPriority, prioMatch?.[1]?.toLowerCase()]);
  const matches = fuzzyMatchTodos(query, todos);

  if (matches.length === 0) {
    return {
      intent: 'change_priority',
      response: `Couldn't find a task matching **"${query}"**. Try **"show all tasks"** first.`,
    };
  }

  const target = matches[0];
  return {
    intent: 'change_priority',
    response: `Changed **"${target.title}"** priority to **${newPriority}**.`,
    action: {
      type: 'update',
      payload: { todoId: target.id, updates: { priority: newPriority } },
    },
  };
}

function handleSearchTasks(input, entities, todos) {
  // Check for status-based search
  const pendingMatch = input.match(/\b(pending|incomplete|in progress|not done|active)\b/i);
  const completedMatch = input.match(/\b(completed|done|finished)\b/i);

  let filtered = todos;
  let label = '';

  if (pendingMatch) {
    filtered = todos.filter((t) => !t.completed);
    label = 'pending';
  } else if (completedMatch) {
    filtered = todos.filter((t) => t.completed);
    label = 'completed';
  } else {
    // Text-based search
    const query = extractTaskQuery(input, ['search', 'find', 'look for', 'look up', 'show', 'about']);
    filtered = fuzzyMatchTodos(query, todos);
    label = `matching "${query}"`;
  }

  if (filtered.length === 0) {
    return {
      intent: 'search_tasks',
      response: `No ${label} tasks found.`,
      action: { type: 'search', payload: { results: [] } },
    };
  }

  const taskList = filtered
    .slice(0, 5)
    .map((t) => {
      const status = t.completed ? '~~' : '';
      const prio = t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢';
      return `${prio} ${status}${t.title}${status}`;
    })
    .join('\n');

  const extra = filtered.length > 5 ? `\n\n...and ${filtered.length - 5} more` : '';

  return {
    intent: 'search_tasks',
    response: `Here are your **${label}** tasks (${filtered.length}):\n\n${taskList}${extra}`,
    action: { type: 'search', payload: { results: filtered } },
  };
}

function handleListTasks(todos) {
  if (todos.length === 0) {
    return {
      intent: 'list_tasks',
      response: "You don't have any tasks yet! Try **\"Add my first task\"** to get started.",
      action: { type: 'list', payload: { results: [] } },
    };
  }

  const taskList = todos
    .slice(0, 8)
    .map((t) => {
      const status = t.completed ? '✅' : '⬜';
      const prio = t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢';
      return `${status} ${prio} ${t.title}`;
    })
    .join('\n');

  const extra = todos.length > 8 ? `\n\n...and ${todos.length - 8} more` : '';

  return {
    intent: 'list_tasks',
    response: `Here are your tasks (${todos.length}):\n\n${taskList}${extra}`,
    action: { type: 'list', payload: { results: todos } },
  };
}

function handleShowStats(stats) {
  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return {
    intent: 'show_stats',
    response: [
      '**Task Summary:**\n',
      `📋 Total: **${stats.total}**`,
      `✅ Completed: **${stats.completed}**`,
      `⏳ In Progress: **${stats.inProgress}**`,
      `🔴 High Priority: **${stats.highPriority}**`,
      `📈 Completion Rate: **${completionRate}%**`,
    ].join('\n'),
    action: { type: 'stats', payload: stats },
  };
}

function handleHelp() {
  return {
    intent: 'help',
    response: [
      "Here's what I can do:\n",
      '**Add a task:**',
      '  "Add buy groceries high priority"',
      '  "Create meeting tomorrow 2pm"\n',
      '**Complete a task:**',
      '  "Mark meeting as done"',
      '  "Complete gym task"\n',
      '**Delete a task:**',
      '  "Delete the gym task"',
      '  "Remove buy groceries"\n',
      '**Change priority:**',
      '  "Set meeting to high priority"\n',
      '**View tasks:**',
      '  "Show all tasks"',
      '  "Show pending tasks"',
      '  "Search gym"\n',
      '**Stats:**',
      '  "Show my stats"',
      '  "How many tasks do I have?"',
    ].join('\n'),
  };
}

function handleGreet() {
  const greetings = [
    "Hey there! 👋 I'm **Evo**, your task assistant. Try saying **\"add buy groceries\"** or **\"show my tasks\"**!",
    "Hello! 😊 I'm here to help you manage your tasks. What would you like to do?",
    "Hi! 👋 Ready to help you stay productive. Try **\"add a task\"** or **\"show stats\"**!",
  ];
  return {
    intent: 'greet',
    response: greetings[Math.floor(Math.random() * greetings.length)],
  };
}

function handleUnknown() {
  return {
    intent: 'unknown',
    response: "I didn't quite get that. Try **\"add\"**, **\"delete\"**, **\"complete\"**, **\"show tasks\"**, or type **\"help\"** for all commands.",
  };
}

/**
 * Strip intent keywords to isolate the task name query
 */
function extractTaskQuery(input, stripWords) {
  let text = input.trim();
  for (const word of stripWords) {
    if (!word) continue;
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    text = text.replace(regex, '');
  }
  // Clean up filler words
  text = text.replace(/\b(the|a|an|my|as|to|from|in|is|it|of|task|todo)\b/gi, '');
  text = text.replace(/[^a-zA-Z0-9\s]/g, '');
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}
