import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import API from '../utils/api';
import { Search, BookOpen, CheckCircle } from 'lucide-react';

const Modules = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadModules = async () => {
      try {
        setLoading(true);
        const response = await API.get('/modules');
        setModules(response.data.modules || []);
      } catch (error) {
        console.error('Error loading modules:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  const searchTerm = search.trim().toLowerCase();
  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const normalizedName = module.name?.toLowerCase() || '';
      const normalizedCode = module.code?.toLowerCase() || '';
      return (
        normalizedName.includes(searchTerm) ||
        normalizedCode.includes(searchTerm)
      );
    });
  }, [modules, searchTerm]);

  const highlightedModuleCodes = useMemo(() => {
    if (user?.role === 'lecturer') {
      return new Set((user.teachingModules || []).map((code) => String(code).trim().toUpperCase()));
    }
    if (user?.role === 'student' || user?.role === 'expert') {
      return new Set((user.enrolledModules || []).map((code) => String(code).trim().toUpperCase()));
    }
    return new Set();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary-500" />
              Modules
            </h1>
            <p className="text-gray-600 mt-2">
              Browse available modules and see the ones assigned to your role.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm text-primary-700">
              <BookOpen className="w-4 h-4" />
              {user?.role === 'lecturer' ? 'Teaching modules' : 'Enrolled modules'}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4" />
              {highlightedModuleCodes.size} items
            </span>
          </div>
        </div>

        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">All Modules</p>
              <p className="text-sm text-gray-500">Search and discover module details.</p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search modules..."
                className="w-full rounded-xl border border-gray-200 bg-white px-11 py-3 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size="lg" text="Loading modules..." />
          </div>
        ) : filteredModules.length === 0 ? (
          <Card className="py-20 text-center text-gray-500">
            No modules found. Try a different search term or check back later.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredModules.map((module) => {
              const code = module.code || module.code?.toUpperCase();
              const isHighlighted = highlightedModuleCodes.has(String(module.code).trim().toUpperCase());

              return (
                <Card
                  key={module.code || module._id}
                  className={`border ${isHighlighted ? 'border-primary-400 ring-1 ring-primary-100' : 'border-gray-200'}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{module.code}</h2>
                      <p className="text-sm text-gray-600 mt-1">{module.name}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {module.year && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                          Year {module.year}
                        </span>
                      )}
                      {module.level && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                          Level {module.level}
                        </span>
                      )}
                      {isHighlighted && (
                        <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">
                          My module
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Modules;
