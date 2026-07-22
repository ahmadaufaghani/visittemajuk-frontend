import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X, Pen, Check, Ban } from 'lucide-react';
import { useAuth } from '../../../contexts/authContextValue';
import type {
  Specialty,
  Gallery,
  Culinary,
} from '../../../types/culinary';
import { ApiError } from '../../../lib/api';
import { createCulinary, createGallery, createSpeciality, deleteGallery, deleteSpeciality, getCulinary, updateCulinary, updateSpeciality } from '../../../services/culinariesApi';
import { PuffLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { storageUrl } from '../../../utils/storageUrl';

const CulinaryForm: React.FC = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const user = useAuth();
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
  const [specialtiesUpdate, setSpecialitiesUpdate] = useState<Specialty[]>([]);
  const [galleriesUpdate, setGalleriesUpdate] = useState<Gallery[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [editSpecialtyId, setEditSpecialtyId] = useState<number>(0);
  const categories = ['Seafood', 'Indonesia', 'Kafe', 'Lokal', 'Tradisional'];


  const showCulinary = async (id: number) => {
      setIsLoading(true);
      getCulinary(String(id)).then(res => {
        setIdCulinary(res.id);
        setTitle(res.title);
        setDescription(res.description);
        setFullDescription(res.full_description);
        setImage(res.image);
        setCategory(res.category);
        setPrice(res.price);
        setLocation(res.location);
        setLocationMap(res.location_map);
        setOpenHours(res.open_hours);
        setContact(res.contact || '');
        setSpecialitiesUpdate(res.specialties);
        setGalleriesUpdate(res.culinary_galleries);
        setIsLoading(false);
      }).catch(err => {
        console.error(err);
      })
  }

  useEffect(() => {
    if (isEdit && id) {
      showCulinary(Number(id));
    }
  }, [isEdit, id]);

  const addCulinaryData = async () => {
      const formBody = new FormData();
      formBody.append("title",title);
      formBody.append("description",description);
      formBody.append("full_description",fullDescription);
      formBody.append("image",image!);
      formBody.append("category",category);
      formBody.append("price",price);
      formBody.append("location",location);
      formBody.append("location_map",locationMap);
      formBody.append("open_hours",openHours);
      formBody.append("contact",contact);

      createCulinary(formBody,user.token as string)
      .then((res: Culinary ) => {
        toast.success("Kuliner berhasil ditambahkan.")
        addSpecialtiesData(res.id);
        addGalleriesData(res.id);
      })
      .catch(err => {
        if(err instanceof ApiError) {
          toast.error(`Kuliner gagal ditambahkan. Error : ${err.message}`);
          console.error(err.errors);
        }
      });

  }

  const addSpecialtiesData = (id: number) => {
      specialties.map(async (val) => {
        createSpeciality({menu: val, culinary_id: id}, user.token as string)
        .then(()=>{
          toast.success("Menu spesial berhasil ditambahkan.");
        })
        .catch(err => {
          if(err instanceof ApiError) {
            toast.error(`Menu spesial gagal ditambahkan. Error ${err.message}`);
            console.error(err.errors);
          }
        })
      });
  }

  const addGalleriesData = (id: number) => {
      galleries.map(async (val) => {
        const formGallery = new FormData();
        formGallery.append("image",val);
        formGallery.append("culinary_id",String(id));
        createGallery(formGallery, user.token as string)
        .then(()=> {
          toast.success("Galeri berhasil ditambahkan.");
        })
        .catch(err => {
          if(err instanceof ApiError) {
            toast.error(`Galeri gagal ditambahkan. Error : ${err.message}`);
            console.error(err.errors);
          }
        })
      });

  }

  const updateCulinaryData = async (id : number) => {
    const formBody = new FormData();
    formBody.append("title",title);
    formBody.append("description",description);
    formBody.append("full_description",fullDescription);
    formBody.append("image",image!);
    formBody.append("category",category);
    formBody.append("price",price);
    formBody.append("location",location);
    formBody.append("location_map",locationMap);
    formBody.append("open_hours",openHours);
    formBody.append("contact",contact);

    updateCulinary(id, formBody, user.token as string)
    .then(() => {
      toast.success("Kuliner berhasil diperbarui.");
      addSpecialtiesData(idCulinary);
      addGalleriesData(idCulinary);
      })
    .catch(err => {
      if(err instanceof ApiError) {
        toast.error(`Kuliner gagal diperbarui. Error : ${err.message}`);
        console.error(err.errors);
      }
    });
  }

  const addArrayItemSpecialties = () => {
    setSpecialities(prev => [...prev, '']);
  }

  const addArrayItemGalleries = () => {
    setGalleries(prev => [...prev, {} as File]);
  }

  const handleArrayChangeSpecialties = (index: number, value: string) => {
    setSpecialities(specialties.map((item, i) => i === index ? value : item));
  };

  const handleArrayChangeSpecialtiesUpdate = (index: number, key: string, value: string) => {
    setSpecialitiesUpdate(specialtiesUpdate.map((item, i) => i === index ? {...item, [key]:value} : item));
  };

  const handleArrayChangeGallery = (index: number, value: File) => {
    setGalleries(galleries.map((item, i) => i === index ? value : item));
  };

  const removeArrayItemSpecialties = (index: number) => {
    setSpecialities(specialties.filter((_, i) => i != index));
  }
  const removeArrayItemGalleries = (index: number) => {
    setGalleries(galleries.filter((_, i) => i != index));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(id) {
      updateCulinaryData(Number(id));    
      navigate('/admin/culinary', {replace : true});
    } else {
      addCulinaryData();
      navigate('/admin/culinary', {replace : true});
    }
  };

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

                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  placeholder="cth: Rumah Makan Sari Rasa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select

                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
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

                  type="text"
                  name="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="cth: Rp 25.000 - Rp 100.000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Buka *
                </label>
                <input

                  type="text"
                  name="openHours"
                  value={openHours}
                  onChange={(e) => setOpenHours(e.target.value)}
                  placeholder="cth: 11.00 - 21.00 WIB"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon *
                </label>
                <input

                  type="text"
                  name="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="cth: +62 8123 4567 890"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat *
              </label>
              <textarea
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                placeholder="cth: Jl. Utama Temajuk No. 25, Desa Temajuk, Kecamatan Paloh, Kabupaten Sambas"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Url Lokasi Map *
              </label>
              <textarea
                name="location"
                value={locationMap}
                onChange={(e) => setLocationMap(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                placeholder="cth: https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127601.4652245904!2d109.52879789999999!3d1..."
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Utama *
              </label>
              {preview || id && image ? 
                <img
                  src={preview ? preview : storageUrl(image as string)}
                  className='mb-4 w-64'
                />
                :
                <></>
              }
              <input
                type="file"
                name="image"
                accept="image/jpeg,image/webp"
                onChange={(e) => {

                  const target = e.target as HTMLInputElement & {
                    files : FileList;
                  }
                  setImage(target.files[0]);
                  const objectUrl = URL.createObjectURL(target.files[0]);
                  setPreview(objectUrl);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required={image ? false : true}
              />
              <div>
                <span className="text-xs text-red-700">*ext: .jpg, .jpeg, .webp; max: 1 MB</span>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Singkat *
              </label>
              <textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                placeholder="Masukkan deskripsi singkat dari tempat kuliner"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Lengkap *
              </label>
              <textarea
                name="fullDescription"
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
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
                type="button"
                onClick={() => addArrayItemSpecialties()}
                className="text-primary hover:text-primary-dark flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </button>
            </div>
            
            <div className="space-y-3">
            {
              id && specialtiesUpdate.map((item, index) => {
              return (
              <div key={index} className="flex items-center space-x-2 ">
                <input
                  disabled={!(item.id === editSpecialtyId)}
                  type="text"
                  value={item.menu}
                  onChange={(e) => handleArrayChangeSpecialtiesUpdate(index, "menu", e.target.value)}
                  className={`flex-1 px-4 py-2 border border-gray-300 rounded-md ${item.id === editSpecialtyId ? "" : "cursor-not-allowed"}`}
                  placeholder="Nama menu spesial"
                />
                <button
                      key={`button-speciality-edit-${index}`}
                      type="button"
                      onClick={() => {
                        setEditSpecialtyId(prev => prev === item.id ? 0 : item.id);
                        if(item.id === editSpecialtyId) {
                          setIsLoading(true);
                          updateSpeciality(item.id, specialtiesUpdate[index], user.token as string)
                          .then(()=>{
                            toast.success("Menu spesial berhasil diperbarui.");
                            showCulinary(Number(id));
                          })
                          .catch(err => {
                            if(err instanceof ApiError) {
                              toast.error(`Menu spesial gagal diperbarui. Error : ${err.message}`);
                              console.error(err.errors);
                            }
                          })
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {item.id === editSpecialtyId ? <Check className="h-3 w-3"/> : <Pen className="h-3 w-3" />}
                </button>
                <button
                      key={`button-speciality-delete-${index}`}
                      type="button"
                      onClick={() => {
                        if(item.id === editSpecialtyId) {
                          setEditSpecialtyId(0);
                        } else {
                          setIsLoading(true);
                          deleteSpeciality(item.id,user.token as string)
                          .then(() => {
                            toast.success("Menu spesial berhasil dihapus.");
                            showCulinary(Number(id));
                          }).catch(err => {
                            if(err instanceof ApiError) {
                              toast.error(`Menu spesial gagal dihapus. Error: ${err.message}`);
                              console.error(err.errors);
                            }
                          });
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      {item.id === editSpecialtyId ? <Ban className="h-3 w-3"/> : <X className="h-4 w-4" />}
                </button>
              </div>)
              }) 
            }
            {id && specialties.length >= 1 && <p className="font-semibold text-md pt-4">Tambah Menu Baru</p>}
            {
              specialties.map((specialty, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => handleArrayChangeSpecialties(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nama menu spesial"
                  />
                  {specialties.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItemSpecialties(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
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
              <button
                type="button"
                onClick={() => addArrayItemGalleries()}
                className="text-primary hover:text-primary-dark flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </button>
            </div>

            {id && galleriesUpdate.map((item,index) => {
            return (
                  <div key={index} className="flex items-center justify-between gap-5 border border-1 border-gray-300 rounded-md mb-4 p-3">
                    <div className="flex gap-4 items-center">
                      <img src={storageUrl(item.image)} className="h-16 w-16 object-cover" alt="" />
                      <span className='font-semibold'>{`Galeri ${index+1}`}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoading(true);
                        deleteGallery(item.id,user.token as string)
                        .then(() => {
                          toast.success("Galeri berhasil dihapus.");
                          showCulinary(Number(id));
                        }).catch(err => {
                          if(err instanceof ApiError) {
                            toast.error(`Galeri gagal dihapus. Error : ${err.message}`);
                            console.error(err.errors);
                          }
                        });
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )
            })}
            {id && galleries.length >= 1 && <p className="font-semibold text-md pt-4 mb-3">Tambah Galeri Baru</p>}
            <div className="space-y-3">
              {galleries.map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/webp"
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement & {
                        files : FileList;
                      }
                      handleArrayChangeGallery(index, target.files[0]);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-full"
                  />
                  {galleries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItemGalleries(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/culinary')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-md flex items-center transition-colors duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Update' : 'Simpan'}
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
      {/* Header */}
  </div>)
}

export default CulinaryForm;
