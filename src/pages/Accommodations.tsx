import React, { useState } from 'react';
import Hero from '../components/Hero';
import SectionTitle from '../components/SectionTitle';
import Card from '../components/Card';
import { useAccommodations } from '../hooks/useAccommodations';
import { ChevronLeft, ChevronRight, Search, Hotel } from 'lucide-react';

const Accommodations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const { accommodations, meta, isLoading, error } = useAccommodations({
    params: {
      search: searchTerm,
      category: selectedCategory,
      page,
      perPage: 9,
    },
  });

  const categories = meta.filters.categories;
  const pagination = meta.pagination;
  const canGoToPreviousPage = pagination.current_page > 1;
  const canGoToNextPage = pagination.current_page < pagination.last_page;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(1);
  };

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div>
      <Hero
        title="Akomodasi di Temajuk"
        subtitle="Temukan penginapan nyaman untuk liburan Anda"
        imageUrl="https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
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
                  imageUrl={accommodation.imageUrl}
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
    </div>
  );
};

export default Accommodations;