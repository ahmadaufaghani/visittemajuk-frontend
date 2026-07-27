import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/authContextValue';
import {
  MapPin,
  Bed,
  Utensils,
  LogOut,
  Menu,
  Bus,
  Camera,
  ChevronDown,
  ChevronUp,
  X,
  KeyRound,
  Settings,
} from 'lucide-react';
import { useOverlay } from '../../contexts/OverlayContext';
import ChangePasswordModal from './ChangePasswordModal';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [idOpenedSubMenu, setIdOpenedSubMenu] = useState<number>(0);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isHeightShrinked, setIsHeightShrinked] = useState<boolean>(false);
  const overlay = useOverlay();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = useMemo(() => [
    { title: 'Beranda & Footer', icon: Settings, path: '/admin/settings' },
    { title: 'Destinasi', icon: MapPin, path: '/admin/destinations' },
    { title: 'Akomodasi', icon: Bed, path: '/admin/accommodations' },
    {
      title: 'Transportasi',
      icon: Bus,
      path: '/admin/transportations',
      subMenu: [{ title: 'Informasi Tambahan', path: '/information' }],
    },
    {
      title: 'Kuliner',
      icon: Utensils,
      path: '/admin/culinary',
      subMenu: [{ title: 'Kuliner Khas', path: '/additional' }],
    },
    {
      title: 'Spot Foto',
      icon: Camera,
      path: '/admin/photo-spots',
      subMenu: [{ title: 'Tips Fotografi', path: '/photography-tips' }],
    },
  ], []);

  window.addEventListener('resize', () => {
    if(window.innerWidth >= 1280) {
      overlay.changeStatusSideBarMobile(false);
      overlay.changeStatusDialogForm(false);
      overlay.changeStatus(false);
    }
    
    if(window.innerHeight <= 480) {
      setIsHeightShrinked(true);
    } else {
      setIsHeightShrinked(false);
    }
  });

  window.addEventListener('scroll', () => {
    if(window.innerHeight <= 120) {
      return setIsHeightShrinked(true);
    }
    
    if(window.innerHeight <= 480 && window.scrollY >= 101) {
      setIsHeightShrinked(false);
    }
    
    if (window.innerHeight <= 480 && window.scrollY <= 100) {
      setIsHeightShrinked(true);
    }
  })

  useEffect(() => {
    const subMenu = location.pathname.split("/")[3];
    menuItems.map((val, i) => location.pathname.startsWith(val.path) && subMenu && (subMenu !== 'edit' && subMenu !== 'add') && setIdOpenedSubMenu(i));
    if(window.innerHeight <= 480) {
      setIsHeightShrinked(true);
    }
  },[location.pathname, menuItems]);

  return (
    <div className="relative min-h-screen bg-gray-100 lg:flex">
      <div
        onClick={() => {
          overlay.changeStatusSideBarMobile(false);
          overlay.changeStatusDialogForm(false);
          overlay.changeStatus(false);
        }}
        className={`${overlay.status ? 'absolute' : 'hidden'} bg-black/80 backdrop-blur w-full h-full z-10`}
      ></div>

      <button
        onClick={() => {
          overlay.changeStatusSideBarMobile(false);
          overlay.changeStatus(false);
        }}
        className={`rounded-full h-12 w-12 bg-gray-400/50 flex justify-center items-center z-20 bottom-10 right-10 ${
          overlay.statusSideBarMobile && overlay.status ? 'fixed' : 'hidden'
        } xl:hidden`}
      >
        <X className="h-4 w-4" />
      </button>

      <div
        className={`${
          overlay.statusSideBarMobile && overlay.status ? 'left-0' : 'left-[-400px]'
        } absolute h-full w-64 z-10 bg-white shadow-lg xl:left-0 xl:h-auto xl:relative xl:block transition-all duration-500 ease-in-out`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-primary" />
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
              <p className="text-sm text-gray-600">Visit Temajuk</p>
            </div>
          </div>
        </div>

        <nav className="lg:mt-6">
          {menuItems.map((item, index) => (
            <div key={item.title}>
              <div
                className={`px-6 py-3 flex items-center justify-between ${
                  isActive(item.path) ? 'bg-primary text-white' : 'bg-white text-gray-700'
                }`}
              >
                <Link
                  onClick={() => {
                    overlay.changeStatusSideBarMobile(false);
                    overlay.changeStatus(false);
                    setIdOpenedSubMenu(0);
                  }}
                  to={item.path}
                  className="flex items-center font-medium mb-2"
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.title}
                </Link>
                {item.subMenu && item.subMenu.length > 0 ? (
                  <button
                    onClick={() => setIdOpenedSubMenu((prev) => (prev === index ? 0 : index))}
                  >
                    {idOpenedSubMenu === index ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                ) : null}
              </div>
              {idOpenedSubMenu === index && item.subMenu && item.subMenu.length > 0
                ? item.subMenu.map((childItem) => (
                    <div
                      key={`${item.title}-submenu-${childItem.title}`}
                      className={`pl-12 py-3 ${
                        isActive(item.path + childItem.path) ? 'bg-gray-200 text-gray-700' : 'bg-white text-gray-700'
                      }`}
                    >
                      <Link
                        onClick={() => {
                          overlay.changeStatusSideBarMobile(false);
                          overlay.changeStatus(false);
                        }}
                        to={item.path + childItem.path}
                        className="flex items-center gap-4 font-medium text-sm mb-2"
                      >
                        <span>{'\u2022'}</span>
                        <span>{childItem.title}</span>
                      </Link>
                    </div>
                  ))
                : null}
            </div>
          ))}
        </nav>
             
        <div className={`${isHeightShrinked ? "" : "fixed bottom-0"} w-64 p-6 border-t border-gray-200 transition-all -z-10`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.username}</p>
              <p className="text-xs text-gray-600">Administrator</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsChangePasswordOpen(true)}
                className="p-2 text-gray-600 hover:text-primary transition-colors duration-200"
                title="Ganti Password"
                aria-label="Ganti Password"
              >
                <KeyRound className="h-5 w-5" />
              </button>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center gap-4 px-6 py-4">
            <Menu
              className="cursor-pointer xl:hidden"
              onClick={() => {
                overlay.changeStatusSideBarMobile(true);
                overlay.changeStatus(true);
              }}
            />
            <h2 className="text-2xl font-semibold text-gray-800">
              {location.pathname.includes('/destinations') && 'Manajemen Destinasi'}
              {location.pathname.includes('/accommodations') && 'Manajemen Akomodasi'}
              {location.pathname.includes('/transportations/information') && 'Informasi Tambahan'}
              {location.pathname.includes('/transportations') && 'Transportasi'}
              {location.pathname.includes('/culinary/additional') && 'Kuliner Khas'}
              {location.pathname.includes('/culinary') && 'Kuliner'}
              {location.pathname.includes('/photo-spots/photography-tips') && 'Tips Fotografi'}
              {location.pathname.includes('/photo-spots') && !location.pathname.includes('/photography-tips') && 'Spot Foto'}
              {location.pathname === '/admin/settings' && 'Beranda & Footer'}
            </h2>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
};

export default AdminLayout;
