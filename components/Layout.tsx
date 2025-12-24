import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Role } from '../types';
import { 
  Plane, 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  Menu,
  X,
  UserCircle,
  ClipboardList,
  BarChart3
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const isAdmin = user.role === Role.ADMIN;
  const isActive = (path: string) => location.pathname === path;

  const NavLinks = () => (
    <>
      {isAdmin ? (
        <>
          <Link
            to="/admin/workbench"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/workbench') 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span>处理中心</span>
          </Link>
          <Link
            to="/admin/stats"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/stats') 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>数据统计</span>
          </Link>
        </>
      ) : (
        <>
          <Link
            to="/user/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/user/dashboard') 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>我的需求</span>
          </Link>
          <Link
            to="/user/create"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/user/create') 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span>新建需求</span>
          </Link>
          <Link
            to="/user/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/user/profile') 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <UserCircle className="w-5 h-5" />
            <span>个人资料</span>
          </Link>
        </>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col flex-shrink-0 z-20">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">TripFlow</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavLinks />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 px-4 py-3 mb-2">
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
               {user.name.charAt(0)}
             </div>
             <div className="flex-1 overflow-hidden">
               <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
               <p className="text-xs text-gray-500 truncate">{user.role === Role.ADMIN ? '管理员' : '普通用户'}</p>
             </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center z-30 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center space-x-2">
              <Plane className="w-6 h-6 text-indigo-600" />
              <span className="font-bold text-lg text-gray-800">TripFlow</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
             {user.name.charAt(0)}
          </div>
        </header>

        {/* Mobile Navigation Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 top-16 bg-gray-800 bg-opacity-50 z-20" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="bg-white w-3/4 h-full shadow-xl flex flex-col p-4" onClick={e => e.stopPropagation()}>
               <nav className="flex-1 space-y-2">
                 <NavLinks />
               </nav>
               <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex items-center space-x-3 px-4 py-2 mb-2">
                     <div className="flex-1 overflow-hidden">
                       <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                       <p className="text-xs text-gray-500 truncate">{user.email}</p>
                     </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;