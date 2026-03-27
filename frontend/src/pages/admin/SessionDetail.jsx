import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import API from "../../utils/api";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  ArrowLeft,
  CheckCircle,
  Edit,
  XCircle as XCircleIcon,
  RefreshCw,
  FileText,
} from "lucide-react";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

const AdminSessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchSession = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await API.get(`/sessions/${id}`);
      setSession(res.data.session);
    } catch (error) {
      toast.error("Failed to load session");
      navigate("/admin/sessions");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [id]);

  const handleCancelSession = async () => {
    try {
      setActionLoading("cancel");
      await API.patch(`/sessions/${id}/cancel`);
      toast.success("Session cancelled");
      await fetchSession(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel session");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkCompleted = async () => {
    try {
      setActionLoading("complete");
      await API.patch(`/sessions/${id}/complete`);
      toast.success("Session marked as completed");
      await fetchSession(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to complete session");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = async () => {
    await fetchSession(true);
    toast.success("Session details refreshed");
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "requested":
        return "warning";
      case "pending":
        return "warning";
      case "completed":
        return "default";
      case "cancelled":
        return "danger";
      case "approved":
      case "scheduled":
        return "success";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-8">
          <Loader size="lg" text="Loading session..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Card>
            <div className="py-10 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Session not found
              </h3>
              <p className="mb-6 text-gray-600">
                This session may have been removed or is no longer available.
              </p>
              <Button onClick={() => navigate("/admin/sessions")}>
                Back to Sessions
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate("/admin/sessions")}
          >
            Back to Sessions
          </Button>

          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={handleRefresh}
            disabled={actionLoading !== null}
          >
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {session.title || "Untitled Session"}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="primary-outline">
                      {session.moduleCode || "No module"}
                    </Badge>
                    <Badge variant={getStatusVariant(session.status)}>
                      {session.status || "unknown"}
                    </Badge>
                  </div>
                </div>

                <Button
                  size="sm"
                  icon={Edit}
                  onClick={() => navigate(`/admin/sessions/${id}/edit`)}
                >
                  Edit
                </Button>
              </div>

              <p className="mb-6 whitespace-pre-line text-gray-600">
                {session.description || "No description available."}
              </p>

              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Date</span>
                  </div>
                  <p className="text-gray-900">
                    {session.date ? formatDate(session.date) : "Not scheduled yet"}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-gray-700">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Time</span>
                  </div>
                  <p className="text-gray-900">
                    {session.startTime
                      ? `${session.startTime} - ${session.endTime || "TBA"}`
                      : "Time not set"}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-gray-700">
                    {session.isOnline ? (
                      <Video className="h-4 w-4 text-gray-500" />
                    ) : (
                      <MapPin className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="font-medium">
                      {session.isOnline ? "Session Mode" : "Venue"}
                    </span>
                  </div>

                  {session.isOnline ? (
                    <div className="space-y-2">
                      <p className="text-gray-900">Online Session</p>
                      {session.meetingLink ? (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          Join Meeting
                        </a>
                      ) : (
                        <p className="text-gray-500">Meeting link not added yet</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-900">
                      {session.venue || "Venue not assigned yet"}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-gray-700">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Participants</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-900">
                      {session.participants?.length || 0} /{" "}
                      {session.requiredStudents || 0} students
                    </p>
                    <p className="text-gray-900">
                      Required Experts: {session.requiredExperts || 0}
                    </p>
                    {session.expert && (
                      <Badge variant="success" size="sm" className="flex w-fit items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Expert assigned
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card>
              <h3 className="mb-3 font-semibold text-gray-900">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => navigate(`/admin/sessions/${id}/edit`)}
                >
                  Edit Session
                </Button>

                {session.status !== "cancelled" && session.status !== "completed" && (
                  <Button
                    fullWidth
                    variant="danger"
                    icon={XCircleIcon}
                    onClick={handleCancelSession}
                    loading={actionLoading === "cancel"}
                  >
                    Cancel Session
                  </Button>
                )}

                {(session.status === "pending" || session.status === "approved") && (
                  <Button
                    fullWidth
                    onClick={handleMarkCompleted}
                    loading={actionLoading === "complete"}
                    disabled={actionLoading === "cancel"}
                  >
                    Mark Completed
                  </Button>
                )}

                <Button fullWidth onClick={() => navigate("/admin/sessions")}>
                  Back to List
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSessionDetail;