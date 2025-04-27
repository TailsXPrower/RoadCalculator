import './styles/Layout.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiX, FiMenu } from 'react-icons/fi';
import { useApi } from './context/ApiContext';
import React from 'react';
import ContactsPage from './ContactsPage';
import AboutPage from './AboutPage';

/**
 * This component is responsible for rendering the main layout of the application.
 * It includes the header, footer, and main content area.
 * It also handles the search functionality and manages the state for the active header.
 * It uses the useApi context to access the geocoding API for location search.
 * The component is memoized to prevent unnecessary re-renders.
 */
const Layout = ({ children, onSearch }) => {

    // Fetching geocoding API from the context
    const { geocoding } = useApi();

    // State variables to manage search query, suggestions, and other UI states
    const [searchQuery, setSearchQuery] = useState('');

    // State to hold the suggestions from the geocoding API
    const [suggestions, setSuggestions] = useState([]);

    // State to hold the debounced search query
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // State to manage the focus state of the search input
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // State to manage the loading state of the search
    const [isSearching, setIsSearching] = useState(false);

    // State to manage the mobile view and menu open state
    const [isMobile, setIsMobile] = useState(false);

    // State to manage the menu open state
    const [menuOpen, setMenuOpen] = useState(false);

    // State to manage the active header
    const [activeHeader, setActiveHeader] = useState('Home');

    // State to hold the random place coordinates
    const [randomPlace, setRandomPlace] = useState({lat: null, lng: null});

    // Ref to hold the search input element
    const searchRef = useRef(null);

    // Function to render the appropriate page based on the active header
    const renderPage = () => {
        switch(activeHeader) {
            case 'Home':
                return children;
            case 'About':
                return <AboutPage />;
            case 'Contact':
                return <ContactsPage />;
            default:
                return children;
        }
    };

    // Check mobile view
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 820);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSuggestions([]);
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery.trim());
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Fetch suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedQuery || debouncedQuery.length < 2) return;
            
            setIsSearching(true);
            try {
                const results = await geocoding.searchLocations(debouncedQuery);
                setSuggestions(results);
            } catch (err) {
                console.error('Geocoding error:', err);
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        };

        fetchSuggestions();
    }, [debouncedQuery, geocoding]);

    // Handle header click
    // This function sets the active header and closes the menu if in mobile view
    // It also clears the search query and suggestions when navigating away from Home
    const handleHeaderClick = useCallback((headerName) => {
        setActiveHeader(headerName);
        if (isMobile) {
            setMenuOpen(false);
        }
        // Clear search when navigating away from Home
        if (headerName !== 'Home') {
            setSearchQuery('');
            setSuggestions([]);
        }
    }, [isMobile]);
 
    // Generate random place coordinates
    const generateRandomPlace = useCallback(() => {
        const lat = (Math.random() * 180 - 90).toFixed(6);
        const lng = (Math.random() * 360 - 180).toFixed(6);
        const newCoords = { lat: parseFloat(lat), lng: parseFloat(lng) };
        setRandomPlace(newCoords);
        return newCoords;
    }, []);

    // Handle selection of a suggestion
    // This function sets the search query to the selected suggestion
    const handleSelect = useCallback((item) => {
        if (item.formatted === "Izlases vieta") {
            const coords = generateRandomPlace();
            setSearchQuery(`Izlases vieta (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
            onSearch({
                latitude: coords.lat,
                longitude: coords.lng,
            });
        } else {
            setSearchQuery(item.formatted);
            onSearch({
                latitude: item.geometry.lat,
                longitude: item.geometry.lng,
            });
        }
        setSuggestions([]);
        setMenuOpen(false);
    }, [onSearch, generateRandomPlace]);

    // Handle input focus
    const handleInputFocus = useCallback(() => {
        if (activeHeader !== 'Home') return;
        
        setIsSearchFocused(true);
        // Generate random place suggestion if no suggestions are available
        generateRandomPlace();
        
        setSuggestions(prev => {
            const randomPlaceSuggestion = {
                formatted: "Izlases vieta",
                geometry: randomPlace.lat && randomPlace.lng 
                    ? { lat: randomPlace.lat, lng: randomPlace.lng } 
                    : { lat: 0, lng: 0 },
                components: {}
            };
            
            if (prev.length > 0 && prev[0].formatted !== "Izlases vieta") {
                return [randomPlaceSuggestion, ...prev.slice(0, 6)];
            }
            if (prev.length === 0) {
                return [randomPlaceSuggestion];
            }
            return prev;
        });
    }, [randomPlace, activeHeader, generateRandomPlace]);

    // Handle search on Enter key press
    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim() || activeHeader !== 'Home') return;
        
        try {
            let results;
            if (suggestions.length > 0) {
                handleSelect(suggestions[0]);
            } else {
                results = await geocoding.searchLocations(searchQuery, 1);
                if (results.length > 0) {
                    handleSelect(results[0]);
                }
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }, [searchQuery, suggestions, handleSelect, geocoding, activeHeader]);

    // Clear search input and suggestions
    // This function resets the search query and suggestions
    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setSuggestions([]);
    }, []);

    // Handle key down events for search input
    // This function handles Enter and Escape keys
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            handleSearch();
        } else if (e.key === 'Escape') {
            setSuggestions([]);
        }
    }, [handleSearch]);

    // Toggle menu open state
    // This function toggles the menu open state and clears suggestions
    const toggleMenu = useCallback(() => {
        setMenuOpen(prev => !prev);
        setSuggestions([]);
    }, []);

    // Handle click outside the menu to close it
    const headerItems = [
        { name: 'Home', label: 'Galvenais' },
        { name: 'About', label: 'Par mums' },
        { name: 'Contact', label: 'Kontakti' }
    ];

    return (
        <div className="main">
            <header className='header'>
                <nav className='navbar'>
                    <div className="container px-6 flex justify-between items-center">
                        {isMobile && (
                            <button 
                                className="text-white hover:text-gray-300 cursor-pointer"
                                onClick={toggleMenu}
                                aria-label="Toggle menu"
                            >
                                <FiMenu size={24} />
                            </button>
                        )}

                        {(!isMobile || menuOpen) && (
                            <ul className={`${isMobile ? 
                                'absolute top-16 left-0 right-0 bg-blue-800 z-50 p-4 space-y-3' : 
                                'flex space-x-4'}`}
                            >
                                {headerItems.map((item) => (
                                    <li 
                                        key={item.name}
                                        className={`cursor-pointer ${isMobile ? 'py-2 border-b border-blue-700' : ''}`}
                                        style={{
                                            // color: activeHeader === item.name ? 'grey' : 'white',
                                            fontWeight: activeHeader === item.name ? '900' : '400',
                                            letterSpacing: activeHeader === item.name ? '0.5px' : '0px',
                                        }}
                                        onClick={() => handleHeaderClick(item.name)}
                                    >
                                        {item.label}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {activeHeader === 'Home' && (!isMobile || !menuOpen) && (
                            <div className="search-container" ref={searchRef}>
                                <div className={`search-bar ${isSearchFocused ? 'focused' : ''}`}>
                                    <input
                                        type="text"
                                        placeholder="Meklēt vietu..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={handleInputFocus}
                                        onKeyDown={handleKeyDown}
                                        aria-label="Location search"
                                    />
                                    {searchQuery && (
                                        <button 
                                            className="clear-btn"
                                            onClick={clearSearch}
                                            aria-label="Clear search"
                                        >
                                            <FiX />
                                        </button>
                                    )}
                                    <button 
                                        className="search-btn"
                                        onClick={handleSearch}
                                        disabled={!searchQuery.trim()}
                                        aria-label="Search location"
                                    >
                                        <FiSearch />
                                    </button>
                                </div>
                                
                                {suggestions.length > 0 && (
                                    <ul className="suggestion-list">
                                        {suggestions.map((s, idx) => (
                                            <li 
                                                key={`${s.formatted}-${idx}`} 
                                                onClick={() => handleSelect(s)}
                                                className="suggestion-item"
                                            >
                                                <div className="suggestion-text">{s.formatted}</div>
                                                {s.components?.country && (
                                                    <div className="suggestion-country">
                                                        {s.components.country}
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                
                                {isSearching && (
                                    <div className="search-loading">
                                        <div className="spinner"></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </nav>
            </header>

            <main className='main-content'>
                {renderPage()}
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

export default React.memo(Layout);