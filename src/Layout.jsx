import './styles/Layout.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Layout = ({ children, onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;

    // Debounce input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 400); // 400ms debounce

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Fetch suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedQuery || debouncedQuery.length < 3) {
                setSuggestions([]);
                return;
            }

            try {
                const res = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
                    params: {
                        q: debouncedQuery,
                        key: API_KEY,
                        limit: 5,
                    },
                });

                setSuggestions(res.data.results || []);
            } catch (err) {
                console.error('Suggestion fetch error:', err);
                setSuggestions([]);
            }
        };

        fetchSuggestions();
    }, [debouncedQuery]);

    // When user clicks suggestion or presses search
    const handleSelect = (item) => {
        setSearchQuery(item.formatted);
        setSuggestions([]);
        onSearch({
            latitude: item.geometry.lat,
            longitude: item.geometry.lng,
        });
    };

    return (
        <div className="main">
            <header className='header'>
                <nav className='navbar'>
                    <div className="container px-6 flex justify-between items-center">
                        <ul className="flex space-x-4">
                            <li className="text-white hover:text-gray-300 cursor-pointer">Home</li>
                            <li className="text-white hover:text-gray-300 cursor-pointer">About</li>
                            <li className="text-white hover:text-gray-300 cursor-pointer">Contact</li>
                        </ul>
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search for a place"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button onClick={() => handleSelect({ formatted: searchQuery })}>Search</button>
                            {suggestions.length > 0 && (
                                <ul className="suggestion-list">
                                    {suggestions.map((s, idx) => (
                                        <li key={idx} onClick={() => handleSelect(s)}>
                                            {s.formatted}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </nav>
            </header>
            <main className='main-content'>
                {children}
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

export default Layout;
