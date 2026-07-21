import React, { useState } from 'react';
import Hero from '../components/Hero';
import SectionTitle from '../components/SectionTitle';
import Card from '../components/Card';
import { Search } from 'lucide-react';
import { PuffLoader } from 'react-spinners';
import { usePhotoSpots } from '../hooks/usePhotoSpots';

const PhotoSpots: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { photoSpots, meta, isLoading, error } = usePhotoSpots({
    params: {
      search: searchTerm,
      category: selectedCategory,
      perPage: 9,
    },
  });

  const categories = [...new Set(meta.filters.categories.map((category) => category))];

  return (
    <div>
      <Hero
        title="Spot Foto Instagramable"
        subtitle="Abadikan momen liburan Anda di lokasi-lokasi menarik di Temajuk"
        imageUrl="https://images.pexels.com/photos/635279/pexels-photo-635279.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
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
                type="text"
                placeholder="Cari spot foto..."
                className="w-full px-4 py-2 pl-10 rounded-md border-2 border-gray-200 focus:border-primary focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            <div className="w-full md:w-auto">
              <select
                className="w-full md:w-auto px-4 py-2 rounded-md border-2 border-gray-200 focus:border-primary focus:outline-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {photoSpots.map((spot) => (
                <Card
                  key={spot.id}
                  id={spot.slug}
                  title={spot.title}
                  description={spot.description}
                  imageUrl={`http://127.0.0.1:8000/storage/${spot.image}`}
                  link="/foto"
                  category={spot.category}
                />
              ))}
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <img
                src="https://www.kelasgarasi.com/wp-content/uploads/2023/12/golden-hour-kelas-garasi.jpg"
                alt="Golden Hour"
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Manfaatkan Golden Hour</h3>
              <p className="text-gray-600">
                Ambil foto saat golden hour (1 jam setelah matahari terbit atau 1 jam sebelum matahari terbenam)
                untuk mendapatkan pencahayaan alami terbaik dengan nuansa keemasan yang hangat.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <img
                src="https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Wide Angle"
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Bawa Lensa Wide-Angle</h3>
              <p className="text-gray-600">
                Untuk mengabadikan keindahan lanskap pantai, hutan mangrove, dan pemandangan dari puncak bukit,
                lensa wide-angle akan membantu menangkap keluasan pemandangan.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <img
                src="https://images.pexels.com/photos/1092671/pexels-photo-1092671.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Reflections"
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Manfaatkan Refleksi</h3>
              <p className="text-gray-600">
                Cari permukaan air yang tenang seperti di Danau Laut Madu untuk menciptakan foto dengan
                refleksi yang dramatis dan memukau.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <img
                src="https://images.pexels.com/photos/691909/pexels-photo-691909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Silhouettes"
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Ciptakan Siluet</h3>
              <p className="text-gray-600">
                Saat matahari terbenam di Sunset Point, posisikan subjek Anda di depan matahari untuk
                menciptakan foto siluet yang dramatis dan penuh cerita.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <img
                src="https://images.pexels.com/photos/1046896/pexels-photo-1046896.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Local Elements"
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Sertakan Elemen Lokal</h3>
              <p className="text-gray-600">
                Tambahkan elemen lokal seperti perahu nelayan, pohon kelapa, atau penduduk lokal dalam
                foto Anda untuk menambahkan cerita dan keunikan budaya setempat.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <img
                src="https://images.pexels.com/photos/1122408/pexels-photo-1122408.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Drone"
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Gunakan Drone (Jika Diizinkan)</h3>
              <p className="text-gray-600">
                Untuk mendapatkan perspektif yang berbeda, gunakan drone untuk mengambil foto aerial
                (pastikan untuk memeriksa peraturan setempat tentang penggunaan drone).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PhotoSpots;