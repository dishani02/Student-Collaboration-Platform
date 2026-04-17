import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { Search, UserCheck, AlertCircle, BookOpen, GraduationCap } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const AdminApprovalQueue = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('experts'); // 'experts' or 'lecturers'

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const [expertsRes, lecturersRes] = await Promise.all([
        API.get('/users?role=expert&status=pending').catch(() => ({ data: { users: [] } })),
        API.get('/users?role=lecturer&status=pending').catch(() => ({ data: { users: [] } }))
      ]);
      
      setExperts(expertsRes.data.users || []);
      setLecturers(lecturersRes.data.users || []);
    } catch (e) {
      console.error('Failed to load approval queues', e);
      setExperts([]);
      setLecturers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLecturerApproval = async (userId, e) => {
    e.stopPropagation();
    if (window.confirm('Approve this Lecturer account? They will gain immediate access to create group tables.')) {
      try {
        await API.patch(`/users/${userId}/status`, { status: 'active' });
        toast.success('Lecturer approved successfully!');
        fetchPendingUsers(); // Refresh lists without reloading page
      } catch (err) {
        toast.error('Failed to approve lecturer');
      }
    }
  };

  const currentList = activeTab === 'experts' ? experts : lecturers;

  const filtered = currentList.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.studentId?.toLowerCase().includes(q) ||
      u.lecturerId?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="p-8 h-[calc(100vh-64px)] flex flex-col">
        <div className="flex items-start justify-between mb-6 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <UserCheck className="w-7 h-7 text-primary-600" />
              Approval Queue
            </h1>
            <p className="text-gray-600 mt-1">
              Review and approve incoming applications for Expert Students and Lecturers.
            </p>
          </div>
        </div>

        <Card className="mb-6 flex-shrink-0 p-4 border-b-0 rounded-b-none">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between border-b border-gray-100 pb-4 mb-4">
            <div className="flex gap-4">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'experts' 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('experts')}
              >
                <GraduationCap className="w-5 h-5" />
                Expert Students
                <Badge variant={experts.length > 0 ? 'warning' : 'default'} size="sm" className="ml-1">
                  {experts.length}
                </Badge>
              </button>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'lecturers' 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('lecturers')}
              >
                <BookOpen className="w-5 h-5" />
                Lecturers
                <Badge variant={lecturers.length > 0 ? 'warning' : 'default'} size="sm" className="ml-1">
                  {lecturers.length}
                </Badge>
              </button>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
          </div>
        </Card>

        <div className="flex-1 overflow-y-auto pb-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" text={`Loading ${activeTab} applications...`} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border rounded-lg border-gray-200 shadow-sm flex items-center justify-center p-12">
              <div className="text-center">
                <CheckIcon />
                <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-1">
                  No pending {activeTab === 'experts' ? 'expert' : 'lecturer'} applications
                </h3>
                <p className="text-gray-600 text-sm">
                  You're all caught up! Application requests will appear here for review.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((user) => (
                <Card
                  key={user._id}
                  hover
                  className="cursor-pointer border border-gray-200"
                  onClick={() => navigate(activeTab === 'experts' ? `/admin/expert-queue/${user._id}` : `/admin/users`)} 
                  // TODO: we probably need a /admin/lecturer-queue/:id or to just handle it in /admin/users
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeTab === 'experts' ? 'bg-primary-100 text-primary-600' : 'bg-blue-100 text-blue-600'}`}>
                        <span className="font-semibold text-lg">
                          {user.fullName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                          {user.fullName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 font-mono text-xs">{user.email}</p>
                        
                        {activeTab === 'experts' ? (
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 font-medium">
                            {user.studentId && <span className="bg-gray-100 px-2 py-1 rounded">ID: {user.studentId}</span>}
                            {user.yearLevel && <span className="bg-gray-100 px-2 py-1 rounded">Year {user.yearLevel}</span>}
                            {user.specialization && (
                              <Badge variant="primary" size="sm">
                                {user.specialization}
                              </Badge>
                            )}
                            {user.gpa && (
                              <Badge variant="success" size="sm">
                                GPA {user.gpa}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 font-medium">
                            {user.lecturerId && <span className="bg-gray-100 px-2 py-1 rounded">ID: {user.lecturerId}</span>}
                            {user.department && <span className="bg-gray-100 px-2 py-1 rounded">{user.department}</span>}
                            {user.position && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">{user.position}</span>}
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-3 font-medium">
                          Applied {formatDate(user.createdAt || user.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <Badge variant="warning" size="sm" className="uppercase tracking-wider">
                        Pending
                      </Badge>
                      <Button
                        size="sm"
                        variant={activeTab === 'experts' ? 'primary' : 'outline'}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeTab === 'experts') {
                            navigate(`/admin/expert-queue/${user._id}`);
                          } else {
                            // If we don't have a specific lecturer detail view yet, we can go to Users management
                            // Or we could build a quick modal/action here to directly approve them. Let's do a prompt for now.
                            handleLecturerApproval(user._id, e);
                          }
                        }}
                      >
                        {activeTab === 'experts' ? 'Review Application' : 'Quick Approve'}
                      </Button>
                    </div>
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

const CheckIcon = () => (
  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-50 border border-green-200">
    <AlertCircle className="w-7 h-7 text-green-500" />
  </div>
);

export default AdminApprovalQueue;
