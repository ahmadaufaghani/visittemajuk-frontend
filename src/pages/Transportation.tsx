import React, {useEffect, useState} from 'react';
import Hero from '../components/Hero';
import SectionTitle from '../components/SectionTitle';
import { Clock, DollarSign, AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, Compass, PackageOpen } from 'lucide-react';
import { useTransportation } from '../hooks/useTransportations';
import { PuffLoader } from 'react-spinners';
import { AdditionalInformation } from '../types/transportation';
import { storageUrl } from '../utils/storageUrl';
import { useApiErrorHandler } from '../hooks/useApiErrorHandler';
import { getAdditionalInformation, getTransportationBanner } from '../services/transportationsApi';
import { ApiError } from '../lib/api';
import { Banner } from '../types/banner';

const Transportation: React.FC = () => {
  const [openRoute, setOpenRoute] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [additionalInformation, setAdditionalInformation] = useState<AdditionalInformation[]>();
  const [isLoadingAddInfo, setIsLoadingAddInfo] = useState<boolean>(false);
  const [errorAddInfo, setErrorLoadingAddInfo] = useState<string>('');
  const handleApiError = useApiErrorHandler();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isEmptyBanner, setIsEmptyBanner] = useState<boolean>(false);

  const toggleRoute = (id: string) => {
    if (openRoute === id) {
      setOpenRoute(null);
    } else {
      setOpenRoute(id);
    }
  };

  const {transportations, meta, isLoading, error} = useTransportation({params: {
    page: page,
    perPage: 5
  }});
  const pagination = meta.pagination;
  const canGoToPreviousPage = pagination.current_page > 1;
  const canGoToNextPage = pagination.current_page < pagination.last_page;

  useEffect(()=>{
    setIsLoadingAddInfo(true);

    getTransportationBanner()
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

    getAdditionalInformation()
    .then(res=>{
      setAdditionalInformation(res);
    })
    .catch((err) => {
      setErrorLoadingAddInfo("Data informasi tambahan belum dapat dimuat.");
      handleApiError(err);
    })
    .finally(()=>{
      setIsLoadingAddInfo(false);
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
            title="Rute Menuju Temajuk"
            subtitle="Berbagai pilihan rute perjalanan menuju Temajuk dari kota-kota terdekat"
          />

          {!isLoading && !error && transportations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                <Compass className="h-10 w-10 text-gray-400" />
              </div>
               <h3 className="text-lg font-semibold text-gray-700 mb-2"> 
                Tidak ada data transportasi
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                Saat ini data transportasi belum tersedia.
              </p>
            </div>
          )}

          <div className="space-y-6 mt-8">
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
                <p className="text-gray-500 text-lg">Memuat transportasi...</p>
              </div>
            )}

            {!isLoading && error && (
            <div className="text-center py-8">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
            )}

            {transportations.map((route) => (
              <div key={route.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-6 bg-white cursor-pointer"
                  onClick={() => toggleRoute(String(route.id))}
                >
                  <div className="flex items-center">
                    <img
                      src={storageUrl(route.image)}
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
                      openRoute === String(route.id) ? 'transform rotate-180' : ''
                    }`}
                  />
                </div>

                {openRoute === String(route.id) && (
                  <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex flex-wrap gap-4 mb-6">
                      <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm">
                        <Clock className="h-5 w-5 text-primary mr-2" />
                        <span className="text-gray-700">Waktu: {route.estimated_time}</span>
                      </div>
                      <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm">
                        <DollarSign className="h-5 w-5 text-primary mr-2" />
                        <span className="text-gray-700">Biaya: {route.estimated_cost}</span>
                      </div>
                      <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm">
                        <AlertTriangle className="h-5 w-5 text-primary mr-2" />
                        <span className="text-gray-700">Tingkat Kesulitan: {route.difficulty}</span>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Langkah-langkah Perjalanan:</h4>
                    <div className="space-y-4 mb-6">
                      {route.transportation_steps.map((step, index) => (
                        <div key={step.id} className="relative pl-8 border-l-2 border-primary">
                          <div className="absolute left-0 -translate-x-1/2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                            {index+1}
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
                      {route.transportation_tips.map((tip) => (
                        <li key={tip.id}>{tip.tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

              {!isLoading && !error && pagination.total > 0 && (
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  Menampilkan {pagination.from ?? 0}-{pagination.to ?? 0} dari {pagination.total} transportasi
                </p>
                {pagination.last_page > 1 && (
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                      disabled={!canGoToPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Sebelumnya
                    </button>
                    <span className="min-w-28 mx-4 text-center text-sm text-gray-700">
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
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Informasi Tambahan"
            subtitle="Hal-hal yang perlu diperhatikan saat melakukan perjalanan ke Temajuk"
            center={true}
          />

          {isLoadingAddInfo && (
            <div className="text-center py-8">
                <div className="flex justify-center">
                  <PuffLoader
                    color={"#4B5563"}
                    loading={true}
                    size={40}
                    className="mb-6"
                  />
                </div>
              <p className="text-gray-500 text-lg">Memuat informasi tambahan...</p>
            </div>
          )}

          {additionalInformation && additionalInformation.length === 0 &&  (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
              <PackageOpen className="h-10 w-10 text-gray-400" />
            </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2"> 
              Tidak ada data informasi tambahan
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Saat ini data informasi tambahan belum tersedia.
            </p>
          </div>
          )}

          {!isLoadingAddInfo && errorAddInfo && (
          <div className="text-center py-8">
            <p className="text-red-600 text-lg">{errorAddInfo}</p>
          </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
           {additionalInformation && additionalInformation.map(item => {
            return (
              <div key={item.id+"-div"} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{item.title}</h3>
                  {item.type === "list" 
                  ?
                    <ul className="list-disc pl-4 text-gray-600">
                      {item.description.split("\n").filter(item=>item !== "").map(
                        (val, index) => <li key={index+item.title.trim()}>{val}</li>
                      )}
                    </ul>
                  :
                    <p className="text-gray-600 whitespace-pre-line">
                      {item.description}
                    </p>
                  }
              </div>
            )
          })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Transportation;
