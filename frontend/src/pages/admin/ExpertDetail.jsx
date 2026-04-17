import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import { ArrowLeft, Award, Mail, Phone, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminExpertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/users/${id}`);
      setUser(res.data.user);
    } catch (e) {
      console.error('Failed to load expert', e);
      toast.error('Failed to load expert details');
      navigate('/admin/expert-queue');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      setSaving(true);
      await API.patch(`/users/${id}/status`, {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined
      });
      toast.success(
        status === 'active'
          ? 'Expert approved and notified by email'
          : 'Expert application rejected and user notified'
      );
      navigate('/admin/expert-queue');
    } catch (e) {
      console.error('Failed to update status', e);
      toast.error(e.response?.data?.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text="Loading expert details..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          className="mb-6"
          onClick={() => navigate('/admin/expert-queue')}
        >
          Back to Expert Queue
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: main profile */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-2xl">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="primary-outline" size="sm">
                        Expert Student
                      </Badge>
                      <Badge
                        variant={user.status === 'pending' ? 'warning' : user.status === 'active' ? 'success' : 'danger'}
                        size="sm"
                      >
                        {user.status}
                      </Badge>
                      {user.studentId && (
                        <Badge variant="default" size="sm">
                          ID: {user.studentId}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">
                    <span className="font-medium">Year:</span> {user.yearLevel || 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Semester:</span> {user.semester || 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Specialization:</span> {user.specialization || 'N/A'}
                  </p>
                  {user.gpa && (
                    <p className="text-gray-700">
                      <span className="font-medium">GPA:</span> {user.gpa}
                    </p>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  {user.phone && (
                    <p className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4 text-gray-500" />
                      {user.phone}
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-500" />
                    {user.email}
                  </p>
                </div>
              </div>

              {user.bio && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Bio</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{user.bio}</p>
                </div>
              )}

              {user.expertiseModules && user.expertiseModules.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Expertise Modules</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.expertiseModules.map((m) => (
                      <Badge key={m} variant="primary-outline" size="sm">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {user.status === 'pending' && (
              <Card>
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  Review Decision
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Rejection Reason (optional, only used if you reject)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                      placeholder="Provide a brief reason if you reject this application..."
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      icon={CheckCircle}
                      onClick={() => updateStatus('active')}
                      loading={saving}
                    >
                      Approve Expert
                    </Button>
                    <Button
                      variant="danger"
                      icon={XCircle}
                      onClick={() => updateStatus('rejected')}
                      loading={saving}
                    >
                      Reject Application
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    When you approve or reject, an email will be sent to this user using their registered email address.
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Right: summary */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary-600" />
                Expert Summary
              </h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-600">Profile completion</span>
                  <span className="font-medium text-gray-900">{user.profileCompletion || 0}%</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Sessions conducted</span>
                  <span className="font-medium text-gray-900">{user.sessionsConducted || 0}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Average rating</span>
                  <span className="font-medium text-gray-900">
                    {user.averageRating ? user.averageRating.toFixed(1) : 'No ratings yet'}
                  </span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminExpertDetail;
