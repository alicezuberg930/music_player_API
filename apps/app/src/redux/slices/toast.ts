import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type ToastType = 'default' | 'success' | 'error' | 'info' | 'warning';

type ToastAction = {
  label: string;
};

type ToastItem = {
  action?: ToastAction;
  description?: string;
  duration: number;
  id: string;
  title: string;
  type: ToastType;
};

type ToastConfig = {
  duration: number;
  limit: number;
};

type ToastState = {
  config: ToastConfig;
  toasts: ToastItem[];
};

type ToastRootState = {
  toast: ToastState;
};

const initialState: ToastState = {
  config: {
    duration: 4000,
    limit: 3,
  },
  toasts: [],
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    toastAdded(state, action: PayloadAction<ToastItem>) {
      state.toasts.push(action.payload);
    },
    toastConfigUpdated(state, action: PayloadAction<Partial<ToastConfig>>) {
      state.config = { ...state.config, ...action.payload };
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    toastUpdated(
      state,
      action: PayloadAction<{
        data: Partial<Omit<ToastItem, 'id'>>;
        id: string;
      }>,
    ) {
      const toast = state.toasts.find(item => item.id === action.payload.id);
      if (toast) {
        Object.assign(toast, action.payload.data);
      }
    },
  },
});

const selectToastConfig = (state: ToastRootState) => state.toast.config;
const selectToasts = (state: ToastRootState) => state.toast.toasts;

export { initialState, selectToastConfig, selectToasts };
export const { toastAdded, toastConfigUpdated, toastDismissed, toastUpdated } =
  toastSlice.actions;
export type { ToastAction, ToastConfig, ToastItem, ToastState, ToastType };
export default toastSlice.reducer;
