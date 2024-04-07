import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from "./components/Header";
import Home from './components/Home';
import Collections from './components/Collections';
import SearchIgnoreList from './components/SearchIgnoreList';
import LoginPage from './components/LoginPage';
import './App.css';

function App() {
  // Check if the user is already logged in from localStorage
  const initialLoggedInState = localStorage.getItem('isLoggedIn') === 'true';
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedInState);

  // Update the isLoggedIn state and localStorage when logging in
  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  // Handle logout by updating state and localStorage
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  const ProtectedRoute = ({ element, ...rest }) => {
    return isLoggedIn ? element : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div>
        <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        <Routes>
          <Route
            path="/"
            element={<ProtectedRoute element={<Home />} />}
          />
          <Route
            path="/collections"
            element={<ProtectedRoute element={<Collections />} />}
          />
          <Route
            path="/search-ignore-list"
            element={<ProtectedRoute element={<SearchIgnoreList />} />}
          />
          <Route
            path="/login"
            element={<LoginPage setIsLoggedIn={setIsLoggedIn} handleLogin={handleLogin} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
