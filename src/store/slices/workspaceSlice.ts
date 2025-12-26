// src/features/workspace/workspaceSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface WorkspaceState {
  currentOrganizationId: string | null;
  currentDatastoreId: string | null;
  currentProjectId: string | null;
  currentDatasetId: string | null;
}

const initialState: WorkspaceState = {
  currentOrganizationId: null,
  currentDatastoreId: null,
  currentProjectId: null,
  currentDatasetId: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setCurrentOrganization(state, action: PayloadAction<string | null>) {
      state.currentOrganizationId = action.payload;

      // When org changes, everything under it should reset
      if (action.payload === null) {
        state.currentDatastoreId = null;
        state.currentProjectId = null;
        state.currentDatasetId = null;
      } else {
        // Even when switching to a different org, it's safer to clear
        state.currentDatastoreId = null;
        state.currentProjectId = null;
        state.currentDatasetId = null;
      }
    },

    setCurrentDatastore(state, action: PayloadAction<string | null>) {
      state.currentDatastoreId = action.payload;

      // When datastore changes, reset project/dataset
      if (action.payload === null) {
        state.currentProjectId = null;
        state.currentDatasetId = null;
      } else {
        state.currentProjectId = null;
        state.currentDatasetId = null;
      }
    },

    setCurrentProject(state, action: PayloadAction<string | null>) {
      state.currentProjectId = action.payload;

      // When project changes, reset dataset
      if (action.payload === null) {
        state.currentDatasetId = null;
      } else {
        state.currentDatasetId = null;
      }
    },

    setCurrentDataset(state, action: PayloadAction<string | null>) {
      state.currentDatasetId = action.payload;
    },
  },
});

export const {
  setCurrentOrganization,
  setCurrentDatastore,
  setCurrentProject,
  setCurrentDataset,
} = workspaceSlice.actions;
export const workspaceActions = workspaceSlice.actions;

export default workspaceSlice.reducer;
