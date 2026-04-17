import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { BookOpen, Users, CalendarClock, ArrowLeft, PlusCircle, ClipboardList, CheckCircle2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ModuleDetail = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tab, setTab] = useState('register');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchModuleData();
  }, [code]);

  const fetchModuleData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/groups/projects');
      const allProjects = res.data.projects || [];
      const c = String(code || '').trim().toUpperCase();
      const moduleProjects = allProjects.filter(
        (p) => String(p.module || '').trim().toUpperCase() === c
      );
      setProjects(moduleProjects);
    } catch (error) {
      console.error('Error fetching module projects:', error);
      toast.error('Failed to load group assignments for this module.');
    } finally {
      setLoading(false);
    }
  };

  const openAssignments = useMemo(() => projects.filter((p) => p.status !== 'published'), [projects]);
  const publishedAssignments = useMemo(() => projects.filter((p) => p.status === 'published'), [projects]);
  const tabList = tab === 'published' ? publishedAssignments : openAssignments;

  const handleDeleteProject = async (e, project) => {
    e.stopPropagation();
    const ok = window.confirm(
      `Delete "${project.assignmentTitle}"? All groups for this assignment will be removed. This cannot be undone.`
    );
    if (!ok) return;
    try {
      setDeletingId(project._id);
      await API.delete(`/groups/project/${project._id}`);
      toast.success('Group assignment deleted.');
      setProjects((prev) => prev.filter((p) => p._id !== project._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete assignment.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text={`Loading ${code}...`} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        <div className="flex items-center justify-between mb-6 flex-shrink-0 border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/lecturer/modules')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-primary-600" />
                <h1 className="text-3xl font-bold text-gray-900">{code}</h1>
              </div>
              <p className="text-gray-600 mt-1 ml-11">Module group assignments</p>
            </div>
          </div>

          <Button icon={PlusCircle} onClick={() => navigate('/lecturer/groups/create')}>
            New Group Table
          </Button>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === 'register'
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Join group assignments
              {openAssignments.length > 0 && (
                <span className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">
                  {openAssignments.length}
                </span>
              )}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab('published')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === 'published'
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Final published groups
              {publishedAssignments.length > 0 && (
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                  {publishedAssignments.length}
                </span>
              )}
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-8">
          {projects.length === 0 ? (
            <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Assignments Found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                You haven&apos;t created any group assignments for {code} yet.
              </p>
              <Button icon={PlusCircle} onClick={() => navigate('/lecturer/groups/create')}>
                Create First Assignment
              </Button>
            </div>
          ) : tabList.length === 0 ? (
            <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {tab === 'published' ? 'No published assignments' : 'No open assignments'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {tab === 'published'
                  ? 'Publish an assignment from its detail page when you are ready.'
                  : 'All assignments for this module are published, or none are in registration.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tabList.map((project) => {
                const diffDays = Math.ceil(
                  (new Date(project.registrationDeadline) - new Date()) / (1000 * 60 * 60 * 24)
                );
                const isClosedContext = diffDays <= 0;

                return (
                  <Card
                    key={project._id}
                    className="hover:-translate-y-1 transition-transform cursor-pointer hover:shadow-lg border border-gray-200 flex flex-col h-full"
                    onClick={() => navigate(`/lecturer/groups/${project._id}`)}
                  >
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2" title={project.assignmentTitle}>
                          {project.assignmentTitle}
                        </h3>
                      </div>
                      <button
                        type="button"
                        title="Delete assignment"
                        disabled={deletingId === project._id}
                        onClick={(e) => handleDeleteProject(e, project)}
                        className="flex-shrink-0 p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 font-medium">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary-500" />
                          <span>{project.numberOfGroups} Groups</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">|</span>
                          <span>Size: {project.groupSize}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                          <CalendarClock className="w-4 h-4" />
                          <span>{formatDate(project.registrationDeadline)}</span>
                        </div>

                        <Badge
                          variant={
                            project.status === 'published' ? 'success' : isClosedContext ? 'danger' : 'warning'
                          }
                          size="sm"
                        >
                          {project.status === 'published' ? 'Published' : isClosedContext ? 'Closed' : 'Registration'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ModuleDetail;
