import React from 'react';
import Hero from '../components/Hero';
import SectionTitle from '../components/SectionTitle';
import { transportationRoutes } from '../data/transportation';
import { Clock, DollarSign, AlertTriangle, ChevronDown } from 'lucide-react';

const Transportation: React.FC = () => {
  const [openRoute, setOpenRoute] = React.useState<string | null>(null);

  const toggleRoute = (id: string) => {
    if (openRoute === id) {
      setOpenRoute(null);
    } else {
      setOpenRoute(id);
    }
  };

  return (
    <div>
      <Hero
        title="Panduan Transportasi"
        subtitle="Informasi lengkap cara mencapai dan menjelajahi Temajuk"
        imageUrl="https://images.pexels.com/photos/1178448/pexels-photo-1178448.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Rute Menuju Temajuk"
            subtitle="Berbagai pilihan rute perjalanan menuju Temajuk dari kota-kota terdekat"
          />

          <div className="space-y-6 mt-8">
            {transportationRoutes.map((route) => (
              <div key={route.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-6 bg-white cursor-pointer"
                  onClick={() => toggleRoute(route.id)}
                >
                  <div className="flex items-center">
                    <img
                      src={route.imageUrl}
                      alt={route.title}
                      className="w-16 h-16 object-cover rounded-md mr-4"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{route.title}</h3>
                      <p className="text-gray-600">{route.description}</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${
                      openRoute === route.id ? 'transform rotate-180' : ''
                    }`}
                  />
                </div>

                {openRoute === route.id && (
                  <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex flex-wrap gap-4 mb-6">
                      <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm">
                        <Clock className="h-5 w-5 text-primary mr-2" />
                        <span className="text-gray-700">Waktu: {route.estimatedTime}</span>
                      </div>
                      <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm">
                        <DollarSign className="h-5 w-5 text-primary mr-2" />
                        <span className="text-gray-700">Biaya: {route.estimatedCost}</span>
                      </div>
                      <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm">
                        <AlertTriangle className="h-5 w-5 text-primary mr-2" />
                        <span className="text-gray-700">Tingkat Kesulitan: {route.difficulty}</span>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Langkah-langkah Perjalanan:</h4>
                    <div className="space-y-4 mb-6">
                      {route.steps.map((step) => (
                        <div key={step.step} className="relative pl-8 border-l-2 border-primary">
                          <div className="absolute left-0 -translate-x-1/2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                            {step.step}
                          </div>
                          <div className="bg-white p-4 rounded-md shadow-sm">
                            <p className="text-gray-700 mb-2">{step.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span>Durasi: {step.duration}</span>
                              <span>Biaya: {step.cost}</span>
                              <span>Kendaraan: {step.vehicle}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Tips Perjalanan:</h4>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      {route.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Informasi Tambahan"
            subtitle="Hal-hal yang perlu diperhatikan saat melakukan perjalanan ke Temajuk"
            center={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Kondisi Jalan</h3>
              <p className="text-gray-600 mb-4">
                Jalan menuju Temajuk cukup menantang, terutama pada musim hujan. Beberapa ruas jalan masih berupa
                jalan tanah dan bebatuan. Disarankan menggunakan kendaraan dengan ground clearance tinggi
                seperti SUV atau mobil off-road.
              </p>
              <p className="text-gray-600">
                Pada musim kemarau, kondisi jalan relatif lebih baik namun tetap perlu berhati-hati
                karena beberapa bagian dapat berdebu dan licin.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Waktu Terbaik Berkunjung</h3>
              <p className="text-gray-600 mb-4">
                Waktu terbaik untuk mengunjungi Temajuk adalah pada musim kemarau (Mei-September).
                Pada periode ini, cuaca cerah dan jalanan lebih mudah dilalui.
              </p>
              <p className="text-gray-600">
                Hindari berkunjung saat musim hujan (Oktober-April) kecuali Anda sudah sangat berpengalaman
                dan siap menghadapi tantangan perjalanan yang lebih berat.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Persiapan Penting</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Siapkan dokumen identitas (KTP/SIM/Paspor) yang masih berlaku</li>
                <li>Bawa obat-obatan pribadi dan P3K</li>
                <li>Siapkan pakaian yang sesuai untuk berbagai kondisi cuaca</li>
                <li>Download peta offline karena sinyal di beberapa area terbatas</li>
                <li>Bawa powerbank dan perlengkapan charger</li>
                <li>Siapkan uang tunai secukupnya (ATM terbatas)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Transportation;
