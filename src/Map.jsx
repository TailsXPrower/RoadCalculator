 import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import Loading from './Loading';
import './App.css';

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const Map = ({ setDistance, setDuration, setResetRef }) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    requestLocation();
    if (setResetRef) {
      setResetRef.current = resetMap;
    }
  }, []);

  useEffect(() => {
    if (markers.length === 2) {
      fetchRoute();
    } else {
      setRouteCoords([]);
      setDistance(null);
      setDuration(null);
    }
  }, [markers]);

  const resetMap = () => {
    setMarkers([]);
    setRouteCoords([]);
    setDistance(null);
    setDuration(null);
    requestLocation();
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setPermissionChecked(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setPermissionChecked(true);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || "Failed to get your location.");
        setPermissionChecked(true);
        setLoading(false);
        setLocation(null);
      }
    );
  };

  const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

  const fetchRoute = async () => {
    const coords = markers.map(m => [m.longitude, m.latitude]);
    try {
      const response = await axios.post(
        'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
        { coordinates: coords },
        {
          headers: {
            Authorization: ORS_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = response.data.features[0];
      const route = data.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      setRouteCoords(route);
      setDistance(data.properties.summary.distance);
      setDuration(data.properties.summary.duration);
    } catch (err) {
      console.error('Routing error:', err);
    }
  };

  const MapEventHandler = () => {
    useMapEvents({
      click(event) {
        if (markers.length < 2) {
          const { lat, lng } = event.latlng;
          setMarkers((prev) => [...prev, { latitude: lat, longitude: lng }]);
        }
      },
    });
    return null;
  };

  const toggleMarkerClick = (index) => {
    setMarkers((prev) => {
      const clicked = prev[index];
      if (clicked.clicked) {
        return prev.filter((_, i) => i !== index);
      } else {
        return prev.map((m, i) =>
          i === index ? { ...m, clicked: true } : m
        );
      }
    });
  };

  if (!permissionChecked || loading) return <Loading />;

  const centerLat = location?.latitude || 56.946285;
  const centerLng = location?.longitude || 24.105078;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} color="blue" />
        )}

        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={[marker.latitude, marker.longitude]}
            eventHandlers={{ click: () => toggleMarkerClick(index) }}
          >
            <Popup>
              <strong>{index === 0 ? 'Start (A)' : 'Destination (B)'}</strong><br />
              Coordinates: [{marker.latitude.toFixed(5)}, {marker.longitude.toFixed(5)}]
            </Popup>
          </Marker>
        ))}
        {location && (
          <Marker
            position={[location.latitude, location.longitude]}
            icon={redIcon}
          >
            <Popup>
              <strong>Your current location</strong><br />
              [{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}]
            </Popup>
          </Marker>
        )}
        <MapEventHandler />
      </MapContainer>
    </div>
  );
};

export default Map;
