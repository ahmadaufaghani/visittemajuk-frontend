import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PuffLoader } from 'react-spinners';
import { useAuth } from '../../../contexts/authContextValue';
import { ApiError } from '../../../lib/api';
import { usePhotoSpots } from '../../../hooks/usePhotoSpots';
import { deletePhotoSpot } from '../../../services/photoSpotsApi';
import { storageUrl } from '../../../utils/storageUrl';

const PhotoSpotList: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const { token } = useAuth();

  const { photoSpots, isLoading, error, reload, meta } = usePhotoSpots({
    admin: true,
    token,
    enabled: !!token,
    params: {
      search: searchTerm,
      category: selectedCategory,
      page,
      perPage: 5,
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus spot foto ini?')) {
      await deletePhotoSpot(id, token as string)
        .then(() => {
          toast.success('Spot foto berhasil dihapus.');
        })
        .catch((err) => {
          if (err instanceof ApiError) {
            toast.error(`Spot foto gagal dihapus. Error : ${err.message}`);
            console.error(err.errors);
          }
        });
      reload();
    }
  };

  const pagination = meta.pagination;
  const canGoToPreviousPage = pagination.current_page > 1;
  const canGoToNextPage = pagination.current_page < pagination.last_page;

  const categories = [...new Set(meta.filters.categories.map((value) => value))];

  return (
    <div className="space-y-6">
      <div className="space-y-4 sm:flex sm:justify-between sm:items-center">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Spot Foto</h1>
        <Link
          to="/admin/photo-spots/add"
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex gap-2 items-center transition-colors duration-200 w-max"
        >
          <Plus className="h-4 w-4" />
          Tambah Spot Foto
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari spot foto..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
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
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spot Foto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Waktu Terbaik
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!isLoading ? (
                photoSpots.map((item) => (
                  <Fragment key={`${item.id}-fragment`}>
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            className="h-12 w-12 rounded-md object-cover"
                            src={storageUrl(item.image)}
                            alt={item.title}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.title}</div>
                            <div className="text-sm text-gray-500 hidden md:table-cell">
                              {item.description.substring(0, 60)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 hidden md:table-cell">
                        {item.bestHour}
                      </td>
                      <td className="text-center md:hidden">
                        <button
                          onClick={() => setSelectedRow((prev) => (prev === item.id ? 0 : item.id))}
                          className="bg-primary hover:bg-primary-dark text-white p-1 rounded-full transition-colors duration-200"
                        >
                          {selectedRow === item.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium hidden md:table-cell">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/foto/${item.slug}`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Lihat"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/admin/photo-spots/edit/${item.slug}`}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.slug)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className={`${selectedRow === item.id ? '' : 'hidden'} md:hidden`}>
                      <td colSpan={3} className="p-0">
                        <table>
                          <tbody className="divide-y">
                            <tr className="divide-x">
                              <td className="align-top pr-4 font-semibold pl-2">Deskripsi</td>
                              <td className="p-1">{item.description}</td>
                            </tr>
                            <tr className="divide-x">
                              <td className="align-top pr-4 font-semibold pl-2">Waktu Terbaik</td>
                              <td className="p-1">{item.bestHour}</td>
                            </tr>
                            <tr className="divide-x">
                              <td className="align-top pr-4 font-semibold pl-2">Aksi</td>
                              <td className="p-1">
                                <div className="flex justify-start gap-1">
                                  <Link
                                    to={`/foto/${item.slug}`}
                                    className="text-blue-600 hover:text-blue-900 p-1"
                                    title="Lihat"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                  <Link
                                    to={`/admin/photo-spots/edit/${item.slug}`}
                                    className="text-indigo-600 hover:text-indigo-900 p-1"
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(item.slug)}
                                    className="text-red-600 hover:text-red-900 p-1"
                                    title="Hapus"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </Fragment>
                ))
              ) : (
                <></>
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !error && pagination.total > 0 && (
          <div className="border-t py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Menampilkan {pagination.from ?? 0}-{pagination.to ?? 0} dari {pagination.total} spot foto
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
                  <span className="hidden sm:block">Sebelumnya</span>
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
                  <span className="hidden sm:block">Berikutnya</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className=" flex flex-col items-center py-8">
            <PuffLoader color={'#4B5563'} loading={isLoading} size={40} className="mb-6" />
            <p className="text-gray-500">Memuat data spot foto...</p>
          </div>
        ) : null}

        {!isLoading && photoSpots.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Tidak ada spot foto yang ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoSpotList;
