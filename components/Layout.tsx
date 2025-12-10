import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Layers, Monitor, Users, Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, hideNav = false }) => {
  const location = useLocation();

  // Simple check to highlight active link
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!hideNav && (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center gap-2 text-brand-700 font-bold text-xl">
                  <Layers className="h-8 w-8" />
                  <span>QFlow</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/customer"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/customer') ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-1" />
                  Customer
                </Link>
                <Link
                  to="/operator"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/operator') ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Monitor className="h-4 w-4 inline mr-1" />
                  Operator
                </Link>
                 <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin') ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="h-4 w-4 inline mr-1" />
                  Admin
                </Link>
                <Link
                  to="/kiosk"
                  target="_blank"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Monitor className="h-4 w-4 inline mr-1" />
                  Kiosk View
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      {!hideNav && (
        <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} QFlow Systems. Production Simulation.
          </div>
        </footer>
      )}
    </div>
  );
};