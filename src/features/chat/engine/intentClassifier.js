/**
 * Intent Classifier — per FEATURE-AI-CHATBOT.md spec
 * Pattern-based NLP intent detection + entity extraction
 */

const INTENT_PATTERNS = [
  {
    intent: 'add_task',
    patterns: [
      /^(add|create|new|make|schedule|set up|plan)\b/i,
      /^(i need to|i want to|i have to|remind me to)\b/i,
    ],
  },
  {
    intent: 'delete_task',
    patterns: [
      /^(delete|remove|trash|discard|drop|cancel)\b/i,
      /^(get rid of)\b/i,
    ],
  },
  {
    intent: 'complete_task',
    patterns: [
      /^(complete|finish|done|check off)\b/i,
      /^mark\b.*\b(done|complete|finished)\b/i,
      /^(i finished|i completed|i did)\b/i,
    ],
  },
  {
    intent: 'change_priority',
    patterns: [
      /^(change|set|update|modify).*priorit/i,
      /priorit.*\b(to|as)\b.*(low|medium|high|urgent)/i,
      /^(make|set)\b.*\b(low|medium|high|urgent)\b.*priorit/i,
    ],
  },
  {
    intent: 'search_tasks',
    patterns: [
      /^(search|find|look for|look up)\b/i,
      /^show\b.*\b(pending|completed|done|incomplete|finished|overdue)\b/i,
      /^(what|which)\b.*\b(pending|completed|done|incomplete)\b/i,
    ],
  },
  {
    intent: 'list_tasks',
    patterns: [
      /^(list|show|display|view|see)\b.*\btask/i,
      /^(show|list|display|view|see)\b.*\b(all|every|my)\b/i,
      /^what\s*(are|is)\s*my\s*task/i,
      /^(show|list)\s*(me\s*)?(all|every|the)\b/i,
      /^(all|my)\s*tasks?\b/i,
    ],
  },
  {
    intent: 'show_stats',
    patterns: [
      /^(stats|statistics|progress|summary)\b/i,
      /^(how many|count|total)\b.*task/i,
      /^what('s| is)\s*(my\s*)?(progress|status|stats)/i,
    ],
  },
  {
    intent: 'help',
    patterns: [
      /^(help|commands?|how to|what can you|guide|assist)\b/i,
      /^what\s*(do|can)\s*you\b/i,
    ],
  },
  {
    intent: 'greet',
    patterns: [
      /^(hi|hello|hey|yo|sup|good\s*(morning|afternoon|evening)|greetings)\b/i,
    ],
  },
];

export function classifyIntent(input) {
  const trimmed = input.trim();

  for (const { intent, patterns } of INTENT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(trimmed)) {
        return intent;
      }
    }
  }

  return 'unknown';
}
