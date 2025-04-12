import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="container">
      <header className='header'>
        <nav className='navbar'>
          <span>Nav content</span>
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
