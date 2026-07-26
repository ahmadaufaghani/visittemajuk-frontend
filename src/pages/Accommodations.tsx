import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Hero from '../components/Hero';
import SectionTitle from '../components/SectionTitle';
import Card from '../components/Card';
import { useAccommodations } from '../hooks/useAccommodations';
import { useDebounce } from '../hooks/useDebounce';
import { storageUrl } from '../utils/storageUrl';
import { ChevronLeft, ChevronRight, Search, Hotel } from 'lucide-react';
import { PuffLoader } from 'react-spinners';
import { Banner } from '../types/banner';
import { getAccomodationBanner } from '../services/accommodationsApi';
import { ApiError } from '../lib/api';

const Accommodations: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isEmptyBanner, setIsEmptyBanner] = useState<boolean>(false);
  const { accommodations, meta, isLoading, error } = useAccommodations({
    params: {
      search: debouncedSearch,
      category: selectedCategory,
      page,
      perPage: 9,
    },
  });

  const categories = meta.filters.categories;
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

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  useEffect(()=> {
      getAccomodationBanner()
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
            title="Semua Akomodasi"
            subtitle="Pilihan tempat menginap di Temajuk untuk berbagai kebutuhan dan budget"
          />

          {/* Search and Filter */}
          <div className="mb-10 mt-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/3">
              <input
                id="search-accommodations"
                name="search"
                type="text"
                placeholder="Cari akomodasi..."
                className="w-full px-4 py-2 pl-10 rounded-md border-2 border-gray-200 focus:border-primary focus:outline-none"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            <div className="w-full md:w-auto">
              <select
                id="category-accommodations"
                name="category"
                className="w-full md:w-auto px-4 py-2 rounded-md border-2 border-gray-200 focus:border-primary focus:outline-none"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {capitalize(category)}
                  </option>
                ))}
              </select>
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
              <p className="text-gray-500 text-lg">Memuat akomodasi...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="text-center py-8">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          )}

          {!isLoading && !error && accommodations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {accommodations.map((accommodation) => (
                <Card
                  key={accommodation.id}
                  id={accommodation.id}
                  title={accommodation.title}
                  description={accommodation.description}
                  imageUrl={storageUrl(accommodation.image)}
                  link="/akomodasi"
                  category={capitalize(accommodation.category)}
                  price={`Rp ${Number(accommodation.minPrice).toLocaleString('id-ID')} - Rp ${Number(accommodation.maxPrice).toLocaleString('id-ID')}`}
                />
              ))}
            </div>
          ) : null}

          {!isLoading && !error && accommodations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                <Hotel className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchTerm || selectedCategory
                  ? 'Tidak ada akomodasi yang sesuai'
                  : 'Belum ada akomodasi yang terdaftar'}
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                {searchTerm || selectedCategory
                  ? 'Coba ubah kata kunci pencarian atau filter kategori untuk menemukan akomodasi lain.'
                  : 'Akomodasi di Temajuk belum tersedia saat ini. Silakan kembali lagi nanti!'}
              </p>
            </div>
          )}

          {!isLoading && !error && pagination.total > 0 && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Menampilkan {pagination.from ?? 0}-{pagination.to ?? 0} dari {pagination.total} akomodasi
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
        </div>
      </section>
    </div>
  );
};

export default Accommodations;