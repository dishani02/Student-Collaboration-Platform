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
  Clock,
  MapPin,
  Star,
  Users,
  Video,
  CheckCircle,
  MessageSquare,
  BookOpen,
  TrendingUp,
  History
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const ExpertDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    upcomingToConduct: [],
    upcomingJoined: [],
    completedConducted: [],
    pendingAdminConfirmations: [],
    stats: {
      sessionsConducted: 0,
      sessionsJoined: 0,
      averageRating: 0,
      totalReviews: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);

      const [pendingRes, completedRes, requestsRes, assignedPendingRes, assignedReqRes] = await Promise.all([
        API.get('/sessions?status=confirmed&participant=' + user._id).catch(() => ({ data: { sessions: [] } })),
        API.get('/sessions?status=completed&participant=' + user._id).catch(() => ({ data: { sessions: [] } })),
        API.get('/sessions/my-requests').catch(() => ({ data: { sessions: [] } })),
        API.get('/sessions?status=pending&participant=' + user._id).catch(() => ({ data: { sessions: [] } })),
        API.get('/sessions?status=requested&participant=' + user._id).catch(() => ({ data: { sessions: [] } }))
      ]);

      const confirmed = pendingRes.data.sessions || [];
      const completed = completedRes.data.sessions || [];
      const requests = requestsRes.data.sessions || [];
      const assignedPending = assignedPendingRes.data.sessions || [];
      const assignedReq = assignedReqRes.data.sessions || [];

      const upcomingToConduct = confirmed.filter(
        (s) => s.expert?._id === user._id || s.expert === user._id
      );
      const upcomingJoined = confirmed.filter(
        (s) => s.expert?._id !== user._id && s.expert !== user._id
      );

      const completedConducted = completed.filter(
        (s) => s.expert?._id === user._id || s.expert === user._id
      );

      const allPending = [
        ...assignedPending.filter((s) => s.expert?._id === user._id || s.expert === user._id),
        ...assignedReq.filter((s) => s.expert?._id === user._id || s.expert === user._id),
        ...requests.filter((s) => {
          const req = s.pendingRequests?.find(
            (r) => (r.user?._id === user._id || r.user === user._id) && r.status === 'pending' && r.role === 'expert'
          );
          return !!req;
        })
      ];
      
      const pendingAdminConfirmations = Array.from(new Map(allPending.map(s => [s._id, s])).values());

      setData({
        upcomingToConduct,
        upcomingJoined,
        completedConducted,
        pendingAdminConfirmations,
        stats: {
          sessionsConducted: user.sessionsConducted || completedConducted.length,
          sessionsJoined: completed.length - completedConducted.length,
          averageRating: user.averageRating || 0,
          totalReviews: user.totalReviews || 0
        }
      });
    } catch (e) {
      console.error('Error loading expert dashboard:', e);
      setData((prev) => ({ ...prev, upcomingToConduct: [], upcomingJoined: [], completedConducted: [], pendingAdminConfirmations: [] }));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text="Loading..." />
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text="Loading expert dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  const { upcomingToConduct, upcomingJoined, completedConducted, pendingAdminConfirmations, stats } = data;

  const ratingColor =
    stats.averageRating >= 4 ? 'text-green-600' : stats.averageRating >= 3 ? 'text-yellow-600' : 'text-gray-600';

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-primary-600" />
            Expert Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user.fullName}. Track the sessions you conduct, your ratings, and upcoming commitments.
          </p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sessions Conducted</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.sessionsConducted}</h3>
                <p className="text-xs text-gray-500 mt-1">Completed as conductor</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                <div className="flex items-end gap-2">
                  <span className={`text-3xl font-bold ${ratingColor}`}>
                    {stats.averageRating ? stats.averageRating.toFixed(1) : '—'}
                  </span>
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mb-1" />
                </div>
                <p className="text-xs text-gray-500 mt-1">{stats.totalReviews} total reviews</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming Sessions to Conduct</p>
                <h3 className="text-3xl font-bold text-gray-900">{upcomingToConduct.length}</h3>
                <p className="text-xs text-gray-500 mt-1">Confirmed sessions where you are the expert</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: upcoming to conduct */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                  Upcoming Sessions to Conduct
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate('/expert/joined-sessions?tab=pending')}>
                  View all sessions
                </Button>
              </div>
              {upcomingToConduct.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  No upcoming sessions to conduct. Browse announcements and volunteer to conduct a session.
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingToConduct.slice(0, 4).map((s) => (
                    <div
                      key={s._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50/40 cursor-pointer transition-all"
                      onClick={() => navigate(`/expert/sessions/${s._id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{s.title}</h3>
                          <p className="text-sm text-gray-600">{s.moduleCode}</p>
                        </div>
                        <Badge variant="success" size="sm">
                          Confirmed
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        {s.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(s.date)}
                          </span>
                        )}
                        {s.startTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {s.startTime}–{s.endTime || 'TBA'}
                          </span>
                        )}
                        {s.isOnline ? (
                          <span className="flex items-center gap-1">
                            <Video className="w-4 h-4" />
                            Online
                          </span>
                        ) : s.venue ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {s.venue}
                          </span>
                        ) : null}
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {s.participants?.length || 0} students
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-primary-600" />
                  Recently Conducted Sessions
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/expert/joined-sessions?tab=completed&sub=conducted')}
                >
                  View history
                </Button>
              </div>
              {completedConducted.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  You haven&apos;t conducted any sessions yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {completedConducted.slice(0, 4).map((s) => (
                    <div
                      key={s._id}
                      className="border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{s.title}</p>
                        <p className="text-xs text-gray-500">
                          {s.moduleCode} • {s.date ? formatDate(s.date) : 'Completed'}
                        </p>
                      </div>
                      {s.expert?.averageRating && (
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span>{s.expert.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  Pending Admin Confirmation
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate('/expert/joined-sessions?tab=pending')}>
                  View all
                </Button>
              </div>
              {pendingAdminConfirmations.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  You have no pending volunteer requests or unconfirmed sessions.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingAdminConfirmations.slice(0, 3).map((s) => (
                    <div
                      key={s._id}
                      className="border border-yellow-200 bg-yellow-50/30 rounded-lg p-4 cursor-pointer hover:bg-yellow-50/50 transition-all"
                      onClick={() => navigate(`/expert/sessions/${s._id}`)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{s.title}</h3>
                          <p className="text-sm text-gray-600">{s.moduleCode}</p>
                        </div>
                        <Badge variant="warning" size="sm" className="whitespace-nowrap">
                          {s.expert?._id === user._id || s.expert === user._id ? 'Pending Schedule' : 'Pending Approval'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{s.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right: quick links / actions */}
          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  fullWidth
                  variant="outline"
                  icon={Calendar}
                  onClick={() => navigate('/expert/joined-sessions?tab=announcements')}
                >
                  Browse Announcements
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  icon={Users}
                  onClick={() => navigate('/expert/joined-sessions?tab=pending')}
                >
                  View Pending Sessions
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  icon={Star}
                  onClick={() => navigate('/expert/joined-sessions?tab=completed&sub=conducted')}
                >
                  View Your Reviews
                </Button>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">Student Feedback</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Students can rate your sessions after completion. High ratings increase your visibility as an expert.
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/expert/joined-sessions?tab=completed&sub=conducted')}
              >
                See feedback on completed sessions
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExpertDashboard;
