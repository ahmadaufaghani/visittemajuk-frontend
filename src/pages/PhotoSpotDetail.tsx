import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Camera, Clock, CornerDownRight, MapPin } from 'lucide-react';
import Slider from 'react-slick';
import { useAuth } from '../contexts/authContextValue';
import { getPhotoSpot } from '../services/photoSpotsApi';
import type { PhotoSpot } from '../types/photoSpot';

const PhotoSpotDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [photoSpot, setPhotoSpot] = useState<PhotoSpot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const { token } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);
    setError(false);

    getPhotoSpot(String(id))
      .then((res) => {
        setPhotoSpot(res);
      })
      .catch((err) => {
        setError(true);
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const sliderSettings = {
    dots: true,
    infinite: !(photoSpot && photoSpot.photo_spot_galleries.length === 1),
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  const galleryImages = photoSpot
    ? photoSpot.photo_spot_galleries.length > 0
      ? photoSpot.photo_spot_galleries.map((gallery) => gallery.image)
      : [photoSpot.image]
    : [];

  const resolveImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('/')) {
      return imagePath;
    }

    return `http://127.0.0.1:8000/storage/${imagePath}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Memuat spot foto...</p>
      </div>
    );
  }

  if (error || !photoSpot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Spot foto tidak ditemukan</h2>
          <p className="text-gray-600 mb-6">Maaf, spot foto yang Anda cari tidak ditemukan.</p>
          <Link
            to="/foto"
            className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-md shadow transition-colors duration-300"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Kembali ke Daftar Spot Foto
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
        style={{ backgroundImage: `url(http://127.0.0.1:8000/storage/${photoSpot.image})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-full p-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="bg-accent text-primary font-medium px-3 py-1 rounded-full text-sm">
              {photoSpot.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-2 font-heading">
              {photoSpot.title}
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
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tentang {photoSpot.title}</h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                {photoSpot.full_description}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md">
                  <MapPin className="h-5 w-5 text-primary mr-2" />
                  <span className="text-gray-700">{photoSpot.location}</span>
                </div>
                <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md">
                  <Clock className="h-5 w-5 text-primary mr-2" />
                  <span className="text-gray-700">Waktu Terbaik: {photoSpot.bestHour}</span>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Tips Fotografi</h3>
              <ul className="list-none mb-6">
                {photoSpot.tips.map((tip, index) => (
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
              <Slider {...sliderSettings} className="gallery-slider mb-6">
                {galleryImages.map((image, index) => (
                  <div key={index} className="p-1">
                    <img
                      src={resolveImageUrl(image)}
                      alt={`${photoSpot.title} - Gambar ${index + 1}`}
                      className="w-full h-64 md:h-96 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </Slider>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Lokasi</h3>
              <div className="aspect-video bg-gray-200 rounded-lg mb-6 overflow-hidden">
                {photoSpot.location_map ? (
                  <iframe
                    src={photoSpot.location_map}
                    className="h-full w-full"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${photoSpot.title} map`}
                  />
                ) : (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(photoSpot.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-700"
                  >
                    Lihat di Google Maps
                  </a>
                )}
              </div>


              <h3 className="text-xl font-semibold text-gray-800 mb-4">Atraksi Terdekat</h3>
              <div className="border-t border-gray-200 pt-4 mb-6">
                <ul className="space-y-2">
                  {photoSpot.nearestAttraction.map((attraction, index) => (
                    <li key={index} className="flex items-start">
                      <Camera className="h-5 w-5 text-primary mr-2 mt-1" />
                      <span className="text-gray-700">{attraction}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="mb-3">
                  <span className="font-medium text-gray-700">Kategori:</span>
                  <span className="ml-2 text-gray-600">{photoSpot.category}</span>
                </div>
                <div className="mb-3">
                  <span className="font-medium text-gray-700">Waktu Terbaik:</span>
                  <span className="ml-2 text-gray-600">{photoSpot.bestHour}</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to={token ? '/admin/photo-spots' : '/foto'}
                  className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-md shadow w-full justify-center transition-colors duration-300"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  {token ? 'Kembali ke Daftar Spot Foto' : 'Kembali ke Spot Foto'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoSpotDetail;