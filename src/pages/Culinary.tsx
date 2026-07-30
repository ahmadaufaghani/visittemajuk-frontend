import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Hero from '../components/Hero';
import SectionTitle from '../components/SectionTitle';
import Card from '../components/Card';
import { ChevronLeft, ChevronRight, Compass, PackageOpen, Search } from 'lucide-react';
import { PuffLoader } from 'react-spinners';
import { useCulinaries } from '../hooks/useCulinaries';
import { useDebounce } from '../hooks/useDebounce';
import { AdditionalCulinary } from '../types/culinary';
import { storageUrl } from '../utils/storageUrl';
import { useApiErrorHandler } from '../hooks/useApiErrorHandler';
import { getAdditionalCulinaries, getCulinaryBanner } from '../services/culinariesApi';
import { ApiError } from '../lib/api';
import { Banner } from '../types/banner';

const Culinary: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [additionalCulinaries, setAdditionalCulinaries] = useState<AdditionalCulinary[]>();
  const [isLoadingAddCulinary, setIsLoadingAddCulinary] = useState<boolean>(false);
  const [errorAddCulinary, setErrorAddCulinary] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const handleApiError = useApiErrorHandler();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isEmptyBanner, setIsEmptyBanner] = useState<boolean>(false);

  const {culinaries, meta, isLoading : isLoadingCulinary, error} = useCulinaries({ 
    params: {
      search: debouncedSearch,
      category: selectedCategory,
      page,
      perPage: 9,
    }});
  
  const pagination = meta.pagination;
  const canGoToPreviousPage = meta.pagination.current_page > 1;
  const canGoToNextPage = meta.pagination.current_page < meta.pagination.last_page;

  const categories = [...new Set(meta.filters.categories.map(item =>item))];

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
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(1);
    updateSearchParams({ category: value, page: '' });
  }

  useEffect(()=> {
    setIsLoadingAddCulinary(true);
    getCulinaryBanner()
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
        handleApiError(err);
      }
    });

    getAdditionalCulinaries()
    .then(res => {
      setAdditionalCulinaries(res);
    })
    .catch(err => {
      setErrorAddCulinary("Data kuliner khas belum dapat dimuat.")
      handleApiError(err);
    })
    .finally(()=> {
      setIsLoadingAddCulinary(false);
    });
  },[]);

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
            title="Tempat Makan dan Kuliner"
            subtitle="Temukan tempat makan dan hidangan khas yang wajib dicoba di Temajuk"
          />

          {/* Search and Filter */}
          <div className="mb-10 mt-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/3">
              <input
                id="search-culinary"
                name="search"
                type="text"
                placeholder="Cari tempat makan..."
                className="w-full px-4 py-2 pl-10 rounded-md border-2 border-gray-200 focus:border-primary focus:outline-none"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            <div className="w-full md:w-auto">
              <select
                id="category-culinary"
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

          
          {isLoadingCulinary && (
          <div className="text-center py-8">
            <div className="flex justify-center">
              <PuffLoader
                color={"#4B5563"}
                loading={isLoadingCulinary}
                size={40}
                className="mb-6"
              />
            </div>
            <p className="text-gray-500 text-lg">Memuat kuliner...</p>
          </div>
          )}

          {!isLoadingCulinary && error && (
          <div className="text-center py-8">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
          )}


          {/* Culinary Grid */}
          {!isLoadingCulinary && !error && culinaries && culinaries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {culinaries.map((item) => (
                <Card
                  key={item.id}
                  id={String(item.slug)}
                  title={item.title}
                  description={item.description}
                  imageUrl={storageUrl(item.image)}
                  link="/kuliner"
                  category={item.category}
                  price={item.price}
                />
              ))}
            </div>
          ) : <></>}

          {!isLoadingCulinary && !error && culinaries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                <Compass className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchTerm || selectedCategory? 'Kuliner tidak ditemukan' : "Tidak ada data kuliner"}
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                {searchTerm || selectedCategory? 'Coba ubah kata kunci pencarian atau filter kategori untuk menemukan kuliner lain.': "Tambahkan data kuliner melalui halaman admin"}
              </p>
            </div>
          )}

          {!isLoadingCulinary && !error && pagination.total > 0 && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Menampilkan {pagination.from ?? 0}-{pagination.to ?? 0} dari {pagination.total} kuliner
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

      {/* Local Culinary Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Hidangan Khas Temajuk"
            subtitle="Makanan dan minuman tradisional yang wajib dicoba selama di Temajuk"
            center={true}
          />

          {isLoadingAddCulinary && (
            <div className="text-center py-8">
                <div className="flex justify-center">
                  <PuffLoader
                    color={"#4B5563"}
                    loading={true}
                    size={40}
                    className="mb-6"
                  />
                </div>
              <p className="text-gray-500 text-lg">Memuat kuliner khas...</p>
            </div>
          )}

          {additionalCulinaries && additionalCulinaries.length === 0 &&  (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
              <PackageOpen className="h-10 w-10 text-gray-400" />
            </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2"> 
              Tidak ada data kuliner khas
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Saat ini data kuliner khas belum tersedia.
            </p>
          </div>
          )}

          {!isLoadingAddCulinary && errorAddCulinary && (
          <div className="text-center py-8">
            <p className="text-red-600 text-lg">{errorAddCulinary}</p>
          </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {additionalCulinaries && additionalCulinaries.map(item => {
              return (
                <div key={item.id+"div"} className="bg-white p-6 rounded-lg shadow-md flex">
                  <img
                    src={storageUrl(item.image)}
                    alt="Ikan Bakar Temajuk"
                    className="w-32 h-32 object-cover rounded-md mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Culinary;