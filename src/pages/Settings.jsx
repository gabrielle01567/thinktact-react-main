import React from 'react';

const Settings = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-pink-950 text-center mb-10 sm:mb-12">Settings</h1>
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
            <p className="mt-1 text-sm text-gray-500">Manage your account preferences</p>
            
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Email Notifications</h3>
                  <p className="text-xs text-gray-500">Receive emails about your analyses and updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-950"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Dark Mode</h3>
                  <p className="text-xs text-gray-500">Switch between light and dark themes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-950"></div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Analysis Preferences</h2>
            <p className="mt-1 text-sm text-gray-500">Customize your argument analysis experience</p>
            
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="analysis-depth" className="block text-sm font-medium text-gray-700 mb-1">Analysis Depth</label>
                <select id="analysis-depth" className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-pink-700 focus:ring-pink-700">
                  <option>Standard</option>
                  <option>Detailed</option>
                  <option>Comprehensive</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="visualization-style" className="block text-sm font-medium text-gray-700 mb-1">Visualization Style</label>
                <select id="visualization-style" className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-pink-700 focus:ring-pink-700">
                  <option>Modern</option>
                  <option>Classic</option>
                  <option>Minimal</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button type="button" className="px-4 py-2 mr-3 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 border border-gray-300 rounded-md">
              Cancel
            </button>
            <button type="button" className="px-4 py-2 text-sm font-medium text-white bg-pink-950 hover:bg-pink-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 border border-transparent rounded-md">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 