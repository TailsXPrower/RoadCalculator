import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import 'leaflet/dist/leaflet.css';
import { ApiProvider } from './context/ApiContext.jsx';

/** This is the entry point of the application.
 * It renders the App component inside a StrictMode wrapper.
 * It also provides the ApiProvider context to the App component.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApiProvider>
      <App />
    </ApiProvider>
  </StrictMode>,
)
