// Utility functions for formatting/parsing workout plan fields

export function formatPlanName(name) {
  return name ? String(name) : 'Unnamed Plan';
}

export function formatDurationWeeks(weeks) {
  return weeks ? `${weeks} week${weeks > 1 ? 's' : ''}` : 'N/A';
}

export function formatCreatedAt(createdAt) {
  if (!createdAt) return 'No date';
  if (createdAt.toDate) {
    // Firestore Timestamp
    return createdAt.toDate().toLocaleDateString();
  }
  // JS Date or string
  try {
    return new Date(createdAt).toLocaleDateString();
  } catch {
    return 'Invalid date';
  }
}

export function formatPlan(plan) {
  // For now, just return as is or stringified
  if (!plan) return 'No plan';
  if (typeof plan === 'string') return plan;
  try {
    return JSON.stringify(plan);
  } catch {
    return 'Invalid plan';
  }
} 