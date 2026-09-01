import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/noto-serif-kr/400.css';
import '@fontsource/noto-serif-kr/500.css';
import '@fontsource/noto-serif-kr/700.css';
import '@fontsource/noto-sans-kr/400.css';
import '@fontsource/noto-sans-kr/500.css';
import '@fontsource/noto-sans-kr/700.css';
import './styles/variables.css';
import './styles/global.css';
import './styles/album-closed-info.css';
import './styles/album-hero.css';
import './styles/motion.css';
import App from './App';
import { InitialLoadScreen } from './components/InitialLoadScreen';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InitialLoadScreen>
      <App />
    </InitialLoadScreen>
  </StrictMode>,
);
