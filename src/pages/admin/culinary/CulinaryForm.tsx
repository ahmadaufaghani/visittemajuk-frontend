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
  const [idCulinaryTemp, setIdCulinaryTemp] = useState<number>(0);
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
  const [specialties, setSpecialities] = useState<{index:number, menu:string}[]>([]);
  const [galleries, setGalleries] = useState<{index: number, file:File}[]>([]);
  const [specialtiesUpdate, setSpecialtiesUpdate] = useState<Specialty[]>([]);
  const [specialtiesUpdatedTemp, setSpecialitiesUpdatedTemp] = useState<number[]>([]);
  const [specialtiesDeletedTemp, setSpecialtiesDeletedTemp] = useState<number[]>([]);
  const [specialtiesDeletedTempPreview, setSpecialtiesDeletedTempPreview] = useState<number[]>([]);
  const [galleriesDeletedTemp, setGalleriesDeletedTemp] = useState<number[]>([]);
  const [galleriesDeletedTempPreview, setGalleriesDeletedTempPreview] = useState<number[]>([]);
  const [galleriesUpdate, setGalleriesUpdate] = useState<Gallery[]>([]);
  const [lastSpecialtySuccess, setLastSpecialtySuccess] = useState<number[]>([]);
  const [culinaryState, setCulinaryState] = useState<boolean>(false);
  const [specialtyState, setSpecialtyState] = useState<boolean>(false);
  const [galleryState, setGalleryState] = useState<boolean>(false);
  const [lastGallerySuccess, setLastGallerySuccess] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [previews, setPreviews] = useState<{index: number, filename: string}[]>([]);
  const categories = ['Seafood', 'Indonesia', 'Kafe', 'Lokal', 'Tradisional'];
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false);

  const [errorCulinary, setErrorCulinary] = useState<Record<string, string[]>>();
  
  const [errorSpecialtyCreate, setErrorSpecialtyCreate] = useState<{index: number, errors: Record<string, string[]>}[]>([]);

  const [errorSpecialtyUpdate, setErrorSpecialtyUpdate] = useState<{id: number, errors: Record<string, string[]>}[]>([]);

  const [errorGalleryCreate, setErrorGalleryCreate] = useState<{index: number, errors: Record<string, string[]>}[]>([]);
  
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

  const addCulinaryData = async (): Promise<boolean|number> => {
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
      toast.success("Kuliner berhasil ditambahkan.");
      setIdCulinaryTemp(res.id);
      setCulinaryState(true);
      setIsLoadingForm(false);
      return res.id;
    } catch (err) {
      setIsLoadingForm(false);
      if(err instanceof ApiError) {
        setErrorCulinary(err.errors);
      }
      toast.error("Kuliner gagal ditambahkan.");
      return false;
    }
  }

  const addSpecialtiesData = async (id: number): Promise<boolean> => {
    try {
      setIsLoadingForm(true);
      await Promise.all(
        specialties
        .filter(val => !lastSpecialtySuccess.includes(val.index))
        .map(async (val) => {
          const order = specialtiesUpdate.length > 0 ? specialtiesUpdate[specialtiesUpdate.length - 1]["order"] + val.index : val.index;
          try {
            await createSpeciality({
              menu: val.menu.trim(), 
              order: order, 
              culinary_id: id},
            user.token as string);
            setLastSpecialtySuccess(prev => [...prev, val.index]);
          } catch (err) {
            if(err instanceof ApiError) {
              setErrorSpecialtyCreate(prev => [...prev, {index: val.index, errors: {...err.errors}}]);
              throw new Error(`Menu spesial gagal ditambahkan. Error: ${err.message}`);
            }
          }
        })
      );
      setIsLoadingForm(false);
      setSpecialtyState(true);
      specialties.length > 0 && toast.success("Menu spesial berhasil ditambahkan.");
      return true;
      } catch (err) {
        setIsLoadingForm(false);
        if(err instanceof Error) {
          toast.error(err.message);
        }
        return false;
    }
  }

  const addGalleriesData = async (id: number): Promise<boolean> => {
    try {
      setIsLoadingForm(true);
      await Promise.all(
        galleries.filter(val => !lastGallerySuccess.includes(val.index))
        .map(async (val) => {
          try {
            const order = galleriesUpdate.length > 0 ? galleriesUpdate[galleriesUpdate.length-1]["order"] + val.index : val.index;
  
            const formGallery = new FormData();
            formGallery.append("image",val.file);
            formGallery.append("order", String(order));
            formGallery.append("culinary_id", String(id));
  
            await createGallery(formGallery, user.token as string);
  
            setLastGallerySuccess(prev => [...prev, val.index]);
          } catch (err) {
            if(err instanceof ApiError) {
              setErrorGalleryCreate(prev => [...prev, {index: val.index, errors: {...err.errors}}]);
              throw new Error(`Galeri gagal ditambahkan. Error: ${err.message}`);
            }
          }
        })
      );
      setGalleryState(true);
      setIsLoadingForm(false);
      galleries.length > 0 && toast.success("Galeri berhasil ditambahkan.");
      return true;
      } catch (err) {
          setIsLoadingForm(false);
          if(err instanceof Error) {
            toast.error(err.message);
          }
          return false;
      }
  }
  
  const updateCulinaryData = async (id : number): Promise<boolean> => {
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
      setIsLoadingForm(false);
      return true;
    } catch (err) {
        if(err instanceof ApiError) {
          setErrorCulinary(err.errors);
        }
        setIsLoadingForm(false);
        toast.error("Kuliner gagal diperbarui.");
        return false;
    }
  }

  const updateSpecialtiesData = async (id: number): Promise<boolean> => {
    try {
      setIsLoadingForm(true);
      await Promise.all(
        specialtiesUpdatedTemp.filter(val => !specialtiesDeletedTemp.includes(specialtiesUpdate[val].id))
        .map(async (val) => {
          const specialty = specialtiesUpdate[val];
          try {
            await updateSpeciality(specialty.id, {
              menu: specialty.menu.trim(),
              order: specialty.order,
              culinary_id: id
            }, user.token as string);
            setSpecialitiesUpdatedTemp(prev => prev.filter(val => val !== val));
          } catch (err) {
            if(err instanceof ApiError) {
              setErrorSpecialtyUpdate(prev => [...prev, {id: specialty.id, errors: {...err.errors}}]);
              throw new Error(`Menu spesial gagal diperbarui. Error: ${err.message}`);
            }
          }
        })
      );
      setIsLoadingForm(false);
      specialtiesUpdatedTemp.length > 0 && toast.success("Menu spesial berhasil diperbarui.");
      return true;
    } catch (err) {
        if(err instanceof Error) {
          toast.error(err.message);
        }
        setIsLoadingForm(false);
        return false;
    }
  }

  const deleteSpecialtiesData = async (): Promise<boolean> => {
    try {
      setIsLoadingForm(true);
      await Promise.all(
        specialtiesDeletedTemp.map((val) => deleteSpeciality(val, user.token as string))
      );
      setIsLoadingForm(false);
      specialtiesDeletedTemp.length > 0 && toast.success("Menu spesial berhasil dihapus.");
      setSpecialtiesDeletedTemp([]);
      return true;
    } catch (err) {
      setIsLoadingForm(false);
      handleApiError(err);
      return false;
    }
  }

  const deleteGalleriesData = async (): Promise<boolean> => {
    try {
      setIsLoadingForm(true);
      await Promise.all(
        galleriesDeletedTemp.map((val) => deleteGallery(val, user.token as string))
      );
      setIsLoadingForm(false);
      galleriesDeletedTemp.length > 0 && toast.success("Galeri berhasil dihapus.");
      setGalleriesDeletedTemp([]);
      return true;
    } catch (err) {
        setIsLoadingForm(false);
        handleApiError(err);
        return false;
    }
  }

  const deleteErrorCulinary = (key: string) => {
    setErrorCulinary(prev => {
      if(!prev) return;

      const {[key]:_, ...newData} = prev;
      return newData;
    })
  }

  const deleteErrorSpecialtyCreate = (id: number) => {
    errorSpecialtyCreate.find(val => val.index === id) && setErrorSpecialtyCreate(prev => prev.filter(val => val.index !== id));
  }

  const deleteErrorSpecialtyUpdate = (id: number) => {
    errorSpecialtyUpdate.find(val => val.id === id) && setErrorSpecialtyUpdate(prev => prev.filter(val => val.id !== id));
  }

  const deleteErrorGalleryCreate = (id: number) => {
    errorGalleryCreate.find(val => val.index === id) && setErrorGalleryCreate(prev => prev.filter(val => val.index !== id));
  }

  const addArrayItemSpecialties = () => {
    setSpecialities(prev => [...prev, {index:prev.length === 0 ? 1 : prev[prev.length - 1].index + 1, menu:''}]);
  }

  const addArrayItemGalleries = (i: number, val: File) => {
    setGalleries(prev => [...prev, {index: i, file: val}]);
  }

  const addArraySpecialitiesUpdatedTemp = (val: number) => {
    setSpecialitiesUpdatedTemp(prev => [...prev, val]);
  }

  const addArrayDeletedSpecialitiesTemp = (val: number) => {
    const index = specialtiesUpdate.findIndex(item => item.id === val);
    setSpecialitiesUpdatedTemp(prev => prev.filter(val => val !== index));
    setSpecialtiesDeletedTemp(prev => [...prev, val]);
    setSpecialtiesDeletedTempPreview(prev => [...prev, val]);
  }

  const addArrayDeletedGalleriesTemp = (val: number) => {
    setGalleriesDeletedTemp(prev => [...prev, val]);
    setGalleriesDeletedTempPreview(prev => [...prev, val]);
  }

  const handleArrayChangeSpecialties = (index: number, value: string) => {
    setSpecialities(specialties.map((item, i) => i === index ? {
    ...item,
    menu:value}  
    : item));
  };


  const handleArrayChangeSpecialtiesUpdate = (index: number, value: string) => {
    setSpecialtiesUpdate(specialtiesUpdate.map((item, i) => i === index ? {...item, ["menu"]:value} : item));
  };

  const removeArrayItemSpecialties = (index: number) => {
    setSpecialities(specialties.filter((_, i) => i !== index));
  }

  const removeArrayItemGalleries = (index: number) => {
    setLastGallerySuccess(prev => prev.filter(item => item !== index));
    setGalleries(galleries.filter((val) => val.index !== index));
  }

  const removeArrayItemGalleriesPreview = (index: number) => {
    const blobIndex = previews.findIndex(val => val.index === index);
    URL.revokeObjectURL(previews[blobIndex].filename);
    setPreviews(previews.filter((val) => val.index !== index));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCulinary({});
    setErrorSpecialtyCreate([]);
    setErrorSpecialtyUpdate([]);
    setErrorGalleryCreate([]);
    if(idCulinary) {
      const culinaryUpdate = await updateCulinaryData(idCulinary);
      const specialty = await addSpecialtiesData(idCulinary);
      const gallery = await addGalleriesData(idCulinary);
      const specialtyUpdate = await updateSpecialtiesData(idCulinary);
      const specialtyDelete = await deleteSpecialtiesData();
      const galleryDelete = await deleteGalleriesData();
 
      if(culinaryUpdate && specialty && specialtyUpdate && specialtyDelete && gallery && galleryDelete) {
        navigate('/admin/culinary', {replace : true});
      } 
    } else {
      let culinary, specialty, gallery;

      if(!culinaryState) {
        culinary = await addCulinaryData();
      }
      if(culinary || culinaryState)   {
        if(!specialtyState && specialties.length !== 0) {
          specialty = await addSpecialtiesData(idCulinaryTemp ? idCulinaryTemp : culinary as number);
        }
        if(!galleryState && galleries.length !== 0) {
          gallery = await addGalleriesData(idCulinaryTemp ? idCulinaryTemp : culinary as number);
        }
      }

      if((culinary || culinaryState) && (specialty ||  specialties.length === 0) && (gallery || galleries.length === 0)) {
        navigate('/admin/culinary', {replace : true});
      } 
    }
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
                  onChange={(e) => {
                    deleteErrorCulinary("title");
                    setTitle(e.target.value);
                  }}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""} ${errorCulinary && errorCulinary["title"] ? "border-red-600" : ""}`}
                  required
                  placeholder="cth: Rumah Makan Sari Rasa"
                />
                <span className="text-red-600 text-sm">{errorCulinary && errorCulinary["title"] && `*${errorCulinary["title"].toString().replace("title", "Nama Tempat")}`}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  disabled={isLoadingForm}
                  name="category"
                  value={category}
                  onChange={(e) => {
                    deleteErrorCulinary("category");
                    setCategory(e.target.value);
                  }}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""} ${errorCulinary && errorCulinary["category"] ? "border-red-600" : ""}`}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <span className="text-red-600 text-sm">{errorCulinary && errorCulinary["category"] && `*${errorCulinary["category"].toString().replace("category", "Kategori")}`}</span>
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
                  onChange={(e) => {
                    deleteErrorCulinary("price");
                    setPrice(e.target.value);
                  }}
                  placeholder="cth: Rp 25.000 - Rp 100.000"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""} ${errorCulinary && errorCulinary["price"] ? "border-red-600" : ""}`}
                  required
                />
                <span className="text-red-600 text-sm">{errorCulinary && errorCulinary["price"] && `*${errorCulinary["price"].toString().replace("price", "Harga")}`}</span>
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
                  onChange={(e) => {
                    deleteErrorCulinary("open_hours");
                    setOpenHours(e.target.value);
                  }}
                  placeholder="cth: 11.00 - 21.00 WIB"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""} ${errorCulinary && errorCulinary["open_hours"] ? "border-red-600" : ""}`}
                  required
                />
                <span className="text-red-600 text-sm">{errorCulinary && errorCulinary["open_hours"] && `*${errorCulinary["open_hours"].toString().replace("open hours", "Jam Buka")}`}</span>
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
                  onChange={(e) => {
                    deleteErrorCulinary("contact");
                    setContact(e.target.value);
                  }}
                  placeholder="cth: +62 8123 4567 890"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""} ${errorCulinary && errorCulinary["contact"] ? "border-red-600" : ""}`}
                />
                <span className="text-red-600 text-sm">{errorCulinary && errorCulinary["contact"] && `*${errorCulinary["contact"].toString().replace("contact", "Kontak")}`}</span>
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
                onChange={(e) => {
                  deleteErrorCulinary("location");
                  setLocation(e.target.value);
                }}
                rows={2}
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""} ${errorCulinary && errorCulinary["location"] ? "border-red-600" : ""}`}
                required
                placeholder="cth: Jl. Utama Temajuk No. 25, Desa Temajuk, Kecamatan Paloh, Kabupaten Sambas"
              />
              <span className="text-red-600 text-sm">{errorCulinary && errorCulinary["location"] && `*${errorCulinary["location"].toString().replace("location", "Alamat")}`}</span>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Url Lokasi Map
              </label>
              <textarea
                disabled={isLoadingForm}
                name="location_map"
                value={locationMap ?? ""}
                onChange={(e) => {
                  deleteErrorCulinary("location_map");
                  setLocationMap(e.target.value);
                }}
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
                  className={`h-32 w-full md:w-56 object-cover rounded border border-gray-200 ${errorCulinary && errorCulinary["image"] ? "border-2 border-red-600" : ""}`}
                />
              ) : (
                <div className="h-32 w-full md:w-56 flex items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 text-sm">
                  Belum ada gambar
                </div>
              )}
              <label className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md ${isLoadingForm ? "cursor-not-allowed" : "cursor pointer"} transition-colors w-fit`}>
                <Upload className="h-4 w-4" />
                <span>{image ? 'Ganti gambar' : 'Unggah gambar'}</span>
                <input
                  disabled={isLoadingForm}
                  required={image ? false : true}
                  type="file"
                  accept="image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    deleteErrorCulinary("image");
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
              <span className="text-red-600 text-sm">{errorCulinary && errorCulinary["image"] && `*${errorCulinary["image"].map(val=>{
                  let message = '';
                  if(val.includes('jpg, jpeg, webp') || val.includes('max')) {
                    message += "Ekstensi gambar tidak sesuai;";
                  }
                  if(val.includes('1024 KB') || val.includes('size')) {
                    message += "Ukuran gambar lebih dari 1 MB;";
                  }
                  return message;
              }).join(" ")}`}
              </span>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Singkat *
              </label>
              <textarea
                disabled={isLoadingForm}
                name="description"
                value={description}
                onChange={(e) => {
                  deleteErrorCulinary("description");
                  setDescription(e.target.value);
                }}
                rows={3}
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""} ${errorCulinary && errorCulinary["description"] ? "border-red-600" : ""}`}
                required
                placeholder="Masukkan deskripsi singkat dari tempat kuliner"
              />
              <span className="text-red-600 text-sm">{errorCulinary && errorCulinary["description"] && `*${errorCulinary["description"].toString().replace("description", "Deskripsi")}`}</span>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Lengkap *
              </label>
              <textarea
                disabled={isLoadingForm}
                name="fullDescription"
                value={fullDescription}
                onChange={(e) => {
                  deleteErrorCulinary("full_description");
                  setFullDescription(e.target.value);
                }}
                rows={5}
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""} ${errorCulinary && errorCulinary["full_description"] ? "border-red-600" : ""}`}
                required
                placeholder="Masukkan deskripsi lengkap dari tempat kuliner"
              />
              <span className="text-red-600 text-sm">{errorCulinary && errorCulinary["full_description"] && `*${errorCulinary["full_description"].toString().replace("full description", "Deskripsi Lengkap")}`}</span>
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
                !specialtiesDeletedTempPreview.find(val => val === item.id) 
                &&
                <div key={index} className="space-y-2 ">
                  <div className="flex items-center space-x-2">
                    <input
                      disabled={isLoadingForm}
                      required
                      type="text"
                      value={item.menu}
                      onChange={(e) => {
                          deleteErrorSpecialtyUpdate(item.id);
                          handleArrayChangeSpecialtiesUpdate(index, e.target.value);
                          if(!specialtiesUpdatedTemp.includes(index)) {
                            addArraySpecialitiesUpdatedTemp(index);
                          }
                      }}
                      className={`flex-1 px-4 py-2 border border-gray-300 rounded-md ${isLoadingForm ? "cursor-not-allowed" : ""} ${errorSpecialtyUpdate.find(val => val.id === item.id && val.errors["menu"]) ? "border-red-600" : ""}`}
                      placeholder="Nama menu spesial"
                    />
                    <button
                      disabled={isLoadingForm}
                      key={`button-speciality-delete-${index}`}
                      type="button"
                      onClick={() => {
                        deleteErrorSpecialtyUpdate(item.id);
                        addArrayDeletedSpecialitiesTemp(item.id);
                      }}
                      className={`text-red-600 hover:text-red-800 ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                    > 
                        <X className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-red-600 text-sm">{errorSpecialtyUpdate[errorSpecialtyUpdate.findIndex(val => val.id === item.id)] && errorSpecialtyUpdate[errorSpecialtyUpdate.findIndex(val => val.id === item.id)]["errors"]["menu"] && `*${errorSpecialtyUpdate[errorSpecialtyUpdate.findIndex(val => val.id === item.id)]["errors"]["menu"]}`.replace('menu','Menu spesial')}</span>
                </div>
              )
            }) 
            }       
            {
              specialties.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      disabled={isLoadingForm}
                      required
                      type="text"
                      value={item.menu}
                      onChange={(e) => {
                        deleteErrorSpecialtyCreate(item.index);
                        handleArrayChangeSpecialties(index, e.target.value);
                      }}
                      className={`flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""} ${errorSpecialtyCreate.find(val => val.index === item.index && val.errors["menu"]) ? "border-red-600" : ""}`}
                      placeholder="Nama menu spesial"
                    />
                    <button
                      disabled={isLoadingForm}
                      type="button"
                      onClick={() => {
                        deleteErrorSpecialtyCreate(item.index);
                        removeArrayItemSpecialties(index);
                      }}
                      className={`text-red-600 hover:text-red-800 ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-red-600 text-sm">{errorSpecialtyCreate[errorSpecialtyCreate.findIndex(val => val.index === item.index)] && errorSpecialtyCreate[errorSpecialtyCreate.findIndex(val => val.index === item.index)]["errors"]["menu"] && `*${errorSpecialtyCreate[errorSpecialtyCreate.findIndex(val => val.index === item.index)]["errors"]["menu"]}`.replace('menu','Menu spesial')}</span>
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
                        newFilesArray.map((val, index) => {
                          setGalleries(prev => [...prev, {index: galleries.length > 0 ? galleries[galleries.length - 1] && galleries[galleries.length - 1]["index"] + index + 1 : index + 1, file: val}]);
                          const objectUrl = URL.createObjectURL(val);
                          setPreviews(prev => [...prev, {index: galleries.length > 0 ? galleries[galleries.length - 1] && previews[previews.length - 1]["index"] + index + 1 : index + 1, filename: objectUrl}]);
                        })
                      } else {
                        addArrayItemGalleries(galleries.length > 0 ? galleries[galleries.length - 1]["index"] + 1 : galleries.length + 1, target.files[0]);
                        const objectUrl = URL.createObjectURL(target.files[0]);
                        setPreviews(prev => [...prev, {index:previews.length > 0 ? previews[previews.length - 1]["index"] + 1 : previews.length + 1, filename: objectUrl}]);
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
                    !galleriesDeletedTempPreview.find(val => val === item.id) &&
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
                      <div key={index}  className="space-y-2">
                        <div className={`relative group rounded-md overflow-hidden border border-gray-200 ${errorGalleryCreate.find(val => val.index === preview.index && val.errors["image"]) ? "border-2 border-red-600" : ""}`}>
                          <img
                            src={preview.filename}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              deleteErrorGalleryCreate(preview.index);
                              removeArrayItemGalleries(preview.index);
                              removeArrayItemGalleriesPreview(preview.index);
                            }}
                            className="absolute top-2 right-2 inline-flex items-center justify-center h-7 w-7 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Hapus gambar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-red-600 text-sm">{errorGalleryCreate[errorGalleryCreate.findIndex(val => val.index === preview.index)] && errorGalleryCreate[errorGalleryCreate.findIndex(val => val.index === preview.index)]["errors"] && `${errorGalleryCreate[errorGalleryCreate.findIndex(val => val.index === preview.index)]["errors"]["image"].map(val => {
                          let message = '';
                          if(val.includes('jpg, jpeg, webp') || val.includes('max')) {
                            message += "Ekstensi gambar tidak sesuai;";
                          }
                          if(val.includes('1024 KB') || val.includes('size')) {
                            message += "Ukuran gambar lebih dari 1 MB;";
                          }
                          return message;
                        }).join(" ")}`}
                      </span>
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
