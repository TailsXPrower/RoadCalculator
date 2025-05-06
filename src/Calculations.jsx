import React, { useState, useCallback, useMemo } from 'react';
import './styles/App.css';
import WeatherWindow from './WeatherWindow';
import { useApi } from './context/ApiContext';

/** This component is responsible for displaying the calculations based on the distance, duration, and markers provided.
 * It includes input fields for fuel consumption and price, and calculates the total cost and fuel used.
 * It also provides a button to show the weather at the destination point.
 */
const Calculations = ({ distance, duration, markers }) => {

  // State to hold the input values for fuel consumption and price
  const [inputs, setInputs] = useState({
    consumption: '',
    price: ''
  });

  // State to hold the result of the calculations
  const [result, setResult] = useState(null);

  // State to control the visibility of the weather window
  const [showWeather, setShowWeather] = useState(false);

  // Fetching weather data from the API context
  const { weather } = useApi();

  // Function to handle input changes for fuel consumption and price
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Memoized calculation of results based on distance, consumption, price, and markers
  // This will only re-calculate when the dependencies change
  const calculatedResults = useMemo(() => {
    if (!distance || !inputs.consumption || !inputs.price || !markers || markers.length < 2) {
      return null;
    }

    const km = distance / 1000;
    const fuelUsed = (km * parseFloat(inputs.consumption)) / 100;
    const totalCost = fuelUsed * parseFloat(inputs.price);
    const durationMin = Math.round(duration / 60);

    return {
      km: km.toFixed(2),
      fuelUsed: fuelUsed.toFixed(2),
      totalCost: totalCost.toFixed(2),
      durationMin,
    };
  }, [distance, inputs.consumption, inputs.price, markers, duration]);

  // Function to handle form submission
  // It prevents the default form submission behavior and checks if all fields are filled
  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!calculatedResults) {
      alert('Ievadiet visus laukus + 2 markeri kartē!');
      return;
    }

    setResult(calculatedResults);
  }, [calculatedResults]);

  // Function to handle the click event for showing weather
  // It checks if the markers are set and then shows the weather window
  const handleWeatherClick = useCallback(() => {
    if (!markers || markers.length < 2) {
      alert('Iestatiet galamērķa punktu (B) kartē!');
      return;
    }
    setShowWeather(true);
  }, [markers]);

  // Memoized properties for the WeatherWindow component
  // This will only re-calculate when the markers change
  const weatherWindowProps = useMemo(() => ({
    lat: markers[1]?.latitude,
    lng: markers[1]?.longitude,
    onClose: () => setShowWeather(false)
  }), [markers]);

  return (
    <div id="calculations-container" style={{ padding: '1rem' }}>
      <div className="mb-5 text-2xl font-bold text-center">
        <h2>Ceļa kalkulators</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Patēriņš (l/100km): </label>
          <input
            name="consumption"
            min={0}
            step="0.001"
            type="number"
            placeholder={'0'}
            value={inputs.consumption}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Degvielas cena (€/l): </label>
          <input
            name="price"
            min={0}
            step="0.001"
            type="number"
            placeholder={'0'}
            value={inputs.price}
            onChange={handleInputChange}
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
          <button
            type='button'
            onClick={handleWeatherClick}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Laikapstākļi galamērķī
          </button>
        </div>
      )}

      {showWeather && markers && markers.length >= 2 && (
        <WeatherWindow {...weatherWindowProps} />
      )}
    </div>
  );
};

export default React.memo(Calculations);