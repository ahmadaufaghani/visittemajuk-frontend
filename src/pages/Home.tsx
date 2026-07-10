import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import Hero from '../components/Hero';
import SectionTitle from '../components/SectionTitle';
import Card from '../components/Card';
import Testimonial from '../components/Testimonial';
import { useDestinations } from '../hooks/useDestinations';
import { accommodations } from '../data/accommodations';
import { photoSpots } from '../data/photoSpots';
import { Map, MapPin, Compass, Utensils, Camera, ChevronRight } from 'lucide-react';
import avatar from '../assets/img/user.png'
import { useReviews } from '../hooks/useReview';
import dateFormatter from '../utils/dateFormatter';

const Home: React.FC = () => {

  const [isLoaded, setIsLoaded] = useState(false);
  const {
    destinations,
    isLoading: isLoadingDestinations,
    error: destinationsError,
  } = useDestinations();

  const {
    destinations,
    isLoading: isLoadingDestinations,
    error: destinationsError,
  } = useDestinations();

  const {
    reviews,
    isLoading: isLoadingReviews,
    error: reviewsError,
  } = useReviews();


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const testimonialSettings = {
    ...sliderSettings,
    slidesToShow: 2,
  };

  const featuredDestinations = destinations.slice(0, 3);
  const featuredPhotos = photoSpots.slice(0, 3);
  const featuredReviews = reviews?.slice(0, 4);

  return (
    <div className="min-h-screen">
      <Hero
        title="Jelajahi Keindahan Wisata Temajuk"
        subtitle="Destinasi wisata tersembunyi di Kalimantan Barat Indonesia"
        imageUrl="https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        buttonText="Jelajahi Sekarang"
        buttonLink="/destinasi"
      />

      {/* Intro Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div
              className={`transition-all duration-1000 ease-out transform ${
                isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
              }`}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-heading">
                Selamat Datang di <span className="text-primary">Temajuk</span>
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Temajuk adalah surga tersembunyi yang terletak di ujung barat Indonesia, tepatnya di
                Kecamatan Paloh, Kabupaten Sambas, Kalimantan Barat. Dengan pantai pasir putih yang
                membentang sepanjang 6 km, hutan mangrove yang asri, dan berbagai destinasi wisata
                menarik lainnya, Temajuk menawarkan pengalaman wisata yang tak terlupakan.
              </p>
              <p className="text-gray-600 mb-6 text-lg">
                Sebagai desa yang berbatasan langsung dengan Malaysia, Temajuk memiliki keunikan
                budaya dan kuliner yang menarik untuk dieksplorasi. Mari jelajahi keindahan Temajuk
                dan ciptakan kenangan tak terlupakan!
              </p>
              <Link
                to="/destinasi"
                className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-md shadow transition-all duration-300 transform hover:scale-105"
              >
                Lihat Destinasi
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div
              className={`transition-all duration-1000 ease-out transform ${
                isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
              } delay-300`}
            >
              <img
                src="https://images.pexels.com/photos/1680140/pexels-photo-1680140.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Pantai Temajuk"
                className="rounded-lg shadow-lg w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Kenapa Harus Mengunjungi Temajuk?"
            subtitle="Temajuk menawarkan berbagai keunikan dan pengalaman wisata yang menarik"
            center={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
              <div className="bg-primary inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto">
                <Map className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Destinasi Eksotis</h3>
              <p className="text-gray-600">
                Temajuk menawarkan destinasi wisata eksotis dengan keindahan alam yang masih terjaga.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
              <div className="bg-primary inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Lokasi Unik</h3>
              <p className="text-gray-600">
                Terletak di perbatasan Indonesia-Malaysia, Anda bisa berfoto dengan satu kaki di dua negara!
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
              <div className="bg-primary inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto">
                <Utensils className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Kuliner Lezat</h3>
              <p className="text-gray-600">
                Nikmati hidangan seafood segar dan kuliner khas Kalimantan Barat yang lezat.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
              <div className="bg-primary inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Spot Foto Menarik</h3>
              <p className="text-gray-600">
                Temukan berbagai spot foto instagramable untuk mengabadikan momen liburan Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <SectionTitle
              title="Destinasi Populer"
              subtitle="Jelajahi tempat-tempat menarik di Temajuk"
            />
            <Link
              to="/destinasi"
              className="text-primary hover:text-primary-dark font-medium flex items-center transition-colors duration-200"
            >
              Lihat Semua
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>

          {isLoadingDestinations && (
            <div className="text-center py-8">
              <p className="text-gray-500">Memuat destinasi...</p>
            </div>
          )}

          {!isLoadingDestinations && destinationsError && (
            <div className="text-center py-8">
              <p className="text-red-600">{destinationsError}</p>
            </div>
          )}

          {!isLoadingDestinations && !destinationsError && featuredDestinations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDestinations.map((destination) => (
                <Card
                  key={destination.id}
                  id={destination.id}
                  title={destination.title}
                  description={destination.description}
                  imageUrl={destination.imageUrl}
                  link="/destinasi"
                  category={destination.category}
                  price={destination.price}
                />
              ))}
            </div>
          )}

          {!isLoadingDestinations && !destinationsError && featuredDestinations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                <Compass className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Belum ada destinasi wisata yang terdaftar
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                Destinasi wisata di Temajuk belum tersedia saat ini. Silakan kembali lagi nanti!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Accommodations Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <SectionTitle
              title="Akomodasi Terbaik"
              subtitle="Temukan penginapan nyaman untuk liburan Anda"
            />
            <Link
              to="/akomodasi"
              className="text-primary hover:text-primary-dark font-medium flex items-center transition-colors duration-200"
            >
              Lihat Semua
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>

          <Slider {...sliderSettings} className="accommodation-slider">
            {accommodations.map((accommodation) => (
              <div key={accommodation.id} className="px-2">
                <Card
                  id={accommodation.id}
                  title={accommodation.title}
                  description={accommodation.description}
                  imageUrl={accommodation.imageUrl}
                  link="/akomodasi"
                  category={accommodation.category}
                  price={accommodation.price}
                />
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Transport CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">
                Butuh Panduan Transportasi?
              </h2>
              <p className="text-gray-100 mb-6 text-lg">
                Kami menyediakan informasi lengkap tentang cara mencapai Temajuk dan transportasi lokal
                untuk menjelajahi berbagai destinasi wisata. Mulai dari rute, estimasi biaya, hingga
                tips perjalanan yang akan membantu liburan Anda berjalan lancar.
              </p>
              <Link
                to="/transportasi"
                className="inline-flex items-center bg-white hover:bg-gray-100 text-primary font-medium px-6 py-3 rounded-md shadow transition-all duration-300 transform hover:scale-105"
              >
                <Compass className="mr-2 h-5 w-5" />
                Panduan Transportasi
              </Link>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Transportasi Temajuk"
                className="rounded-lg shadow-lg w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Photo Spots Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <SectionTitle
              title="Spot Foto Instagramable"
              subtitle="Abadikan momen liburan Anda di lokasi-lokasi menarik"
            />
            <Link
              to="/foto"
              className="text-primary hover:text-primary-dark font-medium flex items-center transition-colors duration-200"
            >
              Lihat Semua
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPhotos.map((spot) => (
              <Card
                key={spot.id}
                id={spot.id}
                title={spot.title}
                description={spot.description}
                imageUrl={spot.imageUrl}
                link="/foto"
                category={spot.category}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <SectionTitle
              title="Ulasan Pengunjung"
              subtitle="Apa kata mereka tentang pengalaman di Temajuk"
            />
            <Link
              to="/ulasan"
              className="text-primary hover:text-primary-dark font-medium flex items-center transition-colors duration-200"
            >
              Lihat Semua
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>

          {isLoadingReviews && (
            <div className="text-center py-8">
              <p className="text-gray-500">Memuat review...</p>
            </div>
          )}

          {!isLoadingReviews && reviewsError && (
            <div className="text-center py-8">
              <p className="text-red-600">{reviewsError}</p>
            </div>
          )}

          {!isLoadingReviews && !reviewsError && featuredReviews.length > 0 ?
          <Slider {...testimonialSettings} infinite={( featuredReviews && featuredReviews?.length > 1) ?? undefined} className="testimonial-slider">
            {featuredReviews?.map((review) => (
              <div key={review.id+"-div"} className="px-2 my-6">
                <Testimonial
                  key={review.id+"-item"}
                  name={review.name}
                  date={dateFormatter(review.created_at)}
                  rating={review.rating}
                  text={review.text}
                  imageUrl={avatar}
                />
              </div>
              ))}
          </Slider>
          :
          <></>
          }
           {!isLoadingReviews && !reviewsError && featuredReviews.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                <Compass className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Tidak ada data review
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                Review wisata di Temajuk belum tersedia saat ini. Silakan kembali lagi nanti!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 font-heading">
              Dapatkan Informasi Terbaru
            </h2>
            <p className="text-primary-dark mb-8 text-lg max-w-3xl mx-auto">
              Berlangganan newsletter kami untuk mendapatkan informasi terbaru tentang destinasi, event,
              dan promo menarik di Temajuk.
            </p>
            <form className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Alamat Email Anda"
                  className="flex-grow px-4 py-3 rounded-md border-2 border-white focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-md shadow transition-all duration-300 sm:flex-shrink-0"
                >
                  Berlangganan
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
