// Utility functions for formatting/parsing workout plan fields

export function formatPlanName(name) {
  return name ? String(name) : 'Unnamed Plan';
}


export function formatEndDate(createdAt, durationWeeks) {
  if (!createdAt) return 'No date';
  if (createdAt.toDate) {
    // Firestore Timestamp
    const endDate = new Date(createdAt.toDate());
    endDate.setDate(endDate.getDate() + (durationWeeks * 7));
    return endDate.toLocaleDateString();
  }
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


export function extractDaysFromPlan(plan) {
  if (!Array.isArray(plan)) return [];
  return plan.map(item => {
    return {
      day: item.day,
      dayOfWeek: item.dayOfWeek,
    };
  });
}

export function extractDayArray(plan) {
  if (!Array.isArray(plan)) return [];
  return plan.map(item => item.day);
}

export function formatPlanDaysWithExercises(plan) {
    if (!Array.isArray(plan)) return [];
    return plan.map(dayObj => {
      const { day, dayOfWeek, exercises } = dayObj;
      const exercisesStr = Array.isArray(exercises)
        ? exercises.map(
            ex => `  - ${ex.name}: ${ex.sets} sets x ${ex.reps} reps`
          ).join('\n')
        : '';
      return `${day} (${dayOfWeek}):\n${exercisesStr}`;
    });
  }

  export function formatDayOfWeek(plan) {
    if (!Array.isArray(plan)) return [];
    return plan.map(item => item.dayOfWeek);
  }
  

  export function formatDurationWeeks(weeks) {
    return weeks ? parseInt(weeks, 10) : 0;
  }

function getNextDateForDay(baseDate, dayIndex) {
  const date = new Date(baseDate);
  const diff = (dayIndex - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + diff);
  return date;
}

const dayNameToIndex = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6
};

function getMarkedDates(daysOfWeek, durationWeeks, startDateStr) {
  // Use plan's startDate if available, else today
  const baseDate = startDateStr ? new Date(startDateStr) : new Date();

  // Find the earliest day index in daysOfWeek
  const dayIndices = daysOfWeek.map(day => dayNameToIndex[day]);
  const minDayIndex = Math.min(...dayIndices);

  // Find the first occurrence of the earliest day
  const firstWeekStart = getNextDateForDay(baseDate, minDayIndex);

  const marked = {};

  for (let week = 0; week < durationWeeks; week++) {
    daysOfWeek.forEach(dayName => {
      const dayIndex = dayNameToIndex[dayName];
      const d = new Date(firstWeekStart);
      d.setDate(firstWeekStart.getDate() + (week * 7) + (dayIndex - minDayIndex));
      const key = d.toISOString().split('T')[0];
      marked[key] = {
        marked: true,
        dotColor: '#ff5e69',
        selected: true,
        selectedColor: '#ff5e69'
      };
    });
  }

  return marked;
}