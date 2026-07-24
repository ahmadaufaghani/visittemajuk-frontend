import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../../../contexts/authContextValue';
import { ApiError } from '../../../lib/api';
import {
  createPhotoSpot,
  createPhotoSpotGallery,
  deletePhotoSpotGallery,
  getPhotoSpot,
  updatePhotoSpot,
} from '../../../services/photoSpotsApi';
import { useApiErrorHandler } from '../../../hooks/useApiErrorHandler';
import type { PhotoSpotGallery } from '../../../types/photoSpot';
import { PuffLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { storageUrl } from '../../../utils/storageUrl';

const PhotoSpotForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { token } = useAuth();
  const handleApiError = useApiErrorHandler();

  const categoryOptions = ['Pantai', 'Alam', 'Pegunungan', 'Landmark', 'Teluk'];

  const [photoSpotId, setPhotoSpotId] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [fullDescription, setFullDescription] = useState<string>('');
  const [image, setImage] = useState<File | string | null>(null);
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string>('');
  const [bestHour, setBestHour] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [locationMap, setLocationMap] = useState<string>('');
  const [nearestAttraction, setNearestAttraction] = useState<string[]>(['']);
  const [galleries, setGalleries] = useState<File[]>([]);
  const [galleriesUpdate, setGalleriesUpdate] = useState<PhotoSpotGallery[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const showPhotoSpot = async (photoSpotIdValue: string) => {
    setIsLoading(true);
    getPhotoSpot(photoSpotIdValue)
      .then((res) => {
        setPhotoSpotId(res.id);
        setTitle(res.title);
        setDescription(res.description);
        setFullDescription(res.full_description);
        setImage(res.image);
        setCategory(res.category);
        setBestHour(res.bestHour);
        setLocation(res.location);
        setLocationMap(res.location_map ?? '');
        setNearestAttraction(res.nearestAttraction.length > 0 ? res.nearestAttraction : ['']);
        setGalleriesUpdate(res.photo_spot_galleries ?? []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (isEdit && id) {
      showPhotoSpot(id);
    }
  }, [isEdit, id]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const appendArrayField = (formBody: FormData, name: string, values: string[]) => {
    values.forEach((value, index) => {
      formBody.append(`${name}[${index}]`, value);
    });
  };

  const buildFormBody = (): FormData => {
    const formBody = new FormData();
    formBody.append('title', title.trim());
    formBody.append('description', description.trim());
    formBody.append('full_description', fullDescription.trim());
    if (image instanceof File) {
      formBody.append('image', image);
    }
    formBody.append('category', category.trim());
    formBody.append('bestHour', bestHour.trim());
    formBody.append('location', location.trim());
    formBody.append('location_map', locationMap.trim());
    appendArrayField(
      formBody,
      'nearestAttraction',
      nearestAttraction.map((value) => value.trim()).filter(Boolean)
    );

    return formBody;
  };

  const addGalleriesData = (spotId: number) => {
    galleries.forEach((file) => {
      if (!(file instanceof File)) {
        return;
      }

      const formGallery = new FormData();
      formGallery.append('image', file);
      formGallery.append('photo_spot_id', String(spotId));
      createPhotoSpotGallery(formGallery, token as string)
        .then(() => {
          toast.success('Galeri berhasil ditambahkan.');
        })
        .catch((err) => {
          if (err instanceof ApiError) {
            toast.error(`Galeri gagal ditambahkan. Error: ${err.message}`);
            console.error(err.errors);
          }
        });
    });
  };

  const handleDeleteGallery = (galleryId: number) => {
    deletePhotoSpotGallery(galleryId, token as string)
      .then(() => {
        toast.success('Galeri berhasil dihapus.');
        setGalleriesUpdate((prev) => prev.filter((item) => item.id !== galleryId));
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          toast.error(`Galeri gagal dihapus. Error: ${err.message}`);
          console.error(err.errors);
        }
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedNearestAttraction = nearestAttraction.map((value) => value.trim()).filter(Boolean);

    if (cleanedNearestAttraction.length === 0) {
      toast.error('Minimal isi satu atraksi terdekat.');
      return;
    }

    if (!token) {
      toast.error('Sesi admin tidak valid.');
      return;
    }

    setIsSaving(true);
    const formBody = buildFormBody();

    try {
      if (isEdit && id) {
        await updatePhotoSpot(id, formBody, token);
        toast.success('Spot foto berhasil diperbarui.');
        addGalleriesData(photoSpotId);
      } else {
        const res = await createPhotoSpot(formBody, token);
        toast.success('Spot foto berhasil ditambahkan.');
        addGalleriesData(res.id);
      }
      navigate('/admin/photo-spots', { replace: true });
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  const addArrayItemNearestAttraction = () => setNearestAttraction((prev) => [...prev, '']);
  const addArrayItemGalleries = () => setGalleries((prev) => [...prev, {} as File]);
  const removeArrayItemNearestAttraction = (index: number) =>
    setNearestAttraction(nearestAttraction.filter((_, i) => i !== index));
  const removeArrayItemGalleries = (index: number) =>
    setGalleries(galleries.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      {!isLoading ? (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/photo-spots')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg md:text-2xl font-bold text-gray-800">
                {isEdit ? 'Edit Spot Foto' : 'Tambah Spot Foto'}
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Informasi Dasar</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Spot *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    placeholder="cth: Sunset Point Temajuk"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Waktu Terbaik *</label>
                  <input
                    type="text"
                    value={bestHour}
                    onChange={(e) => setBestHour(e.target.value)}
                    placeholder="cth: 16.00 - 18.30 WIB"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Utama *</label>
                  {preview || (isEdit && image) ? (
                    <img
                      src={preview ? preview : storageUrl(image as string)}
                      className="mb-4 w-40 h-28 object-cover rounded-md"
                      alt={title || 'Preview'}
                    />
                  ) : null}
                  <input
                    type="file"
                    accept="image/jpeg,image/webp"
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement & { files: FileList };
                      const file = target.files[0];
                      setImage(file);
                      const objectUrl = URL.createObjectURL(file);
                      setPreview(objectUrl);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required={id === undefined}
                  />
                  <p className="text-xs text-gray-500 mt-1">Maks 1 MB. Format: JPG, JPEG, WebP.</p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat *</label>
                <textarea
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  placeholder="Masukkan alamat spot foto"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Embed Map</label>
                <input
                  type="text"
                  value={locationMap}
                  onChange={(e) => setLocationMap(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Tempelkan URL embed Google Maps"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Singkat *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  placeholder="Masukkan deskripsi singkat spot foto"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Lengkap *</label>
                <textarea
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  placeholder="Masukkan deskripsi lengkap spot foto"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Atraksi Terdekat</h2>
                <button
                  type="button"
                  onClick={addArrayItemNearestAttraction}
                  className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Tambah Atraksi
                </button>
              </div>
              <div className="space-y-4">
                {nearestAttraction.map((attraction, index) => (
                  <div key={`attraction-${index}`} className="flex gap-3 items-start">
                    <input
                      type="text"
                      value={attraction}
                      onChange={(e) =>
                        setNearestAttraction(
                          nearestAttraction.map((item, i) => (i === index ? e.target.value : item))
                        )
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Nama atraksi terdekat"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItemNearestAttraction(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                      title="Hapus"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Galeri</h2>
                <button
                  type="button"
                  onClick={addArrayItemGalleries}
                  className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Tambah Gambar
                </button>
              </div>

              {isEdit && galleriesUpdate.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {galleriesUpdate.map((gallery) => (
                    <div key={gallery.id} className="relative overflow-hidden rounded-lg border border-gray-200">
                      <img
                        src={storageUrl(gallery.image)}
                        alt={`Galeri ${gallery.id}`}
                        className="h-44 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteGallery(gallery.id)}
                        className="absolute top-2 right-2 rounded-full bg-white p-2 text-red-600 shadow"
                        title="Hapus galeri"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                {galleries.map((_, index) => (
                  <div key={`gallery-${index}`} className="flex gap-3 items-start">
                    <input
                      type="file"
                      accept="image/jpeg,image/webp"
                      onChange={(e) => {
                        const target = e.target as HTMLInputElement & { files: FileList };
                        const file = target.files[0];
                        setGalleries(galleries.map((item, i) => (i === index ? file : item)));
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItemGalleries(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                      title="Hapus"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/photo-spots')}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md flex gap-2 items-center transition-colors duration-200 w-max"
              >
                <X className="h-4 w-4" />
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex gap-2 items-center transition-colors duration-200 w-max disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Menyimpan...' : isEdit ? 'Edit Spot Foto' : 'Tambah Spot Foto'}
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="flex flex-col items-center py-12">
          <PuffLoader color={'#4B5563'} loading={isLoading} size={40} className="mb-6" />
          <p className="text-gray-500">Memuat data spot foto...</p>
        </div>
      )}
    </div>
  );
};

export default PhotoSpotForm;
