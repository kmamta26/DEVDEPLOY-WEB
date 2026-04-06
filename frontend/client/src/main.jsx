console.log('MAIN.JSX LOADING...');
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './premium.css'

const rootElement = document.getElementById('root');
if (rootElement) {
  console.log('ROOT ELEMENT FOUND, ATTEMPTING RENDER...');
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
} else {
  console.error('ROOT ELEMENT NOT FOUND!');
}
