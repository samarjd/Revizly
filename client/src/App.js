import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Connection from './pages/Connection';
import './App.css';

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsConnected(true);
    }
    setLoading(false); // After checking, stop loading
  }, []);

  if (loading) {
    return <div className="loader">Loading...</div>; // Show loader while checking
  }

  return isConnected ? <Home /> : <Connection onConnect={setIsConnected} />;
};

export default App;
