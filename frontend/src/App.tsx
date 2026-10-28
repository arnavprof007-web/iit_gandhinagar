import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { AppProvider } from './context/AppContext';
import { AppRouter } from './routes/AppRouter';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </ToastProvider>
  );
};

export default App;
