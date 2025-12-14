// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import { store } from './store/store';
import { AppThemeProvider } from './theme/ThemeProvider';
import { apolloClient } from './apollo/apolloClient';
import { ApolloProvider } from '@apollo/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ApolloProvider client={apolloClient}>
        <AppThemeProvider>
          <App />
        </AppThemeProvider>
      </ApolloProvider>
    </Provider>
  </React.StrictMode>
);
