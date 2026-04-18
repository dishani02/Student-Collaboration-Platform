import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, CalendarClock, Users, FileText, AlertCircle } from 'lucide-react';
import { YEAR_LEVELS, SEMESTERS, SPECIALIZATIONS } from '../../utils/constants';

function normalizeModuleCatalog(raw) {
  return (Array.isArray(raw) ? raw : [])
    .map((m) => ({
      code: String(m.code || '').trim().toUpperCase(),
      name: (String(m.name || '').trim() || String(m.code || '').trim()) || ''
    }))
    .filter((m) => m.code)
    .sort((a, b) => a.code.localeCompare(b.code));
}

const CreateGroupTable = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [catalogModules, setCatalogModules] = useState([]);

  const [formData, setFormData] = useState({
    assignmentTitle: '',
    module: '',
    academicYear: new Date().getFullYear(),
    period: 'Jan-May',
    yearLevel: 3,
    semester: 1,
    specialization: 'All',
    numberOfGroups: 10,
    groupSize: 4,
    registrationDeadline: ''
  });

  const teachingCodes = useMemo(() =>
    (user?.teachingModules || []).map((c) => String(c).trim().toUpperCase()).filter(Boolean),
    [user?.teachingModules]
  );

  const myModules = useMemo(() => {
    if (!teachingCodes.length || !catalogModules.length) return [];
    const allowed = new Set(teachingCodes);
    return catalogModules.filter((m) => allowed.has(m.code));
  }, [catalogModules, teachingCodes]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setPageLoading(true);
        const res = await API.get('/modules');
        const list = normalizeModuleCatalog(res.data?.modules);
        if (!cancelled) setCatalogModules(list);
      } catch {
        if (!cancelled) setCatalogModules([]);
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!myModules.length) return;
    setFormData((prev) => {
      if (myModules.some((m) => m.code === prev.module)) return prev;
      return { ...prev, module: myModules[0].code };
    });
  }, [myModules]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: type === 'number' ? parseInt(value, 10) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.module) { toast.error('Select a module from your teaching list.'); return; }
    setLoading(true);
    try {
      const body = {
        ...formData,
        module: String(formData.module).trim().toUpperCase(),
        academicYear: Number(formData.academicYear),
        yearLevel: Number(formData.yearLevel),
        semester: Number(formData.semester),
        numberOfGroups: Number(formData.numberOfGroups),
        groupSize: Number(formData.groupSize)
      };
      const response = await API.post('/groups/project', body);
      toast.success('Group Table created successfully!');
      const created = response.data.groupTable || response.data.project;
      navigate(`/lecturer/groups/${created._id}`);
    } catch (error) {
      console.error('Error creating group table:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const moduleOptions = myModules.map((m) => ({ value: m.code, label: `${m.code} — ${m.name}` }));

  if (pageLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader size="lg" text="Loading your teaching modules…" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <button type="button" onClick={() => navigate('/lecturer/groups')}
            className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-4 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Groups
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Group Table</h1>
          <p className="text-gray-600 mt-1">Configure an assignment for one of the modules you teach (from your profile).</p>
        </div>

        <Card className="bg-white">
          {teachingCodes.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-gray-900 mb-2">No teaching modules on your profile</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Add the modules you teach under <strong>Teaching Modules</strong> in your profile. Only those modules appear here when creating a group table.
              </p>
              <Button onClick={() => navigate('/lecturer/profile')}>Go to profile</Button>
            </div>
          ) : myModules.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-gray-900 mb-2">Could not match your modules to the catalog</h2>
              <p className="text-gray-600 mb-4 max-w-md mx-auto text-sm">
                Your profile lists: {teachingCodes.join(', ')}. None were found in the system module list. Check codes or contact an administrator.
              </p>
              <Link to="/lecturer/profile" className="text-primary-600 font-medium text-sm hover:underline">Edit teaching modules</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 p-1">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                  <FileText className="w-5 h-5 text-primary-500" /> Assignment Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Assignment Title" name="assignmentTitle" value={formData.assignmentTitle} onChange={handleChange} placeholder="e.g. Final Year Project" required />
                  <Select label="Module (your teaching modules only)" name="module" value={formData.module} onChange={handleChange} options={moduleOptions} placeholder="Select module code and name" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <Select label="Academic Year" name="academicYear" value={formData.academicYear} onChange={handleChange}
                    options={[{ value: 2024, label: '2024' }, { value: 2025, label: '2025' }, { value: 2026, label: '2026' }]} required />
                  <Select label="Period" name="period" value={formData.period} onChange={handleChange}
                    options={[{ value: 'Jan-May', label: 'Jan-May' }, { value: 'Jun-Nov', label: 'Jun-Nov' }]} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <Select label="Year Level" name="yearLevel" value={formData.yearLevel} onChange={handleChange} options={YEAR_LEVELS.map((y) => ({ value: y, label: `Year ${y}` }))} required />
                  <Select label="Semester" name="semester" value={formData.semester} onChange={handleChange} options={SEMESTERS.map((s) => ({ value: s, label: `Semester ${s}` }))} required />
                  <Select label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange}
                    options={[{ value: 'All', label: 'All Specializations' }, ...SPECIALIZATIONS.map((s) => ({ value: s, label: s }))]} required />
                </div>
              </div>

              <div className="pt-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                  <Users className="w-5 h-5 text-primary-500" /> Group Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input label="Number of Groups" name="numberOfGroups" type="number" min="1" max="100" value={formData.numberOfGroups} onChange={handleChange}
                    helperText={`Total capacity: ${formData.numberOfGroups * formData.groupSize} students`} required />
                  <Input label="Students per Group" name="groupSize" type="number" min="1" max="10" value={formData.groupSize} onChange={handleChange} required />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 text-gray-400" /> Registration Deadline
                    </label>
                    <input type="date" name="registrationDeadline" value={formData.registrationDeadline} min={getMinDate()} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
                    <p className="text-xs text-gray-500 mt-1">Students must form groups by this date.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate('/lecturer/groups')}>Cancel</Button>
                <Button type="submit" loading={loading} icon={Save}>Create Table Config</Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateGroupTable;
