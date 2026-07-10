import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { culinary } from '../data/culinary';
import { MapPin, Clock, DollarSign, Phone, Utensils, ArrowLeft } from 'lucide-react';
import Slider from 'react-slick';
import {Culinary} from "../types/culinary";
import { getCulinary } from '../services/culinariesApi';

const CulinaryDetail: React.FC = () => {

  const { id } = useParams<{ id: string }>();
  const [detailCulinary, setDetailCulinary] = useState<Culinary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);
    getCulinary(Number(id))
    .then(res => {
      setDetailCulinary(res);
    }).catch((err) => {
      setError(true);
      console.log(err);
    }).finally(()=> {
      setIsLoading(false);
    });

  }, [id]);


  const sliderSettings = {
    dots: true,
    infinite: !(detailCulinary && detailCulinary.culinary_galleries.length === 1),
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
          <p className="text-gray-600 text-lg">Memuat kuliner...</p>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Kuliner tidak ditemukan</h2>
            <p className="text-gray-600 mb-6">
              {error ?? 'Maaf, kuliner yang Anda cari tidak ditemukan.'}
            </p>
            <Link
              to={"/kuliner"}
              className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-md shadow transition-colors duration-300"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Kembali
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
        style={{ backgroundImage: `url(http://127.0.0.1:8000/storage/${detailCulinary?.image})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-full p-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="bg-accent text-primary font-medium px-3 py-1 rounded-full text-sm">
              {detailCulinary?.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-2 font-heading">
              {detailCulinary?.title}
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
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tentang {detailCulinary?.title}</h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                {detailCulinary?.full_description}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md">
                  <MapPin className="h-5 w-5 text-primary mr-2" />
                  <span className="text-gray-700">{detailCulinary?.location}</span>
                </div>
                <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md">
                  <Clock className="h-5 w-5 text-primary mr-2" />
                  <span className="text-gray-700">{detailCulinary?.open_hours}</span>
                </div>
                <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md">
                  <DollarSign className="h-5 w-5 text-primary mr-2" />
                  <span className="text-gray-700">{detailCulinary?.price}</span>
                </div>
                {detailCulinary?.contact && (
                  <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md">
                    <Phone className="h-5 w-5 text-primary mr-2" />
                    <span className="text-gray-700">{detailCulinary?.contact}</span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Menu Spesial</h3>
              <div className="space-y-3 mb-6">
                {detailCulinary?.specialties && detailCulinary.specialties.length > 0 ? detailCulinary?.specialties?.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <Utensils className="h-5 w-5 text-primary mr-3" />
                    <span className="text-gray-700">{item.menu}</span>
                  </div>
                ))
                :
                <div className="text-center">Menu spesial tidak tersedia.</div>
                }
              </div>
            </div>

            {/* Gallery */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Galeri</h2>
              <Slider {...sliderSettings} className="gallery-slider mb-6">
                {detailCulinary?.culinary_galleries.map((item, index) => (
                  <div key={index} className="p-1">
                    <img
                      src={`http://127.0.0.1:8000/storage/${item.image}`}
                      alt={`${detailCulinary.title} - Gambar ${index + 1}`}
                      className="w-full h-64 md:h-96 object-cover rounded-lg"
                    />
                  </div>
                ))
                }
              </Slider>
              {detailCulinary?.culinary_galleries && detailCulinary?.culinary_galleries.length === 0 
              ? 
               <div className="text-center mb-6">
                  Galeri tidak ditemukan.
                </div>
              :
              <></>
              }
             
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Lokasi</h3>
              <div className="aspect-video bg-gray-200 rounded-lg mb-6 overflow-hidden">
                {/* Placeholder for map (in a real app, this would be an actual map) */}
                  {
                    detailCulinary?.location_map 
                    ?
                    <div className="google-map-code relative h-0 pb-[56.25%] overflow-hidden">
                      <iframe
                          src={`${detailCulinary?.location_map}`}
                          className="absolute left-0 top-0 h-full w-full"
                          
                          style={{border:0}}
                          allowFullScreen={true}
                      />
                    </div>
                    :
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <MapPin className="h-8 w-8 text-primary" />
                      <span className="ml-2 text-gray-700">Peta Lokasi</span>
                    </div>
                  }
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">Informasi Lainnya</h3>
              <div className="border-t border-gray-200 pt-4">
                <div className="mb-3">
                  <span className="font-medium text-gray-700">Kategori:</span>
                  <span className="ml-2 text-gray-600">{detailCulinary?.category}</span>
                </div>
                <div className="mb-3">
                  <span className="font-medium text-gray-700">Kisaran Harga:</span>
                  <span className="ml-2 text-gray-600">{detailCulinary?.price}</span>
                </div>
                <div className="mb-3">
                  <span className="font-medium text-gray-700">Jam Buka:</span>
                  <span className="ml-2 text-gray-600">{detailCulinary?.open_hours}</span>
                </div>
                {detailCulinary?.contact && (
                  <div className="mb-3">
                    <span className="font-medium text-gray-700">Kontak:</span>
                    <span className="ml-2 text-gray-600">{detailCulinary?.contact}</span>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Link
                  to="/kuliner"
                  className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-md shadow w-full justify-center transition-colors duration-300"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Kembali ke Daftar Kuliner
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CulinaryDetail;