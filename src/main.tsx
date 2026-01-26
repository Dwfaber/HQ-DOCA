import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LogtoProvider } from '@logto/react';
import type { LogtoConfig } from '@logto/react';
import './index.css';
import App from './App.tsx';

const config: LogtoConfig = {
  endpoint: 'https://login.docaperformance.com.br/',
  appId: 'afhap45u7bo1qlv27sbwu',
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LogtoProvider config={config}>
      <App />
    </LogtoProvider>
  </StrictMode>,
);