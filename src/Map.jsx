import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import Loading from './Loading';
import './styles/App.css';
import { useApi } from './context/ApiContext';


const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
});

/**
 * This component is responsible for rendering the map and handling user interactions.
 * It includes functionality for displaying the user's current location, adding markers,
 * and calculating routes between markers.
 * It also handles fetching place names and routing data from the API.
 */
const Map = ({ setDistance, setDuration, setResetRef, searchedLocation, markers, setMarkers }) => {

    // Geocoding and routing API from context
    // This allows us to fetch place names and route data
    const { geocoding, routing } = useApi();

    // State to hold the user's current location
    const [location, setLocation] = useState(null);

    // State to hold the error message, loading state, and permission check
    const [error, setError] = useState(null);

    // State to hold the distance and duration of the route
    const [permissionChecked, setPermissionChecked] = useState(false);

    // State to hold the loading state for the map
    const [loading, setLoading] = useState(true);

    // State to hold the route coordinates and place names
    const [routeCoords, setRouteCoords] = useState([]);

    // State to hold the place names for markers
    const [placeNames, setPlaceNames] = useState({});

    // State to hold the visibility of the location marker
    const [locationHidden, setLocationHidden] = useState(false);

    // State to hold the error message for the route
    const [routeError, setRouteError] = useState(null);

    // State to hold the map type (map, satellite, hybrid)
    const [mapType, setMapType] = useState('map');

    const [showTraffic, setShowTraffic] = useState(false);

    const [snappedPoints, setSnappedPoints] = useState([]);

    const [clickBlocked, setClickBlocked] = useState(false);

    const [gasStations, setGasStations] = useState([]);
    const [showGasStations, setShowGasStations] = useState(false);

    // Default coordinates for the map
    // If the user's location is not available, we use a default location (Riga, Latvia)
    const centerLat = location?.latitude || 56.946285;
    const centerLng = location?.longitude || 24.105078;

    // Ref to hold the click block state
    const clickBlockedRef = useRef(false);

      const FlyToController = ({ location, markers }) => {
        const map = useMap();
        const mapRef = useRef(map);

        useEffect(() => {
          mapRef.current = map;
        }, [map]);

        const handleFlyToLocation = useCallback(() => {
          if (!location) return;
          console.log('Flying to location:', location);
          map.flyTo([location.latitude, location.longitude], 15, {
            duration: 1,
            easeLinearity: 0.25
          });
        }, [location, map]);

        const handleFlyToMarkerA = useCallback(() => {
          if (!markers.length) return;
          console.log('Flying to marker A:', markers[0]);
          map.flyTo([markers[0].latitude, markers[0].longitude], 15, {
            duration: 1,
            easeLinearity: 0.25
          });
        }, [markers, map]);

        const handleFlyToMarkerB = useCallback(() => {
          if (markers.length < 2) return;
          console.log('Flying to marker B:', markers[1]);
          map.flyTo([markers[1].latitude, markers[1].longitude], 15, {
            duration: 1,
            easeLinearity: 0.25
          });
        }, [markers, map]);

        // Экспортируем функции через ref
        useEffect(() => {
          window.flyToLocation = handleFlyToLocation;
          window.flyToMarkerA = handleFlyToMarkerA;
            window.flyToMarkerB = handleFlyToMarkerB;
        }, [handleFlyToLocation, handleFlyToMarkerA]);

        return null;
      };

    // Function to fetch the place name based on latitude and longitude
    const fetchPlaceName = useCallback(async (lat, lng) => {
        try {
            const name = await geocoding.getPlaceName(lat, lng);
            setPlaceNames(prev => ({ ...prev, [`${lat},${lng}`]: name }));
            return name;
        } catch (err) {
            console.error('Failed to fetch place name:', err);
            return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
    }, [geocoding]);

    // Function to snap the coordinates to the nearest road
    const snapToRoad = useCallback(async (lat, lng) => {
        try {
            const response = await routing.getNearestRoad([lng, lat]);
            return response.waypoints[0].location; // [lng, lat]
        } catch (err) {
            console.error('Failed to snap to road:', err);
            return [lng, lat];
        }
    }, [routing]);

    // Function to request the user's location
    // It checks if geolocation is supported and requests the current position
    const requestLocation = useCallback(() => {
        console.log('Requesting location...');
        if (!navigator.geolocation) {
          console.warn('Geolocation is not supported by this browser');
          setError('Jūsu pārlūkprogramma neatbalsta atrašanās vietas noteikšanu');
          setPermissionChecked(true);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        const geolocationOptions = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            console.log('Geolocation success:', position);
            try {
              const newLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
              };

              console.log('Setting new location:', newLocation);
              setLocation(newLocation);

              const placeName = await fetchPlaceName(newLocation.latitude, newLocation.longitude);
              console.log('Fetched place name:', placeName);

              setPermissionChecked(true);
              setLoading(false);

            } catch (err) {
              console.error('Error processing location:', err);
              setError('Kļūda apstrādājot atrašanās vietu');
              setLoading(false);
            }
          },
          (err) => {
            console.error('Geolocation error:', err);
            let errorMessage = "Neizdevās iegūt jūsu atrašanās vietu";

            switch(err.code) {
              case err.PERMISSION_DENIED:
                errorMessage = "Lietotājs liegusi piekļuvi atrašanās vietai";
                break;
              case err.POSITION_UNAVAILABLE:
                errorMessage = "Atrašanās vietas informācija nav pieejama";
                break;
              case err.TIMEOUT:
                errorMessage = "Pārsniegts pieprasījuma laika limits";
                break;
              default:
                errorMessage = "Nezināma kļūda";
            }

            setError(errorMessage);
            setPermissionChecked(true);
            setLoading(false);
            setLocation(null);
          },
          geolocationOptions
        );
      }, [fetchPlaceName]);

    // Function to reset the map state
    const resetMap = useCallback(() => {
        setMarkers([]);
        setDistance(null);
        setDuration(null);
        setRouteCoords([]);
        setPlaceNames({});
        setLocationHidden(false);
        requestLocation();
    }, [requestLocation, setDistance, setDuration, setMarkers]);

    // Function to fetch the route between markers
    const fetchRoute = useCallback(async () => {
        if (markers.length < 2) {
            setRouteCoords([]);
            setDistance(null);
            setDuration(null);
            setSnappedPoints([]);
            return;
        }

        try {
            // Snap the markers to the nearest road
            const snapped = await Promise.all(markers.map(marker =>
                snapToRoad(marker.latitude, marker.longitude)
            ));
            setSnappedPoints(snapped);

            // Fetch the route using the snapped coordinates
            const data = await routing.getRoute(snapped);

            if (data.features?.length > 0) {
                const route = data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
                setRouteCoords(route);
                setDistance(data.features[0].properties.summary.distance);
                setDuration(data.features[0].properties.summary.duration);
                setRouteError(null);
            } else {
                throw new Error('Maršruts nav atrasts');
            }
        } catch (err) {
            console.error('Ceļa kļūda:', err);
            setRouteError('Nevarēja izveidot maršrutu starp norādītajiem punktiem. Mēģiniet izvēlēties punktus tuvāk ceļiem.');
            setTimeout(() => setRouteError(null), 5000);

            // Fallback to the original coordinates if routing fails
            try {
                const coords = markers.map(m => [m.longitude, m.latitude]);
                const data = await routing.getRoute(coords);
                if (data.features?.length > 0) {
                    const route = data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
                    setRouteCoords(route);
                    setDistance(data.features[0].properties.summary.distance);
                    setDuration(data.features[0].properties.summary.duration);
                }
            } catch (fallbackErr) {
                console.error('Fallback routing failed:', fallbackErr);
            }
        }
    }, [markers, routing, setDistance, setDuration, snapToRoad]);

    // Effect to request the user's location and set the reset function
    // It also sets the reset function in the ref if provided
    useEffect(() => {
        requestLocation();
        if (setResetRef) {
            setResetRef.current = resetMap;
        }
    }, [requestLocation, resetMap, setResetRef]);

    // Effect to fetch the place name when the location changes
    useEffect(() => {
        if (searchedLocation) {
            setLocation(searchedLocation);
            fetchPlaceName(searchedLocation.latitude, searchedLocation.longitude);
        }
    }, [searchedLocation, fetchPlaceName]);

    // Effect to fetch the route when markers change
    useEffect(() => {
        if (markers.length === 2) {
            fetchRoute();
        } else {
            setRouteCoords([]);
            setDistance(null);
            setDuration(null);
        }
    }, [markers, fetchRoute, setDistance, setDuration]);

    // Effect to check if the location is hidden
    const toggleLocationMarker = useCallback(() => {
        setLocationHidden(prev => !prev);
    }, []);

    // Effect to restore the location marker
    const restoreLocationMarker = useCallback((e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.nativeEvent) {
                e.nativeEvent.stopImmediatePropagation();
            }
        }

        // Click block
        setClickBlocked(true);
        clickBlockedRef.current = true;

        // Restore location marker
        setLocationHidden(false);

        // Request location again
        requestLocation();

        // Reset click block after a timeout
        setTimeout(() => {
            setClickBlocked(false);
            clickBlockedRef.current = false;
        }, 500);
    }, [requestLocation]);

    // Effect to handle map events
    const MapEventHandler = () => {
        const map = useMap();

        useMapEvents({
          async click(event) {
            try {
              const path = event.originalEvent.composedPath?.();
              const isControlClick = path?.some(el =>
                el.classList && el.classList.contains('leaflet-control')
              );

              if (markers.length >= 2) {
                console.log('Maximum markers reached (2)');
                return;
              }

              if (clickBlockedRef.current) {
                console.log('Click blocked');
                return;
              }

              if (isControlClick) {
                console.log('Control click - ignoring');
                return;
              }

              const { lat, lng } = event.latlng;
              console.log('Adding new marker at:', lat, lng);

              const name = await fetchPlaceName(lat, lng);
              console.log('Fetched place name:', name);

              setMarkers(prev => {
                const newMarkers = [...prev, { latitude: lat, longitude: lng }];
                console.log('Markers updated:', newMarkers);
                return newMarkers;
              });
            } catch (err) {
              console.error('Map click error:', err);
            }
          }
        });

        return null;
      };

    // Function to remove a marker from the map
    // It prevents the default behavior and stops propagation of the event
    const removeMarker = useCallback((index, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.nativeEvent) {
            e.nativeEvent.stopImmediatePropagation();
        }

        setClickBlocked(true);
        clickBlockedRef.current = true;
        setMarkers(prev => prev.filter((_, i) => i !== index));

        setTimeout(() => {
            setClickBlocked(false);
            clickBlockedRef.current = false;
        }, 300);
    }, [setMarkers]);

  const fetchGasStations = useCallback(async () => {
    try {
        const center = mapRef.current?.getCenter();
        if (!center) return;

        const stations = await routing.getGasStations(center.lat, center.lng); // Assuming 'routing' is the correct context
        setGasStations(stations);
    } catch (error) {
        console.error('Failed to fetch gas stations:', error);
    }
  }, []);

  // Add this effect to fetch gas stations when the button is toggled
  useEffect(() => {
      if (showGasStations) {
          fetchGasStations();
      } else {
          setGasStations([]);
      }
  }, [showGasStations, fetchGasStations]);

    // Function to remove all markers from the map
    // It prevents the default behavior and stops propagation of the event
    // It also resets the markers and click block state
    const removeAllMarkers = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.nativeEvent) {
            e.nativeEvent.stopImmediatePropagation();
        }

        setClickBlocked(true);
        clickBlockedRef.current = true;
        setMarkers([]);

        setTimeout(() => {
            setClickBlocked(false);
            clickBlockedRef.current = false;
        }, 300);
    }, [setMarkers]);

    // Request location on component mount
    if (!permissionChecked || loading) return <Loading />;

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
          {routeError && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              backgroundColor: 'rgba(255, 0, 0, 0.7)',
              color: 'white',
              padding: '10px',
              borderRadius: '5px',
              maxWidth: '80%',
              textAlign: 'center'
            }}>
              {routeError}
            </div>
          )}

          <MapContainer
            center={[centerLat, centerLng]}
            zoom={13}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            key={JSON.stringify(centerLat)}
            whenCreated={(mapInstance) => {
                console.log('Map instance created', mapInstance);
                mapRef.current = mapInstance;
            }}
            >
            <FlyToController location={location} markers={markers} />

            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              opacity={mapType === 'map' ? 1 : 0}
            />

            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              opacity={mapType === 'satellite' || mapType === 'hybrid' ? 1 : 0}
            />

            {mapType === 'hybrid' && (
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                opacity={0.5}
              />
            )}

            {/* Слой пробок */}
            {showTraffic && (
              <TileLayer
                url={`https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=${import.meta.env.VITE_TOMTOM_API_KEY}`}
                attribution='© TomTom'
                maxZoom={22}
              />
            )}

            <div className="leaflet-control leaflet-bar" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMapType('map');
                }}
                style={{
                  backgroundColor: mapType === 'map' ? '#f4f4f4' : 'white',
                  fontWeight: mapType === 'map' ? 'bold' : 'normal',
                  padding: '5px 10px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Karte
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMapType('satellite');
                }}
                style={{
                  backgroundColor: mapType === 'satellite' ? '#f4f4f4' : 'white',
                  fontWeight: mapType === 'satellite' ? 'bold' : 'normal',
                  padding: '5px 10px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Satelīts
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMapType('hybrid');
                }}
                style={{
                  backgroundColor: mapType === 'hybrid' ? '#f4f4f4' : 'white',
                  fontWeight: mapType === 'hybrid' ? 'bold' : 'normal',
                  padding: '5px 10px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Hibrīds
              </button>
            </div>

            <div className="leaflet-control leaflet-bar" style={{
                position: 'absolute',
                top: '130px',
                right: '10px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
                }}>
                <button
                    onClick={() => window.flyToLocation?.()}
                    style={{
                    padding: '5px 10px',
                    backgroundColor: location ? '#4CAF50' : '#cccccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: location ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                    }}
                    disabled={!location}
                    title={location ? "Pārvietoties uz savu pašreizējo atrašanās vietu" : "Lokācija nav pieejama"}
                >
                    <span>📍</span>
                    <span>Uz manu atrašanās vietu</span>
                </button>

                <button
                    onClick={() => window.flyToMarkerA?.()}
                    style={{
                    padding: '5px 10px',
                    backgroundColor: markers.length > 0 ? '#2196F3' : '#cccccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: markers.length > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                    }}
                    disabled={markers.length === 0}
                    title={markers.length > 0 ? "Pārvietoties uz maršruta sākumpunktu (A)" : "Nav marķieru"}
                >
                    <span>🚩</span>
                    <span>Uz sākumpunktu (A)</span>
                </button>
                <button
                    onClick={() => window.flyToMarkerB?.()}
                    style={{
                    padding: '5px 10px',
                    backgroundColor: markers.length > 1 ? '#FF9800' : '#cccccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: markers.length > 1 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                    }}
                    disabled={markers.length <= 1}
                    title={markers.length > 1 ? "Pārvietoties uz maršruta galapunktu (B)" : "Nav pietiekami daudz marķieru"}
                >
                    <span>🏁</span>
                    <span>Uz galapunktu (B)</span>
                </button>
                </div>

            <div className="leaflet-control leaflet-bar" style={{ position: 'absolute', top: '10px', right: '88px', zIndex: 1000 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTraffic(!showTraffic);
                }}
                style={{
                  backgroundColor: showTraffic ? '#f4f4f4' : 'white',
                  fontWeight: showTraffic ? 'bold' : 'normal',
                  padding: '5px 10px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                {showTraffic ? 'Slēpt satiksmi' : 'Rādīt satiksmi'}
              </button>
            </div>

            {routeCoords.length > 0 && (
              <Polyline positions={routeCoords} color="blue" />
            )}

            {markers.map((marker, index) => (
              <Marker
                key={`${marker.latitude}-${marker.longitude}-${index}`}
                position={[marker.latitude, marker.longitude]}
                eventHandlers={{
                  click: (e) => {
                    e.originalEvent.preventDefault();
                    e.originalEvent.stopPropagation();
                  }
                }}
              >
                <Popup>
                  <strong>{index === 0 ? 'Starts (A)' : 'Galapunkts (B)'}</strong><br />
                  {placeNames[`${marker.latitude},${marker.longitude}`] ||
                    `${marker.latitude.toFixed(5)}, ${marker.longitude.toFixed(5)}`}
                  <div style={{ marginTop: '10px' }}>
                    <button
                      onClick={(e) => removeMarker(index, e)}
                      style={{
                        padding: '5px 10px',
                        marginRight: '5px',
                        backgroundColor: '#ff4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      Noņemt markers
                    </button>
                    {markers.length > 1 && (
                      <button
                        onClick={(e) => removeAllMarkers(e)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        Noņemt visus marķierus
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {location && !locationHidden && (
              <Marker
                position={[location.latitude, location.longitude]}
                icon={redIcon}
                eventHandlers={{
                  click: (e) => {
                    e.originalEvent.preventDefault();
                    e.originalEvent.stopPropagation();
                  }
                }}
              >
                <Popup>
                  <strong>Tava geolokācija</strong><br />
                  {placeNames[`${location.latitude},${location.longitude}`] ||
                    `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`}
                  <div style={{ marginTop: '10px' }}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleLocationMarker();
                      }}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#ff4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      Paslēpt manu atrašanās vietu
                    </button>
                  </div>
                </Popup>
              </Marker>
            )}

            <MapEventHandler />
          </MapContainer>

          {locationHidden && (
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000
              }}
            >
              <button
                onClick={restoreLocationMarker}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  pointerEvents: 'auto'
                }}
              >
                Paradīt manu atrašanās vietu
              </button>
            </div>
          )}
        </div>
      );
    }

export default React.memo(Map);