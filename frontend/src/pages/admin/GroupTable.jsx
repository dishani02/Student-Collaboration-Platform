import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { ChevronRight, Search, Filter, Users, ArrowLeft, Lock, CalendarClock } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const AdminGroupTable = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [groupTable, setGroupTable] = useState(null);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projectRes = await API.get(`/groups/project/${projectId}`);
      const gt = projectRes.data.groupTable;
      const g = projectRes.data.groups || [];
      setGroupTable(gt);
      setGroups(g);
    } catch (error) {
      console.error('Error fetching group details:', error);
      navigate('/admin/groups');
    } finally {
      setLoading(false);
    }
  };

  const getGroupName = (num) => String.fromCharCode(64 + num);

  const isPublished = groupTable?.status === 'published';
  const deadlinePassed = groupTable ? new Date() > new Date(groupTable.registrationDeadline) : false;

  const filteredGroups = groups.filter((g) => {
    const label = `Group ${getGroupName(g.groupNumber)}`.toLowerCase();
    const q = searchQuery.toLowerCase();
    if (label.includes(q)) return true;
    return (g.members || []).some((m) => {
      const name = m.name || m.user?.fullName || '';
      return name.toLowerCase().includes(q);
    });
  });

  const totalCapacity = groupTable ? groupTable.numberOfGroups * groupTable.groupSize : 0;
  const totalAssigned = groups.reduce((acc, g) => acc + (g.members?.length || 0), 0);
  const fillPercentage = totalCapacity ? Math.round((totalAssigned / totalCapacity) * 100) : 0;

  if (loading || !groupTable) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
          <Loader size="lg" text="Loading group assignment details..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-[#f8f9fc] min-h-[calc(100vh-64px)] flex flex-col relative pb-12">
        <div
          className={`mx-8 mt-6 rounded-xl border px-4 py-3 flex items-center gap-3 bg-blue-50 border-blue-200 text-blue-900`}
        >
          <Lock className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">
              Admin View Only
            </p>
            <p className="text-xs opacity-90 mt-0.5">
              You are viewing this group table in a read-only student-like format. Contact details may be visible based on admin permissions.
            </p>
          </div>
        </div>

        <div className="px-8 mt-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-4">
            <button
              type="button"
              onClick={() => navigate('/admin/groups')}
              className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Groups
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">
              {groupTable.module}: {groupTable.assignmentTitle}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 mt-2">
            <div className="max-w-xl">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Group formation</h1>
                {isPublished && <Badge variant="success">Published</Badge>}
                {!isPublished && !deadlinePassed && <Badge variant="warning">Registration open</Badge>}
                {!isPublished && deadlinePassed && <Badge variant="danger">Closed</Badge>}
              </div>
              <p className="text-gray-500 text-lg leading-relaxed">
                <span className="font-semibold text-gray-700">{groupTable.assignmentTitle}</span>
                <span className="text-gray-400"> · </span>
                Details of student registrations across all created groups.
              </p>
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                Registration deadline: {formatDate(groupTable.registrationDeadline)}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-right">
                <p className="text-sm font-bold text-blue-600 mb-1">{fillPercentage}%</p>
                <p className="text-xs font-medium text-blue-400">Filled</p>
              </div>
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 flex-1 flex flex-col lg:flex-row gap-8">
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex gap-3 bg-white">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search groups or names..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-gray-700 placeholder:text-gray-400"
                />
              </div>
              <button
                type="button"
                className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 shadow-sm"
                aria-label="Filter"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/30 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-2">Group</div>
              <div className="col-span-3">Student ID</div>
              <div className="col-span-5">Member Name</div>
              <div className="col-span-2 text-right">Capacity</div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[min(60vh,520px)]">
              {filteredGroups.map((group) => {
                const filled = group.members?.length || 0;
                const cap = group.maxMembers;
                const isFull = filled === cap;
                const names = (group.members || []).map((m) => {
                  const n = m.name || m.user?.fullName || '—';
                  const sid = m.studentId || m.user?.studentId || '';
                  return sid ? `${n} (${sid})` : n;
                }).join(', ') || '—';

                return (
                  <div
                    key={group._id}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-50 items-center ${
                      isFull ? 'bg-green-50/80' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="col-span-2 font-bold text-gray-900">Group {getGroupName(group.groupNumber)}</div>
                    <div className="col-span-3 text-sm text-gray-600">
                      <ul className="space-y-1">
                        {(group.members || []).map((m, i) => (
                          <li key={i}>{m.studentId || m.user?.studentId || '—'}</li>
                        ))}
                        {(group.members || []).length === 0 && <li>—</li>}
                      </ul>
                    </div>
                    <div className="col-span-5 text-sm text-gray-800 font-medium">
                      <ul className="space-y-1">
                        {(group.members || []).map((m, i) => (
                          <li key={i}>{m.name || m.user?.fullName || '—'}</li>
                        ))}
                        {(group.members || []).length === 0 && <li>—</li>}
                      </ul>
                    </div>
                    <div className="col-span-2 text-right text-sm font-semibold text-gray-700">
                      {filled}/{cap}
                    </div>
                  </div>
                );
              })}
              {filteredGroups.length === 0 && (
                <div className="text-center py-12 text-gray-500 font-medium">No rows match your search.</div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold text-gray-900">Module context</h3>
              </div>
              <dl className="text-sm space-y-2 text-gray-600">
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-400">Module</dt>
                  <dd className="font-medium text-gray-900">{groupTable.module}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-400">Year / Sem</dt>
                  <dd className="font-medium text-gray-900">
                    {groupTable.yearLevel} · Sem {groupTable.semester}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-400">Specialization</dt>
                  <dd className="font-medium text-gray-900">{groupTable.specialization}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminGroupTable;
