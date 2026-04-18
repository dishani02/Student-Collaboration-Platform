import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import { Users, BookOpen, CalendarClock, ChevronRight, ClipboardList, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const AdminGroups = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('open');
  const [openProjects, setOpenProjects] = useState([]);
  const [publishedProjects, setPublishedProjects] = useState([]);

  useEffect(() => { fetchAssignments(); }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/groups/projects');
      const all = res.data.projects || [];
      setOpenProjects(all.filter(p => p.status !== 'published'));
      setPublishedProjects(all.filter(p => p.status === 'published'));
    } catch (error) {
      console.error('Error fetching group projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader size="lg" text="Loading group assignments..." />
        </div>
      </DashboardLayout>
    );
  }

  const renderProjectCard = (project, { showPublishedBadge }) => {
    const diffDays = Math.ceil((new Date(project.registrationDeadline) - new Date()) / (1000 * 60 * 60 * 24));
    const deadlinePassed = diffDays <= 0;

    return (
      <Card key={project._id} className="hover:-translate-y-1 transition-transform cursor-pointer hover:shadow-lg border border-gray-200 flex flex-col justify-between"
        onClick={() => navigate(`/admin/groups/${project._id}`)}>
        <div className="mb-4">
          <div className="flex items-start justify-between mb-3">
            <Badge variant="default" className="uppercase tracking-wider font-semibold">{project.module}</Badge>
            <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2" title={project.assignmentTitle}>{project.assignmentTitle}</h3>
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
            <BookOpen className="w-4 h-4" /> Module: {project.module}
          </p>
        </div>

        <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <CalendarClock className="w-4 h-4 text-gray-400" />
              Deadline: {formatDate(project.registrationDeadline)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">{project.numberOfGroups} Groups • Size: {project.groupSize}</span>
            <div className="flex items-center gap-2">
              {showPublishedBadge ? (
                <Badge variant="success" size="sm">Final published</Badge>
              ) : (
                <Badge variant={deadlinePassed ? 'danger' : 'warning'} size="sm">
                  {deadlinePassed ? 'Deadline passed' : 'Open for students'}
                </Badge>
              )}
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const emptyOpen = openProjects.length === 0 ? (
    <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
      <ClipboardList className="w-14 h-14 text-gray-300 mx-auto mb-3" />
      <h3 className="text-lg font-bold text-gray-900 mb-2">No active group assignments</h3>
      <p className="text-gray-500 max-w-md mx-auto">There are currently no open registration tables across your modules.</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {openProjects.map((p) => renderProjectCard(p, { showPublishedBadge: false }))}
    </div>
  );

  const emptyPublished = publishedProjects.length === 0 ? (
    <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
      <CheckCircle2 className="w-14 h-14 text-gray-300 mx-auto mb-3" />
      <h3 className="text-lg font-bold text-gray-900 mb-2">Nothing published yet</h3>
      <p className="text-gray-500 max-w-md mx-auto">No group assignments have been finalized and published.</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {publishedProjects.map((p) => renderProjectCard(p, { showPublishedBadge: true }))}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-900">Admin Group Monitor</h1>
          <p className="text-gray-600 mt-1">Browse and monitor all group assignment tables and their sizes from a unified readonly view.</p>
        </div>

        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button type="button" onClick={() => setTab('open')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === 'open' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            <span className="inline-flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Open group assignments
              {openProjects.length > 0 && <span className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">{openProjects.length}</span>}
            </span>
          </button>
          <button type="button" onClick={() => setTab('published')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === 'published' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Final published groups
              {publishedProjects.length > 0 && <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{publishedProjects.length}</span>}
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-8">
          {tab === 'open' ? emptyOpen : emptyPublished}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminGroups;
