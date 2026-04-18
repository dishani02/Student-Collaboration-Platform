
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import { 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Clock,
  Layout,
  FileText,
  Users,
  Star,
  PlusCircle
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user?._id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/dashboard/stats');
      setStats(res.data.stats);
      setRecentSessions(res.data.recentSessions || []);
    } catch (error) {
      console.error('Error fetching student dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text="Loading your dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 w-full min-h-screen">
        {/* Welcome Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
               <Layout className="w-8 h-8 text-primary-600" /> Student Dashboard
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              Welcome back, {user?.fullName}. You're enrolled in <span className="text-primary-600 font-bold">{user?.enrolledModules?.length || 0} modules</span> this semester.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Button icon={Sparkles} onClick={() => navigate('/student/sessions?tab=ai-recommendations')}>
               AI Suggestions
             </Button>
          </div>
        </div>

        {/* Top Stats Grid - Expert Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sessions Joined</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats?.totalSessions || 0}</h3>
                <p className="text-xs text-gray-500 mt-1">Completed learning sessions</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Academic Modules</p>
                <h3 className="text-3xl font-bold text-gray-900">{user?.enrolledModules?.length || 0}</h3>
                <p className="text-xs text-gray-500 mt-1">Enrolled this semester</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming Sessions</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats?.myUpcoming || 0}</h3>
                <p className="text-xs text-gray-500 mt-1">Confirmed sessions to attend</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-primary-600" /> Latest Announcements
                </h2>
                <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/student/sessions')}>
                  Explore Hub
                </Button>
              </div>

              {recentSessions.length > 0 ? (
                <div className="space-y-4">
                  {recentSessions.slice(0, 5).map((s) => (
                    <div 
                      key={s._id} 
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50/40 cursor-pointer transition-all"
                      onClick={() => navigate(`/student/sessions/${s._id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg shadow-sm flex items-center justify-center font-bold text-primary-600 text-xs">
                            {s.moduleCode}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{s.title}</h4>
                            <p className="text-sm text-gray-500 flex items-center gap-2 font-medium">
                              <Calendar className="w-3.5 h-3.5" /> {formatDate(s.date)} • {s.startTime}
                            </p>
                          </div>
                        </div>
                        <Badge variant={s.status === 'confirmed' ? 'success' : 'warning'} size="sm">
                          {s.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 text-sm italic">
                  No upcoming sessions found for your modules.
                </div>
              )}
            </Card>

            {/* My Modules Card */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary-600" /> My Modules
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>Update Profile</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {user?.enrolledModules?.map(code => (
                   <div key={code} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                     <span className="text-sm font-bold text-gray-800">{code}</span>
                     <button 
                      onClick={() => navigate(`/resources?module=${code}`)}
                      className="text-[10px] font-bold text-primary-600 hover:underline hover:text-primary-700 uppercase tracking-wide transition-colors"
                     >
                       View Materials
                     </button>
                   </div>
                 ))}
                 {(!user?.enrolledModules || user.enrolledModules.length === 0) && (
                   <p className="text-sm text-gray-500 italic col-span-2">No modules found. Please update your profile.</p>
                 )}
              </div>
            </Card>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/chat')}
                  className="w-full flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-bold text-gray-700 text-sm">Open Collaboration Chat</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transform group-hover:translate-x-1 transition-all" />
                </button>

                <button 
                  onClick={() => navigate('/resources')}
                  className="w-full flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="font-bold text-gray-700 text-sm">Browse Learning Resources</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transform group-hover:translate-x-1 transition-all" />
                </button>

                <button 
                  onClick={() => navigate('/student/sessions')}
                  className="w-full flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="font-bold text-gray-700 text-sm">Join Group Sessions</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transform group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </Card>

            <Card className="bg-primary-600 text-white border-none shadow-lg shadow-primary-200">
               <div className="flex items-center gap-3 mb-3">
                 <Sparkles className="w-6 h-6 text-primary-200" />
                 <h3 className="font-bold text-lg">AI Tutor Tip</h3>
               </div>
               <p className="text-sm text-primary-100 leading-relaxed">
                 Updating your <span className="font-bold text-white underline cursor-pointer" onClick={() => navigate('/profile')}>Academic Profile</span> helps me recommend the most relevant study materials for your specialization.
               </p>
               <Button 
                variant="outline" 
                className="mt-4 border-white text-white hover:bg-white hover:text-primary-600 w-full"
                onClick={() => navigate('/student/sessions?tab=ai-recommendations')}
               >
                 View Suggestions
               </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;