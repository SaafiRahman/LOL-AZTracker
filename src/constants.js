// Roles a champion can be played in during a run.
// `key` is what we store; `label` is what we show.
export const ROLES = [
  { key: 'top', label: 'Top' },
  { key: 'jungle', label: 'Jungle' },
  { key: 'mid', label: 'Mid' },
  { key: 'bot', label: 'Bot' },
  { key: 'support', label: 'Support' },
]

export const RESULTS = [
  { key: 'win', label: 'Win' },
  { key: 'loss', label: 'Loss' },
]

// Filter options for the champion list.
export const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'remaining', label: 'Remaining' },
  { key: 'completed', label: 'Completed' },
  { key: 'wins', label: 'Wins' },
  { key: 'losses', label: 'Losses' },
]
