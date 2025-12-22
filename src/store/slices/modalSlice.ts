// src/store/modalSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ModalType =
  | "createProject"
  | "createDataset"
  | "createOrg";

interface ModalPayload {
  type: ModalType;
  props?: Record<string, any>;
}

interface ModalState {
  isOpen: boolean;
  type: ModalType | null;
  props: Record<string, any> | null;
}

const initialState: ModalState = {
  isOpen: false,
  type: null,
  props: null,
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<ModalPayload>) => {
      state.isOpen = true;
      state.type = action.payload.type;
      state.props = action.payload.props || null;
    },

    closeModal: (state) => {
      state.isOpen = false;
      state.type = null;
      state.props = null;
    },

    // optional: update props without closing modal
    updateModalProps: (state, action: PayloadAction<Record<string, any>>) => {
      state.props = { ...(state.props || {}), ...action.payload };
    },
  },
});

export const { openModal, closeModal, updateModalProps } = modalSlice.actions;

export default modalSlice.reducer;
