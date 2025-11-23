import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Roulette from 'react-roulette-pro';
import 'react-roulette-pro/dist/index.css';
import Ruleta from './Ruleta';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Ruleta/>
  </StrictMode>,
)
