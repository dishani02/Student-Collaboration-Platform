import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, CalendarClock, Users, FileText, AlertCircle } from 'lucide-react';
import { YEAR_LEVELS, SEMESTERS, SPECIALIZATIONS } from '../../utils/constants';

const CreateGroupTable = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    assignmentTitle: '',
    module: '',
    academicYear: new Date().getFullYear(),
    period: 'Jan-May',
    yearLevel: 3,
    semester: 1,
    specialization: 'All',
    numberOfGroups: 5,
    groupSize: 4,
    registrationDeadline: ''
  });

  useEffect(() => {
    if (user?.teachingModules && user.teachingModules.length > 0) {
      setFormData((prev) => ({
        ...prev,
        module: prev.module || String(user.teachingModules[0]).trim().toUpperCase()
      }));
    }
  }, [user]);

  const teachingModules = (user?.teachingModules || [])
    .map((code) => String(code || '').trim().toUpperCase())
    .filter(Boolean);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.module) {
      toast.error('Please select a module you teach.');
      return;
    }
    if (!formData.registrationDeadline) {
      toast.error('Please select a registration deadline.');
      return;
    }

    setLoading(true);
    try {
      await API.post('/groups/project', {
        ...formData,
        module: String(formData.module).trim().toUpperCase()
      });
      toast.success('Group table created successfully.');
      navigate('/groups');
    } catch (error) {
      console.error('Create group table error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate('/groups')}
            className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-4 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Group Assignments
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Group Table</h1>
          <p className="text-gray-600 mt-1">Set up a new group assignment for a module you teach.</p>
        </div>

        <Card className="bg-white">
          {false ? null : (
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-500" /> Assignment Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Assignment Title"
                    name="assignmentTitle"
                    value={formData.assignmentTitle}
                    onChange={handleChange}
                    placeholder="e.g. Final Year Project"
                    required
                  />
                  <Input
                    label="Module"
                    name="module"
                    value={formData.module}
                    onChange={handleChange}
                    placeholder="e.g. SE3020"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Academic Year"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  options={[2024, 2025, 2026, 2027].map((year) => ({ value: year, label: String(year) }))}
                  required
                />
                <Select
                  label="Period"
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                  options={[
                    { value: 'Jan-May', label: 'Jan-May' },
                    { value: 'Jun-Nov', label: 'Jun-Nov' }
                  ]}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Select
                  label="Year Level"
                  name="yearLevel"
                  value={formData.yearLevel}
                  onChange={handleChange}
                  options={YEAR_LEVELS.map((level) => ({ value: level, label: `Year ${level}` }))}
                  required
                />
                <Select
                  label="Semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  options={SEMESTERS.map((sem) => ({ value: sem, label: `Semester ${sem}` }))}
                  required
                />
                <Select
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  options={[
                    { value: 'All', label: 'All Specializations' },
                    ...SPECIALIZATIONS.map((spec) => ({ value: spec, label: spec }))
                  ]}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Number of Groups"
                  name="numberOfGroups"
                  type="number"
                  min="1"
                  value={formData.numberOfGroups}
                  onChange={handleChange}
                  helperText={`Maximum capacity: ${formData.numberOfGroups * formData.groupSize} students`}
                  required
                />
                <Input
                  label="Students per Group"
                  name="groupSize"
                  type="number"
                  min="1"
                  value={formData.groupSize}
                  onChange={handleChange}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    min={getMinDate()}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Deadline for student group registration.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => navigate('/groups')}>
                  Cancel
                </Button>
                <Button type="submit" loading={loading} icon={Save}>
                  Create Table
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateGroupTable;
