import './App.css';
import Layout from './Layout';
import Calculations from './Calculations';
import Map from './Map';
import { useState, useRef } from 'react';

function App() {
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const mapRef = useRef();

  return (
    <Layout>
      <div className='main-content'>
        <div className='calculations'>
          <Calculations distance={distance} duration={duration} />
        </div>
        <div className='map'>
          <Map setDistance={setDistance} setDuration={setDuration} setResetRef={mapRef} />
        </div>
      </div>
    </Layout>
  );
}

export default App;
