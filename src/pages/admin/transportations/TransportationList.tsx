import React, { useState, Fragment, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Edit, Trash2, Plus, ChevronDown, ChevronLeft, ChevronRight, MoveUpRight, ChevronUp, GalleryThumbnails, Upload } from 'lucide-react';
import { useAuth } from '../../../contexts/authContextValue';
import { ClipLoader, PuffLoader } from "react-spinners";
import { useTransportation } from '../../../hooks/useTransportations';
import { showConfirm } from '../../../utils/confirm';
import { storageUrl } from '../../../utils/storageUrl';
import { useApiErrorHandler } from '../../../hooks/useApiErrorHandler';
import { createTransportationBanner, deleteTransportation, getTransportationBanner, updateTransportationBanner } from '../../../services/transportationsApi';
import toast from 'react-hot-toast';
import { useOverlay } from '../../../contexts/OverlayContext';
import { ApiError } from '../../../lib/api';

const TransportationList: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [id, setId] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [menu, setMenu] = useState<string>('');
  const [image, setImage] = useState<File | string>('');
  const [preview, setPreview] = useState<string>('');
  const [isLoadingBanner, setIsLoadingBanner] = useState<boolean>(false);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const user = useAuth();
  const handleApiError = useApiErrorHandler();
  const overlay = useOverlay();
  const fileRef = useRef<HTMLInputElement|null>(null);
  const [errorBanner, setErrorBanner] = useState<Record<string, string[]>>();


  const {transportations, isLoading, error, reload, meta} = useTransportation({params:{
    search : searchTerm,
    difficulty: selectedDifficulty,
    page,
    perPage: 5
  }});

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
    setErrorBanner({});
  }

  const getBannerData = async () => {
    try {
      setIsLoadingBanner(true);
      const [res] = await getTransportationBanner();
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

  const createBannerData = async (): Promise<boolean> => {
    try {
      setIsLoadingForm(true);
      const formBody = new FormData();
      formBody.append("title", title);
      formBody.append("description", description);
      formBody.append("menu","transportasi");
      formBody.append("image", image);
      await createTransportationBanner(formBody, user.token as string)
      handleReset();
      setIsLoadingForm(false);
      toast.success("Banner berhasil ditambahkan.")
      return true;
    } catch (err) {
        setIsLoadingForm(false);
        if(err instanceof ApiError) setErrorBanner(err.errors);
        toast.error("Banner gagal ditambahkan.")
        return false;
    }
  }

  const updateBannerData = async (id: number): Promise<boolean> => {
    try {
      setIsLoadingForm(true);
      const formBody = new FormData();
      formBody.append("title", title);
      formBody.append("description", description);
      formBody.append("menu", menu);
      formBody.append("image", image);
      await updateTransportationBanner(id, formBody, user.token as string)
      handleReset();
      setIsLoadingForm(false);
      toast.success("Banner berhasil diperbarui.");
      return true;
    } catch (err) {
        setIsLoadingForm(false);
        if(err instanceof ApiError) setErrorBanner(err.errors);
        toast.error("Banner gagal diperbarui.")
        return false;
    }
  }

   const deleteErrorBanner = (key: string) => {
    setErrorBanner(prev => {
      if(!prev) return;
      
      const {[key]:_, ...newData} = prev;
      return newData;
    })
  }

  const handleDelete = async (id: number) => {
    showConfirm({
      title: 'Hapus Transportasi',
      message: 'Apakah Anda yakin ingin menghapus rute transportasi ini?',
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
          let addBanner = false; 
          let updateBanner = false;
          if(!menu) {
            addBanner = await createBannerData();
          } else {
            updateBanner = await updateBannerData(id);
          }
          if(addBanner || updateBanner) {
            overlay.changeStatusDialogForm(false);
            overlay.changeStatus(false);
          }
        }}>
          <div className="flex flex-col gap-4">
              <div>
                <span className="font-bold text-xl">Data Banner Menu Transportasi</span>
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
                      onChange={(e) => {
                        deleteErrorBanner("title");
                        setTitle(e.target.value);
                      }}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${errorBanner && errorBanner["title"] && "border-red-600"}`}
                      required
                      placeholder="Masukkan judul banner"
                    />
                    <span className="text-sm text-red-600">{errorBanner && errorBanner["title"] && `*${errorBanner["title"]}`.replace("title", "Judul")}</span>
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
                          className={`h-32 w-full md:w-56 object-cover rounded border border-gray-200 ${errorBanner && errorBanner["image"] && "border-red-600"}`}
                        />
                      ) : (
                        <div className="h-32 w-full md:w-56 flex items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 text-sm">
                          Belum ada gambar
                        </div>
                      )}
                      <span className="text-sm text-red-600">{errorBanner && errorBanner["image"] && '*'+errorBanner["image"].map(val => 
                      {
                        let message = '';
                        if(val.includes('jpg, jpeg, webp') || val.includes('max')) {
                          message += "Ekstensi gambar tidak sesuai;";
                        }
                        if(val.includes('1024 KB') || val.includes('size')) {
                          message += "Ukuran gambar lebih dari 1 MB;";
                        }
                        return message;
                      }).join(" ").trim()}
                      </span>
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
                              deleteErrorBanner("image");
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
                      onChange={(e) => {
                        deleteErrorBanner("description");
                        setDescription(e.target.value);
                      }}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      placeholder="Masukkan deskripsi banner"
                    />
                    <span className="text-sm text-red-600">{errorBanner && errorBanner["description"] && `*${errorBanner["description"]}`.replace("description", "Deskripsi")}</span>
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
                      {id ? "Edit Menu Transportasi": "Tambah Menu Transportasi"}
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
      <div className="space-y-4 md:flex md:justify-between md:items-center">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Transportasi</h1>
        <div className="flex flex-col items-end sm:flex-row sm:items-center sm:justify-end gap-2">
          <button
            onClick={async ()=> {
              overlay.changeStatus(true);
              overlay.changeStatusDialogForm(true);
              setErrorBanner({});
              await getBannerData();
            }}
            className="bg-blue-800 hover:bg-blue-950 text-white px-4 py-2 rounded-md flex gap-2 items-center transition-colors duration-200 w-max"
          >
            <GalleryThumbnails className="h-4 w-4" />
            Banner
          </button>
          <Link
            to="/transportasi"
            target="_blank"
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
                    <table className="w-full">
                      <tbody className="divide-y">
                        <tr className="divide-x">
                          <td className="align-top pr-4 font-semibold pl-2 text-sm">Deskripsi</td>
                          <td className="p-1 text-gray-500 text-sm">{item.description}</td>
                        </tr>
                        <tr className="divide-x">
                          <td className="align-top pr-4 font-semibold pl-2 text-sm">Biaya</td>
                          <td className="p-1 text-sm">{item.estimated_cost}</td>
                        </tr>
                        <tr className="divide-x">
                          <td className="align-top pr-4 font-semibold pl-2 text-sm">Waktu</td>
                          <td className="p-1 text-sm">{item.estimated_time}</td>
                        </tr>
                        <tr className="divide-x">
                          <td className="align-top pr-4 font-semibold pl-2 text-sm">Aksi</td>
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