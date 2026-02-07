/**
 * Entity Extractor — per FEATURE-AI-CHATBOT.md spec
 * Extracts title, priority, category, and date hints from user input
 */

const PRIORITY_MAP = {
  low: 'low',
  medium: 'medium',
  mid: 'medium',
  normal: 'medium',
  high: 'high',
  urgent: 'high',
  critical: 'high',
  important: 'high',
};

const CATEGORY_MAP = {
  personal: 'personal',
  work: 'work',
  office: 'work',
  job: 'work',
  health: 'health',
  gym: 'health',
  fitness: 'health',
  exercise: 'health',
  workout: 'health',
  learning: 'learning',
  study: 'learning',
  course: 'learning',
  read: 'learning',
  other: 'other',
};

const STRIP_WORDS = [
  'add', 'create', 'new', 'make', 'schedule', 'set up', 'plan',
  'a', 'an', 'the', 'my', 'task', 'todo', 'to-do', 'to do',
  'i need to', 'i want to', 'i have to', 'remind me to',
  'please', 'called', 'named', 'titled',
];

const DATE_WORDS = [
  'today', 'tomorrow', 'tonight', 'morning', 'afternoon', 'evening',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'next week', 'this week',
];

const TIME_PATTERN = /\b\d{1,2}(:\d{2})?\s*(am|pm)\b/i;

export function extractEntities(input) {
  let text = input.trim();
  const entities = {
    title: '',
    priority: null,
    category: null,
    dateHint: null,
    timeHint: null,
  };

  // Extract priority
  const prioMatch = text.match(
    /\b(low|medium|mid|normal|high|urgent|critical|important)\s*(priority|prio)?\b/i
  );
  if (prioMatch) {
    entities.priority = PRIORITY_MAP[prioMatch[1].toLowerCase()] || 'medium';
    text = text.replace(prioMatch[0], '').trim();
  }
  // Also check "priority <word>"
  const prioMatch2 = text.match(/\bpriority\s+(low|medium|mid|normal|high|urgent|critical|important)\b/i);
  if (prioMatch2) {
    entities.priority = PRIORITY_MAP[prioMatch2[1].toLowerCase()] || 'medium';
    text = text.replace(prioMatch2[0], '').trim();
  }

  // Extract category
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    const catRegex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (catRegex.test(text)) {
      entities.category = category;
      // Don't remove category words if they're part of the task title
      break;
    }
  }

  // Extract date hints
  for (const dateWord of DATE_WORDS) {
    const dateRegex = new RegExp(`\\b${dateWord}\\b`, 'i');
    if (dateRegex.test(text)) {
      entities.dateHint = dateWord;
      text = text.replace(dateRegex, '').trim();
      break;
    }
  }

  // Extract time hints
  const timeMatch = text.match(TIME_PATTERN);
  if (timeMatch) {
    entities.timeHint = timeMatch[0];
    text = text.replace(TIME_PATTERN, '').trim();
  }

  // Strip intent words and filler words to get title
  let title = text;
  for (const word of STRIP_WORDS) {
    const wordRegex = new RegExp(`^${word}\\b\\s*`, 'i');
    title = title.replace(wordRegex, '');
  }

  // Clean up extra spaces, colons, dashes at start
  title = title.replace(/^[\s:,\-–—]+/, '').replace(/[\s:,\-–—]+$/, '').trim();

  entities.title = title;

  return entities;
}

/**
 * Fuzzy match a query against a list of todos
 * Returns matching todos sorted by relevance
 */
export function fuzzyMatchTodos(query, todos) {
  if (!query || !todos.length) return [];

  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/);

  return todos
    .map((todo) => {
      const titleLower = todo.title.toLowerCase();
      const descLower = (todo.description || '').toLowerCase();

      let score = 0;

      // Exact title match
      if (titleLower === q) score += 100;
      // Title contains full query
      else if (titleLower.includes(q)) score += 60;
      // Each word match
      else {
        for (const word of words) {
          if (word.length < 2) continue;
          if (titleLower.includes(word)) score += 20;
          if (descLower.includes(word)) score += 5;
        }
      }

      return { todo, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.todo);
}
