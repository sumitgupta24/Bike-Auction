import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import AuctionList from './pages/AuctionList';
import AuctionDetail from './pages/AuctionDetail';
import Auth from './pages/Auth';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuctionList />} />
          <Route path="/auctions/:id" element={<AuctionDetail />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
