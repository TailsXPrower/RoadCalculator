import './styles/Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="main">
      <header className="header">
          <nav className="navbar">
              <div className="container px-6">
                  <ul className="flex space-x-4">
                      <li className="text-white hover:text-gray-300 cursor-pointer">Home</li>
                      <li className="text-white hover:text-gray-300 cursor-pointer">About</li>
                      <li className="text-white hover:text-gray-300 cursor-pointer">Contact</li>
                  </ul>
              </div>
          </nav>
      </header>
      <main className='main-content'>
        {children}
      </main>
      <footer className='footer'>
          <div className="container px-6">
              <ul className="flex space-x-4">
                  <li className="text-white">@ 2025</li>
                  <li className="text-white">Degviela kalkulators</li>
              </ul>
          </div>
      </footer>
    </div>
  );
};

export default Layout;
