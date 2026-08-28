import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import toastReducer from './slices/toast';

function createAppStore() {
  return configureStore({
    reducer: {
      toast: toastReducer,
    },
  });
}

const store = createAppStore();

type AppStore = ReturnType<typeof createAppStore>;
type RootState = ReturnType<AppStore['getState']>;
type AppDispatch = AppStore['dispatch'];

const useAppDispatch = useDispatch.withTypes<AppDispatch>();
const useAppSelector = useSelector.withTypes<RootState>();

export { createAppStore, store, useAppDispatch, useAppSelector };
export type { AppDispatch, AppStore, RootState };
