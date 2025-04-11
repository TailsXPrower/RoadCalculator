import React from 'react';
import './Layout.css';

const Layout = ({children}) => {
  return (
  <div className="container">
    <header className='header'>
      <nav className='navbar'>
        Nav content
      </nav>
    </header>
    <main className='main-content'>
      {children}
    </main>
    <footer className='footer'>
      <p>Footer content</p>
    </footer>
  </div>
  );
};
export default Layout;