import React, { useState, useRef, useEffect } from 'react';
import './Ruleta.css';

const COLORS = [
  '#3ac45a', '#f2de5c', '#c44a3a', '#3a7dc4', 
];

const DEFAULT_ITEMS = [
  { text: 'Elemento 1', enabled: true },
  { text: 'Elemento 2', enabled: true },
  { text: 'Elemento 3', enabled: true },
  { text: 'Elemento 4', enabled: true },
  { text: 'Elemento 5', enabled: true },
  { text: 'Elemento 6', enabled: true }
];

// Diccionario de traducciones
const TRANSLATIONS = {
  es: {
    winnerTitle: "🎉 ¡Ganador!",
    hideItem: "Ocultar \n elemento",
    close: "Cerrar",
    spinAlert: "Necesitas al menos 2 elementos activos para girar.",
    resetBtn: "🔄 Reactivar ocultos",
    optionsTitle: "Opciones",
    placeholder: "Nueva opción...",
    deleteBtn: "Eliminar",
    limitMsg: "activos / total",
    toggleTitle: "Clic para activar/desactivar",
    deleteTitle: "Eliminar definitivamente",
    hideWinnerTitle: "Ocultar de la ruleta temporalmente",
    closeWinnerTitle: "Cerrar popup ganador",
    themeLabelDark: "Cambiar a modo claro",
    themeLabelLight: "Cambiar a modo oscuro",
    langLabel: "Cambiar idioma"
  },
  en: {
    winnerTitle: "🎉 Winner!",
    hideItem: "Hide \n element",
    close: "Close",
    spinAlert: "You need at least 2 active items to spin.",
    resetBtn: "🔄 Reactivate hidden",
    optionsTitle: "Options",
    placeholder: "New option...",
    deleteBtn: "Delete",
    limitMsg: "active / total",
    toggleTitle: "Click to toggle",
    deleteTitle: "Delete permanently",
    hideWinnerTitle: "Hide from wheel temporarily",
    closeWinnerTitle: "Close winner popup",
    themeLabelDark: "Switch to light mode",
    themeLabelLight: "Switch to dark mode",
    langLabel: "Switch language"
  }
};

