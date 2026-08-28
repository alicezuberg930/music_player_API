import { store } from '@/redux/store';
import * as React from 'react';
import { Provider } from 'react-redux';

function ReduxProvider({ children }: React.PropsWithChildren) {
  return <Provider store={store}>{children}</Provider>;
}

export { ReduxProvider };
