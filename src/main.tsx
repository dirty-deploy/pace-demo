import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/onest/400.css';
import '@fontsource/onest/500.css';
import '@fontsource/onest/600.css';
import '@fontsource/source-serif-4/600.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/shell.css';
import './styles/palette.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
