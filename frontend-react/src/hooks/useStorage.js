const STORAGE_KEY = 'million_items_app';

export function useStorage() {

  const getState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { selectedIds: [], order: [] };
    } catch {
      return { selectedIds: [], order: [] };
    }
  };

  const saveState = (state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  return {
    getSelectedIds: () => getState().selectedIds,
    getOrder: () => getState().order,
    addSelectedId: (id) => {
      const state = getState();
      if (!state.selectedIds.includes(id)) {
        state.selectedIds.push(id);
        saveState(state);
      }
    },
    removeSelectedId: (id) => {
      const state = getState();
      state.selectedIds = state.selectedIds.filter(itemId => itemId !== id);
      saveState(state);
    },
    updateOrder: (newOrder) => {
      const state = getState();
      state.order = newOrder;
      saveState(state);
    }
  };
}