export default function Ruleta() {
  // --- TEMA ---
  const [theme, setTheme] = useState('dark');

  // --- IDIOMA (Detectar sistema) ---
  const [lang, setLang] = useState(() => {
    // Si el navegador empieza con 'es' (es-ES, es-MX), usa español, sino inglés
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language.startsWith('es') ? 'es' : 'en';
    }
    return 'es';
  });

  // Shortcut para acceder a los textos
  const t = TRANSLATIONS[lang];

  const [items, setItems] = useState(() => {
    try {
      const savedItems = localStorage.getItem('ruletaItems');
      return savedItems ? JSON.parse(savedItems) : DEFAULT_ITEMS;
    } catch (error) {
      return DEFAULT_ITEMS;
    }
  });
  
  const [newItem, setNewItem] = useState('');
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  
  const currentRotation = useRef(0);

  useEffect(() => {
    localStorage.setItem('ruletaItems', JSON.stringify(items));
  }, [items]);

  // --- LÓGICA DEL JUEGO ---
  const activeItems = items.filter(item => item.enabled);
  const hasHiddenItems = items.some(item => !item.enabled);

  const addItem = (e) => {
    e.preventDefault();
    if (newItem.trim() && items.length < 40) {
      setItems([...items, { text: newItem.trim(), enabled: true }]);
      setNewItem('');
    }
  };

  const deleteItem = (e, indexToDelete) => {
    e.stopPropagation();
    const newItems = items.filter((_, index) => index !== indexToDelete);
    setItems(newItems);
  };

  const toggleItem = (indexToToggle) => {
    const newItems = [...items];
    newItems[indexToToggle].enabled = !newItems[indexToToggle].enabled;
    setItems(newItems);
  };

  const hideCurrentWinner = () => {
    if (!winner) return;
    setItems(prevItems => 
      prevItems.map(item => 
        item.text === winner ? { ...item, enabled: false } : item
      )
    );
    setWinner(null);
  };

  const closeWinner = () => {
    setWinner(null);
  };

  const unhideAll = () => {
    setItems(prevItems => prevItems.map(item => ({ ...item, enabled: true })));
  };

  const spinWheel = () => {
    if (isSpinning || activeItems.length < 2) {
      if (activeItems.length < 2) alert(t.spinAlert);
      return;
    }

    setIsSpinning(true);
    setWinner(null);

    const randomOffset = Math.floor(Math.random() * 360);
    const newAngle = currentRotation.current + 1800 + randomOffset;
    
    setRotation(newAngle);
    currentRotation.current = newAngle;

    setTimeout(() => {
      const anglePerItem = 360 / activeItems.length;
      const normalizedRotation = newAngle % 360;
      const winningIndex = Math.floor(((360 - normalizedRotation) % 360) / anglePerItem);
      
      const winnerItem = activeItems[winningIndex];
      setWinner(winnerItem.text);
      setIsSpinning(false);
    }, 3000);
  };

  // --- MATEMÁTICAS SVG ---
  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const makeSlicePath = (percent, index, total) => {
    const startPercent = index / total;
    const endPercent = (index + 1) / total;
    const [startX, startY] = getCoordinatesForPercent(startPercent - 0.25);
    const [endX, endY] = getCoordinatesForPercent(endPercent - 0.25);

    if (total === 1) {
      return "M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0"; 
    }

    const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;
    return `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
  };

  // Funciones de control UI
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleLang = () => {
    setLang(prev => prev === 'es' ? 'en' : 'es');
  };

  return (
    <div className="ruleta-container" data-theme={theme}>
      
      {/* --- SECCIÓN IZQUIERDA: RULETA --- */}
      <div className="wheel-section">
        
        {winner && !isSpinning && (
          <div className="winner-display">
            <span>{t.winnerTitle} {winner}</span>
            <button 
              className="hide-winner-btn" 
              onClick={hideCurrentWinner}
              title={t.hideWinnerTitle}
              style={{ whiteSpace: 'pre-line' }}
            >
              {t.hideItem}
            </button>
            <button
              className='close-winner-btn'
              onClick={closeWinner}
              title={t.closeWinnerTitle}
            >
              {t.close}
            </button>
          </div>
        )}

        <div className="wheel-wrapper" onClick={spinWheel}>
          <div className="wheel-pointer"></div>
          
          <div 
            className="wheel"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <svg viewBox="-1 -1 2 2" className="wheel-svg">
              {activeItems.map((_, index) => (
                <path
                  key={index}
                  d={makeSlicePath(100, index, activeItems.length)}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </svg>

            {activeItems.map((item, index) => {
              const angle = (360 / activeItems.length);
              const itemRotation = angle * index + (angle / 2);
              
              return (
                <div
                  key={index}
                  className="wheel-item"
                  style={{ transform: `rotate(${itemRotation}deg)` }}
                >
                  <span className="wheel-text">
                    {item.text.length > 20 ? item.text.substring(0, 20) + '...' : item.text}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="spin-btn"></div>
        </div>

        {hasHiddenItems && !isSpinning && (
          <button className="reset-btn" onClick={unhideAll}>
            {t.resetBtn} ({items.filter(i => !i.enabled).length})
          </button>
        )}

      </div>

      {/* --- SECCIÓN DERECHA: PANEL --- */}
      <div className="sidebar">
        <h2 className="controls-title">{t.optionsTitle}</h2>
        
        <form onSubmit={addItem} className="input-group">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={t.placeholder}
            maxLength={30}
          />
          <button type="submit" className="add-btn">+</button>
        </form>

        <ul className="items-list">
          {items.map((item, index) => (
            <li 
              key={index} 
              className={`list-item ${!item.enabled ? 'disabled' : ''}`}
              onClick={() => toggleItem(index)}
              title={t.toggleTitle}
            >
              <span className="item-text">{item.text}</span>
              <button 
                onClick={(e) => deleteItem(e, index)} 
                className="delete-btn"
                title={t.deleteTitle}
              >
                {t.deleteBtn}
              </button>
            </li>
          ))}
        </ul>
        
        <div className="limit-msg">
          {activeItems.length} {t.limitMsg} {items.length}
        </div>
      </div>

      {/* --- CONTROLES FLOTANTES (TEMA + IDIOMA) --- */}
      <div className="floating-controls">
        <button 
          className="control-btn theme-btn" 
          onClick={toggleTheme}
          title={theme === 'dark' ? t.themeLabelDark : t.themeLabelLight}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <button 
          className="control-btn lang-btn" 
          onClick={toggleLang}
          title={t.langLabel}
        >
          {lang === 'es' ? 'ES' : 'EN'}
        </button>
      </div>

    </div>
  );
}