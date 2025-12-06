// src/features/ui/uiSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SnackbarSeverity = 'success' | 'error' | 'info' | 'warning';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
  autoHideDuration?: number;
}

interface DialogState {
  open: boolean;
  dialogType?: string;
  dialogProps?: Record<string, unknown>;
}

export interface UiState {
  snackbar: SnackbarState;
  dialog: DialogState;
}


const initialState: UiState = {
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
    autoHideDuration: 4000,
  },
  dialog: {
    open: false,
    dialogType: undefined,
    dialogProps: undefined,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showSnackbar(
      state,
      action: PayloadAction<
        {
          message: string;
        } & Partial<Omit<SnackbarState, 'open' | 'message'>>
      >
    ) {
      const { message, severity, autoHideDuration } = action.payload;
      state.snackbar.open = true;
      state.snackbar.message = message;
      state.snackbar.severity = severity ?? 'info';
      if (autoHideDuration !== undefined) {
        state.snackbar.autoHideDuration = autoHideDuration;
      }
    },
    hideSnackbar(state) {
      state.snackbar.open = false;
    },
    openDialog(
      state,
      action: PayloadAction<{
        dialogType: string;
        dialogProps?: Record<string, unknown>;
      }>
    ) {
      state.dialog.open = true;
      state.dialog.dialogType = action.payload.dialogType;
      state.dialog.dialogProps = action.payload.dialogProps ?? {};
    },
    closeDialog(state) {
      state.dialog.open = false;
      state.dialog.dialogType = undefined;
      state.dialog.dialogProps = undefined;
    },
  },
});

export const { showSnackbar, hideSnackbar, openDialog, closeDialog } =
  uiSlice.actions;

export default uiSlice.reducer;
