// Roles a champion can be played in during a run.
// `key` is what we store; `label` is what we show.
export const ROLES = [
  { key: 'top', label: 'Top' },
  { key: 'jungle', label: 'Jungle' },
  { key: 'mid', label: 'Mid' },
  { key: 'bot', label: 'Bot' },
  { key: 'support', label: 'Support' },
]

// Champion classes, as they appear in Data Dragon's `tags`. Used to scope a
// run's champion pool (e.g. a Marksman-only A–Z).
export const CLASSES = [
  { key: 'Fighter', label: 'Fighter' },
  { key: 'Tank', label: 'Tank' },
  { key: 'Mage', label: 'Mage' },
  { key: 'Assassin', label: 'Assassin' },
  { key: 'Marksman', label: 'Marksman' },
  { key: 'Support', label: 'Support' },
]

// Filter options for the champion list.
export const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'remaining', label: 'Remaining' },
  { key: 'inprogress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'won', label: 'Won' },
]
