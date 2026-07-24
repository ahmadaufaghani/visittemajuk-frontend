import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContextValue';
import { getAdminPhotographyTips, deletePhotographyTip } from '../../../services/photographyTipsApi';
import { useApiErrorHandler } from '../../../hooks/useApiErrorHandler';
import { showConfirm } from '../../../utils/confirm';
import { storageUrl } from '../../../utils/storageUrl';
import type { PhotographyTip } from '../../../types/photographyTip';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PuffLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const PhotographyTipList: React.FC = () => {
  const { token } = useAuth();
  const handleApiError = useApiErrorHandler();
  const [tips, setTips] = useState<PhotographyTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTips = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAdminPhotographyTips(token);
      setTips(result);
    } catch (err) {
      handleApiError(err);
      setError('Gagal memuat data tips fotografi.');
    } finally {
      setIsLoading(false);
    }
  }, [token, handleApiError]);

  useEffect(() => {
    void loadTips();
  }, [token, loadTips]);

  const handleDelete = async (id: number) => {
    if (!token) return;
    showConfirm({
      title: 'Hapus Tips Fotografi',
      message: 'Apakah Anda yakin ingin menghapus tips ini?',
      onConfirm: async () => {
        try {
          await deletePhotographyTip(id, token);
          toast.success('Tips fotografi berhasil dihapus.');
          await loadTips();
        } catch (err) {
          handleApiError(err);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <PuffLoader color="#4B5563" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Tips Fotografi</h1>
        <Link
          to="/admin/photo-spots/photography-tips/add"
          className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Tips
        </Link>
      </div>

      {tips.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Belum ada tips fotografi.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gambar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Judul
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urutan
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tips.map((tip) => (
                <tr key={tip.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tip.image ? (
                      <img
                        src={storageUrl(tip.image)}
                        alt={tip.title}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No img</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{tip.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                      {tip.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{tip.order}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/admin/photo-spots/photography-tips/edit/${tip.id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit className="h-4 w-4 inline" />
                    </Link>
                    <button
                      onClick={() => handleDelete(tip.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PhotographyTipList;
