import React from 'react';
import { ThemeProvider } from './ThemeContext';
import ThemeToggle from './ThemeToggle';
import Header from './Header';
import Content from './Content';

function App() {
  return (
    <ThemeProvider>
      <div style={{ backgroundColor: 'var(--background-color)', minHeight: '100vh' }}>
        <Header />
        <main style={{ color: 'var(--text-color)', padding: '2rem' }}>
          <Content />
          <ThemeToggle />
        </main>
      </div>
    </ThemeProvider>
  );
}
export default App;
