
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import { 
  Users, 
  Calendar, 
  FileText, 
  UserCheck, 
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle,
  History
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/dashboard/stats');
      setStats(res.data.stats);
      setRecentSessions(res.data.recentSessions || []);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text="Loading admin dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  const userStats = stats?.users || {};
  const sessionStats = stats?.sessions || {};

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Overview 🛡️</h1>
          <p className="text-gray-600 mt-1">
            System status and pending management tasks.
          </p>
        </div>

        {/* Top Level Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-t-4 border-blue-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold">{Object.values(userStats).reduce((a, b) => a + b, 0)}</h3>
                <p className="text-xs text-gray-400 mt-1">{userStats.student || 0} students, {userStats.expert || 0} experts</p>
              </div>
            </div>
          </Card>

          <Card className="border-t-4 border-green-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                <h3 className="text-2xl font-bold">{sessionStats.pending || 0}</h3>
                <p className="text-xs text-gray-400 mt-1">{sessionStats.completed || 0} completed</p>
              </div>
            </div>
          </Card>

          <Card className="border-t-4 border-purple-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Resources</p>
                <h3 className="text-2xl font-bold">{stats?.totalResources || 0}</h3>
                <p className="text-xs text-gray-400 mt-1">Study materials & guides</p>
              </div>
            </div>
          </Card>

          <Card className="border-t-4 border-amber-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-xl">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Module Load</p>
                <h3 className="text-2xl font-bold">{sessionStats.requested || 0}</h3>
                <p className="text-xs text-gray-400 mt-1">Current session requests</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Center Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pending Approvals */}
          <Card title="Management Queue" icon={UserCheck}>
            <div className="space-y-4">
              <div 
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer group"
                onClick={() => navigate('/expert-queue')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Expert Approvals</h4>
                    <p className="text-sm text-gray-500">{stats?.pendingExperts || 0} experts waiting for verification</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <Badge variant="warning">{stats?.pendingExperts || 0}</Badge>
                   <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              <div 
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer group"
                onClick={() => navigate('/admin/sessions')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Session Requests</h4>
                    <p className="text-sm text-gray-500">{stats?.pendingSessionRequests || 0} student-requested sessions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <Badge variant="warning">{stats?.pendingSessionRequests || 0}</Badge>
                   <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 transform group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activity / Sessions */}
          <Card title="Recent Activity" icon={History}>
             <div className="space-y-4">
               {recentSessions.length > 0 ? (
                 recentSessions.map((s) => (
                   <div key={s._id} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 line-clamp-1">{s.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge size="sm" variant="primary-outline">{s.moduleCode}</Badge>
                          <span className="text-xs text-gray-400">{formatDate(s.createdAt)}</span>
                        </div>
                      </div>
                      <Badge variant={s.status === 'completed' ? 'success' : s.status === 'pending' ? 'info' : 'warning'}>
                        {s.status}
                      </Badge>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-8">
                   <p className="text-sm text-gray-400">No recent activity found.</p>
                 </div>
               )}
               <Button 
                variant="ghost" 
                size="sm" 
                fullWidth 
                icon={ArrowRight} 
                onClick={() => navigate('/admin/sessions')}
                className="mt-2"
               >
                 View All Sessions
               </Button>
             </div>
          </Card>
        </div>

        {/* Global Quick Links */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-primary-500" />
            Quick Administration
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <button 
              onClick={() => navigate('/admin/sessions/create')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-primary-50 hover:border-primary-100 hover:shadow-md transition-all group"
             >
                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-sm font-bold text-gray-700">New Session</span>
             </button>

             <button 
              onClick={() => navigate('/users')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-blue-50 hover:border-blue-100 hover:shadow-md transition-all group"
             >
                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-bold text-gray-700">Manage Users</span>
             </button>

             <button 
              onClick={() => navigate('/resources')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-purple-50 hover:border-purple-100 hover:shadow-md transition-all group"
             >
                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-bold text-gray-700">Content Hub</span>
             </button>

             <button 
              onClick={() => navigate('/settings')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-amber-50 hover:border-amber-100 hover:shadow-md transition-all group"
             >
                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-sm font-bold text-gray-700">System Logs</span>
             </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
