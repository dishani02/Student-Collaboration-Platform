// import Sidebar from '../../components/layout/Sidebar';
// import { useAuth } from '../../context/AuthContext';

// const Dashboard = () => {
//   const { user } = useAuth();

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <Sidebar />
//       <div className="flex-1">
//         <div className="bg-white border-b border-gray-200 px-8 py-6">
//           <h1 className="text-2xl font-bold">Dashboard</h1>
//           <p className="text-gray-600">Welcome back, {user?.fullName}!</p>
//         </div>

//         <div className="p-8">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//             <div className="bg-white rounded-lg p-6 shadow-sm border">
//               <h3 className="text-sm text-gray-600 mb-2">Profile Completion</h3>
//               <div className="flex items-end gap-2">
//                 <span className="text-3xl font-bold text-primary-600">75%</span>
//                 <span className="text-sm text-gray-500 pb-1">Complete</span>
//               </div>
//               <div className="mt-3 h-2 bg-gray-200 rounded-full">
//                 <div className="h-full bg-primary-500 rounded-full" style={{width: '75%'}}></div>
//               </div>
//             </div>

//             <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-6 text-white shadow-sm">
//               <h3 className="text-sm opacity-90 mb-2">Upcoming Credits</h3>
//               <div className="flex items-end gap-2">
//                 <span className="text-3xl font-bold">12.5</span>
//                 <span className="text-sm opacity-90 pb-1">Points to graduation</span>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg p-6 shadow-sm border">
//               <h3 className="text-sm text-gray-600 mb-2">Pending Items</h3>
//               <div className="space-y-2">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm">Uploads</span>
//                   <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">2</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm">Posts</span>
//                   <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">1</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm border p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-bold">Upcoming Confirmed Sessions</h2>
//               <a href="/student/sessions" className="text-primary-600 text-sm font-medium">View Calendar →</a>
//             </div>
//             <div className="text-center py-12 text-gray-500">
//               No upcoming sessions. Join a session from the Sessions page.
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

//dashboard page with multiple sections: profile completion, upcoming sessions, AI suggestions, and stats. Uses DashboardLayout for consistent layout and styling. Fetches data from API on mount and displays loading state. Provides navigation to related pages.
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';

