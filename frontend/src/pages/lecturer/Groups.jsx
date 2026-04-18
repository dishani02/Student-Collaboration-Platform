import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import {
  Users, PlusCircle, CalendarClock, ChevronRight, FileText, Search,
  ClipboardList, CheckCircle2, Trash2, DownloadCloud
} from 'lucide-react';
import toast from 'react-hot-toast';
import { exportGroupsToExcel } from '../../utils/excelExport';

const Groups = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tab, setTab] = useState('register');
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('All');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await API.get('/groups/projects');
      setProjects(res.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAssignments = useMemo(() => projects.filter((p) => p.status !== 'published'), [projects]);
  const publishedAssignments = useMemo(() => projects.filter((p) => p.status === 'published'), [projects]);
  const tabSource = tab === 'published' ? publishedAssignments : openAssignments;

  const getModules = () => {
    const modules = new Set(tabSource.map((p) => p.module));
    return ['All', ...Array.from(modules)];
  };

  const filteredProjects = tabSource.filter((p) => {
    const matchesSearch = p.assignmentTitle.toLowerCase().includes(search.toLowerCase()) || p.module.toLowerCase().includes(search.toLowerCase());
    const matchesModule = selectedModule === 'All' || p.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  useEffect(() => { setSelectedModule('All'); }, [tab]);

  const handleDeleteProject = async (e, project) => {
    e.stopPropagation();
    const ok = window.confirm(`Delete "${project.assignmentTitle}" (${project.module})? All groups and member slots will be removed. This cannot be undone.`);
    if (!ok) return;
    try {
      setDeletingId(project._id);
      await API.delete(`/groups/project/${project._id}`);
      toast.success('Group assignment deleted.');
      setProjects((prev) => prev.filter((p) => p._id !== project._id));
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportQuick = async (e, project) => {
    e.stopPropagation();
    try {
      toast.loading('Preparing Excel file...', { id: 'export' });
      const res = await API.get(`/groups/project/${project._id}`);
      const groups = res.data.groups || [];
      exportGroupsToExcel(project, groups);
      toast.success('Download started!', { id: 'export' });
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export groups.', { id: 'export' });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text="Loading group assignments..." />
        </div>
      </DashboardLayout>
    );
  }

  const renderEmpty = () => (
    <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-gray-900 mb-2">No group assignments found</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        {search || selectedModule !== 'All'
          ? "We couldn't find any assignments matching your filters."
          : tab === 'published' ? 'Nothing has been published yet.' : "You don't have any open assignments. Create a new group table to get started."}
      </p>
      {search || selectedModule !== 'All' ? (
        <Button variant="outline" onClick={() => { setSearch(''); setSelectedModule('All'); }}>Clear Filters</Button>
      ) : tab === 'register' ? (
        <Button icon={PlusCircle} onClick={() => navigate('/lecturer/groups/create')}>Create Group Table</Button>
      ) : null}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-8 w-full min-h-screen flex flex-col">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 shadow-sm shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Group Assignments</h1>
              <p className="text-gray-600 mt-1">Manage registration tables and final published rosters separately.</p>
            </div>
          </div>
          <Button icon={PlusCircle} onClick={() => navigate('/lecturer/groups/create')}>Create New Group Table</Button>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200 flex-shrink-0">
          <button type="button" onClick={() => setTab('register')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === 'register' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            <span className="inline-flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Join group assignments
              {openAssignments.length > 0 && <span className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">{openAssignments.length}</span>}
            </span>
          </button>
          <button type="button" onClick={() => setTab('published')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === 'published' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Final published groups
              {publishedAssignments.length > 0 && <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{publishedAssignments.length}</span>}
            </span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 flex-shrink-0 border-b border-gray-200 pb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search by assignment title or module..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {getModules().map((mod) => (
              <button key={mod} onClick={() => setSelectedModule(mod)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedModule === mod ? 'bg-primary-600 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                {mod}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-8">
          {filteredProjects.length === 0 ? renderEmpty() : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const diffDays = Math.ceil((new Date(project.registrationDeadline) - new Date()) / (1000 * 60 * 60 * 24));
                const isClosedContext = diffDays <= 0;
                return (
                  <Card key={project._id} className="hover:-translate-y-1 transition-transform cursor-pointer hover:shadow-lg border border-gray-200 flex flex-col h-full"
                    onClick={() => navigate(`/lecturer/groups/${project._id}`)}>
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <div className="min-w-0">
                        <Badge variant="default" className="mb-2 uppercase text-xs tracking-wider font-semibold">{project.module}</Badge>
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{project.assignmentTitle}</h3>
                      </div>
                      <button type="button" title="Delete assignment" disabled={deletingId === project._id}
                        onClick={(e) => handleDeleteProject(e, project)}
                        className="flex-shrink-0 p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {project.status === 'published' && (
                        <button type="button" title="Export as Excel" onClick={(e) => handleExportQuick(e, project)}
                          className="flex-shrink-0 p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 ml-2">
                          <DownloadCloud className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 font-medium">
                        <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary-500" /><span>{project.numberOfGroups} Groups</span></div>
                        <div className="flex items-center gap-2"><span className="text-gray-400">|</span><span>Size: {project.groupSize}</span></div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-500"><CalendarClock className="w-4 h-4" /><span>{formatDate(project.registrationDeadline)}</span></div>
                        <div className="flex items-center gap-2">
                          <Badge variant={project.status === 'published' ? 'success' : isClosedContext ? 'danger' : 'warning'} size="sm">
                            {project.status === 'published' ? 'Published' : isClosedContext ? 'Closed' : 'Registration'}
                          </Badge>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
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

export default Groups;
