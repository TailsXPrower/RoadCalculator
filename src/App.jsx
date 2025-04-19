import Layout from './Layout';
import HomePage from './HomePage';
import React, { useState } from 'react';

// This is the main App component that initializes the application.
function App() {
    
    // State to hold the searched location.
    const [searchedLocation, setSearchedLocation] = useState(null);
    
    return (
        <Layout onSearch={setSearchedLocation}>
            <HomePage searchedLocation={searchedLocation} />
        </Layout>
    );
}

export default App;