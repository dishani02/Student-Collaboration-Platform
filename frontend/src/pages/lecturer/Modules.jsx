
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import { BookOpen, Users, Clock, ArrowRight, Search, FileText } from 'lucide-react';

const LecturerModules = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchModules();
  }, [user._id]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await API.get('/modules');
      const allModules = res.data.modules || [];
      const teachingModules = user.teachingModules || [];
      
      setModules(allModules.filter(m => teachingModules.includes(m.code)));
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredModules = modules.filter(m => 
    m.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Teaching Modules</h1>
          <p className="text-gray-600 mt-1">
            Manage and view peer session activity for modules assigned to you.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by module code or name..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
        </Card>

        {filteredModules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredModules.map((module) => (
              <Card 
                key={module._id} 
                className="hover:shadow-md transition-all cursor-pointer border-l-4 border-primary-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 leading-tight">
                      {module.name}
                    </h3>
                    <Badge variant="primary-outline" className="mt-2 font-mono tracking-wider">
                      {module.code}
                    </Badge>
                  </div>
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary-600" />
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Year {module.year} • Semester {module.semester}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{module.credits || '3'} Credits</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between group">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    View Activity Dashboard
                  </span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-20 bg-gray-50 border-dashed text-center">
            <h4 className="text-gray-900 font-bold mb-1">No modules found</h4>
            <p className="text-gray-500 text-sm">
              {searchQuery ? 'Try matching a different module code or name.' : 'You haven\'t assigned any teaching modules to your profile yet.'}
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LecturerModules;
