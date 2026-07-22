import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/authContextValue';
import { getDestination } from '../../../services/destinationsApi';
import {
  deleteDestinationGallery,
  uploadDestinationGallery,
} from '../../../services/destinationsApi';
import type { DestinationGalleryImage } from '../../../types/destination';
import { storageUrl } from '../../../utils/storageUrl';
import { ImagePlus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface DestinationGalleryEditorProps {
  destinationSlug: string;
}

const DestinationGalleryEditor: React.FC<DestinationGalleryEditorProps> = ({
  destinationSlug,
}) => {
  const { token } = useAuth();
  const [galleries, setGalleries] = useState<DestinationGalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const refresh = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const destination = await getDestination(destinationSlug);
      setGalleries(destination.galleries ?? []);
    } catch {
      setGalleries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationSlug, token]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !token) {
      return;
    }
    setIsUploading(true);
    try {
      await uploadDestinationGallery(destinationSlug, file, token);
      toast.success('Gambar berhasil ditambahkan ke galeri.');
      await refresh();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Gambar belum dapat diunggah.';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (galleryId: number) => {
    if (!token) {
      return;
    }
    if (!window.confirm('Hapus gambar ini dari galeri?')) {
      return;
    }
    try {
      await deleteDestinationGallery(galleryId, token);
      toast.success('Gambar berhasil dihapus.');
      await refresh();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Gambar belum dapat dihapus.';
      toast.error(message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Galeri Destinasi</h2>
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer transition-colors">
          <ImagePlus className="h-4 w-4" />
          <span>{isUploading ? 'Mengunggah...' : 'Tambah Gambar'}</span>
          <input
            type="file"
            accept="image/jpeg,image/webp"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
        <p className="text-xs text-gray-500 mt-1">Maks 1 MB. Format: JPG, JPEG, WebP.</p>
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-sm">Memuat galeri...</p>
      ) : galleries.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada gambar di galeri. Unggah gambar untuk memperkaya tampilan destinasi.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleries.map((gallery) => (
            <div key={gallery.id} className="relative group rounded-md overflow-hidden border border-gray-200">
              <img
                src={storageUrl(gallery.image)}
                alt={`Galeri ${gallery.sort_order + 1}`}
                className="w-full h-32 object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(gallery.id)}
                className="absolute top-2 right-2 inline-flex items-center justify-center h-7 w-7 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Hapus gambar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DestinationGalleryEditor;
