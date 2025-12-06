// src/features/workspace/workspaceSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface WorkspaceState {
  currentDatastoreId: string | null;
  currentProjectId: string | null;
  currentDatasetId: string | null;
}

const initialState: WorkspaceState = {
  currentDatastoreId: null,
  currentProjectId: null,
  currentDatasetId: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setCurrentDatastore(state, action: PayloadAction<string | null>) {
      state.currentDatastoreId = action.payload;
      // You might want to reset dependent things when datastore changes:
      if (action.payload === null) {
        state.currentProjectId = null;
        state.currentDatasetId = null;
      }
    },
    setCurrentProject(state, action: PayloadAction<string | null>) {
      state.currentProjectId = action.payload;
      if (action.payload === null) {
        state.currentDatasetId = null;
      }
    },
    setCurrentDataset(state, action: PayloadAction<string | null>) {
      state.currentDatasetId = action.payload;
    },
  },
});

export const {
  setCurrentDatastore,
  setCurrentProject,
  setCurrentDataset,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
