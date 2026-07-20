import React, { useState, Fragment, useEffect} from 'react';
import { Edit, Trash2, Plus, X, ChevronDown, ChevronUp, Search, MoveUpRight } from 'lucide-react';
import { useAuth } from '../../../contexts/authContextValue';
import { PuffLoader } from "react-spinners";
import { createAdditionalInformation, deleteAdditionalInformation, getAdditionalInformation, updateAdditionalInformation } from '../../../services/transportationsApi';
import toast from 'react-hot-toast';
import { ApiError } from '../../../lib/api';
import { useOverlay } from '../../../contexts/OverlayContext';
import { Link } from 'react-router-dom';
import { AdditionalInformation, AdditionalInformationPayload } from '../../../types/transportation';

const AdditionalInformationList: React.FC = () => {
  const [additionalInformation, setAdditionalInformation] = useState<AdditionalInformation[]>([]);
  const [id, setId] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const user = useAuth();
  const [list, setList] = useState<string[]>([]);
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const overlay = useOverlay();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const types = [...new Set(additionalInformation.map(item => item.type))];

  const filteredAddInfo = additionalInformation.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesCategory = selectedCategory === '' || item.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  const getAdditionalInformationData = () => {
    setIsLoading(true);
    getAdditionalInformation().then(res => setAdditionalInformation(res))
    .catch(err => console.log(err))
    .finally(() => setIsLoading(false));
  }

  const addAdditionalInformation = () => {
    const formattedList = list.join("\n");
    const addInfoBody: AdditionalInformationPayload = {
      title : title,
      type : type,
      description: type === "paragraph" ? description : formattedList
    } 
    setIsLoading(true);
    createAdditionalInformation(addInfoBody, user.token as string)
    .then(() => {
      toast.success("Informasi tambahan berhasil ditambahkan.")
      getAdditionalInformationData();
      setTitle('');
      setType('');
      setDescription('');
    })
    .catch(err =>{
      if(err instanceof ApiError) {
        toast.error(`Kuliner khas gagal ditambahkan. Error : ${err.message}`);
        console.log(err.errors);
      }
      setIsLoading(false);
    });
  }

  const updateAdditionalInformationData = (id: number) => {
    const formattedList = list.join("\n");
    const addInfoBody: AdditionalInformationPayload = {
      title : title,
      type : type,
      description: type === "paragraph" ? description : formattedList
    } 
    setIsLoading(true);
    updateAdditionalInformation(id, addInfoBody, user.token as string)
    .then(() => {
      toast.success("Informasi tambahan berhasil diperbarui.")
      getAdditionalInformationData();
      setId(0);
      setTitle('');
      setType('');
      setDescription('');
      setList([]);
    })
    .catch(err =>{
      if(err instanceof ApiError) {
        toast.error(`Informasi tambahan gagal diperbarui. Error : ${err.message}`);
        console.log(err.errors);
      }
      setIsLoading(false);
    });
  }

  const deleteAdditionalInformationData = (id: number) => {
      deleteAdditionalInformation(id, user.token as string)
      .then(() => {
        toast.success("Informasi tambahan berhasil dihapus.");
        getAdditionalInformationData();
      })
      .catch(err => {
        if(err instanceof ApiError) {
          toast.error(`Informasi tambahan gagal dihapus. Error : ${err.message}`);
          console.log(err.errors);
        }
        setIsLoading(false);
      });
  }

  const handleAddArray = () => {
    setList(prev => [...prev, '']);
  }

  const handleArrayChange = (index: number, value: string) => {
    setList(list.map((item, i) => i === index ? value : item));
  }

  const handleArrayDelete = (index: number) => {
    setList(list.filter((_, i) => i !== index));
  }

  useEffect(()=> {
    if(!(overlay.statusDialogForm)) {
      if(id) {
        setId(0);
      }
      setTitle('');
      setDescription('');
      setType('');
    }
    },[overlay.statusDialogForm])

  useEffect(()=>{
    getAdditionalInformationData();
  },[])

  return (
    <>
      {/* Form CRUD */}
      <div className={`bg-white rounded-lg p-6 w-fit h-fit sm:w-[400px] inset-0 m-auto xl:left-[15%] z-10 shadow-lg ${overlay.statusDialogForm && overlay.status ? "absolute" : "hidden"}`}>
      <form onSubmit={(e) => {
        e.preventDefault();
        if(id) {
          setIsLoading(true);
          updateAdditionalInformationData(id);
          overlay.changeStatusDialogForm(false);
          overlay.changeStatus(false);
        } else {
          setIsLoading(true);
          addAdditionalInformation();
          overlay.changeStatusDialogForm(false);
          overlay.changeStatus(false);
        }
      }}>
        <div className="flex flex-col gap-4">
            <div>
              <span className="font-bold text-xl">Data Informasi Tambahan</span>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul *
              </label>
              <input
                type="text"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Masukkan judul informasi tambahan"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe *
              </label>
              <select required name="type" value={type} className="w-full px-4 py-2 rounded-md border-2 border-gray-200 focus:border-primary focus:outline-none" onChange={(e)=>setType(e.target.value)}>
                <option value="">- Pilih Tipe Informasi -</option>
                <option value="paragraph">Paragraf</option>
                <option value="list">Daftar/List</option>
              </select>
            </div>
            { type === 'paragraph' || type === '' 
                ?
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi *
                </label>
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  placeholder="Masukkan deskripsi informasi tambahan"
                />
              </div>
                :
              <div className="flex-1">
                <div className="flex flex-row items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 mb-2">
                    Daftar *
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddArray()}
                    className="text-primary hover:text-primary-dark flex items-center text-sm pb-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span>Tambah</span>
                  </button>
                </div>
                <div className="h-[200px] [scrollbar-width:none] overflow-y-scroll">
                  {list && list.map((item, index) => {
                    return (
                      <div key={index+'-list'} className="flex gap-2 mb-3">
                        <input
                          key={index+'-list'}
                          type="text"
                          value={item}
                          onChange={(e) => handleArrayChange(index, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                          placeholder="Masukkan deskripsi dari informasi"
                        />
                        <button
                          onClick={(e)=>{
                            e.preventDefault();
                            handleArrayDelete(index);
                          }}
                        >
                          <X className="h-4 w-4 text-red-800" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            }

            <div className="flex justify-end gap-2">
              <button
              type="button"
              onClick={() => {
                overlay.changeStatusDialogForm(false);
                overlay.changeStatus(false);

                if(id) {
                  setId(0);
                }

                setTitle('');
                setType('');
                setDescription('');
                setList([]);
              }}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md flex gap-2 items-center transition-colors duration-200 w-max"
              >
                Tutup
              </button>
              <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex gap-2 items-center transition-colors duration-200 w-max"
              >
                {id ? "Edit Informasi" : "Tambah Informasi"}
              </button>
            </div>
          </div>
      </form>
      </div>
      <div className="space-y-6 relative">
        {/* Header */}
        <div className="space-y-4 md:flex md:justify-between md:items-center">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Informasi Tambahan</h1>
          <div className="flex gap-2">
            <Link
              to="/transportasi"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex gap-2 items-center transition-colors duration-200 w-max"
            >
              <MoveUpRight className="h-4 w-4" />
              Kunjungi
            </Link>
            <button
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex gap-2 items-center transition-colors duration-200 w-max"
              onClick={()=>{
                overlay.changeStatus(true);
                overlay.changeStatusDialogForm(true);
              }}
            >
            <Plus className="h-4 w-4" />
            Tambah Informasi Tambahan
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari informasi tambahan..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Semua Tipe</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Additional Information Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Judul
                  </th>
                  <th className="px-6 py-3 text-xs text-center font-medium text-gray-500 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Deskripsi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!isLoading && additionalInformation && additionalInformation.length > 0 && filteredAddInfo.map((item) => (
                <Fragment key={`${item.id}-fragment`}>
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-2 md:px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <div className="ml-4">
                          <div className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-green-800 bg-green-100">
                            {item.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center">
                        <div className="ml-4">
                          
                          {item.type === 'paragraph' && 
                            <div className="text-sm text-gray-500 whitespace-pre-line text-justify">
                              {item.description}
                            </div>
                          }

                          {item.type === "list" && 
                            <ul className="text-sm list-disc pl-3 text-gray-500">
                              {item.description.split("\n").map((item,index) => {
                              return (
                                <li key={index}>{item}</li>
                              )
                            })}
                            </ul>
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={()=>setSelectedRow((prev) => prev === item.id ? 0 : item.id)}
                        className="bg-primary hover:bg-primary-dark text-white p-1 rounded-full transition-colors duration-200 md:hidden"
                      >
                         {selectedRow === item.id 
                        ? 
                        <ChevronUp className="h-4 w-4" />
                        :
                        <ChevronDown className="h-4 w-4" />
                        }
                      </button>
                      <div className="justify-end space-x-2 hidden md:flex">
                        <button
                          onClick={()=>{
                            setId(item.id);
                            setTitle(item.title);
                            setType(item.type);
                            if(item.type === "paragraph") {
                              setDescription(item.description);
                            } else {
                              setList(prev => [...prev, ...item.description.split("\n")]);
                            }
                            overlay.changeStatusDialogForm(true);
                            overlay.changeStatus(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setIsLoading(true);
                            deleteAdditionalInformationData(item.id);
                          }}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className={`${selectedRow === item.id ? "" : "hidden"} md:hidden`}>
                    <td colSpan={3} className="p-0">
                      <table>
                        <tbody className="divide-y">
                          <tr className="divide-x">
                            <td className="align-top pr-4 font-semibold pl-2 text-sm">Deskripsi</td>
                            <td className="p-1">{item.type === 'paragraph' 
                              ? 
                              <div className="text-sm text-gray-500 whitespace-pre-line text-justify">
                                {item.description}
                              </div>
                              :
                              item.description.split("\n").map((val,index) => {
                                return (
                                  <ul key={index} className="text-sm list-disc pl-3 text-gray-500">
                                    <li>{val}</li>
                                  </ul>
                                )
                              })
                              }
                            </td>
                          </tr>
                          <tr className="divide-x">
                            <td className="align-top pr-4 font-semibold pl-2 text-sm">Aksi</td>
                            <td className="px-1 py-2 text-right text-sm font-medium">
                              <div className="flex justify-start space-x-2">
                                <button
                                  onClick={()=>{
                                    setId(item.id);
                                    setTitle(item.title);
                                    setType(item.type);
                                    if(item.type === "paragraph") {
                                      setDescription(item.description);
                                    } else {
                                      setList(prev => [...prev, ...item.description.split("\n")]);
                                    }
                                    overlay.changeStatusDialogForm(true);
                                    overlay.changeStatus(true);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900 p-1"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setIsLoading(true);
                                    deleteAdditionalInformationData(item.id);
                                  }}
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Hapus"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </Fragment>
                ))
                }
              </tbody>
            </table>
          </div> 

          {isLoading ? <div className=" flex flex-col items-center py-8">
              <PuffLoader
                color={"#4B5563"}
                loading={isLoading}
                size={40}
                className="mb-6"
              />
              <p className="text-gray-500">Memuat data informasi tambahan...</p>
            </div>
            :
            <></>
          }

          {!isLoading && additionalInformation.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada informasi tambahan yang ditemukan.</p>
            </div>
          )}


        </div>
      </div>
    </>
  );
};

export default AdditionalInformationList;