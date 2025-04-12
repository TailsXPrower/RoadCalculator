import React, { useState } from 'react';
import './App.css';

const Calculations = ({ distance, duration }) => {
  const [consumption, setConsumption] = useState('');
  const [price, setPrice] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!distance || !consumption || !price) {
      alert('Enter all fields + set 2 markers!');
      return;
    }

    const km = distance / 1000;
    const fuelUsed = (km * parseFloat(consumption)) / 100;
    const totalCost = fuelUsed * parseFloat(price);
    const durationMin = Math.round(duration / 60);

    setResult({
      km: km.toFixed(2),
      fuelUsed: fuelUsed.toFixed(2),
      totalCost: totalCost.toFixed(2),
      durationMin,
    });
  };

  return (
    <div id="calculations-container" style={{ padding: '1rem' }}>
      <h2>Расчёт маршрута</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Patēriņš (l/100km): </label>
          <input
            type="number"
            value={consumption}
            onChange={(e) => setConsumption(e.target.value)}
          />
        </div>
        <div>
          <label>Degvielas cena (€/l): </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <button type="submit">Aprēķināt</button>
      </form>

      {result && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Rezultāti:</h3>
          <p>Distance: {result.km} km</p>
          <p>Laiks ceļā: {result.durationMin} min.</p>
          <p>Patērēta degviela: {result.fuelUsed} L</p>
          <p>Ceļojuma izmaksas: €{result.totalCost}</p>
        </div>
      )}
    </div>
  );
};

export default Calculations;
