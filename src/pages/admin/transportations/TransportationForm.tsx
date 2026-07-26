import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X, Upload } from 'lucide-react';
import { useAuth } from '../../../contexts/authContextValue';
import type {
  TransportationTips,
  TransportationSteps,
  TransportationStepsList,
} from '../../../types/transportation';
import { ApiError } from '../../../lib/api';
import { getTransportation, createTransportation, updateTransportation, createSteps, createTips, deleteSteps, deleteTips, updateTransportationSteps, updateTransportationTips } from '../../../services/transportationsApi';
import { ClipLoader, PuffLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { storageUrl } from '../../../utils/storageUrl';
import { useApiErrorHandler } from '../../../hooks/useApiErrorHandler';

const TransportationForm: React.FC = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const user = useAuth();
  const handleApiError = useApiErrorHandler();
  const [idTransportation, setIdTransportation] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<File| string | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<string>("");
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [steps, setSteps] = useState<TransportationStepsList[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [stepsUpdate, setStepsUpdate] = useState<TransportationSteps[]>([]);
  const [stepsUpdatedTemp, setStepsUpdatedTemp] = useState<number[]>([]);
  const [stepsDeletedTemp, setStepsDeletedTemp] = useState<number[]>([]);
  const [tipsUpdatedTemp, setTipsUpdatedTemp] = useState<number[]>([]);
  const [tipsDeletedTemp, setTipsDeletedTemp] = useState<number[]>([]);
  const [tipsUpdate, setTipsUpdate] = useState<TransportationTips[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | undefined>(undefined);

  const difficulties = ['Mudah', 'Sedang', 'Sulit'];

  const showTransportation = async (id: number) => {
    try {
      setIsLoading(true);
      const res = await getTransportation(id)
      setIdTransportation(res.id);
      setTitle(res.title);
      setDescription(res.description);
      setImage(res.image);
      setDifficulty(res.difficulty);
      setEstimatedCost(res.estimated_cost);
      setEstimatedTime(res.estimated_time);
      setStepsUpdate(res.transportation_steps);
      setTipsUpdate(res.transportation_tips);
      setIsLoading(false);
    } catch (err) {
        handleApiError(err);
    }
  }

  const addTransportationData = async () => {
    try {
      setIsLoadingForm(true);
      const formBody = new FormData();
      formBody.append("title", title.trim());
      formBody.append("description", description.trim());
      formBody.append("image", image!);
      formBody.append("difficulty", difficulty.trim());
      formBody.append("estimated_cost", estimatedCost.trim());
      formBody.append("estimated_time", estimatedTime.trim());

      const res = await createTransportation(formBody,user.token as string)
      toast.success("Transportasi berhasil ditambahkan.");
      addStepsData(res.id);
      addTipsData(res.id);
      setIsLoadingForm(false);
    } catch (err) {
      setIsLoadingForm(false);
        if(err instanceof ApiError) {
          toast.error(`Transportasi gagal ditambahkan. Error : ${err.message}`);
          console.error(err.errors);
        }
    }
  }

  const addStepsData = (id: number) => {
      steps.map(async (val) => {
        try {
          await createSteps({
            description: val.description.trim(), 
            duration: val.duration.trim(), 
            cost: val.cost.trim(), 
            vehicle: val.vehicle.trim(), 
            transportation_id: id
          }, 
          user.token as string)
          toast.success("Langkah baru berhasil ditambahkan.");
        } catch (err) {
          if(err instanceof ApiError) {
            toast.error(`Langkah baru gagal ditambahkan. Error : ${err.message}`);
            console.error(err.errors);
          }
        }
      });
  }

  const addTipsData = (id: number) => {
      tips.map(async (val) => {
        try {
          await createTips({
            tip: val.trim(), 
            transportation_id: id
          }, user.token as string)
          toast.success("Tips baru berhasil ditambahkan.");
        } catch (err) {
          if(err instanceof ApiError) {
             toast.error(`Tips baru gagal ditambahkan. Error : ${err.message}`);
             console.error(err.errors);
           }  
        }
      });

  }

  const updateTransportationData = async (id : number) => {
    try {
      setIsLoadingForm(true);
      const formBody = new FormData();
      formBody.append("title",title);
      formBody.append("description",description);
      formBody.append("image",image!);
      formBody.append("difficulty", difficulty);
      formBody.append("estimated_cost", estimatedCost);
      formBody.append("estimated_time", estimatedTime);
      await updateTransportation(id, formBody, user.token as string)
      toast.success("Transportasi berhasil diperbarui.");
      addStepsData(id);
      addTipsData(id);
      updateStepsData();
      updateTipsData();
      deleteStepsData();
      deleteTipsData();
      setIsLoadingForm(false);    
    } catch (err) {   
      handleApiError(err);
    }
  }

  const updateStepsData = () => {
      stepsUpdatedTemp.map(async (val) => {
        try {
          const steps = stepsUpdate[val];
  
          if(!stepsDeletedTemp.find(val => val === steps.id)) {
            await updateTransportationSteps(steps.id, {description:steps.description, duration: steps.duration, cost: steps.cost, vehicle: steps.vehicle, transportation_id: steps.transportation_id}, user.token as string)
            toast.success("Langkah baru berhasil diperbarui.");
          }
        } catch (err) {
          handleApiError(err);
        }

      });
  }
  
  const updateTipsData = () => {
    tipsUpdatedTemp.map(async (val) => {
      try {
        const tips = tipsUpdate[val];
        
        if(!tipsDeletedTemp.find(val => val === tips.id)) {
          await updateTransportationTips(tips.id, {tip: tips.tip, transportation_id: tips.transportation_id}, user.token as string)
          toast.success("Tips berhasil diperbarui.");  
        }
      } catch (err) {
        handleApiError(err);
      }
    });
    
  }

  const deleteStepsData = () => {
    stepsDeletedTemp.map(async (val) => {
      try {
        await deleteSteps(val, user.token as string)
        toast.success("Langkah berhasil dihapus.");
      } catch (err) {
        handleApiError(err);
      }
    });
  }

  const deleteTipsData = () => {
    tipsDeletedTemp.map(async (val) => {
      try {
        await deleteTips(val, user.token as string)
        toast.success("Tips berhasil dihapus.");
      } catch (err) {
        handleApiError(err);
      }
    });
  }
  
  const addArrayItemSteps = () => {
    setSteps(prev => [...prev, {description : '', duration: '', cost: '', vehicle: ''}]);
  }

  const addArrayItemTips = () => {
    setTips(prev => [...prev, '']);
  }

  const addArrayItemStepsUpdatedTemp = (val: number) => {
    setStepsUpdatedTemp(prev => [...prev, val]);
  }

  const addArrayItemStepsDeletedTemp = (val: number) => {
    setStepsDeletedTemp(prev => [...prev, val]);
  }

  const addArrayItemTipsUpdatedTemp = (val: number) => {
    setTipsUpdatedTemp(prev => [...prev, val]);
  }

  const addArrayItemTipsDeletedTemp = (val: number) => {
    setTipsDeletedTemp(prev => [...prev, val]);
  }

  const handleArrayChangeSteps = (index: number, key: string, value: string) => {
    setSteps(steps.map((item, i) => i === index ? {...item, [key]:value} : item));
  };

  const handleArrayChangeTips = (index: number, value: string) => {
    setTips(tips.map((item, i) => i === index ? value : item));
  };

  const removeArrayItemSteps = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  }
  const removeArrayItemTips = (index: number) => {
    setTips(tips.filter((_, i) => i !== index));
  }

  const handleArrayChangeStepsUpdate = (index: number, key: string, value: string) => {
    setStepsUpdate(stepsUpdate.map((item, i) => i === index ? {...item, [key]:value} : item));
  };

  const handleArrayChangeTipsUpdate = (index: number, key: string, value: string) => {
    setTipsUpdate(tipsUpdate.map((item, i) => i === index ? {...item, [key]:value} : item));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(idTransportation) {
      await updateTransportationData(idTransportation);
      navigate('/admin/transportations', {replace : true});
    } else {
      await addTransportationData();
      navigate('/admin/transportations', {replace : true});
    }
  };
  
  useEffect(() => {
    if (isEdit && id) {
      showTransportation(Number(id));
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
              onClick={() => navigate('/admin/transportations')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">
              {isEdit ? 'Edit Transportasi' : 'Tambah Transportasi'}
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
                  Rute Transportasi *
                </label>
                <input
                  disabled={isLoadingForm}
                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                  required
                  placeholder="cth: Potianak ke Temajuk"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tingkat Kesulitan *
                </label>
                <select
                  disabled={isLoadingForm}
                  name="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                  required
                >
                  <option value="">Pilih Kesulitan</option>
                  {difficulties.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimasi Biaya *
                </label>
                <input
                  disabled={isLoadingForm}
                  type="text"
                  name="estimated_cost"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="cth: Rp 100.000 - Rp 200.000 per orang"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimasi Waktu *
                </label>
                <input
                  disabled={isLoadingForm}
                  type="text"
                  name="estimated_time"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="cth: 1-2 Jam"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                  required
                />
              </div>
            </div>
           
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar *
              </label>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
              {preview || id && image  ? (
                <img
                  src={preview ? preview : storageUrl(image as string)}
                  alt="Pratinjau gambar utama"
                  className="h-32 w-full md:w-56 object-cover rounded border border-gray-200"
                />
              ) : (
                <div className="h-32 w-full md:w-56 flex items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 text-sm">
                  Belum ada gambar
                </div>
              )}
              <label className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md ${isLoadingForm ? "cursor-not-allowed" : "cursor-pointer"} transition-colors`}>
                <Upload className="h-4 w-4" />
                <span>{image ? 'Ganti gambar' : 'Unggah gambar'}</span>
                <input
                  disabled={isLoadingForm}
                  required={image ? false : true}
                  type="file"
                  accept="image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
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
                <p className="text-xs text-gray-500">Wajib diisi untuk transportasi baru. Maks 1 MB. Format: JPG, JPEG, WebP.</p>
              ) : (
                <p className="text-xs text-gray-500">Kosongkan jika tidak ingin mengubah gambar. Format: JPG, JPEG, WebP. Maks 1 MB.</p>
              )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi *
              </label>
              <textarea
                disabled={isLoadingForm}
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                required
                placeholder="Masukkan deskripsi dari rute transportasi"
              />
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Langkah-langkah</h2>
              <button
                disabled={isLoadingForm}
                type="button"
                className={`text-primary hover:text-primary-dark flex items-center ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                onClick={()=> {
                  addArrayItemSteps();
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </button>
            </div>

            <div className="space-y-6">
              {id && stepsUpdate && stepsUpdate.length > 0 && stepsUpdate.map((item, index) => {
              return (
              !stepsDeletedTemp.find(val => val === item.id) &&
              <div key={index+"div"} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-800">Langkah {index+1}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`text-red-600 hover:text-red-800 ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                      onClick={()=>{
                        addArrayItemStepsDeletedTemp(item.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durasi *
                    </label>
                    <input
                      disabled={isLoadingForm}
                      type="text"
                      name="duration"
                      value={item.duration}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                      placeholder="1-2 Jam"
                      onChange={(e)=>{
                        handleArrayChangeStepsUpdate(index, "duration", e.target.value);
                        if(!stepsUpdatedTemp.includes(index)) {
                          addArrayItemStepsUpdatedTemp(index);
                        }
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biaya *
                    </label>
                    <input
                      disabled={isLoadingForm}
                      type="text"
                      name="cost"
                      value={item.cost}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                      placeholder="Rp 50.000 - Rp 100.000"
                      onChange={(e)=>{
                        handleArrayChangeStepsUpdate(index, "cost", e.target.value);
                        if(!stepsUpdatedTemp.includes(index)) {
                          addArrayItemStepsUpdatedTemp(index);
                        }
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kendaraan *
                    </label>
                    <input
                      disabled={isLoadingForm}
                      type="text"
                      name="vehicle"
                      value={item.vehicle}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                      placeholder="Bus / Travel"
                      onChange={(e)=>{
                        handleArrayChangeStepsUpdate(index, "vehicle", e.target.value);
                        if(!stepsUpdatedTemp.includes(index)) {
                          addArrayItemStepsUpdatedTemp(index);
                        }
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi *
                  </label>
                  <textarea
                    disabled={isLoadingForm}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                    placeholder="Masukkan deskripsi dari langkah"
                    value={item.description}
                    rows={2}
                    onChange={(e)=>{
                      handleArrayChangeStepsUpdate(index, "description", e.target.value);
                      if(!stepsUpdatedTemp.includes(index)) {
                        addArrayItemStepsUpdatedTemp(index);
                      }
                    }}
                    required
                  />
                </div>
              </div>)  
              })}
              {steps && steps.length > 0 && steps.map((item, index) => {
              return (
              <div key={index+"div"} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-800">Langkah {id ? ((steps.length > 0) ? stepsUpdate.length+index+1 : stepsUpdate.length+1) :  index+1}</h3>
                    <button
                      type="button"
                      className={`text-red-600 hover:text-red-800 ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                      onClick={()=>removeArrayItemSteps(index)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durasi *
                    </label>
                    <input
                      disabled={isLoadingForm}
                      type="text"
                      name="duration"
                      value={item.duration}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                      placeholder="cth: 1-2 Jam"
                      onChange={(e)=>handleArrayChangeSteps(index, "duration", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biaya *
                    </label>
                    <input
                      disabled={isLoadingForm}
                      type="text"
                      name="cost"
                      value={item.cost}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                      placeholder="cth: Rp 50.000 - Rp 100.000"
                      onChange={(e)=>handleArrayChangeSteps(index, "cost", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kendaraan *
                    </label>
                    <input
                      disabled={isLoadingForm}
                      type="text"
                      name="vehicle"
                      value={item.vehicle}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                      placeholder="cth: Bus / Travel"
                      onChange={(e)=>handleArrayChangeSteps(index, "vehicle", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi *
                  </label>
                  <textarea
                    disabled={isLoadingForm}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                    placeholder="Masukkan deskripsi dari langkah"
                    value={item.description}
                    rows={2}
                    onChange={(e)=>handleArrayChangeSteps(index, "description", e.target.value)}
                    required
                  />
                </div>
              </div>)  
              })}
            </div>
          </div>
        
          {/* Tips */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Tips</h2>
              <button
                disabled={isLoadingForm}
                type="button"
                onClick={() => addArrayItemTips()}
                className={`text-primary hover:text-primary-dark flex items-center ${isLoadingForm ? "cursor-not-allowed" : ""}`}
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </button>
            </div>
            
            <div className="space-y-3 mb-6">
            {
              id && tipsUpdate.map((item, index) => {
              return (
              !tipsDeletedTemp.find(val => val === item.id) &&
              <div key={index} className="flex items-center space-x-2 ">
                <input
                  disabled={isLoadingForm}
                  type="text"
                  value={item.tip}
                  onChange={(e) => {
                    handleArrayChangeTipsUpdate(index, "tip", e.target.value);
                    if(!tipsUpdatedTemp.includes(index)) {
                      addArrayItemTipsUpdatedTemp(index);
                    }
                  }}
                  className={`flex-1 px-4 py-2 border border-gray-300 rounded-md ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                  placeholder="Tips terkait transportasi"
                  required
                />
                <button
                  key={`button-tips-delete-${index}`}
                  type="button"
                  onClick={() => {
                    addArrayItemTipsDeletedTemp(item.id);
                  }}
                  className={`text-red-600 hover:text-red-800 ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                  disabled={isLoadingForm}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>)
              }) 
            }
            {
              tips.map((specialty, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    disabled={isLoadingForm}
                    type="text"
                    value={specialty}
                    onChange={(e) => handleArrayChangeTips(index, e.target.value)}
                    className={`flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                    placeholder="Tips terkait transportasi"
                    required
                  />
                  <button
                    disabled={isLoadingForm}
                    type="button"
                    onClick={() => removeArrayItemTips(index)}
                    className={`text-red-600 hover:text-red-800 ${isLoadingForm ? "cursor-not-allowed" : ""}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            }
            </div>
          </div>

          {/* Submit Button */}
          {<div className="flex justify-end space-x-4">
            <button
              disabled={isLoadingForm}
              type="button"
              onClick={() => navigate('/admin/transportations')}
              className={`px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 ${isLoadingForm ? "cursor-not-allowed" : ""}`}
            >
              Batal
            </button>
            <button
              disabled={isLoadingForm}
              type="submit"
              className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-md shadow transition-colors duration-300"
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
                  {id ? "Edit" : "Simpan"}
                </>
                }
            </button>
          </div>}
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
          <p className="text-gray-600 text-lg">Memuat data transportasi...</p>
        </div>
      }
      {/* Header */}
  </div>)
}

export default TransportationForm;
