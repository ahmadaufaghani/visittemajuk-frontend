import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { OverlayProvider } from './contexts/OverlayContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import Home from './pages/Home';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import Accommodations from './pages/Accommodations';
import AccommodationDetail from './pages/AccommodationDetail';
import Transportation from './pages/Transportation';
import Culinary from './pages/Culinary';
import CulinaryDetail from './pages/CulinaryDetail';
import PhotoSpots from './pages/PhotoSpots';
import PhotoSpotDetail from './pages/PhotoSpotDetail';
import Reviews from './pages/Reviews';
import AdminLogin from './pages/admin/AdminLogin';
import DestinationList from './pages/admin/destinations/DestinationList';
import DestinationForm from './pages/admin/destinations/DestinationForm';
import AccommodationList from './pages/admin/accommodations/AccommodationList';
import AccommodationForm from './pages/admin/accommodations/AccommodationForm';
import CulinaryList from './pages/admin/culinary/CulinaryList';
import CulinaryForm from './pages/admin/culinary/CulinaryForm';
import AdditionalCulinaryList from './pages/admin/additionalCulinary/AdditionalCulinaryList';
import PhotoSpotList from './pages/admin/photoSpots/PhotoSpotList';
import PhotoSpotForm from './pages/admin/photoSpots/PhotoSpotForm';
import TransportationList from './pages/admin/transportations/TransportationList';
import TransportationForm from './pages/admin/transportations/TransportationForm';
import AdditionalInformationList from './pages/admin/additionalInformation/AdditionalInformationList';

function App() {
  return (
    <AuthProvider>
      <OverlayProvider>
      <Router>
        <Routes>
          {/* Public Routes with Navbar and Footer */}
          <Route path="/*" element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/destinasi" element={<Destinations />} />
                  <Route path="/destinasi/:id" element={<DestinationDetail />} />
                  <Route path="/akomodasi" element={<Accommodations />} />
                  <Route path="/akomodasi/:id" element={<AccommodationDetail />} />
                  <Route path="/transportasi" element={<Transportation />} />
                  <Route path="/kuliner" element={<Culinary />} />
                  <Route path="/kuliner/:id" element={<CulinaryDetail />} />
                  <Route path="/foto" element={<PhotoSpots />} />
                  <Route path="/foto/:id" element={<PhotoSpotDetail />} />
                  <Route path="/ulasan" element={<Reviews />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
          
          {/* Admin Routes without Navbar and Footer */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DestinationList />} />
            <Route path="destinations" element={<DestinationList />} />
            <Route path="destinations/add" element={<DestinationForm />} />
            <Route path="destinations/edit/:id" element={<DestinationForm />} />
            <Route path="accommodations" element={<AccommodationList />} />
            <Route path="accommodations/add" element={<AccommodationForm />} />
            <Route path="accommodations/edit/:id" element={<AccommodationForm />} />
            <Route path="culinary" element={<CulinaryList />} />
            <Route path="culinary/additional" element={<AdditionalCulinaryList/>} />
            <Route path="culinary/add" element={<CulinaryForm />} />
            <Route path="culinary/edit/:id" element={<CulinaryForm />} />
            <Route path="photo-spots" element={<PhotoSpotList />} />
            <Route path="photo-spots/add" element={<PhotoSpotForm />} />
            <Route path="photo-spots/edit/:id" element={<PhotoSpotForm />} />
            <Route path="transportations" element={<TransportationList />} />
            <Route path="transportations/information" element={<AdditionalInformationList />} />
            <Route path="transportations/add" element={<TransportationForm />} />
            <Route path="transportations/edit/:id" element={<TransportationForm />} />
          </Route>
        </Routes>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '8px',
            background: '#fff',
            color: '#1f2937',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
          },
          success: {
            iconTheme: {
              primary: '#2E7D32',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
          },
        }}
      />
    </OverlayProvider>
    </AuthProvider>
  );
}

export default App;