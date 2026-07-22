import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContextValue';
import {
  createPhotographyTip,
  updatePhotographyTip,
  getAdminPhotographyTips,
} from '../../../services/photographyTipsApi';
import { storageUrl } from '../../../utils/storageUrl';
import { Save, ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const PhotographyTipForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { token } = useAuth();

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState('0');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !id || !token) {
      setIsLoading(false);
      return;
    }

    const loadTip = async () => {
      try {
        const tips = await getAdminPhotographyTips(token);
        const tip = tips.find((t) => t.id === Number(id));
        if (tip) {
          setTitle(tip.title);
          setDescription(tip.description);
          setOrder(String(tip.order));
          if (tip.image) {
            setImagePreview(storageUrl(tip.image));
          }
        } else {
          setError('Tips fotografi tidak ditemukan.');
        }
      } catch {
        setError('Gagal memuat data.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadTip();
  }, [id, isEdit, token]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        order: Number(order) || 0,
        image: imageFile,
      };

      if (isEdit && id) {
        await updatePhotographyTip(Number(id), payload, token);
        toast.success('Tips fotografi berhasil diperbarui.');
      } else {
        await createPhotographyTip(payload, token);
        toast.success('Tips fotografi berhasil dibuat.');
      }

      navigate('/admin/photo-spots/photography-tips');
    } catch {
      setError('Gagal menyimpan data.');
      toast.error('Gagal menyimpan tips fotografi.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate('/admin/photo-spots/photography-tips')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Edit Tips Fotografi' : 'Tambah Tips Fotografi'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Judul *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Urutan
          </label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gambar
          </label>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="h-32 w-full md:w-56 object-cover rounded border border-gray-200"
              />
            ) : (
              <div className="h-32 w-full md:w-56 flex items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 text-sm">
                Belum ada gambar
              </div>
            )}
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer transition-colors">
              <Upload className="h-4 w-4" />
              <span>{imageFile ? 'Ganti gambar' : 'Unggah gambar'}</span>
              <input
                type="file"
                accept="image/jpeg,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">Opsional. Maks 1 MB. Format: JPG, JPEG, WebP.</p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/photo-spots/photography-tips')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-md flex items-center transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PhotographyTipForm;
