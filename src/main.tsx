import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // optional - your global CSS
import { ThemeProvider } from "@/utils/theme-provider";

// Create root and render App
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
