import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import Hero from '../components/Hero';
import SectionTitle from '../components/SectionTitle';
import Card from '../components/Card';
import Testimonial from '../components/Testimonial';
import { useAccommodations } from '../hooks/useAccommodations';
import { useDestinations } from '../hooks/useDestinations';
import { storageUrl } from '../utils/storageUrl';
import { Map, MapPin, Compass, Utensils, Camera, ChevronRight, Bus, Bed } from 'lucide-react';
import avatar from '../assets/img/user.png'
import { useReviews } from '../hooks/useReview';
import dateFormatter from '../utils/dateFormatter';
import { usePhotoSpots } from '../hooks/usePhotoSpots';
import { useSiteSettings } from '../hooks/useSiteSettings';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Map, MapPin, Utensils, Camera, Compass, Bus, Bed,
};

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

function formatAccommodationPrice(accommodation: { minPrice: number; maxPrice: number }): string {
  if (accommodation.minPrice === accommodation.maxPrice) {
    return formatRupiah(accommodation.minPrice);
  }
  return `${formatRupiah(accommodation.minPrice)} - ${formatRupiah(accommodation.maxPrice)}`;
}

const Home: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  const { settings } = useSiteSettings();

  const hero = settings['home.hero'];
  const intro = settings['home.intro'];
  const titles = settings['home.section_titles'];
  const featuresSetting = settings['home.features'];
  const transportCta = settings['home.transport_cta'];
  const features = useMemo(() => {
    if (!featuresSetting || !Array.isArray(featuresSetting) || featuresSetting.length === 0) {
      return [];
    }
    return featuresSetting.map((f) => {
      const Icon = ICON_MAP[f.icon] ?? Map;
      return { icon: Icon, title: f.title, body: f.body };
    });
  }, [featuresSetting]);

  const { destinations, isLoading: isLoadingDestinations, error: destinationsError } =
    useDestinations({ params: { perPage: 6 } });

  const { accommodations, isLoading: isLoadingAccommodations, error: accommodationsError } =
    useAccommodations({ params: { perPage: 6 } });

  const { reviews, isLoading: isLoadingReviews, error: reviewsError } = useReviews();

  const { photoSpots, isLoading: isLoadingPhotoSpots, error: photoSpotsError } =
    usePhotoSpots({ params: { perPage: 3 } });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const featuredDestinations = destinations.slice(0, 3);
  const featuredReviews = reviews?.slice(0, 4) ?? [];

  const sliderSettings = {
    dots: true,
    infinite: destinations.length > 1,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  const testimonialSettings = { ...sliderSettings, slidesToShow: 2, infinite: featuredReviews.length > 1 };

  if (!hero) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-24 px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Compass className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2 font-heading">
          Konten beranda belum tersedia
        </h2>
        <p className="text-gray-500 text-center max-w-md">
          Pengaturan beranda belum dikonfigurasi oleh admin. Silakan kembali lagi nanti.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Hero
        title={hero.title}
        subtitle={hero.subtitle ?? ''}
        imageUrl={storageUrl(hero.image)}
        buttonText={hero.button_text}
        buttonLink={hero.button_link}
      />

      {intro && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div
                className={`transition-all duration-1000 ease-out transform ${
                  isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                }`}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-heading">
                  {intro.title}
                </h2>
                <p className="text-gray-600 mb-6 text-lg">{intro.body}</p>
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
                  src={storageUrl(intro.image)}
                  alt="Temajuk"
                  className="rounded-lg shadow-lg w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {features.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle
              title={titles?.features ?? 'Kenapa Harus Mengunjungi Temajuk?'}
              subtitle="Temajuk menawarkan berbagai keunikan dan pengalaman wisata yang menarik"
              center
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center"
                >
                  <div className="bg-primary inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <SectionTitle title={titles?.destinations ?? ''} subtitle="Jelajahi tempat-tempat menarik di Temajuk" />
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

          {!isLoadingDestinations && !destinationsError && destinations.length > 0 ? (
            <Slider {...sliderSettings} className="destination-slider">
              {destinations.slice(0, 6).map((destination) => (
                <div key={destination.id} className="px-2">
                  <Card
                    id={destination.id}
                    title={destination.title}
                    description={destination.description}
                    imageUrl={storageUrl(destination.image)}
                    link="/destinasi"
                    category={destination.category}
                    price={destination.price}
                  />
                </div>
              ))}
            </Slider>
          ) : null}

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

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <SectionTitle title={titles?.accommodations ?? ''} subtitle="Temukan penginapan nyaman untuk liburan Anda" />
            <Link
              to="/akomodasi"
              className="text-primary hover:text-primary-dark font-medium flex items-center transition-colors duration-200"
            >
              Lihat Semua
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>

          {isLoadingAccommodations && (
            <div className="text-center py-8">
              <p className="text-gray-500">Memuat akomodasi...</p>
            </div>
          )}

          {!isLoadingAccommodations && accommodationsError && (
            <div className="text-center py-8">
              <p className="text-red-600">{accommodationsError}</p>
            </div>
          )}

          {!isLoadingAccommodations && !accommodationsError && accommodations.length > 0 ? (
            <Slider {...sliderSettings} className="accommodation-slider">
              {accommodations.slice(0, 6).map((accommodation) => (
                <div key={accommodation.id} className="px-2">
                  <Card
                    id={accommodation.id}
                    title={accommodation.title}
                    description={accommodation.description}
                    imageUrl={storageUrl(accommodation.image)}
                    link="/akomodasi"
                    category={accommodation.category}
                    price={formatAccommodationPrice(accommodation)}
                  />
                </div>
              ))}
            </Slider>
          ) : null}

          {!isLoadingAccommodations && !accommodationsError && accommodations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                <Compass className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Belum ada data akomodasi yang terdaftar
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                Akomodasi di Temajuk belum tersedia saat ini. Silakan kembali lagi nanti!
              </p>
            </div>
          )}
        </div>
      </section>

      {transportCta && (
        <section className="py-16 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">{transportCta.title}</h2>
                <p className="text-gray-100 mb-6 text-lg">
                  {transportCta.body}
                </p>
                {transportCta.button_link && (
                  <Link
                    to={transportCta.button_link}
                    className="inline-flex items-center bg-white hover:bg-gray-100 text-primary font-medium px-6 py-3 rounded-md shadow transition-all duration-300 transform hover:scale-105"
                  >
                    <Compass className="mr-2 h-5 w-5" />
                    {transportCta.button_text}
                  </Link>
                )}
              </div>
              {transportCta.image && (
                <div className="hidden md:block">
                  <img
                    src={storageUrl(transportCta.image)}
                    alt="Transportasi Temajuk"
                    className="rounded-lg shadow-lg w-full h-auto object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <SectionTitle title={titles?.photo_spots ?? ''} subtitle="Abadikan momen liburan Anda di lokasi-lokasi menarik" />
            <Link
              to="/foto"
              className="text-primary hover:text-primary-dark font-medium flex items-center transition-colors duration-200"
            >
              Lihat Semua
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>

          {isLoadingPhotoSpots && (
            <div className="text-center py-8">
              <p className="text-gray-500">Memuat spot foto...</p>
            </div>
          )}

          {!isLoadingPhotoSpots && photoSpotsError && (
            <div className="text-center py-8">
              <p className="text-red-600">{photoSpotsError}</p>
            </div>
          )}

          {!isLoadingPhotoSpots && !photoSpotsError && photoSpots.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {photoSpots.map((spot) => (
                <Card
                  key={spot.slug}
                  id={spot.slug}
                  title={spot.title}
                  description={spot.description}
                  imageUrl={storageUrl(spot.image)}
                  link="/foto"
                  category={spot.category}
                />
              ))}
            </div>
          )}

          {!isLoadingPhotoSpots && !photoSpotsError && photoSpots.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                <Camera className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Belum ada spot foto yang terdaftar
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                Spot foto di Temajuk belum tersedia saat ini. Silakan kembali lagi nanti!
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <SectionTitle title={titles?.testimonials ?? ''} subtitle="Apa kata mereka tentang pengalaman di Temajuk" />
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
              <p className="text-gray-500">Memuat ulasan...</p>
            </div>
          )}

          {!isLoadingReviews && reviewsError && (
            <div className="text-center py-8">
              <p className="text-red-600">{reviewsError}</p>
            </div>
          )}

          {!isLoadingReviews && !reviewsError && featuredReviews.length > 0 ? (
            <Slider {...testimonialSettings} className="testimonial-slider" infinite={featuredReviews.length > 1}>
              {featuredReviews.map((review) => (
                <div key={`${review.id}-div`} className="px-2 my-6">
                  <Testimonial
                    name={review.name}
                    date={dateFormatter(review.created_at)}
                    rating={review.rating}
                    text={review.text}
                    imageUrl={avatar}
                  />
                </div>
              ))}
            </Slider>
          ) : null}

          {!isLoadingReviews && !reviewsError && featuredReviews.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                <Compass className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Tidak ada data ulasan
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                Ulasan wisata di Temajuk belum tersedia saat ini. Silakan kembali lagi nanti!
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 font-heading">
              {titles?.newsletter ?? 'Dapatkan Informasi Terbaru'}
            </h2>
            <p className="text-primary-dark mb-8 text-lg max-w-3xl mx-auto">
              Berlangganan newsletter kami untuk mendapatkan informasi terbaru tentang destinasi, event,
              dan promo menarik di Temajuk.
            </p>
            <form
              className="max-w-md mx-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="newsletter-email"
                  name="email"
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
