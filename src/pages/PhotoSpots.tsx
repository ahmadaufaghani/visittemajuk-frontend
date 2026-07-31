import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Hero from '../components/Hero';
import SectionTitle from '../components/SectionTitle';
import Card from '../components/Card';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { PuffLoader } from 'react-spinners';
import { usePhotoSpots } from '../hooks/usePhotoSpots';
import { usePhotographyTips } from '../hooks/usePhotographyTips';
import { useDebounce } from '../hooks/useDebounce';
import { storageUrl } from '../utils/storageUrl';
import { Banner } from '../types/banner';
import { getPhotoSpotsBanner } from '../services/photoSpotsApi';
import { ApiError } from '../lib/api';

const PhotoSpots: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isEmptyBanner, setIsEmptyBanner] = useState<boolean>(false);
  const { photoSpots, meta, isLoading, error } = usePhotoSpots({
    params: {
      search: debouncedSearch,
      category: selectedCategory,
      page,
      perPage: 9,
    },
  });
  const { tips: photographyTips, isLoading: isLoadingTips, error: tipsError } = usePhotographyTips();

  const categories = [...new Set(meta.filters.categories.map((category) => category))];
  const pagination = meta.pagination;
  const canGoToPreviousPage = pagination.current_page > 1;
  const canGoToNextPage = pagination.current_page < pagination.last_page;

  const updateSearchParams = (updates: Record<string, string | number>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, String(value));
        } else {
          newParams.delete(key);
        }
      });
      return newParams;
    }, { replace: true });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
    updateSearchParams({ search: value, page: '' });
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(1);
    updateSearchParams({ category: value, page: '' });
  };

  useEffect(()=> {
      getPhotoSpotsBanner()
      .then(res => {
        if(res.length === 0) {
          setIsEmptyBanner(true);
        }
        const [banner] = res;
        setBanner(banner);
      })
      .catch(err => {
        setIsEmptyBanner(true);
        if(err instanceof ApiError) {
          console.error(err.errors);
        }
      });
    },[])

  return (
    <div>
      <Hero
        title={banner?.title ? banner.title : !isEmptyBanner ? "Memuat judul..." : "Judul tidak tersedia"}
        subtitle={banner?.description ? banner.description : !isEmptyBanner ? "Memuat deskripsi..." : "Deskripsi tidak tersedia"}
        imageUrl={storageUrl(banner?.image)}
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Semua Spot Foto"
            subtitle="Temukan lokasi-lokasi terbaik untuk mengabadikan momen liburan Anda"
          />

          {/* Search and Filter */}
          <div className="mb-10 mt-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/3">
              <input
                id="search-photo-spots"
                name="search"
                type="text"
                placeholder="Cari spot foto..."
                className="w-full px-4 py-2 pl-10 rounded-md border-2 border-gray-200 focus:border-primary focus:outline-none"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            <div className="w-full md:w-auto">
              <select
                id="category-photo-spots"
                name="category"
                className="w-full md:w-auto px-4 py-2 rounded-md border-2 border-gray-200 focus:border-primary focus:outline-none"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <div className="flex justify-center">
                <PuffLoader color={'#4B5563'} loading={isLoading} size={40} className="mb-6" />
              </div>
              <p className="text-gray-500 text-lg">Memuat spot foto...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="text-center py-8">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          )}

          {/* Photo Spots Grid */}
          {!isLoading && !error && photoSpots.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {photoSpots.map((spot) => (
                  <Card
                    key={spot.id}
                    id={spot.slug}
                    title={spot.title}
                    description={spot.description}
                    imageUrl={storageUrl(spot.image)}
                    link="/foto"
                    category={spot.category}
                  />
                ))}
              </div>

              {pagination.total > 0 && (
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-600">
                    Menampilkan {pagination.from ?? 0}-{pagination.to ?? 0} dari {pagination.total} spot foto
                  </p>

                  {pagination.last_page > 1 && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => {
                          const newPage = Math.max(1, page - 1);
                          setPage(newPage);
                          updateSearchParams({ page: newPage });
                        }}
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
                        onClick={() => {
                          const newPage = page + 1;
                          setPage(newPage);
                          updateSearchParams({ page: newPage });
                        }}
                        disabled={!canGoToNextPage}
                      >
                        Berikutnya
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Tidak ada spot foto yang sesuai dengan pencarian Anda.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Tips Fotografi di Temajuk"
            subtitle="Panduan untuk mendapatkan foto terbaik selama liburan Anda"
            center={true}
          />

          {isLoadingTips ? (
            <div className="text-center py-8">
              <PuffLoader color="#4B5563" loading={isLoadingTips} size={40} className="mx-auto" />
            </div>
          ) : tipsError ? (
            <p className="text-center text-red-600 mt-8">{tipsError}</p>
          ) : photographyTips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {photographyTips.map((tip) => (
                <div key={tip.id} className="bg-white p-6 rounded-lg shadow-md">
                  {tip.image ? (
                    <img
                      src={storageUrl(tip.image)}
                      alt={tip.title}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  ) : null}
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{tip.title}</h3>
                  <p className="text-gray-600">{tip.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-8">Tips fotografi belum tersedia.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default PhotoSpots;