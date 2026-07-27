import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X, Upload, Trash2, ImagePlus } from 'lucide-react';
import { useAuth } from '../../../contexts/authContextValue';
import type {
  Specialty,
  Gallery,
} from '../../../types/culinary';
import { ApiError } from '../../../lib/api';
import { createCulinary, createGallery, createSpeciality, deleteGallery, deleteSpeciality, getCulinary, updateCulinary, updateSpeciality } from '../../../services/culinariesApi';
import { ClipLoader, PuffLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { storageUrl } from '../../../utils/storageUrl';
import { useApiErrorHandler } from '../../../hooks/useApiErrorHandler';

const CulinaryForm: React.FC = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const user = useAuth();
  const handleApiError = useApiErrorHandler();
  const [idCulinary, setIdCulinary] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [fullDescription, setFullDescription] = useState<string>("");
  const [image, setImage] = useState<File| string | null>(null);
  const [category, setCategory] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [locationMap, setLocationMap] = useState<string>("");
  const [openHours, setOpenHours] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [specialties, setSpecialities] = useState<string[]>([]);
  const [galleries, setGalleries] = useState<File[]>([]);
  const [specialtiesUpdate, setSpecialtiesUpdate] = useState<Specialty[]>([]);
  const [specialtiesUpdatedTemp, setSpecialitiesUpdatedTemp] = useState<number[]>([]);
  const [specialtiesDeletedTemp, setSpecialtiesDeletedTemp] = useState<number[]>([]);
  const [galleriesDeletedTemp, setGalleriesDeletedTemp] = useState<number[]>([]);
  const [galleriesUpdate, setGalleriesUpdate] = useState<Gallery[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [previews, setPreviews] = useState<string[]>([]);
  const categories = ['Seafood', 'Indonesia', 'Kafe', 'Lokal', 'Tradisional'];
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false);
  
  const showCulinary = async (id: number) => {
    try {
      setIsLoading(true);
      const res = await getCulinary(String(id));
      setIdCulinary(res.id);
      setTitle(res.title);
      setDescription(res.description);
      setFullDescription(res.full_description);
      setImage(res.image);
      setCategory(res.category);
      setPrice(res.price);
      setLocation(res.location);
      setLocationMap(res.location_map ?? "");
      setOpenHours(res.open_hours);
      setContact(res.contact || "");
      setSpecialtiesUpdate(res.specialties);
      setGalleriesUpdate(res.culinary_galleries);
      setIsLoading(false);
    } catch (err) {
        setIsLoading(false);
        handleApiError(err);
    }
  }

  const addCulinaryData = async () => {
    try {
      setIsLoadingForm(true);
      const formBody = new FormData();
      formBody.append("title",title.trim());
      formBody.append("description",description.trim());
      formBody.append("full_description",fullDescription.trim());
      formBody.append("image",image!);
      formBody.append("category",category.trim());
      formBody.append("price",price.trim());
      formBody.append("location",location.trim());
      formBody.append("location_map",locationMap.trim() ?? "");
      formBody.append("open_hours",openHours.trim());
      formBody.append("contact",contact.trim());
      const res = await createCulinary(formBody,user.token as string);
      toast.success("Kuliner berhasil ditambahkan.")
      addSpecialtiesData(res.id);
      addGalleriesData(res.id);
    } catch (err) {
      if(err instanceof ApiError) {
        handleApiError(err.errors);
      }
    }
  }

  const addSpecialtiesData = (id: number) => {
      specialties.map(async (val) => {
        try {
          await createSpeciality({menu: val.trim(), culinary_id: id}, user.token as string);
          toast.success("Menu spesial berhasil ditambahkan.");
        } catch (err) {
            handleApiError(err);
        }
      });
  }

  const addGalleriesData = (id: number) => {
      galleries.map(async (val) => {
        try {
          const formGallery = new FormData();
          formGallery.append("image",val);
          formGallery.append("culinary_id", String(id));
          await createGallery(formGallery, user.token as string);
          toast.success("Galeri berhasil ditambahkan.");
        } catch (err) {
            handleApiError(err);
        }
      });
  }

  const updateCulinaryData = async (id : number) => {
    try {
      setIsLoadingForm(true);
      const formBody = new FormData();
      formBody.append("title",title.trim());
      formBody.append("description",description.trim());
      formBody.append("full_description",fullDescription.trim());
      formBody.append("image",image!);
      formBody.append("category",category.trim());
      formBody.append("price",price.trim());
      formBody.append("location",location.trim());
      formBody.append("location_map",locationMap.trim());
      formBody.append("open_hours",openHours.trim());
      formBody.append("contact",contact.trim());
  
      await updateCulinary(id, formBody, user.token as string);
      toast.success("Kuliner berhasil diperbarui.");

      addSpecialtiesData(idCulinary);
      addGalleriesData(idCulinary);
      updateSpecialtiesData(idCulinary);
      deleteSpecialtiesData();
      deleteGalleriesData();
      
    } catch (err) {
        setIsLoadingForm(false);
        handleApiError(err);
    }
  }

  const updateSpecialtiesData = (id: number) => {
    specialtiesUpdatedTemp.map(async (val) => {
      try {
        const specialty = specialtiesUpdate[val];

        if(!specialtiesDeletedTemp.find(val => val === specialty.id)) {
          await updateSpeciality(specialtiesUpdate[val].id, {
            menu: specialtiesUpdate[val].menu.trim(),
            culinary_id: id
          }, user.token as string);
          toast.success("Menu spesial berhasil diperbarui.");
        }
      } catch (err) {
          handleApiError(err);
      }
    });
  }

  const deleteSpecialtiesData = () => {
    specialtiesDeletedTemp.map(async (val) => {
      try {
        await deleteSpeciality(val, user.token as string);
        toast.success("Menu spesial berhasil dihapus.");
      } catch (err) {
          handleApiError(err);
      }
    });
  }

  const deleteGalleriesData = () => {
    galleriesDeletedTemp.map(async (val) => {
      try {
        deleteGallery(val, user.token as string);
        toast.success("Galeri berhasil dihapus.");
      } catch (err) {
          handleApiError(err);
      }
    });
  }

  const addArrayItemSpecialties = () => {
    setSpecialities(prev => [...prev, '']);
  }

  const addArrayItemGalleries = (val: File) => {
    setGalleries(prev => [...prev, val]);
  }

  const addArraySpecialitiesUpdatedTemp = (val: number) => {
    setSpecialitiesUpdatedTemp(prev => [...prev, val]);
  }

  const addArrayDeletedSpecialitiesTemp = (val: number) => {
    setSpecialtiesDeletedTemp(prev => [...prev, val]);
  }

  const addArrayDeletedGalleriesTemp = (val: number) => {
    setGalleriesDeletedTemp(prev => [...prev, val]);
  }

  const handleArrayChangeSpecialties = (index: number, value: string) => {
    setSpecialities(specialties.map((item, i) => i === index ? value : item));
  };


  const handleArrayChangeSpecialtiesUpdate = (index: number, value: string) => {
    setSpecialtiesUpdate(specialtiesUpdate.map((item, i) => i === index ? {...item, ["menu"]:value} : item));
  };

  const removeArrayItemSpecialties = (index: number) => {
    setSpecialities(specialties.filter((_, i) => i !== index));
  }

  const removeArrayItemGalleries = (index: number) => {
    setGalleries(galleries.filter((_, i) => i !== index));
  }

  const removeArrayItemGalleriesPreview = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setPreviews(previews.filter((_, i) => i !== index));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(idCulinary) {
      await updateCulinaryData(idCulinary);
    } else {
      await addCulinaryData();
    }
    navigate('/admin/culinary', {replace : true});
  };

  
  useEffect(() => {
    if (isEdit && id) {
      showCulinary(Number(id));
    }
  }, [isEdit, id]);

  useEffect(()=>{
    return () => {
      if(preview) {
        URL.revokeObjectURL(preview);
      }
    }
  },[preview]);


  return (
    <div className="space-y-6">
      {
        !isLoading ?
        <>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/culinary')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">
              {isEdit ? 'Edit Kuliner' : 'Tambah Kuliner'}
            </h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Informasi Dasar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Tempat *
                </label>
                <input
                  disabled={isLoadingForm}
                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                  required
                  placeholder="cth: Rumah Makan Sari Rasa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  disabled={isLoadingForm}
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kisaran Harga *
                </label>
                <input
                  disabled={isLoadingForm}
                  type="text"
                  name="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="cth: Rp 25.000 - Rp 100.000"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Buka *
                </label>
                <input
                  disabled={isLoadingForm}
                  type="text"
                  name="openHours"
                  value={openHours}
                  onChange={(e) => setOpenHours(e.target.value)}
                  placeholder="cth: 11.00 - 21.00 WIB"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon *
                </label>
                <input
                  disabled={isLoadingForm}
                  type="text"
                  name="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="cth: +62 8123 4567 890"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat *
              </label>
              <textarea
                disabled={isLoadingForm}
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                rows={2}
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                required
                placeholder="cth: Jl. Utama Temajuk No. 25, Desa Temajuk, Kecamatan Paloh, Kabupaten Sambas"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Url Lokasi Map
              </label>
              <textarea
                disabled={isLoadingForm}
                name="location"
                value={locationMap ?? ""}
                onChange={(e) => setLocationMap(e.target.value)}
                rows={2}
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                placeholder="cth: https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127601.4652245904!2d109.52879789999999!3d1..."
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Utama *
              </label>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
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
              <label className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md ${isLoadingForm ? "cursor-not-allowed" : "cursor pointer"} transition-colors`}>
                <Upload className="h-4 w-4" />
                <span>{image ? 'Ganti gambar' : 'Unggah gambar'}</span>
                <input
                  disabled={isLoadingForm}
                  required={image ? false : true}
                  type="file"
                  accept="image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement & {
                      files : FileList;
                    }
                    setImage(target.files[0]);
                    const objectUrl = URL.createObjectURL(target.files[0]);
                    setPreview(objectUrl);
                  }}
                />
              </label>
              {!isEdit ? (
                <p className="text-xs text-gray-500">Wajib diisi untuk kuliner baru. Maks 1 MB. Format: JPG, JPEG, WebP.</p>
              ) : (
                <p className="text-xs text-gray-500">Kosongkan jika tidak ingin mengubah gambar. Format: JPG, JPEG, WebP. Maks 1 MB.</p>
              )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Singkat *
              </label>
              <textarea
                disabled={isLoadingForm}
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                required
                placeholder="Masukkan deskripsi singkat dari tempat kuliner"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Lengkap *
              </label>
              <textarea
                disabled={isLoadingForm}
                name="fullDescription"
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                rows={5}
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                required
                placeholder="Masukkan deskripsi lengkap dari tempat kuliner"
              />
            </div>
          </div>

          {/* Menu Specialties */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Menu Spesial</h2>
              <button
                disabled={isLoadingForm}
                type="button"
                onClick={() => addArrayItemSpecialties()}
                className={`text-primary hover:text-primary-dark flex items-center ${isLoadingForm ? "cursor-not-allowed" : ""}`}
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </button>
            </div>
            
            <div className="space-y-3">
            {
              id && specialtiesUpdate.map((item, index) => {
              return (
                !specialtiesDeletedTemp.find(val => val === item.id) 
                &&
                <div key={index} className="flex items-center space-x-2 ">
                  <input
                    disabled={isLoadingForm}
                    required
                    type="text"
                    value={item.menu}
                    onChange={(e) => {
                        handleArrayChangeSpecialtiesUpdate(index, e.target.value);
                        if(!specialtiesUpdatedTemp.includes(index)) {
                          addArraySpecialitiesUpdatedTemp(index);
                        }
                    }}
                    className={`flex-1 px-4 py-2 border border-gray-300 rounded-md ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                    placeholder="Nama menu spesial"
                  />
                  <button
                    disabled={isLoadingForm}
                    key={`button-speciality-delete-${index}`}
                    type="button"
                    onClick={() => {
                      addArrayDeletedSpecialitiesTemp(item.id);
                    }}
                    className={`text-red-600 hover:text-red-800 ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                  > 
                      <X className="h-4 w-4" />
                  </button>
                </div>
              )
            }) 
            }       
            {
              specialties.map((specialty, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    disabled={isLoadingForm}
                    required
                    type="text"
                    value={specialty}
                    onChange={(e) => handleArrayChangeSpecialties(index, e.target.value)}
                    className={`flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                    placeholder="Nama menu spesial"
                  />
                  <button
                    disabled={isLoadingForm}
                    type="button"
                    onClick={() => removeArrayItemSpecialties(index)}
                    className={`text-red-600 hover:text-red-800 ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            }
            </div>
          </div>

          {/* Gallery */}
          {
            <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Galeri</h2>
              <label className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md ${isLoadingForm ? "cursor-not-allowed" : "cursor-pointer"} transition-colors`}>
                <ImagePlus className="h-4 w-4" />
                <span>Tambah Gambar</span>
                <input
                  disabled={isLoadingForm}
                  multiple
                  type="file"
                  accept="image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                     const target = e.target as HTMLInputElement & {
                        files : FileList;
                      }
                      const newFiles = target.files;
                      if(newFiles.length > 1) {
                        const newFilesArray = Array.from(newFiles);
                        setGalleries(prev => [...prev, ...newFilesArray]);
                        newFilesArray.map(val => {
                          const objectUrl = URL.createObjectURL(val);
                          setPreviews(prev => [...prev, objectUrl]);
                        })
                      } else {
                        addArrayItemGalleries(target.files[0]);
                        const objectUrl = URL.createObjectURL(target.files[0]);
                        setPreviews(prev => [...prev, objectUrl]);
                      }
                  }}
                />
              </label>
            </div>

            <div className="space-y-3">
              {isEdit && galleriesUpdate.length > 0 && galleriesUpdate.length !== galleriesDeletedTemp.length 
              && 
              (<div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Gambar yang sudah ada:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleriesUpdate.map((item, index) => (
                    !galleriesDeletedTemp.find(val => val === item.id) &&
                    <div key={item.id} className="relative group rounded-md overflow-hidden border border-gray-200">
                      <img
                        src={storageUrl(item.image)}
                        alt={`Galeri ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        disabled={isLoadingForm}
                        type="button"
                        onClick={() => {
                          addArrayDeletedGalleriesTemp(item.id);
                        }}
                        className={`absolute top-2 right-2 inline-flex items-center justify-center h-7 w-7 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                        aria-label="Hapus gambar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {previews.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Gambar baru yang akan ditambahkan:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative group rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            removeArrayItemGalleries(index);
                            removeArrayItemGalleriesPreview(index);
                          }}
                          className="absolute top-2 right-2 inline-flex items-center justify-center h-7 w-7 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Hapus gambar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {(!isEdit || galleries.length === 0) && galleriesUpdate.length === galleriesDeletedTemp.length && (
                <p className="text-gray-500 text-sm">
                  Belum ada gambar di galeri. Klik "Tambah Gambar" untuk menambahkan gambar.
                </p>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Maks 1 MB per gambar. Format: JPG, JPEG, WebP.
              </p>
            </div>
          </div>}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              disabled={isLoadingForm}
              type="button"
              onClick={() => navigate('/admin/culinary')}
              className={`px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 ${isLoadingForm ? "cursor-not-allowed" : ""}`}
            >
              Batal
            </button>
            <button
              disabled={isLoadingForm}
              type="submit"
              className={`inline-flex items-center bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-md shadow transition-colors duration-300 ${isLoadingForm ? "cursor-not-allowed" : ""}`}
            >
              {isLoadingForm ?
                <>
                  <ClipLoader
                    color={"#ffff"}
                    loading={true}
                    size={20}
                    className="mr-2"
                  />
                  <span>Memproses...</span>
                </>
                :
                <>
                  <Save className="mr-2 h-5 w-5" />
                  {id ? "Edit" : "Simpan"}
                </>
                }
            </button>
          </div>
          </form>
        </>
        :
        <div className="min-h-screen flex flex-col items-center justify-center">
           <PuffLoader
              color={"#4B5563"}
              loading={isLoading}
              size={40}
              className="mb-6"
            />
          <p className="text-gray-600 text-lg">Memuat data kuliner...</p>
        </div>
      }
  </div>)
}

export default CulinaryForm;
