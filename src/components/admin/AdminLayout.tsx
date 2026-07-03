import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/authContextValue';
import { 
  MapPin, 
  Bed, 
  Utensils, 
  LogOut,
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const menuItems = [
    {
      title: 'Destinasi',
      icon: MapPin,
      path:'/admin/destinations'
    },
    {
      title: 'Akomodasi',
      icon: Bed,
      path: '/admin/accommodations'
    },
    {
      title: 'Kuliner',
      icon: Utensils,
      path: '/admin/culinary'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg relative">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-primary" />
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
              <p className="text-sm text-gray-600">Visit Temajuk</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          {menuItems.map((item, index) => (
            <div key={index}>
                <div className={`px-6 py-3 ${isActive(item.path) ? 'bg-primary text-white' : 'bg-white text-gray-700' }   `}>
                  <Link to={item.path} className="flex items-center font-medium mb-2">
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.title}
                  </Link>
                </div>
              </div>
             ))}
        </nav>

        <div className="fixed bottom-0 w-64 p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.username}</p>
              <p className="text-xs text-gray-600">Administrator</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              {location.pathname.includes('/destinations') && 'Manajemen Destinasi'}
              {location.pathname.includes('/accommodations') && 'Manajemen Akomodasi'}
              {location.pathname.includes('/culinary') && 'Manajemen Kuliner'}
            </h2>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
