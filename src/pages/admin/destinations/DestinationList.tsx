import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContextValue';
import { useDestinations } from '../../../hooks/useDestinations';
import { createDestinationBanner, deleteDestination, getDestinationBanner, updateDestinationBanner } from '../../../services/destinationsApi';
import { useApiErrorHandler } from '../../../hooks/useApiErrorHandler';
import { storageUrl } from '../../../utils/storageUrl';
import { showConfirm } from '../../../utils/confirm';
import { Search, Edit, Trash2, Plus, Eye, ChevronLeft, ChevronRight, MapPin, GalleryThumbnails, MoveUpRight, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOverlay } from '../../../contexts/OverlayContext';
import { ClipLoader } from 'react-spinners';

const DestinationList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [id, setId] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [menu, setMenu] = useState<string>('');
  const [image, setImage] = useState<File | string>('');
  const [preview, setPreview] = useState<string>('');
  const [page, setPage] = useState(1);
  const [isLoadingBanner, setIsLoadingBanner] = useState<boolean>(false);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { token } = useAuth();
  const handleApiError = useApiErrorHandler();
  const {
    destinations,
    meta,
    isLoading,
    error,
    reload,
  } = useDestinations({
    admin: true,
    token,
    enabled: Boolean(token),
    params: {
      search: searchTerm,
      category: selectedCategory,
      page,
      perPage: 10,
    },
  });
  const overlay = useOverlay();

  const categories = meta.filters.categories;
  const pagination = meta.pagination;
  const canGoToPreviousPage = pagination.current_page > 1;
  const canGoToNextPage = pagination.current_page < pagination.last_page;
  const fileRef = useRef<HTMLInputElement|null>(null);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(1);
  };

    const handleReset = () => {
      if(id) {
        setId(0);
      }
      setTitle('');
      setDescription('');
      setImage('');
      setPreview('');
      if (fileRef.current) {
        fileRef.current.value = "";
        fileRef.current.type = "text";
        fileRef.current.type = "file";
      }
    }
  
    const getBannerData = async () => {
      try {
        setIsLoadingBanner(true);
        const [res] = await getDestinationBanner()
        if(res) {
          setId(res.id);
          setTitle(res.title);
          setDescription(res.description);
          setMenu(res.menu);
          setImage(res.image);        
        }

        setIsLoadingBanner(false);
      } catch (err) {
          setIsLoadingBanner(false);
          handleApiError(err);
      }
    }
  
    const createBannerData = async () => {
      try {
        setIsLoadingForm(true);
        const formBody = new FormData();
        formBody.append("title", title);
        formBody.append("description", description);
        formBody.append("menu","destinasi");
        formBody.append("image", image);
        await createDestinationBanner(formBody, token as string);
        handleReset();
        setIsLoadingForm(false);
        toast.success("Banner berhasil ditambahkan.");
      } catch (err) {
          setIsLoadingForm(false);
          handleApiError(err);
      }
    }
  
    const updateBannerData = async (id: number) => {
      try {
        setIsLoadingForm(true);
        const formBody = new FormData();
        formBody.append("title", title);
        formBody.append("description", description);
        formBody.append("menu",menu);
        formBody.append("image", image);
        await updateDestinationBanner(id, formBody, token as string);
        handleReset();
        setIsLoadingForm(false);
        toast.success("Banner berhasil diperbarui.")
      } catch (err) {
          setIsLoadingForm(false);
          handleApiError(err);
      }
    }

  const handleDelete = async (id: string) => {
    showConfirm({
      title: 'Hapus Destinasi',
      message: 'Apakah Anda yakin ingin menghapus destinasi ini?',
      onConfirm: async () => {
        if (!token) {
          setActionError('Sesi admin tidak valid.');
          return;
        }

        setActionError(null);

        try {
          await deleteDestination(id, token);
          toast.success('Destinasi berhasil dihapus.');
          if (destinations.length === 1 && page > 1) {
            setPage((currentPage) => Math.max(1, currentPage - 1));
          } else {
            await reload();
          }
        } catch (err) {
          handleApiError(err);
          setActionError('Destinasi belum dapat dihapus.');
        }
      },
    });
  };

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(preview);
    }
  },[preview])

  useEffect(()=> {
    handleReset();
  }, [overlay.statusDialogForm])
  

  return (
    <div className="space-y-6">
      <div className={`bg-white rounded-lg p-6 left-[20%] translate-x-[-15%] top-[50%] translate-y-[-50%] sm:left-[50%] sm:translate-x-[-50%] xl:left-[55%] xl:translate-x-[-40%] z-10 shadow-lg ${overlay.statusDialogForm && overlay.status ? "fixed" : "hidden"}`}>
        <form onSubmit={async (e) => {
        e.preventDefault();
        if(!menu) {
          await createBannerData();
          overlay.changeStatusDialogForm(false);
          overlay.changeStatus(false);
        } else {
          await updateBannerData(id);
          overlay.changeStatusDialogForm(false);
          overlay.changeStatus(false);
        }
        }}>
          <div className="flex flex-col gap-4">
              <div>
                <span className="font-bold text-xl">Data Banner Menu Destinasi</span>
              </div>
              {
                !isLoadingBanner 
                ? 
                <>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judul *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      placeholder="Masukkan judul banner"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gambar *
                    </label>
                    <div className="flex flex-col gap-4">
                      {preview || id && image  ? (
                        <img
                          src={preview ? preview : storageUrl(image as string)}
                          alt="Pratinjau gambar utama"
                          className="h-32 w-full md:w-56 object-cover rounded border border-gray-200"
                        />
                      ) : (
                        <div className="h-32 w-full md:w-56 flex items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 text-sm">
                          Belum ada gambar
                        </div>
                      )}
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer transition-colors w-fit">
                        <Upload className="h-4 w-4" />
                        <span>{image ? 'Ganti gambar' : 'Unggah gambar'}</span>
                        <input
                          type="file"
                          name="image"
                          ref={el => {
                            if(!el) {
                              return;
                            }

                            fileRef.current = el;

                            if(typeof image !== "string") {
                              const dt = new DataTransfer();
                              dt.items.add(image);

                              fileRef.current.files = dt.files;
                            }
                          }}
                          onChange={(e) => {
                              const target = e.target as HTMLInputElement & {
                                files: FileList;
                              }
                              setImage(target.files[0]);
                              const objectUrl = URL.createObjectURL(target.files[0]);
                              setPreview(objectUrl);
                          }}
                          className="hidden"
                          required={id === 0}
                        />
                      </label>
                      {!id ? (
                        <p className="text-xs text-gray-500">Wajib diisi untuk transportasi baru. Maks 1 MB. Format: JPG, JPEG, WebP.</p>
                      ) : (
                        <p className="text-xs text-gray-500">Kosongkan jika tidak ingin mengubah gambar. Format: JPG, JPEG, WebP. Maks 1 MB.</p>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi *
                    </label>
                    <textarea
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                        placeholder="Masukkan deskripsi banner"
                      />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                    type="button"
                    onClick={() => {
                      overlay.changeStatusDialogForm(false);
                      overlay.changeStatus(false);
                      handleReset();
                    }}
                    className={`border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md flex gap-2 items-center transition-colors duration-200 w-max ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                    disabled={isLoadingForm}
                    >
                      Tutup
                    </button>
                    <button
                      type="submit"
                      disabled={isLoadingForm}
                      className="inline-flex items-center bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md shadow transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {isLoadingForm ?
                    <>
                      <ClipLoader
                        color={"#ffff"}
                        loading={true}
                        size={20}
                        className="mr-2"
                      />
                      <span>Mengunggah...</span>
                    </>
                    :
                    <>
                      {id ? "Edit Menu Destinasi": "Tambah Menu Destinasi"}
                    </>
                    }
                  </button>
                  </div>
                </>
                :
                <div className="flex flex-col gap-2 items-center">
                    <ClipLoader
                      color={"#000"}
                      loading={true}
                      size={20}
                      className="mb-2"
                    />
                    <span>Memuat data banner...</span>
                </div>
              }
            </div>
        </form>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Destinasi</h1>
        <div className="flex justify-between gap-2">
          <button
            onClick={async()=> {
              overlay.changeStatus(true);
              overlay.changeStatusDialogForm(true);
              await getBannerData();
            }}
            className="bg-blue-800 hover:bg-blue-950 text-white px-4 py-2 rounded-md flex gap-2 items-center transition-colors duration-200 w-max"
          >
            <GalleryThumbnails className="h-4 w-4" />
            Banner
          </button>
          <Link
            to="/destinasi"
            target="_blank"
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex gap-2 items-center transition-colors duration-200 w-max"
          >
            <MoveUpRight className="h-4 w-4" />
            Kunjungi
          </Link>
          <Link
            to="/admin/destinations/add"
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Destinasi
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
                placeholder="Cari nama destinasi..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
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
      </div>

      {(error || actionError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700 text-sm">{actionError ?? error}</p>
        </div>
      )}

      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Memuat destinasi...</p>
        </div>
      )}

      {/* Destinations Table */}
       {!isLoading && !error && (
       <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destinasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam Buka
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {destinations.map((destination) => (
                <tr key={destination.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                      <img
                        className="h-12 w-12 rounded-md object-cover"
                        src={storageUrl(destination.image)}
                        alt={destination.title}
                      />
                  </td>
                  <td>
                     <div className="text-sm font-medium text-gray-900">
                          {destination.title}
                      </div>
                  </td>
                  <td>
                    <p className="text-sm text-gray-500 p-4 overflow-hidden text-ellipsis">
                          {destination.description}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary bg-opacity-10 text-primary">
                      {destination.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {destination.price}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {destination.openHours.length > 20 ? `${destination.openHours.substring(0,30)}...` : destination.openHours}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/destinasi/${destination.id}`}
                        state={{ fromAdmin: true }}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Lihat"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/admin/destinations/edit/${destination.id}`}
                        state={{ fromAdmin: true }}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(destination.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {destinations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <MapPin className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Data destinasi masih kosong
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Belum ada data destinasi wisata yang tersimpan. Mulai tambahkan destinasi pertama Anda sekarang.
            </p>
            <Link
              to="/admin/destinations/add"
              className="inline-flex items-center bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-md transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Destinasi
            </Link>
          </div>
        )}

        {pagination.total > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
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
       )}
    </div>
  );
};

export default DestinationList;
