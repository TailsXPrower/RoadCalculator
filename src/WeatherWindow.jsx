import React, { useState, useEffect } from 'react';
import { useApi } from './context/ApiContext';
import './styles/WeatherWindow.css';

/** This component is responsible for displaying the weather information in a modal window.
 * It fetches the weather data based on the latitude and longitude provided as props.
 * It includes tabs for current weather, forecast, and detailed information.
 * It also provides a refresh button to reload the weather data.
 */
const WeatherWindow = ({ lat, lng, onClose }) => {

    // Fetching weather data from the API context
    const { weather } = useApi();

    // State to hold the weather data, loading state, error state, active tab, and refresh count
    const [weatherData, setWeatherData] = useState(null);

    // State to control the loading state
    const [loading, setLoading] = useState(true);

    // State to hold any error messages
    const [error, setError] = useState(null);

    // State to control the active tab in the weather modal
    const [activeTab, setActiveTab] = useState('current');

    // State to hold the refresh count for re-fetching weather data
    const [refreshCount, setRefreshCount] = useState(0);

    // Function to fetch weather data from the API
    // It sets the loading state to true while fetching data and handles errors
    const fetchWeather = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await weather.getForecast(lat, lng);
            setWeatherData(data);
        } catch (err) {
            console.error('Failed to fetch weather:', err);
            setError('Не удалось загрузить данные о погоде');
        } finally {
            setLoading(false);
        }
    };

    // Effect to fetch weather data when the component mounts or when lat, lng, weather, or refreshCount changes
    // It also handles the case when the weather data is not available
    // and sets the error state accordingly
    useEffect(() => {
        fetchWeather();
    }, [lat, lng, weather, refreshCount]);

    const handleRefresh = React.useCallback(() => {
        setRefreshCount(prev => prev + 1);
    }, []);

    const handleTabChange = React.useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    // If the weather data is not available and loading is true, show a loading spinner
    if (loading && !weatherData) {
        return (
            <div className="weather-modal">
                <div className="weather-modal-content loading">
                    <div className="weather-spinner"></div>
                    <h2>Notiek laikapstākļu datu ielāde...</h2>
                </div>
            </div>
        );
    }

    // If the weather data is not available and loading is false, show an error message
    if (error) {
        return (
            <div className="weather-modal">
                <div className="weather-modal-content error">
                    <button className="weather-modal-close" onClick={onClose}>×</button>
                    <h2>{error}</h2>
                    <button className="refresh-btn" onClick={handleRefresh}>
                        Mēģiniet vēlreiz
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="weather-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="weather-modal-content">
                <button className="weather-modal-close" onClick={onClose}>×</button>
                
                <div className="weather-header">
                    <h2>Laikapstākļi: {weatherData.location.name}</h2>
                    <button className="refresh-btn" onClick={handleRefresh}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M23 4v6h-6M1 20v-6h6" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M3.5 9a9 9 0 0 1 14-5.5L23 4M1 20l5.5-5.5A9 9 0 0 1 20.5 15" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Atsvaidzināt
                    </button>
                </div>

                <div className="weather-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
                        onClick={() => handleTabChange('current')}
                    >
                        Šobrīd
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'forecast' ? 'active' : ''}`}
                        onClick={() => handleTabChange('forecast')}
                    >
                        Prognoze
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => handleTabChange('details')}
                    >
                        Sīkāka informācija
                    </button>
                </div>

                {activeTab === 'current' && (
                    <div className="current-weather">
                        <div className="weather-main">
                            <img 
                                src={`https:${weatherData.current.condition.icon}`} 
                                alt={weatherData.current.condition.text} 
                                className="weather-icon"
                            />
                            <div>
                                <span className="weather-temp">{weatherData.current.temp_c}°C</span>
                                <p className="weather-condition">{weatherData.current.condition.text}</p>
                            </div>
                        </div>
                        <div className="weather-stats">
                            <div className="weather-stat">
                                <span className="stat-label">Jūtams</span>
                                <span className="stat-value">{weatherData.current.feelslike_c}°C</span>
                            </div>
                            <div className="weather-stat">
                                <span className="stat-label">Mitrums</span>
                                <span className="stat-value">{weatherData.current.humidity}%</span>
                            </div>
                            <div className="weather-stat">
                                <span className="stat-label">Vējš</span>
                                <span className="stat-value">{weatherData.current.wind_kph} км/ч</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'forecast' && (
                    <div className="weather-forecast">
                        {weatherData.forecast.forecastday.map((day, index) => (
                            <div key={index} className="forecast-day">
                                <h4>{new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' })}</h4>
                                <img 
                                    src={`https:${day.day.condition.icon}`} 
                                    alt={day.day.condition.text} 
                                    className="forecast-icon"
                                />
                                <div className="forecast-temps">
                                    <span className="temp-max">{day.day.maxtemp_c}°</span>
                                    <span className="temp-min">{day.day.mintemp_c}°</span>
                                </div>
                                <p className="forecast-condition">{day.day.condition.text}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className="weather-details">
                        <div className="detail-row">
                            <span>Spiediens</span>
                            <span>{weatherData.current.pressure_mb} мбар</span>
                        </div>
                        <div className="detail-row">
                            <span>Redzamība</span>
                            <span>{weatherData.current.vis_km} км</span>
                        </div>
                        <div className="detail-row">
                            <span>UV rādītājs</span>
                            <span>{weatherData.current.uv}</span>
                        </div>
                        <div className="detail-row">
                            <span>Mākoņainība</span>
                            <span>{weatherData.current.cloud}%</span>
                        </div>
                        <div className="detail-row">
                            <span>Saullēkts</span>
                            <span>{weatherData.forecast.forecastday[0].astro.sunrise}</span>
                        </div>
                        <div className="detail-row">
                            <span>Saulriets</span>
                            <span>{weatherData.forecast.forecastday[0].astro.sunset}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(WeatherWindow);