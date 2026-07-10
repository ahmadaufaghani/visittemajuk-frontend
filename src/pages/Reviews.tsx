import React, { useState } from 'react';
import Hero from '../components/Hero';
import SectionTitle from '../components/SectionTitle';
import Testimonial from '../components/Testimonial';
import { useDestinations } from '../hooks/useDestinations';
import { ChevronLeft, ChevronRight, Compass, Search, Send, Star } from 'lucide-react';
import avatar from '../assets/img/user.png'
import { ClipLoader, PuffLoader } from 'react-spinners';
import { AddReview} from '../types/review';
import { createReviews } from '../services/reviewsApi';
import { useAuth } from '../contexts/authContextValue';
import { useReviews } from '../hooks/useReview';
import dateFormatter from '../utils/dateFormatter';

const Reviews: React.FC = () => {

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<number | undefined>(undefined);
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [formName, setFormName] = useState<string>("");
  const [formDestination, setFormDestination] = useState<number|undefined>(undefined);
  const [formRating, setFormRating] = useState<number|undefined>(undefined);
  const [formReviews, setFormReviews] = useState<string>("");
  const [isLoadingReview, setIsLoadingReview] = useState<boolean>(false);
  const user = useAuth();
  const [page, setPage] = useState(1);

  const { reload,reviews, meta, isLoading, error } = useReviews({
    params: {
      search: searchTerm,
      destination: selectedDestination,
      rating: selectedRating,
      page,
      perPage: 4,
    },
  });
  
  const pagination = meta.pagination;
  const canGoToPreviousPage = pagination.current_page > 1;
  const canGoToNextPage = pagination.current_page < pagination.last_page;
  
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleSearchDestination = (value: number) => {
    setSelectedDestination(value);
    setPage(1);
  };

  const handleSearchRating = (value: number) => {
    setSelectedRating(value);
    setPage(1);
  };

  const { destinations, isLoading: isLoadingDestinations } = useDestinations({
    params: { perPage: 50 },
    allPages: true,
  });

  const addReviewData = async () => {
    try {
      setIsLoadingReview(true);
      const addReviewData: AddReview = {
        name: formName,
        text: formReviews,
        rating: Number(formRating),
        destination_id : Number(formDestination)
      }
      await createReviews(addReviewData,user?.token as string);
      setFormName("");
      setFormDestination(0);
      setFormRating(0);
      setFormReviews("");
    } catch (err) {
      console.log(err);
    } finally {
      reload();
      setIsLoadingReview(false);
    }
  }

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDestination(0);
    setSelectedRating(0);
    reload();
  };

  const apiDestinationOptions = destinations.map((destination) => destination.title);
  const destinationOptions = [...new Set([...apiDestinationOptions])];


  return (
    <div>
      <Hero
        title="Ulasan Pengunjung"
        subtitle="Apa yang mereka katakan tentang pengalaman mereka di Temajuk"
        imageUrl="https://images.pexels.com/photos/6203792/pexels-photo-6203792.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Semua Ulasan"
            subtitle="Baca pengalaman pengunjung sebelumnya untuk merencanakan liburan Anda di Temajuk"
          />

          {/* Search and Filter */}
          <div className="mb-10 mt-6">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Cari ulasan..."
                className="w-full px-4 py-2 pl-10 rounded-md border-2 border-gray-200 focus:border-primary focus:outline-none"
                value={searchTerm}
                onChange={(e)=> handleSearchChange(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="w-full md:w-1/3">
                <select
                  className="w-full px-4 py-2 rounded-md border-2 border-gray-200 focus:border-primary focus:outline-none"
                  value={selectedDestination}
                  onChange={(e) => {
                    handleSearchDestination(Number(e.target.value));
                  }}
                >
                  <option value="">Semua Destinasi</option>
                 {destinationOptions.map((dest,index) => (
                    <option key={index} value={index+1}>
                      {dest}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-1/3 flex items-center">
                <span className="mr-4 text-gray-700">Rating:</span>
                <div className="flex space-x-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        selectedRating === rating ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                      onClick={() => {
                        handleSearchRating(selectedRating === rating ? 0 : rating)}
                      }
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="w-full md:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200 mt-2 md:mt-0"
                onClick={clearFilters}
              >
                Reset Filter
              </button>
            </div>
          </div>

          {isLoading && (
          <div className="text-center py-8">
              <div className="flex justify-center">
                <PuffLoader
                  color={"#4B5563"}
                  loading={isLoading}
                  size={40}
                  className="mb-6"
                />
              </div>
            <p className="text-gray-500 text-lg">Memuat review...</p>
          </div>
          )}

          {!isLoading && error && (
          <div className="text-center py-8">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
          )}

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {!isLoading && !error && destinations.length > 0 && (
            reviews?.map((review) => (
              <Testimonial
                key={`${review.destination.title}-${review.id}`}
                name={review.name}
                date={dateFormatter(review.created_at)}
                rating={review.rating}
                text={review.text}
                imageUrl={avatar}
              />
            ))
          )}
          </div>

          {!isLoading && !error && reviews.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                <Compass className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchTerm || selectedDestination || selectedRating ? 'Review tidak ditemukan' : "Tidak ada data review"}
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                {searchTerm || selectedDestination || selectedRating ? 'Coba ubah kata kunci pencarian atau filter kategori maupun rating untuk menemukan review lain.': "Tambahkan review melalui formulir di bawah ini"}
              </p>
            </div>
          )}

        
          {!isLoading && !error && pagination.total > 0 && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Menampilkan {pagination.from ?? 0}-{pagination.to ?? 0} dari {pagination.total} review
            </p>

            {pagination.last_page > 1 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  disabled={!canGoToPreviousPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </button>
                <span className="min-w-28 text-center text-sm text-gray-700">
                  Halaman {pagination.current_page} dari {pagination.last_page}
                </span>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                  disabled={!canGoToNextPage}
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          )}
      </div>
      </section>


      {/* Submit Review Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Bagikan Pengalaman Anda"
            subtitle="Ceritakan pengalaman Anda saat mengunjungi Temajuk"
            center={true}
          />

          <div className="max-w-2xl mx-auto mt-8">
            <form onSubmit={(e)=> {
              e.preventDefault();
              addReviewData();
            }} className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Nama Anda"
                  className="w-full px-4 py-2 rounded-md border-2 border-gray-200 focus:border-primary focus:outline-none"
                  value={formName!}
                  onChange={(e)=>{
                    e.preventDefault();
                    setFormName(e.target.value);
                  }}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                  Destinasi
                </label>
                <select
                  id="destination"
                  className="w-full px-4 py-2 rounded-md border-2 border-gray-200 focus:border-primary focus:outline-none"
                  value={formDestination}
                  disabled={isLoadingDestinations}
                  onChange={(e)=>setFormDestination(Number(e.target.value))}
                >
                  <option value="">
                    {isLoadingDestinations ? 'Memuat destinasi...' : 'Pilih Destinasi'}
                  </option>
                  {destinations.map((dest, index) => (
                    <option key={index+1} value={index+1}>
                      {dest.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormRating(rating)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500"
                    >
                      <Star className={`h-6 w-6 ${formRating && rating <= formRating ? 'text-accent-dark fill-current' : 'text-gray-400'}`} />
                    </button>
                  ))}
                </div>
                {formRating && formRating > 0 ? (
                  <p className="text-sm text-gray-600 mt-2">Rating: {formRating} bintang</p>
                ) : ""}
              </div>

              <div className="mb-4">
                <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">
                  Ulasan
                </label>
                <textarea
                  id="review"
                  rows={5}
                  placeholder="Ceritakan pengalaman Anda..."
                  className="w-full px-4 py-2 rounded-md border-2 border-gray-200 focus:border-primary focus:outline-none"
                  value={formReviews!}
                  onChange={(e)=> {
                    e.preventDefault();
                    setFormReviews(e.target.value);
                  }}
                ></textarea>
              </div>

              <button
                type="submit"
                className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-md shadow transition-colors duration-300"
              >
                {isLoadingReview ?
                <>
                  <ClipLoader
                    color={"#ffff"}
                    loading={isLoadingReview}
                    size={20}
                    className="mr-2"
                  />
                  <span>Mengunggah...</span>
                </>
                :
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Kirim Ulasan
                </>
                }
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reviews;
