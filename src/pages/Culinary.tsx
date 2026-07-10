import React, { useState } from 'react';
import Hero from '../components/Hero';
import SectionTitle from '../components/SectionTitle';
import Card from '../components/Card';
import { culinary } from '../data/culinary';
import { Search } from 'lucide-react';

const Culinary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [...new Set(culinary.map((item) => item.category))];

  const filteredCulinary = culinary.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <Hero
        title="Kuliner Khas Temajuk"
        subtitle="Jelajahi cita rasa autentik dan hidangan lezat dari Temajuk"
        imageUrl="https://images.pexels.com/photos/566345/pexels-photo-566345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
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
                type="text"
                placeholder="Cari tempat makan..."
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

          {/* Culinary Grid */}
          {filteredCulinary.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCulinary.map((item) => (
                <Card
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  imageUrl={item.imageUrl}
                  link="/kuliner"
                  category={item.category}
                  price={item.price}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Tidak ada tempat makan yang sesuai dengan pencarian Anda.</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-md flex">
              <img
                src="https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Ikan Bakar Temajuk"
                className="w-32 h-32 object-cover rounded-md mr-4"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ikan Bakar Temajuk</h3>
                <p className="text-gray-600">
                  Ikan segar hasil tangkapan nelayan lokal yang dibakar dengan bumbu khas Temajuk
                  yang terdiri dari rempah-rempah lokal dan sambal terasi.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md flex">
              <img
                src="https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Bubur Pedas Kalimantan"
                className="w-32 h-32 object-cover rounded-md mr-4"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Bubur Pedas Kalimantan</h3>
                <p className="text-gray-600">
                  Bubur beras yang dimasak dengan kaldu ikan dan dilengkapi dengan berbagai sayuran
                  dan bumbu pedas khas Kalimantan Barat.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md flex">
              <img
                src="https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Sotong Pangkong"
                className="w-32 h-32 object-cover rounded-md mr-4"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Sotong Pangkong</h3>
                <p className="text-gray-600">
                  Cumi-cumi segar yang dipukul hingga pipih lalu digoreng kering dan disajikan dengan
                  sambal kacang yang pedas dan nikmat.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md flex">
              <img
                src="https://images.pexels.com/photos/1437590/pexels-photo-1437590.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Sayur Pakis Santan"
                className="w-32 h-32 object-cover rounded-md mr-4"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Sayur Pakis Santan</h3>
                <p className="text-gray-600">
                  Sayur pakis yang dimasak dengan santan kelapa dan rempah-rempah lokal, menciptakan
                  hidangan yang lezat dan bergizi.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md flex">
              <img
                src="https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Kopi Robusta Kalimantan"
                className="w-32 h-32 object-cover rounded-md mr-4"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Kopi Robusta Kalimantan</h3>
                <p className="text-gray-600">
                  Kopi robusta lokal yang disangrai dan digiling secara tradisional, menghasilkan
                  minuman kopi yang khas dengan aroma yang kuat.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md flex">
              <img
                src="https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Kue Lapis Sambas"
                className="w-32 h-32 object-cover rounded-md mr-4"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Kue Lapis Sambas</h3>
                <p className="text-gray-600">
                  Kue lapis tradisional khas Sambas yang terbuat dari tepung beras, santan, dan gula
                  dengan lapisan berwarna-warni yang menarik.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Culinary;