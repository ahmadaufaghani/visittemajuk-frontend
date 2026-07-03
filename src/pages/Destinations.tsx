import React, { useState } from 'react';
import Hero from '../components/Hero';
import SectionTitle from '../components/SectionTitle';
import Card from '../components/Card';
import { useDestinations } from '../hooks/useDestinations';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const Destinations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const { destinations, meta, isLoading, error } = useDestinations({
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

  return (
    <div>
      <Hero
        title="Destinasi Wisata Temajuk"
        subtitle="Jelajahi keindahan tersembunyi di ujung barat Indonesia"
        imageUrl="https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Semua Destinasi"
            subtitle="Temukan berbagai destinasi wisata menarik di Temajuk"
          />

          {/* Search and Filter */}
          <div className="mb-10 mt-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Cari destinasi..."
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
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Memuat destinasi...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="text-center py-8">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          )}

          {!isLoading && !error && destinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map((destination) => (
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
          ) : null}

          {!isLoading && !error && destinations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Tidak ada destinasi yang sesuai dengan pencarian Anda.</p>
            </div>
          )}

          {!isLoading && !error && pagination.total > 0 && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Menampilkan {pagination.from ?? 0}-{pagination.to ?? 0} dari {pagination.total} destinasi
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

export default Destinations;
