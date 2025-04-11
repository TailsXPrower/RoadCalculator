import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Loading from './Loading';
import { useMapEvents } from 'react-leaflet';

const Map = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
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

  const MapEventHandler = () => {
    useMapEvents({
      click(event) {
        const { lat, lng } = event.latlng;
        setMarkers((prevMarkers) => [
          ...prevMarkers,
          { latitude: lat, longitude: lng },
        ]);
      },
    });
    return null;
  };

  const toggleMarkerClick = (index) => {
    setMarkers((prevMarkers) => {
      const clickedMarker = prevMarkers[index];
      if (clickedMarker.clicked) {
        return prevMarkers.filter((_, i) => i !== index);
      } else {
        return prevMarkers.map((marker, i) =>
          i === index ? { ...marker, clicked: true } : marker
        );
      }
    });
  };

  const toggleLocationMarkerClick = () => {
    setLocation((prevLocation) => {
      if (prevLocation?.clicked) {
        return null;
      } else {
        return { ...prevLocation, clicked: true };
      }
    });
  };

  if (!permissionChecked || loading) return <Loading />;
  if (error) return console.log(error);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={[location?.latitude || 56.946285, location?.longitude || 24.105078]}
        zoom={13}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={[marker.latitude, marker.longitude]}
            eventHandlers={{
              click: () => toggleMarkerClick(index),
            }}
          >
            <Popup>
              Marker at: <br /> Coordinates [{marker.latitude}, {marker.longitude}]
            </Popup>
          </Marker>
        ))}
        {location && (
          <Marker
            position={[location.latitude, location.longitude]}
            eventHandlers={{
              click: toggleLocationMarkerClick,
            }}
          >
            <Popup>
              Your current location! <br /> Coordinates: [{location.latitude}, {location.longitude}]
            </Popup>
          </Marker>
        )}
        <MapEventHandler />
      </MapContainer>
    </div>
  );
};

export default Map;
