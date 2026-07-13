import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContextValue';
import {
  createAccommodation,
  getAccommodation,
  getAccommodations,
  updateAccommodation,
} from '../../../services/accommodationsApi';
import { ApiError } from '../../../lib/api';
import type { AccommodationPayload, RoomTypePayload } from '../../../types/accommodation';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_OPTIONS = ['resort', 'wisma', 'bungalow', 'homestay', 'villa'];

const emptyRoomType: RoomTypePayload = {
  name: '',
  description: '',
  capacity: 1,
  price: 0,
};

const emptyFormData: AccommodationPayload = {
  title: '',
  description: '',
  fullDescription: '',
  imageUrl: '',
  category: '',
  minPrice: 0,
  maxPrice: 0,
  location: '',
  contacs: '',
  siteUrl: '',
  facilities: [''],
  gallery: [''],
  roomTypes: [{ ...emptyRoomType }],
};

const cleanItems = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);

const clearCustomValidity = (event: React.FormEvent<HTMLInputElement>) =>
  event.currentTarget.setCustomValidity('');

const AccommodationForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { token } = useAuth();

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoadedAccommodation, setHasLoadedAccommodation] = useState(!isEdit);
  const [categories, setCategories] = useState<string[]>([]);

  const [formData, setFormData] = useState<AccommodationPayload>(emptyFormData);

  useEffect(() => {
    let isActive = true;

    getAccommodations({ perPage: 1 })
      .then((result) => {
        if (isActive) {
          setCategories(result.meta.filters.categories);
        }
      })
      .catch(() => {
        if (isActive) {
          setCategories([]);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    if (!isEdit || !id) {
      setIsLoading(false);
      setFormData(emptyFormData);
      setLoadError(null);
      setHasLoadedAccommodation(true);
      return () => {
        isActive = false;
      };
    }

    setIsLoading(true);
    setError(null);
    setLoadError(null);
    setHasLoadedAccommodation(false);
    setFormData(emptyFormData);

    getAccommodation(id)
      .then((accommodation) => {
        if (!isActive) {
          return;
        }

        setFormData({
          title: accommodation.title,
          description: accommodation.description,
          fullDescription: accommodation.fullDescription,
          imageUrl: accommodation.imageUrl,
          category: accommodation.category,
          minPrice: accommodation.minPrice,
          maxPrice: accommodation.maxPrice,
          location: accommodation.location,
          contacs: accommodation.contacs,
          siteUrl: accommodation.siteUrl,
          facilities: accommodation.facilities.length > 0 ? accommodation.facilities : [''],
          gallery: accommodation.gallery.length > 0 ? accommodation.gallery : [''],
          roomTypes: accommodation.roomTypes.length > 0
            ? accommodation.roomTypes.map((rt) => ({
              name: rt.name,
              description: rt.description,
              capacity: rt.capacity,
              price: rt.price,
            }))
            : [{ ...emptyRoomType }],
        });
        setHasLoadedAccommodation(true);
      })
      .catch(() => {
        if (isActive) {
          setLoadError('Akomodasi belum dapat dimuat. Silakan kembali ke daftar akomodasi dan coba lagi.');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [isEdit, id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (
    field: 'facilities' | 'gallery',
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field: 'facilities' | 'gallery') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ''],
    }));
  };

  const removeArrayItem = (field: 'facilities' | 'gallery', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const handleRoomChange = (
    index: number,
    field: keyof RoomTypePayload,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      roomTypes: prev.roomTypes.map((room, i) =>
        i === index ? { ...room, [field]: value } : room
      ),
    }));
  };

  const addRoom = () => {
    setFormData((prev) => ({
      ...prev,
      roomTypes: [...prev.roomTypes, { ...emptyRoomType }],
    }));
  };

  const removeRoom = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      roomTypes: prev.roomTypes.filter((_, i) => i !== index),
    }));
  };

  const buildPayload = (): AccommodationPayload => ({
    ...formData,
    facilities: cleanItems(formData.facilities),
    gallery: cleanItems(formData.gallery),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Sesi admin tidak valid.');
      return;
    }

    if (isEdit && !hasLoadedAccommodation) {
      setLoadError('Data awal akomodasi belum berhasil dimuat. Update dibatalkan agar data tidak tertimpa.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (isEdit && id) {
        await updateAccommodation(id, buildPayload(), token);
        toast.success('Akomodasi berhasil diperbarui.');
      } else {
        await createAccommodation(buildPayload(), token);
        toast.success('Akomodasi berhasil ditambahkan.');
      }

      navigate('/admin/accommodations');
    } catch (saveError) {
      if (saveError instanceof ApiError) {
        const firstError = saveError.errors
          ? Object.values(saveError.errors).flat()[0]
          : undefined;

        const message = firstError ?? saveError.message;
        setError(message);
        toast.error(message);
        return;
      }

      setError('Akomodasi belum dapat disimpan.');
      toast.error('Gagal menyimpan akomodasi. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const categoryOptions = [...new Set([...CATEGORY_OPTIONS, ...categories])];
  if (formData.category && !categoryOptions.includes(formData.category)) {
    categoryOptions.push(formData.category);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/accommodations')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEdit ? 'Edit Akomodasi' : 'Tambah Akomodasi'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Memuat akomodasi...</p>
        </div>
      ) : isEdit && loadError ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-red-700 mb-4">{loadError}</p>
          <button
            type="button"
            onClick={() => navigate('/admin/accommodations')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Akomodasi
          </button>
        </div>
      ) : (
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
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
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
                  value={formData.minPrice}
                  onChange={handleInputChange}
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
                  value={formData.maxPrice}
                  onChange={handleInputChange}
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
                  value={formData.contacs}
                  onChange={handleInputChange}
                  placeholder="+62 8123 4567 890"
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
                  value={formData.siteUrl}
                  onChange={handleInputChange}
                  onInput={clearCustomValidity}
                  onInvalid={(event) =>
                    event.currentTarget.setCustomValidity('Masukkan URL website yang valid.')
                  }
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
                value={formData.location}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Gambar Utama *
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                onInput={clearCustomValidity}
                onInvalid={(event) =>
                  event.currentTarget.setCustomValidity('Masukkan URL gambar utama yang valid.')
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Singkat *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Lengkap *
              </label>
              <textarea
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Fasilitas</h2>
              <button
                type="button"
                onClick={() => addArrayItem('facilities')}
                className="text-primary hover:text-primary-dark flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </button>
            </div>

            <div className="space-y-3">
              {formData.facilities.map((facility, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={facility}
                    onChange={(e) => handleArrayChange('facilities', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nama fasilitas"
                  />
                  {formData.facilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('facilities', index)}
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
              {formData.roomTypes.map((room, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">Kamar {index + 1}</h3>
                    {formData.roomTypes.length > 1 && (
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
                        onChange={(e) => handleRoomChange(index, 'capacity', Number(e.target.value))}
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
                onClick={() => addArrayItem('gallery')}
                className="text-primary hover:text-primary-dark flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </button>
            </div>

            <div className="space-y-3">
              {formData.gallery.map((image, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleArrayChange('gallery', index, e.target.value)}
                    onInput={clearCustomValidity}
                    onInvalid={(event) =>
                      event.currentTarget.setCustomValidity('Masukkan URL gambar galeri yang valid.')
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.gallery.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('gallery', index)}
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
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-md flex items-center transition-colors duration-200 disabled:opacity-60"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AccommodationForm;