import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  FileText, 
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Users,
  BookOpen,
  Video
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    upcomingSessions: [],
    pendingRequests: [],
    pendingUploads: [],
    aiSuggestions: [],
    stats: {
      sessionsAttended: 0,
      resourcesUploaded: 0,
      groupsJoined: 0,
    }
  });

  useEffect(() => {
    if (user?._id || user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch multiple endpoints
      // 1. Pending Sessions (Requests I've made)
      // 2. All active sessions (where I'm a participant but not necessarily a requester)
      // 3. Completed Sessions (For stats)
      // 4. Resources (For stats and pending list)
      // 5. Groups
      const [sessionsReqRes, sessionsPartRes, sessionsCompRes, resourcesRes, groupsRes] = await Promise.all([
        API.get('/sessions/my-requests').catch(() => ({ data: { sessions: [] } })),
        API.get(`/sessions?participant=${user._id}`).catch(() => ({ data: { sessions: [] } })),
        API.get(`/sessions?status=completed&participant=${user._id}`).catch(() => ({ data: { sessions: [] } })),
        API.get(`/resources?uploader=${user._id}`).catch(() => ({ data: { resources: [] } })),
        API.get('/groups/student/assignments').catch(() => ({ data: { openForRegistration: [], published: [] } })),
      ]);

      const allMyResources = resourcesRes.data.resources || [];
      const pendingResources = allMyResources.filter(r => r.status === 'pending');
      
      // Combine sessions from requests and participants
      const rawSessions = [
        ...(sessionsReqRes.data.sessions || []),
        ...(sessionsPartRes.data.sessions || [])
      ];

      // Deduplicate by _id and Filter to only show active ones (requested, pending, confirmed)
      const sessionsMap = new Map();
      rawSessions.forEach(s => {
        if (!sessionsMap.has(s._id)) {
          // EXCLUDE completed and cancelled
          if (s.status !== 'completed' && s.status !== 'cancelled') {
            sessionsMap.set(s._id, s);
          }
        }
      });

      const pendingSessions = Array.from(sessionsMap.values());

      setDashboardData({
        upcomingSessions: pendingSessions,
        pendingRequests: [], 
        pendingUploads: pendingResources,
        aiSuggestions: [],
        stats: {
          sessionsAttended: sessionsCompRes.data.sessions?.length || 0,
          resourcesUploaded: allMyResources.length, // Total uploaded
          groupsJoined: (groupsRes.data.published?.length || 0), // Count only published groups as "joined"
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfileCompletionColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };

  const getProfileCompletionMessage = (percentage) => {
    if (percentage === 100) return 'Your profile is complete!';
    if (percentage >= 80) return 'Almost there! Complete your profile.';
    if (percentage >= 50) return 'Keep going! Add more details.';
    return 'Complete your profile to get better recommendations.';
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
      <div className="p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.fullName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your academic journey today.
          </p>
        </div>



        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profile Completion Card */}
          <Card className="bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Profile Completion</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {user?.profileCompletion || 0}%
                  </h3>
                  <Badge 
                    variant={getProfileCompletionColor(user?.profileCompletion || 0)}
                    size="sm"
                    className="mb-1"
                  >
                    {user?.profileCompletion >= 80 ? 'Great!' : 'In Progress'}
                  </Badge>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          {/* Sessions & Resources Stats Card */}
          <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="border-r border-white/20 pr-4">
                <p className="text-xs text-white/80 mb-1 uppercase tracking-wider font-semibold">Completed</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-bold">{dashboardData.stats.sessionsAttended}</h3>
                  <CheckCircle className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-xs text-white/80 mt-1">Sessions</p>
              </div>
              <div className="pl-2">
                <p className="text-xs text-white/80 mb-1 uppercase tracking-wider font-semibold">Total</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-bold">{dashboardData.stats.resourcesUploaded}</h3>
                  <BookOpen className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-xs text-white/80 mt-1">Resources</p>
              </div>
            </div>
          </Card>

          {/* Pending Items Card */}
          <Card className="bg-white">
            <div>
              <p className="text-sm text-gray-600 mb-3">Pending Items</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Pending Resources</span>
                  </div>
                  <Badge variant="warning" size="sm">
                    {dashboardData.pendingUploads.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Pending Sessions</span>
                  </div>
                  <Badge variant="info" size="sm">
                    {dashboardData.upcomingSessions.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Live Groups</span>
                  </div>
                  <Badge variant="success" size="sm">
                    {dashboardData.stats.groupsJoined}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Updates */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Sessions */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Pending Sessions
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/student/sessions?tab=requested')}
                >
                  View All →
                </Button>
              </div>

              {dashboardData.upcomingSessions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No pending sessions</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate('/student/sessions')}
                  >
                    Browse Sessions
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.upcomingSessions.slice(0, 3).map((session) => (
                    <div 
                      key={session._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer"
                      onClick={() => navigate(`/student/sessions/${session._id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {session.title}
                            </h3>
                            <Badge variant="warning" size="sm">Pending</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{session.module?.name || session.moduleCode}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{session.date ? formatDate(session.date) : 'Date TBA'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{session.startTime || 'Time TBA'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Pending Resources */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Pending Resources
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/resources?tab=my-uploads')}
                >
                  View All →
                </Button>
              </div>

              {dashboardData.pendingUploads.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No pending resources</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardData.pendingUploads.slice(0, 3).map((resource) => (
                    <div 
                      key={resource._id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{resource.title}</p>
                          <p className="text-xs text-gray-500">{resource.moduleCode}</p>
                        </div>
                      </div>
                      <Badge variant="warning">Pending Approval</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Post */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold">Quick Post</h3>
              </div>
              <Button 
                fullWidth 
                variant="outline"
                icon={MessageSquare}
                onClick={() => navigate('/student/chat')}
              >
                Create Post
              </Button>
            </Card>

            {/* AI Resource Suggestions */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold">AI Resource Suggestions</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Personalized study materials based on your recent sessions
              </p>

              <Button 
                size="sm" 
                variant="ghost" 
                fullWidth 
                onClick={() => navigate('/student/sessions?tab=ai-recommendations')}
              >
                View AI Suggestions
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;