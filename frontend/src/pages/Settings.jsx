import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { User, Shield, Bell, Layout, Moon, Sun, Save, Settings as SettingsIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <DashboardLayout>
      <div className="p-8 w-full min-h-screen">
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary-100 rounded-2xl">
                <SettingsIcon className="w-8 h-8 text-primary-600" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage your account preferences and system configuration.</p>
            </div>
        </div>
        
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" /> Account Context
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">Full Name</p>
                <p className="text-gray-900 font-bold">{user?.fullName}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">System Role</p>
                <div className="flex items-center gap-2">
                  <span className="capitalize text-gray-900 font-bold">{user?.role}</span>
                  <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">ID: {user?._id?.slice(-6)}</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 md:col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">Verified Email Address</p>
                <p className="text-gray-900 font-bold">{user?.email}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-500" /> Security & Privacy
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                <div>
                   <p className="font-bold text-red-900">Change Password</p>
                   <p className="text-sm text-red-700">Update your account password to stay secure.</p>
                </div>
                <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">Reset Security Credentials</Button>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-500" /> Notification & View Preferences
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all cursor-pointer group">
                <div>
                  <p className="font-bold text-gray-800">System Alerts & Email Updates</p>
                  <p className="text-xs text-gray-500">Receive real-time notifications for session changes and new academic materials.</p>
                </div>
                <div 
                    onClick={() => setNotifications(!notifications)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${notifications ? 'bg-primary-600' : 'bg-gray-300'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'left-7' : 'left-1'}`} />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all cursor-pointer">
                <div>
                  <p className="font-bold text-gray-800">Interface Theme (Beta)</p>
                  <p className="text-xs text-gray-500">Currently optimized for Light Mode. Enable Dark Mode for an experimental view.</p>
                </div>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${darkMode ? 'bg-gray-900 text-yellow-400' : 'bg-white text-gray-500 border border-gray-200'}`}
                >
                  {darkMode ? <><Sun className="w-4 h-4" /> Light</> : <><Moon className="w-4 h-4" /> Dark</>}
                </button>
              </div>
            </div>
          </Card>

          <div className="flex justify-end pt-4">
            <Button icon={Save} onClick={handleSave}>Apply Settings Changes</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
