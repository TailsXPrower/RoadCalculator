import React, { useState, useRef } from 'react';
import './styles/App.css';
import Calculations from './Calculations';
import Map from './Map';

/** This component is responsible for rendering the home page of the application.
 * It includes the map and calculations components.
 * It manages the state for distance, duration, and markers.
 * It also receives the searched location as a prop from the parent component.
 */
const HomePage = ({ searchedLocation }) => {

    // State to hold the distance, duration, and markers
    const [distance, setDistance] = useState(null);

    // State to hold the duration of the route
    const [duration, setDuration] = useState(null);

    // State to hold the markers on the map
    const [markers, setMarkers] = useState([]);

    // Ref to hold the map instance
    const mapRef = useRef();

    return (
        <div className='main-content'>
            <div className='calculations'>
                <Calculations 
                    distance={distance} 
                    duration={duration} 
                    markers={markers} 
                />
            </div>
            <div className='map'>
                <Map
                    setDistance={setDistance}
                    setDuration={setDuration}
                    setResetRef={mapRef}
                    searchedLocation={searchedLocation}
                    setMarkers={setMarkers}
                    markers={markers}
                />
            </div>
        </div>
    );
}

export default HomePage;