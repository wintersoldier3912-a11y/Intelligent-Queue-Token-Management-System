import React from 'react';
import { Link } from 'react-router-dom';
import { User, Monitor, Users, ExternalLink, Shield } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { useSystem } from '../context/SystemContext';

export const Home: React.FC = () => {
  const { resetSystem } = useSystem();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto text-center py-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
          Intelligent Queue Management
        </h1>
        <p className="text-xl text-gray-500 mb-12">
          Select a role to simulate the end-to-end flow. Open different roles in different tabs to see real-time updates.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Customer</h2>
            <p className="text-sm text-gray-500 mb-4 min-h-[40px]">Get a token and track status.</p>
            <Link to="/customer">
              <Button fullWidth>Enter</Button>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <User className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Operator</h2>
            <p className="text-sm text-gray-500 mb-4 min-h-[40px]">Serve customers & manage counters.</p>
            <Link to="/operator">
              <Button fullWidth variant="secondary">Login</Button>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Admin</h2>
            <p className="text-sm text-gray-500 mb-4 min-h-[40px]">Manage services, counters & users.</p>
            <Link to="/admin">
              <Button fullWidth variant="secondary">Manage</Button>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Monitor className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Kiosk</h2>
            <p className="text-sm text-gray-500 mb-4 min-h-[40px]">Waiting area display screen.</p>
            <Link to="/kiosk" target="_blank">
              <Button fullWidth variant="outline">
                Launch <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
           <p className="text-sm text-gray-400 mb-4">Development Tools</p>
           <Button variant="danger" size="sm" onClick={resetSystem}>Reset System Data</Button>
        </div>
      </div>
    </Layout>
  );
};