import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X, Pen, Check, Ban } from 'lucide-react';
import { useAuth } from '../../../contexts/authContextValue';
import type {
  TransportationTips,
  TransportationSteps,
  Transportation,
  TransportationStepsList,
} from '../../../types/transportation';
import { ApiError } from '../../../lib/api';
import { getTransportation, createTransportation, updateTransportation, createSteps, createTips, deleteSteps, deleteTips, updateTransportationSteps, updateTransportationTips } from '../../../services/transportationsApi';
import { PuffLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { storageUrl } from '../../../utils/storageUrl';

const TransportationForm: React.FC = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const user = useAuth();
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
  const [tipsUpdate, setTipsUpdate] = useState<TransportationTips[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [editStepsId, setEditStepsId] = useState<number>(0);
  const [editTipsId, setEditTipsId] = useState<number>(0);

  const difficulties = ['Mudah', 'Sedang', 'Sulit'];


  const showTransportation = async (id: number) => {
      setIsLoading(true);
      getTransportation(id).then(res => {
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
      }).catch(err => {
        console.error(err);
      });
  }

  useEffect(() => {
    if (isEdit && id) {
      showTransportation(Number(id));
    }
  }, [isEdit, id]);

  const addTransportationData = async () => {
      const formBody = new FormData();
      formBody.append("title",title);
      formBody.append("description",description);
      formBody.append("image",image!);
      formBody.append("difficulty", difficulty);
      formBody.append("estimated_cost", estimatedCost);
      formBody.append("estimated_time", estimatedTime);

      createTransportation(formBody,user.token as string)
      .then((res: Transportation ) => {
        toast.success("Transportasi berhasil ditambahkan.");
        addStepsData(res.id);
        addTipsData(res.id);
      })
      .catch(err => {
        if(err instanceof ApiError) {
          toast.error(`Transportasi gagal ditambahkan. Error : ${err.message}`);
          console.error(err.errors);
        }
      });

  }

  const addStepsData = (id: number) => {
      steps.map(async (val) => {
        createSteps({description: val.description, duration: val.duration, cost: val.cost, vehicle: val.vehicle, transportation_id: id}, user.token as string)
        .then(()=> {
          toast.success("Langkah baru berhasil ditambahkan.");
        })
        .catch(err => {
          if(err instanceof ApiError) {
            toast.error(`Langkah baru gagal ditambahkan. Error : ${err.message}`);
            console.error(err.errors);
          }
        });
      });
  }

  const addTipsData = (id: number) => {
      tips.map(async (val) => {
        createTips({tip: val, transportation_id: id}, user.token as string)
        .then(()=> {
           toast.success("Tips baru berhasil ditambahkan.");
        })
        .catch(err => {
         if(err instanceof ApiError) {
            toast.error(`Tips baru gagal ditambahkan. Error : ${err.message}`);
            console.error(err.errors);
          }
        });
      });

  }

  const updateTransportationData = async (id : number) => {
    const formBody = new FormData();
    formBody.append("title",title);
      formBody.append("description",description);
      formBody.append("image",image!);
      formBody.append("difficulty", difficulty);
      formBody.append("estimated_cost", estimatedCost);
      formBody.append("estimated_time", estimatedTime);

    updateTransportation(id, formBody, user.token as string)
    .then(() => {
        toast.success("Transportasi berhasil diperbarui.");
        addStepsData(idTransportation);
        addTipsData(idTransportation);
      })
    .catch(err => {
      console.error(err);
    });
  }

  const addArrayItemSteps = () => {
    setSteps(prev => [...prev, {description : '', duration: '', cost: '', vehicle: ''}]);
  }

  const addArrayItemTips = () => {
    setTips(prev => [...prev, '']);
  }

  const handleArrayChangeSteps = (index: number, key: string, value: string) => {
    setSteps(steps.map((item, i) => i === index ? {...item, [key]:value} : item));
  };

  const handleArrayChangeTips = (index: number, value: string) => {
    setTips(tips.map((item, i) => i === index ? value : item));
  };

  const removeArrayItemSteps = (index: number) => {
    setSteps(steps.filter((_, i) => i != index));
  }
  const removeArrayItemTips = (index: number) => {
    setTips(tips.filter((_, i) => i != index));
  }

  const handleArrayChangeStepsUpdate = (index: number, key: string, value: string) => {
    setStepsUpdate(stepsUpdate.map((item, i) => i === index ? {...item, [key]:value} : item));
  };

  const handleArrayChangeTipsUpdate = (index: number, key: string, value: string) => {
    setTipsUpdate(tipsUpdate.map((item, i) => i === index ? {...item, [key]:value} : item));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(id) {
      updateTransportationData(Number(id));    
      navigate('/admin/transportations', {replace : true});
    } else {
      addTransportationData();
      navigate('/admin/transportations', {replace : true});
    }
  };

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

                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  placeholder="cth: Potianak ke Temajuk"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tingkat Kesulitan *
                </label>
                <select

                  name="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
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

                  type="text"
                  name="estimated_cost"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="cth: Rp 100.000 - Rp 200.000 per orang"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimasi Waktu *
                </label>
                <input

                  type="text"
                  name="estimated_time"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="cth: 1-2 Jam"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar *
              </label>
              {preview || id && image ? 
                <img
                  src={preview ? preview : storageUrl(image as string)}
                  className='mb-4 w-64'
                />
                :
                <></>
              }
              <input
                type="file"
                name="image"
                accept="image/jpeg,image/webp"
                onChange={(e) => {

                  const target = e.target as HTMLInputElement & {
                    files : FileList;
                  }
                  setImage(target.files[0]);
                  const objectUrl = URL.createObjectURL(target.files[0]);
                  setPreview(objectUrl);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required={image ? false : true}
              />
              <div>
                <span className="text-xs text-red-700">*ext: .jpg, .jpeg, .webp; max: 1 MB</span>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi *
              </label>
              <textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
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
                type="button"
                className="text-primary hover:text-primary-dark flex items-center"
                onClick={()=> {
                  addArrayItemSteps();
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Langkah
              </button>
            </div>

            <div className="space-y-6">
              {id && stepsUpdate && stepsUpdate.length > 0 && stepsUpdate.map((item, index) => {
              return (
              <div key={index+"div"} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-800">Langkah {index+1}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={()=>{
                        setEditStepsId(prev => prev === item.id ? 0 : item.id);
                        if(editStepsId === item.id && editStepsId !== 0) {
                          setIsLoading(true);
                          updateTransportationSteps(item.id, stepsUpdate[index], user.token as string)
                          .then(()=> {
                            toast.success("Langkah berhasil diperbarui.");
                            showTransportation(idTransportation);
                          })
                          .catch(err => {
                            if(err instanceof ApiError) {
                              toast.error(`Langkah gagal diperbarui. Error: ${err.message}`)
                              console.error(err.errors);
                            }
                          });
                        }
                      }}
                    >
                      {item.id === editStepsId 
                      ? 
                      <Check className="h-3 w-3" />
                      :
                      <Pen className="h-3 w-3" />
                      }
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800"
                      onClick={()=>{
                        if(item.id === editStepsId) {
                          setEditStepsId(0);
                        } else {
                          setIsLoading(true);
                          deleteSteps(Number(item.id), user.token as string)
                          .then(() => {
                            toast.success("Langkah berhasil dihapus.")
                            showTransportation(idTransportation);
                          })
                          .catch(err => {
                            if(err instanceof ApiError) {
                              toast.error(`Langkah gagal dihapus. Error: ${err.message}`)
                              console.error(err.errors);
                            }
                          });
                        }
                      }}
                    >
                      {
                        item.id === editStepsId 
                        ? 
                        <Ban className="h-3 w-3" />
                        :
                        <X className="h-4 w-4" />
                      }
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durasi *
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={item.duration}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${item.id !== editStepsId ? "cursor-not-allowed" : ""}`}
                      placeholder="1-2 Jam"
                      onChange={(e)=>handleArrayChangeStepsUpdate(index, "duration", e.target.value)}
                      required
                      disabled={!(editStepsId === item.id)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biaya *
                    </label>
                    <input
                      type="text"
                      name="cost"
                      value={item.cost}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${item.id !== editStepsId ? "cursor-not-allowed" : ""}`}
                      placeholder="Rp 50.000 - Rp 100.000"
                      onChange={(e)=>handleArrayChangeStepsUpdate(index, "cost", e.target.value)}
                      required
                      disabled={!(editStepsId === item.id)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kendaraan *
                    </label>
                    <input
                      type="text"
                      name="vehicle"
                      value={item.vehicle}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${item.id !== editStepsId ? "cursor-not-allowed" : ""}`}
                      placeholder="Bus / Travel"
                      onChange={(e)=>handleArrayChangeStepsUpdate(index, "vehicle", e.target.value)}
                      required
                      disabled={!(editStepsId === item.id)}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi *
                  </label>
                  <textarea
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${item.id !== editStepsId ? "cursor-not-allowed" : ""}`}
                    placeholder="Masukkan deskripsi dari langkah"
                    value={item.description}
                    rows={2}
                    onChange={(e)=>handleArrayChangeStepsUpdate(index, "description", e.target.value)}
                    required
                    disabled={!(editStepsId === item.id)}
                  />
                </div>
              </div>)  
              })}
              
              {id && steps && steps.length > 0 && <p className="font-semibold text-md pt-4">Tambah Langkah Baru</p>}
              {steps && steps.length > 0 && steps.map((item, index) => {
              return (
              <div key={index+"div"} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-800">Langkah {id ? ((steps.length > 0) ? stepsUpdate.length+index+1 : stepsUpdate.length+1) :  index+1}</h3>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800"
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
                      type="text"
                      name="duration"
                      value={item.duration}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      type="text"
                      name="cost"
                      value={item.cost}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      type="text"
                      name="vehicle"
                      value={item.vehicle}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
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
                type="button"
                onClick={() => addArrayItemTips()}
                className="text-primary hover:text-primary-dark flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </button>
            </div>
            
            <div className="space-y-3">
            {
              id && tipsUpdate.map((item, index) => {
              return (
              <div key={index} className="flex items-center space-x-2 ">
                <input
                  disabled={!(item.id === editTipsId)}
                  type="text"
                  value={item.tip}
                  onChange={(e) => handleArrayChangeTipsUpdate(index, "tip", e.target.value)}
                  className={`flex-1 px-4 py-2 border border-gray-300 rounded-md ${item.id !== editTipsId ?"cursor-not-allowed" : ""}`}
                  placeholder="Tips terkait transportasi"
                />
                <button
                      key={`button-tips-edit-${index}`}
                      type="button"
                      onClick={() => {
                        setEditTipsId(prev => prev === item.id ? 0 : item.id);
                        if(editTipsId === item.id && editTipsId !== 0) {
                          setIsLoading(true);
                          updateTransportationTips(item.id, tipsUpdate[index], user.token as string)
                          .then(() => {
                            toast.success("Tips berhasil diperbarui.");
                            showTransportation(idTransportation);
                          })
                          .catch((err) => {
                            if(err instanceof ApiError) {
                              toast.error(`Tips gagal diperbarui. Error : ${err.message}`);
                              console.error(err.errors);
                            }
                          });
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                     { item.id === editTipsId ? <Check className="h-3 w-3" />  : <Pen className="h-3 w-3" />}
                </button>
                <button
                      key={`button-tips-delete-${index}`}
                      type="button"
                      onClick={() => {
                        if(item.id === editTipsId) {
                          setEditTipsId(0);
                        } else {
                          setIsLoading(true);
                          deleteTips(item.id,user.token as string)
                          .then(() => {
                            showTransportation(Number(id));
                          }).catch(err => {
                            console.error(err);
                          });
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      {item.id === editTipsId ? <Ban className="h-3 w-3" /> : <X className="h-4 w-4" />}
                </button>
              </div>)
              }) 
            }
            {id && tips.length >= 1 && <p className="font-semibold text-md pt-4">Tambah Tips Baru</p>}
            {
              tips.map((specialty, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => handleArrayChangeTips(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Tips terkait transportasi"
                  />
                  {tips.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItemTips(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))
            }
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/transportations')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-md flex items-center transition-colors duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Update' : 'Simpan'}
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
          <p className="text-gray-600 text-lg">Memuat data transportasi...</p>
        </div>
      }
      {/* Header */}
  </div>)
}

export default TransportationForm;
