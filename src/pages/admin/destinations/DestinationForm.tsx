import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContextValue';
import {
  createDestination,
  getDestination,
  getDestinations,
  updateDestination,
} from '../../../services/destinationsApi';
import type { DestinationPayload, DestinationGalleryImage } from '../../../types/destination';
import { storageUrl } from '../../../utils/storageUrl';
import { useApiErrorHandler } from '../../../hooks/useApiErrorHandler';
import { Save, ArrowLeft, Plus, X, Upload, ImagePlus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyFormData: DestinationPayload = {
  title: '',
  description: '',
  fullDescription: '',
  category: '',
  price: '',
  location: '',
  locationMap: '',
  openHours: '',
  facilities: [''],
  activities: [''],
  tips: [''],
  image: null,
};

const fallbackCategoryOptions = ['Pantai', 'Monumen', 'Alam', 'Teluk', 'Air Terjun'];

const cleanItems = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);

const DestinationForm: React.FC = () => {
  const { slug: id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoadedDestination, setHasLoadedDestination] = useState(!isEdit);
  const [categories, setCategories] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Gallery states
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGalleries, setExistingGalleries] = useState<DestinationGalleryImage[]>([]);
  const [removedGalleryIds, setRemovedGalleryIds] = useState<number[]>([]);

  const [formData, setFormData] = useState<DestinationPayload>(emptyFormData);
  const handleApiError = useApiErrorHandler();

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
      setImagePreview(null);
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
    setImagePreview(null);

    getDestination(id)
      .then((destination) => {
        if (!isActive) {
          return;
        }

        setFormData({
          title: destination.title,
          description: destination.description,
          fullDescription: destination.fullDescription,
          category: destination.category,
          price: destination.price,
          location: destination.location,
          locationMap: destination.locationMap ?? '',
          openHours: destination.openHours,
          facilities: destination.facilities,
          activities: destination.activities,
          tips: destination.tips,
          image: null,
        });
        setImagePreview(storageUrl(destination.image));
        setExistingGalleries(destination.galleries ?? []);
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayChange = (field: 'facilities' | 'activities' | 'tips', index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field: 'facilities' | 'activities' | 'tips') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field: 'facilities' | 'activities' | 'tips', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  // Gallery handlers
  const handleGalleryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const newFiles = Array.from(files);
    setGalleryFiles((prev) => [...prev, ...newFiles]);

    // Create previews
    newFiles.forEach((file) => {
      const preview = URL.createObjectURL(file);
      setGalleryPreviews((prev) => [...prev, preview]);
    });
  };

  const removeGalleryFile = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingGallery = (galleryId: number) => {
    setExistingGalleries((prev) => prev.filter((g) => g.id !== galleryId));
    setRemovedGalleryIds((prev) => [...prev, galleryId]);
  };

  const destinationPayload = (): DestinationPayload => ({
    ...formData,
    title: formData.title.trim(),
    description: formData.description.trim(),
    fullDescription: formData.fullDescription.trim(),
    category: formData.category.trim(),
    price: formData.price.trim(),
    location: formData.location.trim(),
    locationMap: formData.locationMap?.trim(),
    openHours: formData.openHours.trim(),
    facilities: cleanItems(formData.facilities),
    activities: cleanItems(formData.activities),
    tips: cleanItems(formData.tips),
    gallery: galleryFiles.length > 0 ? galleryFiles : undefined,
    removedGalleryIds: removedGalleryIds.length > 0 ? removedGalleryIds : undefined,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

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
        toast.success('Destinasi berhasil diperbarui.');
      } else {
        await createDestination(destinationPayload(), token);
        toast.success('Destinasi berhasil ditambahkan.');
      }

      navigate('/admin/destinations');
    } catch (saveError) {
      handleApiError(saveError);
      setError('Gagal menyimpan destinasi.');
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

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      ) : null}

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
                  {categoryOptions.map((cat) => (
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
                Link Google Maps
              </label>
              <input
                type="url"
                name="locationMap"
                value={formData.locationMap ?? ''}
                onChange={handleInputChange}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Opsional. Link Google Maps untuk menampilkan peta lokasi.</p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Utama{!isEdit ? ' *' : ''}
              </label>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Pratinjau gambar utama"
                    className="h-32 w-full md:w-56 object-cover rounded border border-gray-200"
                  />
                ) : (
                  <div className="h-32 w-full md:w-56 flex items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 text-sm">
                    Belum ada gambar
                  </div>
                )}
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>{formData.image ? 'Ganti gambar' : 'Unggah gambar'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
                {!isEdit ? (
                  <p className="text-xs text-gray-500">Wajib diisi untuk destinasi baru. Maks 1 MB. Format: JPG, JPEG, WebP.</p>
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

          {(['facilities', 'activities', 'tips'] as const).map((field) => (
            <div key={field} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {field === 'facilities' && 'Fasilitas'}
                  {field === 'activities' && 'Aktivitas'}
                  {field === 'tips' && 'Tips Kunjungan'}
                </h2>
                <button
                  type="button"
                  onClick={() => addArrayItem(field)}
                  className="text-primary hover:text-primary-dark flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </button>
              </div>

              <div className="space-y-3">
                {formData[field].map((value, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    {field === 'tips' ? (
                      <textarea
                        value={value}
                        onChange={(event) => handleArrayChange(field, index, event.target.value)}
                        rows={2}
                        placeholder="Tips untuk pengunjung"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(event) => handleArrayChange(field, index, event.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={field === 'facilities' ? 'Nama fasilitas' : 'Nama aktivitas'}
                      />
                    )}
                    {formData[field].length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(field, index)}
                        className={`text-red-600 hover:text-red-800 ${field === 'tips' ? 'mt-2' : ''}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Gallery Section - Inline */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Galeri Destinasi</h2>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer transition-colors">
                <ImagePlus className="h-4 w-4" />
                <span>Tambah Gambar</span>
                <input
                  type="file"
                  accept="image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleGalleryChange}
                  multiple
                />
              </label>
            </div>

            {/* Existing galleries (edit mode) */}
            {isEdit && existingGalleries.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Gambar yang sudah ada:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingGalleries.map((gallery) => (
                    <div key={gallery.id} className="relative group rounded-md overflow-hidden border border-gray-200">
                      <img
                        src={storageUrl(gallery.image)}
                        alt={`Galeri ${gallery.sort_order + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingGallery(gallery.id)}
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

            {/* New gallery previews */}
            {galleryPreviews.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Gambar baru yang akan ditambahkan:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative group rounded-md overflow-hidden border border-gray-200">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryFile(index)}
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
            {(!isEdit || existingGalleries.length === 0) && galleryPreviews.length === 0 && (
              <p className="text-gray-500 text-sm">
                Belum ada gambar di galeri. Klik "Tambah Gambar" untuk menambahkan gambar.
              </p>
            )}

            <p className="text-xs text-gray-500 mt-2">Maks 1 MB per gambar. Format: JPG, JPEG, WebP.</p>
          </div>

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
