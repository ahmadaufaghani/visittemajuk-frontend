import React, { useState, Fragment, useEffect, useRef } from 'react';
import { Edit, Trash2, Plus, ChevronDown, ChevronUp, MoveUpRight } from 'lucide-react';
import { useAuth } from '../../../contexts/authContextValue';
import { PuffLoader } from "react-spinners";
import { createAdditionalCulinary, deleteAdditionalCulinary, getAdditionalCulinaries, updateAdditionalCulinary } from '../../../services/culinariesApi';
import toast from 'react-hot-toast';
import { AdditionalCulinary } from '../../../types/culinary';
import { useOverlay } from '../../../contexts/OverlayContext';
import {Link} from 'react-router-dom';
import { storageUrl } from '../../../utils/storageUrl';
import { useApiErrorHandler } from '../../../hooks/useApiErrorHandler';

const AdditionalCulinaryList: React.FC = () => {

  const [additionalCulinaries, setAdditionalCulinaries] = useState<AdditionalCulinary[]>([]);
  const [id, setId] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [image, setImage] = useState< File | string >();
  const user = useAuth();
  const imageFile = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const overlay = useOverlay();
  const handleApiError = useApiErrorHandler();
  
  const getAdditionalCulinariesData = () => {
    setIsLoading(true);
    getAdditionalCulinaries().then(res => setAdditionalCulinaries(res))
    .catch(err => handleApiError(err))
    .finally(() => setIsLoading(false));
  }

  const addAdditionalCulinary = async () => {
    const formBody = new FormData();
    formBody.append('title', title);
    formBody.append('description', description);
    formBody.append('image', image!);
    setIsLoading(true);
    try {
      await createAdditionalCulinary(formBody, user.token as string);
      toast.success("Kuliner khas berhasil ditambahkan.");
      getAdditionalCulinariesData();
      setTitle('');
      setDescription('');
      setPreview('');
      if (imageFile.current) {
        imageFile.current.value = "";
        imageFile.current.type = "text";
        imageFile.current.type = "file";
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }

  const updateAdditionalCulinaryData = async (id: number) => {
    const formBody = new FormData();
    formBody.append('title', title);
    formBody.append('description', description);
    formBody.append('image', image!);
    setIsLoading(true);
    try {
      await updateAdditionalCulinary(id, formBody, user.token as string);
      toast.success("Kuliner khas berhasil diperbarui.");
      getAdditionalCulinariesData();
      setId(0);
      setTitle('');
      setDescription('');
      setPreview('');
      if (imageFile.current) {
        imageFile.current.value = "";
        imageFile.current.type = "text";
        imageFile.current.type = "file";
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }

  const deleteAdditionalCulinaryData = async (id: number) => {
    try {
      await deleteAdditionalCulinary(id, user.token as string);
      toast.success("Kuliner khas berhasil dihapus.");
      getAdditionalCulinariesData();
    } catch (err) {
      handleApiError(err);
    }
  }

  useEffect(()=>{
    getAdditionalCulinariesData();

  },[])

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(preview);
    }
  },[preview])

  useEffect(()=> {
    if(!(overlay.statusDialogForm)) {
      if(id) {
        setId(0);
      }
      setTitle('');
      setDescription('');
      setPreview('');
      if (imageFile.current) {
        imageFile.current.value = "";
        imageFile.current.type = "text";
        imageFile.current.type = "file";
      }
    }
  },[overlay.statusDialogForm]) // eslint-disable-line react-hooks/exhaustive-deps
 
  return (
    <>
      {/* Form CRUD */}
      <div className={`bg-white rounded-lg p-6 left-[20%] translate-x-[-15%] top-[50%] translate-y-[-50%] sm:left-[50%] sm:translate-x-[-50%] xl:left-[55%] xl:translate-x-[-40%] z-10 shadow-lg ${overlay.statusDialogForm && overlay.status ? "absolute" : "hidden"}`}>
      <form onSubmit={(e) => {
        e.preventDefault();
        if(id) {
          setIsLoading(true);
          updateAdditionalCulinaryData(id);
          overlay.changeStatusDialogForm(false);
          overlay.changeStatus(false);
        } else {
          setIsLoading(true);
          addAdditionalCulinary();
          overlay.changeStatusDialogForm(false);
          overlay.changeStatus(false);
        }
      }}>
        <div className="flex flex-col gap-4">
            <div>
              <span className="font-bold text-xl">Data Kuliner Khas</span>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Kuliner *
              </label>
              <input
                type="text"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                placeholder="Masukkan nama kuliner khas"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar *
              </label>
              {preview || id && image ? 
                <img
                  src={preview ? preview : storageUrl(image as string)}
                  className='mb-4 w-32'
                />
                :
                <></>
              }
              <input
                  type="file"
                  name="image"
                  accept="image/jpeg,image/webp"
                  ref={imageFile}
                  onChange={(e) => {
                      const target = e.target as HTMLInputElement & {
                        files: FileList;
                      }
                      setImage(target.files[0]);
                      const objectUrl = URL.createObjectURL(target.files[0]);
                      setPreview(objectUrl);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required={id === 0}
              />
              <div>
                <span className="text-xs text-red-700">*ext: .jpg, .jpeg, .webp; max: 1 MB</span>
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
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  placeholder="Masukkan deskripsi kuliner khas"
                />
            </div>
            <div className="flex justify-end gap-2">
              <button
              type="button"
              onClick={() => {
                overlay.changeStatusDialogForm(false);
                overlay.changeStatus(false);

                if(id) {
                  setId(0);
                }

                setTitle('');
                setDescription('');
                setPreview('');

                if (imageFile.current) {
                  imageFile.current.value = "";
                  imageFile.current.type = "text";
                  imageFile.current.type = "file";
                }
              }}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md flex gap-2 items-center transition-colors duration-200 w-max"
              >
                Tutup
              </button>
              <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex gap-2 items-center transition-colors duration-200 w-max"
              >
                {id ? "Edit Kuliner Khas" : "Tambah Kuliner Khas"}
              </button>
            </div>
          </div>
      </form>
      </div>
      <div className="space-y-6 relative">
        {/* Header */}
        <div className="space-y-4 sm:flex sm:justify-between sm:items-center">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Kuliner Khas</h1>
          <div className="flex gap-2">
            <Link
              to="/kuliner"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex gap-2 items-center transition-colors duration-200 w-max"
            >
              <MoveUpRight className="h-4 w-4" />
              Kunjungi
            </Link>
            <button
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex gap-2 items-center transition-colors duration-200 w-max"
              onClick={()=>{
                overlay.changeStatus(true);
                overlay.changeStatusDialogForm(true);
              }}
            >
            <Plus className="h-4 w-4" />
            Tambah Kuliner Khas
            </button>
          </div>
        </div>

        {/* Additional Culinary Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kuliner
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!isLoading && additionalCulinaries.map((item) => (
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
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={()=>setSelectedRow((prev) => prev === item.id ? 0 : item.id)}
                        className="bg-primary hover:bg-primary-dark text-white p-1 rounded-full transition-colors duration-200 md:hidden"
                      >
                        {selectedRow === item.id 
                        ? 
                        <ChevronUp className="h-4 w-4" />
                        :
                        <ChevronDown className="h-4 w-4" />
                        }
                      </button>
                      <div className="justify-end space-x-2 hidden md:flex">
                        <button
                          onClick={()=>{
                            setId(item.id);
                            setTitle(item.title);
                            setDescription(item.description);
                            setImage(item.image);
                            overlay.changeStatusDialogForm(true);
                            overlay.changeStatus(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setIsLoading(true);
                            deleteAdditionalCulinaryData(item.id);
                          }}
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
                            <td className="align-top pr-4 font-semibold pl-2 text-sm">Deskripsi</td>
                            <td className="p-1">
                              {item.description}
                            </td>
                          </tr>
                          <tr className="divide-x">
                            <td className="align-top pr-4 font-semibold pl-2 text-sm">Aksi</td>
                            <td className="px-1 py-2 text-sm font-medium">
                              <div className="justify-start space-x-2">
                                <button
                                  onClick={()=>{
                                    setId(item.id);
                                    setTitle(item.title);
                                    setDescription(item.description);
                                    setImage(item.image);
                                    overlay.changeStatusDialogForm(true);
                                    overlay.changeStatus(true);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900 p-1"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setIsLoading(true);
                                    deleteAdditionalCulinaryData(item.id);
                                  }}
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
                }
              </tbody>
            </table>
          </div> 

          {isLoading ? <div className=" flex flex-col items-center py-8">
              <PuffLoader
                color={"#4B5563"}
                loading={isLoading}
                size={40}
                className="mb-6"
              />
              <p className="text-gray-500">Memuat data kuliner khas...</p>
            </div>
            :
            <></>
          }

          {!isLoading && additionalCulinaries.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada kuliner khas yang ditemukan.</p>
            </div>
          )}


        </div>
      </div>
    </>
  );
};

export default AdditionalCulinaryList;