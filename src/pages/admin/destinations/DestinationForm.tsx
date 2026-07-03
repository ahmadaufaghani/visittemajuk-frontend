import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContextValue';
import {
  createDestination,
  getDestination,
  getDestinations,
  updateDestination,
} from '../../../services/destinationsApi';
import { ApiError } from '../../../lib/api';
import type { DestinationPayload } from '../../../types/destination';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';

const emptyFormData: DestinationPayload = {
  title: '',
  description: '',
  fullDescription: '',
  imageUrl: '',
  category: '',
  price: '',
  location: '',
  openHours: '',
  facilities: [''],
  activities: [''],
  tips: [''],
  gallery: ['']
};

const fallbackCategoryOptions = ['Pantai', 'Monumen', 'Alam', 'Teluk', 'Air Terjun'];

const cleanItems = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);

const clearCustomValidity = (
  event: React.FormEvent<HTMLInputElement>
) => event.currentTarget.setCustomValidity('');

const DestinationForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoadedDestination, setHasLoadedDestination] = useState(!isEdit);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<DestinationPayload>(emptyFormData);

  useEffect(() => {
    let isActive = true;

    getDestinations({ perPage: 1 })
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
      setHasLoadedDestination(true);
      return () => {
        isActive = false;
      };
    }

    setIsLoading(true);
    setError(null);
    setLoadError(null);
    setHasLoadedDestination(false);
    setFormData(emptyFormData);

    getDestination(id)
      .then((destination) => {
        if (!isActive) {
          return;
        }

        setFormData({
          title: destination.title,
          description: destination.description,
          fullDescription: destination.fullDescription,
          imageUrl: destination.imageUrl,
          category: destination.category,
          price: destination.price,
          location: destination.location,
          openHours: destination.openHours,
          facilities: destination.facilities,
          activities: destination.activities,
          tips: destination.tips,
          gallery: destination.gallery
        });
        setHasLoadedDestination(true);
      })
      .catch(() => {
        if (isActive) {
          setLoadError('Destinasi belum dapat dimuat. Silakan kembali ke daftar destinasi dan coba lagi.');
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field: 'facilities' | 'activities' | 'tips' | 'gallery', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'facilities' | 'activities' | 'tips' | 'gallery') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'facilities' | 'activities' | 'tips' | 'gallery', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const destinationPayload = (): DestinationPayload => ({
    ...formData,
    facilities: cleanItems(formData.facilities),
    activities: cleanItems(formData.activities),
    tips: cleanItems(formData.tips),
    gallery: cleanItems(formData.gallery)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Sesi admin tidak valid.');
      return;
    }

    if (isEdit && !hasLoadedDestination) {
      setLoadError('Data awal destinasi belum berhasil dimuat. Update dibatalkan agar data tidak tertimpa.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (isEdit && id) {
        await updateDestination(id, destinationPayload(), token);
      } else {
        await createDestination(destinationPayload(), token);
      }

      navigate('/admin/destinations');
    } catch (saveError) {
      if (saveError instanceof ApiError) {
        const firstError = saveError.errors
          ? Object.values(saveError.errors).flat()[0]
          : undefined;

        setError(firstError ?? saveError.message);
        return;
      }

      setError('Destinasi belum dapat disimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  const categoryOptions = [...new Set([...fallbackCategoryOptions, ...categories])];

  if (formData.category && !categoryOptions.includes(formData.category)) {
    categoryOptions.push(formData.category);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/destinations')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEdit ? 'Edit Destinasi' : 'Tambah Destinasi'}
          </h1>
        </div>
      </div>

      {/* Form */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Memuat destinasi...</p>
        </div>
      ) : isEdit && loadError ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-red-700 mb-4">{loadError}</p>
          <button
            type="button"
            onClick={() => navigate('/admin/destinations')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Destinasi
          </button>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informasi Dasar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Destinasi *
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
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga Tiket *
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Rp 10.000"
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
                value={formData.openHours}
                onChange={handleInputChange}
                placeholder="08.00 - 17.00 WIB"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
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
              onInvalid={(event) => event.currentTarget.setCustomValidity('Masukkan URL gambar utama yang valid.')}
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

        {/* Activities */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Aktivitas</h2>
            <button
              type="button"
              onClick={() => addArrayItem('activities')}
              className="text-primary hover:text-primary-dark flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.activities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={activity}
                  onChange={(e) => handleArrayChange('activities', index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nama aktivitas"
                />
                {formData.activities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('activities', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Tips Kunjungan</h2>
            <button
              type="button"
              onClick={() => addArrayItem('tips')}
              className="text-primary hover:text-primary-dark flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.tips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-2">
                <textarea
                  value={tip}
                  onChange={(e) => handleArrayChange('tips', index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Tips untuk pengunjung"
                  rows={2}
                />
                {formData.tips.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('tips', index)}
                    className="text-red-600 hover:text-red-800 mt-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
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
                  onInvalid={(event) => event.currentTarget.setCustomValidity('Masukkan URL gambar galeri yang valid.')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="URL gambar"
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

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/destinations')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-md flex items-center transition-colors duration-200"
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

export default DestinationForm;
