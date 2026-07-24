import React, { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Search, Edit, Trash2, Plus, ChevronDown, ChevronLeft, ChevronRight, MoveUpRight, ChevronUp } from 'lucide-react';
import { useAuth } from '../../../contexts/authContextValue';
import { PuffLoader } from "react-spinners";
import { useTransportation } from '../../../hooks/useTransportations';
import { deleteTransportation } from '../../../services/transportationsApi';
import { showConfirm } from '../../../utils/confirm';
import toast from 'react-hot-toast';
import { storageUrl } from '../../../utils/storageUrl';
import { useApiErrorHandler } from '../../../hooks/useApiErrorHandler';

const TransportationList: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const user = useAuth();
  const handleApiError = useApiErrorHandler();

  const {transportations, isLoading, error, reload, meta} = useTransportation({params:{
    search : searchTerm,
    difficulty: selectedDifficulty,
    page,
    perPage: 5
  }});

  const handleDelete = async (id: number) => {
    showConfirm({
      title: 'Hapus Transportasi',
      message: 'Apakah Anda yakin ingin menghapus rute kuliner ini?',
      onConfirm: async () => {
        try {
          await deleteTransportation(id, user.token as string);
          toast.success("Transportasi berhasil dihapus.");
          reload();
        } catch (err) {
          handleApiError(err);
        }
      },
    });
  };

  const pagination = meta.pagination;
  const canGoToPreviousPage = pagination.current_page > 1;
  const canGoToNextPage = pagination.current_page < pagination.last_page;

  const categories = [...new Set(meta.filters.difficulties.map(val => val))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4 md:flex md:justify-between md:items-center">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Transportasi</h1>
        <div className="flex gap-2">
          <Link
            to="/transportasi"
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex gap-2 items-center transition-colors duration-200 w-max"
          >
            <MoveUpRight className="h-4 w-4" />
            Kunjungi
          </Link>
          <Link
            to="/admin/transportations/add"
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex gap-2 items-center transition-colors duration-200 w-max"
          >
            <Plus className="h-4 w-4" />
            Tambah Transportasi
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari tempat rute transportasi..."
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
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
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

      {/* Culinary Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rute Transportasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tingkat Kesulitan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Biaya
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!isLoading ? transportations.map((item) => (
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
                        <div className="text-sm font-medium text-gray-900">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-500 hidden md:table-cell">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.difficulty === "Sedang" && "bg-yellow-100 text-yellow-800"} ${item.difficulty === "Mudah" && "bg-green-100 text-green-800"} ${item.difficulty === "Sulit" && "bg-red-100 text-red-800"}`}>
                      {item.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 hidden md:table-cell">
                      {item.estimated_time}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 hidden md:table-cell">
                    {item.estimated_cost}
                  </td>
                  <td className="text-center md:hidden">
                    <button
                    onClick={()=>setSelectedRow((prev) => prev === item.id ? 0 : item.id)}
                    className="bg-primary hover:bg-primary-dark text-white p-1 rounded-full transition-colors duration-200"
                    >
                      {
                       selectedRow === item.id 
                        ? 
                        <ChevronUp className="h-4 w-4" />
                        :
                        <ChevronDown className="h-4 w-4" />
                      }
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium hidden md:table-cell">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/admin/transportations/edit/${item.id}`}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className={`${selectedRow === item.id ? "" : "hidden"} md:hidden`}>
                  <td colSpan={3} className="p-0">
                    <table>
                      <tbody className="divide-y">
                        <tr className="divide-x">
                          <td className="align-top pr-4 font-semibold pl-2">Deskripsi</td>
                          <td className="p-1">{item.description}</td>
                        </tr>
                        <tr className="divide-x">
                          <td className="align-top pr-4 font-semibold pl-2">Biaya</td>
                          <td className="p-1">{item.estimated_cost}</td>
                        </tr>
                        <tr className="divide-x">
                          <td className="align-top pr-4 font-semibold pl-2">Waktu</td>
                          <td className="p-1">{item.estimated_time}</td>
                        </tr>
                        <tr className="divide-x">
                          <td className="align-top pr-4 font-semibold pl-2">Aksi</td>
                          <td className="p-1">
                            <div className="flex justify-start gap-1">
                              <Link
                                to={`/admin/transportations/edit/${item.id}`}
                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(item.id)}
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
              )):
             <></>
              }
            </tbody>
          </table>
        </div> 

        {!isLoading && !error && pagination.total > 0 && (
          <div className="border-t py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Menampilkan {pagination.from ?? 0}-{pagination.to ?? 0} dari {pagination.total} rute transportasi
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

        {isLoading? <div className=" flex flex-col items-center py-8">
            <PuffLoader
              color={"#4B5563"}
              loading={isLoading}
              size={40}
              className="mb-6"
            />
            <p className="text-gray-500">Memuat data rute transportasi...</p>
          </div>
          :
          <></>
        }

        {!isLoading && transportations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Tidak ada rute transportasi yang ditemukan.</p>
          </div>
        )}


      </div>
    </div>
  );
};

export default TransportationList;