import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import { useAuth } from '../../../contexts/authContextValue';
import type { AccommodationGallery, RoomTypePayload } from '../../../types/accommodation';
import { ApiError } from '../../../lib/api';
import {
  createAccommodation,
  createAccommodationGallery,
  deleteAccommodationGallery,
  getAccommodation,
  getAccommodations,
  updateAccommodation,
} from '../../../services/accommodationsApi';
import { useApiErrorHandler } from '../../../hooks/useApiErrorHandler';
import { PuffLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { storageUrl } from '../../../utils/storageUrl';

const CATEGORY_OPTIONS = ['resort', 'wisma', 'bungalow', 'homestay', 'villa'];

const emptyRoomType: RoomTypePayload = {
  name: '',
  description: '',
  capacity: 1,
  price: 0,
};

const AccommodationForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { token } = useAuth();
  const handleApiError = useApiErrorHandler();

  // Basic fields
  const [, setIdAccommodation] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [fullDescription, setFullDescription] = useState<string>('');
  const [image, setImage] = useState<File | string | null>(null);
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [location, setLocation] = useState<string>('');
  const [locationMap, setLocationMap] = useState<string>('');
  const [contacs, setContacs] = useState<string>('');
  const [siteUrl, setSiteUrl] = useState<string>('');
  const [facilities, setFacilities] = useState<string[]>(['']);
  const [roomTypes, setRoomTypes] = useState<RoomTypePayload[]>([{ ...emptyRoomType }]);

  // Gallery
  const [galleries, setGalleries] = useState<File[]>([]);
  const [galleriesUpdate, setGalleriesUpdate] = useState<AccommodationGallery[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>([]);

  // Load categories for select
  useEffect(() => {
    getAccommodations({ perPage: 1 })
      .then((result) => setCategories(result.meta.filters.categories))
      .catch(() => setCategories([]));
  }, []);

  const showAccommodation = async (accommodationId: string) => {
    setIsLoading(true);
    getAccommodation(accommodationId)
      .then((res) => {
        setIdAccommodation(res.id);
        setTitle(res.title);
        setDescription(res.description);
        setFullDescription(res.fullDescription);
        setImage(res.image);
        setCategory(res.category);
        setMinPrice(res.minPrice);
        setMaxPrice(res.maxPrice);
        setLocation(res.location);
        setLocationMap(res.location_map ?? '');
        setContacs(res.contacs);
        setSiteUrl(res.siteUrl ?? '');
        setFacilities(res.facilities.length > 0 ? res.facilities : ['']);
        setGalleriesUpdate(res.accomodation_galleries ?? []);
        setRoomTypes(
          res.roomTypes.length > 0
            ? res.roomTypes.map((rt) => ({
                name: rt.name,
                description: rt.description,
                capacity: rt.capacity,
                price: rt.price,
              }))
            : [{ ...emptyRoomType }]
        );
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (isEdit && id) {
      showAccommodation(id);
    }
  }, [isEdit, id]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Build FormData for main accommodation
  const buildFormData = (): FormData => {
    const formBody = new FormData();
    formBody.append('title', title.trim());
    formBody.append('description', description.trim());
    formBody.append('fullDescription', fullDescription.trim());
    if (image instanceof File) {
      formBody.append('image', image);
    }
    formBody.append('category', category.trim());
    formBody.append('minPrice', String(minPrice));
    formBody.append('maxPrice', String(maxPrice));
    formBody.append('location', location.trim());
    formBody.append('location_map', locationMap.trim());
    formBody.append('contacs', contacs.trim());
    if (siteUrl.trim()) formBody.append('siteUrl', siteUrl.trim());

    const cleanedFacilities = facilities.map((f) => f.trim()).filter(Boolean);
    cleanedFacilities.forEach((f, i) => formBody.append(`facilities[${i}]`, f));

    roomTypes.forEach((rt, i) => {
      formBody.append(`roomTypes[${i}][name]`, rt.name.trim());
      formBody.append(`roomTypes[${i}][description]`, rt.description.trim());
      formBody.append(`roomTypes[${i}][capacity]`, String(rt.capacity));
      formBody.append(`roomTypes[${i}][price]`, String(rt.price));
    });

    return formBody;
  };

  const addGalleriesData = (accommodationId: string) => {
    galleries.forEach(async (file) => {
      const formGallery = new FormData();
      formGallery.append('image', file);
      formGallery.append('accomodation_id', accommodationId);
      createAccommodationGallery(formGallery, token as string)
        .then(() => {
          toast.success('Galeri berhasil ditambahkan.');
        })
        .catch((err) => {
          if (err instanceof ApiError) {
            toast.error(`Galeri gagal ditambahkan. Error: ${err.message}`);
          }
        });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Sesi admin tidak valid.');
      return;
    }

    setIsSaving(true);
    const formBody = buildFormData();

    try {
      if (isEdit && id) {
        await updateAccommodation(id, formBody, token);
        toast.success('Akomodasi berhasil diperbarui.');
        addGalleriesData(id);
      } else {
        const res = await createAccommodation(formBody, token);
        toast.success('Akomodasi berhasil ditambahkan.');
        addGalleriesData(res.id);
      }
      navigate('/admin/accommodations', { replace: true });
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Facilities helpers
  const addFacility = () => setFacilities((prev) => [...prev, '']);
  const removeFacility = (index: number) =>
    setFacilities(facilities.filter((_, i) => i !== index));
  const handleFacilityChange = (index: number, value: string) =>
    setFacilities(facilities.map((item, i) => (i === index ? value : item)));

  // Room type helpers
  const addRoom = () => setRoomTypes((prev) => [...prev, { ...emptyRoomType }]);
  const removeRoom = (index: number) =>
    setRoomTypes(roomTypes.filter((_, i) => i !== index));
  const handleRoomChange = (
    index: number,
    field: keyof RoomTypePayload,
    value: string | number
  ) =>
    setRoomTypes(roomTypes.map((room, i) => (i === index ? { ...room, [field]: value } : room)));

  // Gallery helpers (new uploads)
  const addGallerySlot = () => setGalleries((prev) => [...prev, {} as File]);
  const removeGallerySlot = (index: number) =>
    setGalleries(galleries.filter((_, i) => i !== index));
  const handleGalleryChange = (index: number, value: File) =>
    setGalleries(galleries.map((item, i) => (i === index ? value : item)));

  const categoryOptions = [...new Set([...CATEGORY_OPTIONS, ...categories])];
  if (category && !categoryOptions.includes(category)) {
    categoryOptions.push(category);
  }

  return (
    <div className="space-y-6">
      {!isLoading ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/accommodations')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg md:text-2xl font-bold text-gray-800">
                {isEdit ? 'Edit Akomodasi' : 'Tambah Akomodasi'}
              </h1>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Informasi Dasar</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Akomodasi *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    placeholder="cth: Resort Bintang Laut"
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
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Minimum (Rp) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    name="minPrice"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    placeholder="250000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Maksimum (Rp) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    name="maxPrice"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    placeholder="500000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Kontak *
                  </label>
                  <input
                    type="text"
                    name="contacs"
                    value={contacs}
                    onChange={(e) => setContacs(e.target.value)}
                    placeholder="cth: +62 8123 4567 890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Website
                  </label>
                  <input
                    type="url"
                    name="siteUrl"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    placeholder="https://www.example.com"
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
                  URL Lokasi Map
                </label>
                <textarea
                  name="location_map"
                  value={locationMap}
                  onChange={(e) => setLocationMap(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="cth: https://www.google.com/maps/embed?pb=!1m18!1m12!..."
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar Utama *
                </label>
                {(preview || (isEdit && image)) ? (
                  <img
                    src={preview ? preview : storageUrl(image as string)}
                    className="mb-4 w-64 rounded-md object-cover"
                    alt="Preview gambar utama"
                  />
                ) : null}
                <input
                  type="file"
                  name="image"
                  accept="image/jpeg,image/webp"
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement & { files: FileList };
                    setImage(target.files[0]);
                    const objectUrl = URL.createObjectURL(target.files[0]);
                    setPreview(objectUrl);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required={!image}
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
                  placeholder="Masukkan deskripsi singkat dari akomodasi"
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
                  placeholder="Masukkan deskripsi lengkap dari akomodasi"
                />
              </div>
            </div>

            {/* Facilities */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Fasilitas</h2>
                <button
                  type="button"
                  onClick={addFacility}
                  className="text-primary hover:text-primary-dark flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </button>
              </div>

              <div className="space-y-3">
                {facilities.map((facility, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={facility}
                      onChange={(e) => handleFacilityChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Nama fasilitas"
                    />
                    {facilities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFacility(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Room Types */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Tipe Kamar</h2>
                <button
                  type="button"
                  onClick={addRoom}
                  className="text-primary hover:text-primary-dark flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Kamar
                </button>
              </div>

              <div className="space-y-6">
                {roomTypes.map((room, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-800">Kamar {index + 1}</h3>
                      {roomTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoom(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Tipe Kamar *
                        </label>
                        <input
                          type="text"
                          value={room.name}
                          onChange={(e) => handleRoomChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Kamar Standard"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Harga per Malam (Rp) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={room.price}
                          onChange={(e) => handleRoomChange(index, 'price', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="250000"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kapasitas (orang) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={room.capacity}
                          onChange={(e) =>
                            handleRoomChange(index, 'capacity', Number(e.target.value))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="2"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi Kamar *
                      </label>
                      <textarea
                        value={room.description}
                        onChange={(e) => handleRoomChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Deskripsi fasilitas dan kenyamanan kamar"
                        rows={2}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Galeri</h2>
                <button
                  type="button"
                  onClick={addGallerySlot}
                  className="text-primary hover:text-primary-dark flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </button>
              </div>

              {/* Existing galleries (edit mode) */}
              {isEdit && galleriesUpdate.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-5 border border-gray-300 rounded-md mb-4 p-3"
                >
                  <div className="flex gap-4 items-center">
                    <img
                      src={storageUrl(item.image)}
                      className="h-16 w-16 object-cover rounded"
                      alt={`Galeri ${index + 1}`}
                    />
                    <span className="font-semibold">{`Galeri ${index + 1}`}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoading(true);
                      deleteAccommodationGallery(item.id, token as string)
                        .then(() => {
                          toast.success('Galeri berhasil dihapus.');
                          showAccommodation(id!);
                        })
                        .catch((err) => {
                          if (err instanceof ApiError) {
                            toast.error(`Galeri gagal dihapus. Error: ${err.message}`);
                          }
                          setIsLoading(false);
                        });
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {isEdit && galleries.length >= 1 && (
                <p className="font-semibold text-md pt-2 mb-3">Tambah Galeri Baru</p>
              )}

              {/* New gallery file inputs */}
              <div className="space-y-3">
                {galleries.map((_, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/webp"
                      onChange={(e) => {
                        const target = e.target as HTMLInputElement & { files: FileList };
                        handleGalleryChange(index, target.files[0]);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-full"
                    />
                    {galleries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGallerySlot(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/accommodations')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-md flex items-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <PuffLoader
            color={'#4B5563'}
            loading={isLoading}
            size={40}
            className="mb-6"
          />
          <p className="text-gray-600 text-lg">Memuat data akomodasi...</p>
        </div>
      )}
    </div>
  );
};

export default AccommodationForm;