const STORAGE_KEY = 'ed-frontend:persisted-state';

export const loadPersistedState = () => {
  if (typeof window === 'undefined') return undefined;

  try {
    const serialized = sessionStorage.getItem(STORAGE_KEY);
    if (!serialized) return undefined;

    return JSON.parse(serialized);
  } catch (error) {
    console.warn('Failed to load state from sessionStorage', error);
    return undefined;
  }
};

export const savePersistedState = (state: unknown): void => {
  if (typeof window === 'undefined') return;

  try {
    const serialized = JSON.stringify(state);
    sessionStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.warn('Failed to save state to sessionStorage', error);
  }
};