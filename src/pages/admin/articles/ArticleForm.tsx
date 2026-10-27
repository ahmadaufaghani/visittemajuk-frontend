import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Upload } from 'lucide-react';
import sanitizeHtml from 'sanitize-html';

import { ApiError } from '../../../lib/api';
import { ClipLoader, PuffLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { useApiErrorHandler } from '../../../hooks/useApiErrorHandler';
import { storageUrl } from '../../../utils/storageUrl';
import { TipTap } from './TipTap';
import { useAuth } from '../../../contexts/authContextValue';
import { getArticle, createArticle, updateArticle } from '../../../services/articlesApi';
import { emptyDescriptionChecking } from '../../../utils/emptyDescriptionChecking';

const ArticleForm: React.FC = () => {


  const navigate = useNavigate();
  const user = useAuth();
  const { id } = useParams();
  const isEdit = !!id;
  const handleApiError = useApiErrorHandler();
  const [idArticle, setIdArticle] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [image, setImage] = useState<File | string>("");
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | undefined>(undefined);

  const [errorArticle, setErrorArticle] = useState<Record<string, string[]>>();
 
  const showArticle = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await getArticle(String(id));
      setIdArticle(res.data.id);
      setTitle(res.data.title);
      setContent(res.data.content);
      setImage(res.data.image);
      setIsLoading(false);
    } catch (err) {
        setIsLoading(false);
        handleApiError(err);
    }
  }

  const addArticleData = async (): Promise<boolean|number> => {
    try {
      setIsLoadingForm(true);

      const isEmpty = emptyDescriptionChecking(content);

      const formBody = new FormData();
      formBody.append("title",title.trim());
      formBody.append("content", isEmpty ? "" : content.trim());
      formBody.append("image",image!);
      formBody.append("user_id", String(user.user?.id));
      const res = await createArticle(formBody,user.token as string);
      toast.success("Artikel berhasil ditambahkan.");
      setIsLoadingForm(false);
      return res.id;
    } catch (err) {
      setIsLoadingForm(false);
      if(err instanceof ApiError) {
        setErrorArticle(err.errors);
      }
      toast.error("Artikel gagal ditambahkan.");
      return false;
    }
  }

  
  const updateArticleData = async (id : number): Promise<boolean> => {
    try {
      setIsLoadingForm(true);
      const isEmpty = emptyDescriptionChecking(content);
      const formBody = new FormData();
      formBody.append("title",title.trim());
      formBody.append("content", isEmpty ? "" : content.trim());
      formBody.append("image",image!);
      formBody.append("user_id", String(user.user?.id));
  
      await updateArticle(id, formBody, user.token as string);
      toast.success("Artikel berhasil diperbarui.");
      setIsLoadingForm(false);
      return true;
    } catch (err) {
        if(err instanceof ApiError) {
          setErrorArticle(err.errors);
        }
        setIsLoadingForm(false);
        toast.error("Artikel gagal diperbarui.");
        return false;
    }
  }

  const handleContentChange = (newContent: string): void => {
    deleteErrorArticle("content");
    const sanitize = sanitizeHtml(newContent, {
      allowedTags: [...sanitizeHtml.defaults.allowedTags],
      allowedAttributes : {
        ...sanitizeHtml.defaults.allowedAttributes,
        p : [...(sanitizeHtml.defaults.allowedAttributes['p'] || []),'style']
      },
      allowedStyles : {
        'p': {
          'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
        }
      }
    });
    setContent(sanitize);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(isEdit && id) {
      const updateArticle = await updateArticleData(Number(id))
      if(updateArticle) navigate('/admin/articles', {replace : true});
    } else  {
      const addArticle = await addArticleData();
      if(addArticle) navigate('/admin/articles', {replace : true});
    }
  };

  const deleteErrorArticle = (key: string) => {
    setErrorArticle(prev => {
      if(!prev) return;

      const {[key]:_, ...newData} = prev;
      return newData;

    })
  }

  useEffect(() => {
    if (isEdit && id) {
      showArticle(Number(id));
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
              onClick={() => navigate('/admin/articles')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">
              {isEdit ? 'Edit Artikel' : 'Tambah Artikel'}
            </h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Informasi Dasar</h2>
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Artikel *
                </label>
                <input
                  disabled={isLoadingForm}
                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => {
                    deleteErrorArticle("title");
                    setTitle(e.target.value);
                  }}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""} ${errorArticle && errorArticle["title"] ? "border-red-600" : ""}`}
                  required
                  placeholder="cth: Alasan Mengapa Anda Harus Mengunjungi Temajuk"
                />
                <span className="text-red-600 text-sm">{errorArticle && errorArticle["title"] && `*${errorArticle["title"].toString().replace("title", "Judul")}`}</span>
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
                    className={`h-32 w-full md:w-56 object-cover rounded border border-gray-200 ${errorArticle && errorArticle["image"] ? "border-2 border-red-600" : ""}`}
                  />
                ) : (
                  <div className={`h-32 w-full md:w-56 flex items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 text-sm ${errorArticle && errorArticle["image"] ? "border-2 border-red-600" : ""}`}>
                    Belum ada gambar
                  </div>
                )}
                <label className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md ${isLoadingForm ? "cursor-not-allowed" : "cursor pointer"} transition-colors w-fit`}>
                  <Upload className="h-4 w-4" />
                  <span>{image ? 'Ganti gambar' : 'Unggah gambar'}</span>
                  <input
                    disabled={isLoadingForm}
                    name='image'
                    type="file"
                    accept="image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      deleteErrorArticle("image");
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
                  <p className="text-xs text-gray-500">Wajib diisi untuk artikel baru. Maks 1 MB. Format: JPG, JPEG, WebP.</p>
                ) : (
                  <p className="text-xs text-gray-500">Kosongkan jika tidak ingin mengubah gambar. Format: JPG, JPEG, WebP. Maks 1 MB.</p>
                )}
                </div>
                <span className="text-red-600 text-sm">{errorArticle && errorArticle["image"] && `*${errorArticle["image"].map(val=>{
                    let message = '';
                    if(val.includes('jpg, jpeg, webp') || val.includes('max')) {
                      message += "Ekstensi gambar tidak sesuai;";
                    }
                    if(val.includes('1024 KB') || val.includes('size')) {
                      message += "Ukuran gambar lebih dari 1 MB;";
                    }
                    if(val.includes('wajib')) {
                      message += "Gambar wajib diisi;";
                    }
                    return message;
                }).join(" ")}`}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Materi Artikel *
                </label>
                <TipTap editable={!isLoadingForm} id={idArticle} key={Number(id) ?? 0} value={content} error={Boolean(errorArticle && errorArticle["content"])} onChange={handleContentChange}/>
                <span className="text-red-600 text-sm">{errorArticle && errorArticle["content"] && `*${errorArticle["content"].toString().replace("content", "Materi")}`}</span>
              </div>
            </div>
          </div>
      

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              disabled={isLoadingForm}
              type="button"
              onClick={() => navigate('/admin/articles')}
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
                  {"Simpan"}
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
          <p className="text-gray-600 text-lg">Memuat data artikel...</p>
        </div>
      }
        
    </div>
  )            
}

export default ArticleForm;
