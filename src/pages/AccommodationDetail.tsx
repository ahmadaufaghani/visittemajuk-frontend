import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getAccommodation } from '../services/accommodationsApi';
import type { Accommodation } from '../types/accommodation';
import { MapPin, Phone, Globe, Bed, ArrowLeft } from 'lucide-react';
import Slider from 'react-slick';
import { storageUrl } from '../utils/storageUrl';

const AccommodationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isFromAdmin = (location.state as { fromAdmin?: boolean } | null)?.fromAdmin ?? false;

  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backTo = isFromAdmin ? '/admin/accommodations' : '/akomodasi';
  const backLabel = isFromAdmin ? 'Kembali ke Kelola Akomodasi' : 'Kembali ke Daftar Akomodasi';

  useEffect(() => {
    let isActive = true;

    window.scrollTo(0, 0);

    if (!id) {
      setAccommodation(null);
      setIsLoading(false);
      return () => {
        isActive = false;
      };
    }

    setIsLoading(true);
    setError(null);
    setAccommodation(null);

    getAccommodation(id)
      .then((loadedAccommodation) => {
        if (isActive) {
          setAccommodation(loadedAccommodation);
        }
      })
      .catch(() => {
        if (isActive) {
          setAccommodation(null);
          setError('Akomodasi yang Anda cari tidak ditemukan.');
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
    infinite: !(accommodation && accommodation.accomodation_galleries.length === 1),
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
        <p className="text-gray-600 text-lg">Memuat akomodasi...</p>
      </div>
    );
  }

  if (!accommodation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Akomodasi tidak ditemukan</h2>
          <p className="text-gray-600 mb-6">
            {error ?? 'Maaf, akomodasi yang Anda cari tidak ditemukan.'}
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

  const priceLabel = accommodation.minPrice && accommodation.maxPrice
    ? `Rp ${Number(accommodation.minPrice).toLocaleString('id-ID')} - Rp ${Number(accommodation.maxPrice).toLocaleString('id-ID')}`
    : accommodation.minPrice
      ? `Mulai Rp ${Number(accommodation.minPrice).toLocaleString('id-ID')}`
      : '-';

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Image */}
      <div
        className="w-full h-[50vh] bg-cover bg-center relative"
        style={{ backgroundImage: `url(${storageUrl(accommodation.image)})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-full p-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="bg-accent text-primary font-medium px-3 py-1 rounded-full text-sm">
              {capitalize(accommodation.category)}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-2 font-heading">
              {accommodation.title}
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
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tentang {accommodation.title}</h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                {accommodation.fullDescription}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md">
                  <MapPin className="h-5 w-5 text-primary mr-2" />
                  <span className="text-gray-700">{accommodation.location}</span>
                </div>
                <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md">
                  <Phone className="h-5 w-5 text-primary mr-2" />
                  <span className="text-gray-700">{accommodation.contacs}</span>
                </div>
                {accommodation.siteUrl && (
                  <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md">
                    <Globe className="h-5 w-5 text-primary mr-2" />
                    <a
                      href={accommodation.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {accommodation.siteUrl}
                    </a>
                  </div>
                )}
              </div>

              {accommodation.facilities.length > 0 && (
                <>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Fasilitas</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {accommodation.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {accommodation.roomTypes.length > 0 && (
                <>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Tipe Kamar</h3>
                  <div className="space-y-4 mb-6">
                    {accommodation.roomTypes.map((room, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Bed className="h-5 w-5 text-primary mr-2" />
                          <h4 className="font-semibold text-gray-800">{room.name}</h4>
                        </div>
                        <p className="text-gray-600 mb-3">{room.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Kapasitas: {room.capacity} orang</span>
                          <span className="font-medium text-primary">
                            Rp {Number(room.price).toLocaleString('id-ID')}/malam
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Gallery */}
            {accommodation.accomodation_galleries.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Galeri</h2>
                <Slider {...sliderSettings} className="gallery-slider mb-6">
                  {accommodation.accomodation_galleries.map((gallery, index) => (
                    <div key={gallery.id} className="p-1">
                      <img
                        src={storageUrl(gallery.image)}
                        alt={`${accommodation.title} - Gambar ${index + 1}`}
                        className="w-full h-64 md:h-96 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            )}
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
                  <span className="ml-2 text-gray-600">{capitalize(accommodation.category)}</span>
                </div>
                <div className="mb-3">
                  <span className="font-medium text-gray-700">Kisaran Harga:</span>
                  <span className="ml-2 text-gray-600">{priceLabel}</span>
                </div>
                <div className="mb-3">
                  <span className="font-medium text-gray-700">Kontak:</span>
                  <span className="ml-2 text-gray-600">{accommodation.contacs}</span>
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

export default AccommodationDetail;