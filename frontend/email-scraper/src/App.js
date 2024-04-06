// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from "./components/Header";
import Home from './components/Home';
import Collections from './components/Collections';
import SearchIgnoreList from './components/SearchIgnoreList';
import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Define your routes here */}
        <Route path="/" element={<Home />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/search-ignore-list" element={<SearchIgnoreList />} />
      </Routes>
    </Router>
  );
}

export default App;