import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { BookOpen, Users, LogOut, ChevronRight } from 'lucide-react';

const Modules = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    fetchModulesWithStats();
  }, []);

  const fetchModulesWithStats = async () => {
    try {
      setLoading(true);
      // user.teachingModules has an array of strings e.g. ["IT1120", "SE1010"]
      
      const teaching = user?.teachingModules || [];
      if (teaching.length === 0) {
        setModules([]);
        return;
      }

      // Fetch all projects to count groups per module
      const res = await API.get('/groups/projects');
      const allProjects = res.data.projects || [];

      // Build module stats
      const moduleStats = teaching.map(modCode => {
        const modProjects = allProjects.filter(p => p.module === modCode);
        return {
          code: modCode,
          name: 'Academic Module', // Default if we don't fetch specific names
          projectCount: modProjects.length,
          activeProjectCount: modProjects.filter(p => p.status === 'open').length
        };
      });

      setModules(moduleStats);
    } catch (error) {
      console.error('Error fetching module stats:', error);
      toast.error('Failed to load teaching modules.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text="Loading modules..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
        <div className="mb-8 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-900">My Modules</h1>
          <p className="text-gray-600 mt-1">Modules currently assigned to your teaching portfolio.</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {modules.length === 0 ? (
            <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Modules Assigned</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                You haven't been assigned any teaching modules yet. Please update your profile to select your modules.
              </p>
              <button 
                onClick={() => navigate('/lecturer/profile')}
                className="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                Go to Profile
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map(mod => (
                <Card 
                  key={mod.code} 
                  className="hover:-translate-y-1 transition-transform cursor-pointer hover:shadow-lg border border-gray-200"
                  onClick={() => navigate('/lecturer/groups')} // Send them to groups page filtered by module ideally
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    {mod.activeProjectCount > 0 && (
                      <Badge variant="warning">{mod.activeProjectCount} Active Tables</Badge>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{mod.code}</h3>
                  <p className="text-gray-500 text-sm mb-6">{mod.name}</p>

                  <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                      <Users className="w-4 h-4" />
                      {mod.projectCount} Group Projects
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Modules;
