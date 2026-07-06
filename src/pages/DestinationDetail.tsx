import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getDestination } from '../services/destinationsApi';
import type { Destination } from '../types/destination';
import { MapPin, Clock, DollarSign, CornerDownRight, ArrowLeft } from 'lucide-react';
import Slider from 'react-slick';

const DestinationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isFromAdmin = (location.state as { fromAdmin?: boolean } | null)?.fromAdmin ?? false;

  const [destination, setDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backTo = isFromAdmin ? '/admin/destinations' : '/destinasi';
  const backLabel = isFromAdmin ? 'Kembali ke Kelola Destinasi' : 'Kembali ke Daftar Destinasi';

  useEffect(() => {
    let isActive = true;

    window.scrollTo(0, 0);

    if (!id) {
      setDestination(null);
      setIsLoading(false);
      return () => {
        isActive = false;
      };
    }

    setIsLoading(true);
    setError(null);
    setDestination(null);

    getDestination(id)
      .then((loadedDestination) => {
        if (isActive) {
          setDestination(loadedDestination);
        }
      })
      .catch(() => {
        if (isActive) {
          setDestination(null);
          setError('Destinasi yang Anda cari tidak ditemukan.');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [id]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Memuat destinasi...</p>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Destinasi tidak ditemukan</h2>
          <p className="text-gray-600 mb-6">
            {error ?? 'Maaf, destinasi yang Anda cari tidak ditemukan.'}
          </p>
          <Link
            to={backTo}
            className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-md shadow transition-colors duration-300"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Image */}
      <div
        className="w-full h-[50vh] bg-cover bg-center relative"
        style={{ backgroundImage: `url(${destination.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-full p-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="bg-accent text-primary font-medium px-3 py-1 rounded-full text-sm">
              {destination.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-2 font-heading">
              {destination.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="md:w-2/3">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tentang {destination.title}</h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                {destination.fullDescription}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md">
                  <MapPin className="h-5 w-5 text-primary mr-2" />
                  <span className="text-gray-700">{destination.location}</span>
                </div>
                <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md">
                  <Clock className="h-5 w-5 text-primary mr-2" />
                  <span className="text-gray-700">{destination.openHours}</span>
                </div>
                <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md">
                  <DollarSign className="h-5 w-5 text-primary mr-2" />
                  <span className="text-gray-700">{destination.price}</span>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Fasilitas</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {destination.facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    {facility}
                  </span>
                ))}
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Aktivitas</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {destination.activities.map((activity, index) => (
                  <span
                    key={index}
                    className="bg-accent bg-opacity-20 text-primary-dark px-3 py-1 rounded-full text-sm"
                  >
                    {activity}
                  </span>
                ))}
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Tips Kunjungan</h3>
              <ul className="list-none mb-6">
                {destination.tips.map((tip, index) => (
                  <li key={index} className="flex mb-2">
                    <CornerDownRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-1" />
                    <span className="text-gray-600">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gallery */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Galeri</h2>
              {destination.gallery.length > 0 ? (
                <Slider {...sliderSettings} className="gallery-slider mb-6">
                  {destination.gallery.map((image, index) => (
                    <div key={index} className="p-1">
                      <img
                        src={image}
                        alt={`${destination.title} - Gambar ${index + 1}`}
                        className="w-full h-64 md:h-96 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </Slider>
              ) : (
                <p className="text-gray-500">Galeri belum tersedia.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Lokasi</h3>
              <div className="aspect-video bg-gray-200 rounded-lg mb-6 overflow-hidden">
                <a
                  href="https://maps.app.goo.gl/tbM3tYfYxtNvBaYw5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  <img
                    src="/images/maps-pantai-temajuk.png"
                    alt="Peta Lokasi Pantai Temajuk"
                    className="w-full h-full object-cover"
                  />
                </a>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">Informasi Lainnya</h3>
              <div className="border-t border-gray-200 pt-4">
                <div className="mb-3">
                  <span className="font-medium text-gray-700">Kategori:</span>
                  <span className="ml-2 text-gray-600">{destination.category}</span>
                </div>
                <div className="mb-3">
                  <span className="font-medium text-gray-700">Harga Tiket:</span>
                  <span className="ml-2 text-gray-600">{destination.price}</span>
                </div>
                <div className="mb-3">
                  <span className="font-medium text-gray-700">Jam Buka:</span>
                  <span className="ml-2 text-gray-600">{destination.openHours}</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to={backTo}
                  className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-md shadow w-full justify-center transition-colors duration-300"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  {backLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
