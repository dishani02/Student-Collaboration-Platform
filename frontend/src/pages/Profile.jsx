
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import TextArea from '../components/common/TextArea';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Save, 
  Camera,
  FileText
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [allModules, setAllModules] = useState([]);

  useEffect(() => {
    if (user) {
      setProfileData({ ...user });
      setLoading(false);
    }
    fetchModules();
  }, [user]);

  const fetchModules = async () => {
    try {
      const response = await API.get('/modules');
      setAllModules(response.data.modules || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleModuleChange = (e, field) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      // Use the generic updateUser route: PUT /api/users/:id
      const response = await API.put(`/users/${user._id}`, profileData);
      
      if (response.data.success) {
        // Update local auth context
        updateUser(response.data.user);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text="Loading profile..." />
        </div>
      </DashboardLayout>
    );
  }

  const isStudent = user.role === 'student' || user.role === 'expert';
  const isExpert = user.role === 'expert';
  const isLecturer = user.role === 'lecturer';

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar 
                src={profileData.profilePicture} 
                name={profileData.fullName} 
                size="2xl" 
                className="border-4 border-white shadow-md"
              />
              <button className="absolute bottom-1 right-1 p-2 bg-primary-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-gray-900">{profileData.fullName}</h1>
                <Badge variant={user.role === 'admin' ? 'danger' : user.role === 'lecturer' ? 'primary' : 'success'}>
                  {user.role.toUpperCase()}
                </Badge>
              </div>
              <p className="text-gray-600 flex items-center gap-2">
                <Mail className="w-4 h-4" /> {profileData.email}
              </p>
              <div className="mt-2 flex items-center gap-4">
                 <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold text-gray-600">
                   Profile Completion: {profileData.profileCompletion}%
                 </div>
              </div>
            </div>
          </div>
          <Button 
            icon={Save} 
            onClick={handleSave} 
            loading={saving}
          >
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Basic Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* General Information */}
            <Card title="General Information" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="fullName"
                  value={profileData.fullName || ''}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  icon={User}
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  value={profileData.phone || ''}
                  onChange={handleChange}
                  placeholder="e.g., +94 77 123 4567"
                  icon={Phone}
                />
                <div className="md:col-span-2">
                  <TextArea
                    label="Bio"
                    name="bio"
                    value={profileData.bio || ''}
                    onChange={handleChange}
                    placeholder="Tell us a bit about yourself..."
                    rows={4}
                  />
                </div>
              </div>
            </Card>

            {/* Academic Information (Student/Expert) */}
            {isStudent && (
              <Card title="Academic Context" icon={GraduationCap}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Student ID"
                    name="studentId"
                    value={profileData.studentId || ''}
                    disabled
                    placeholder="ITXXXXXX"
                  />
                  <Select
                    label="Student Batch"
                    name="batch"
                    value={profileData.batch || ''}
                    onChange={handleChange}
                    options={[
                      { value: '22.1', label: '22.1' },
                      { value: '22.2', label: '22.2' },
                      { value: '23.1', label: '23.1' },
                      { value: '23.2', label: '23.2' },
                      { value: '24.1', label: '24.1' },
                      { value: '24.2', label: '24.2' },
                    ]}
                  />
                  <Select
                    label="Year Level"
                    name="yearLevel"
                    value={profileData.yearLevel || ''}
                    onChange={handleChange}
                    options={[
                      { value: 1, label: 'Year 1' },
                      { value: 2, label: 'Year 2' },
                      { value: 3, label: 'Year 3' },
                      { value: 4, label: 'Year 4' },
                    ]}
                  />
                  <Select
                    label="Semester"
                    name="semester"
                    value={profileData.semester || ''}
                    onChange={handleChange}
                    options={[
                      { value: 1, label: 'Semester 1' },
                      { value: 2, label: 'Semester 2' },
                    ]}
                  />
                  <Select
                    label="Specialization"
                    name="specialization"
                    value={profileData.specialization || ''}
                    onChange={handleChange}
                    options={[
                      { value: 'IT', label: 'Information Technology' },
                      { value: 'SE', label: 'Software Engineering' },
                      { value: 'DS', label: 'Data Science' },
                      { value: 'CSNE', label: 'Cyber Security' },
                    ]}
                  />
                  <Input
                    label="Academic Year"
                    name="academicYear"
                    type="number"
                    value={profileData.academicYear || 2024}
                    onChange={handleChange}
                  />
                </div>
              </Card>
            )}

            {/* Lecturer Information */}
            {isLecturer && (
              <Card title="Departmental Info" icon={Briefcase}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Lecturer ID"
                    name="lecturerId"
                    value={profileData.lecturerId || ''}
                    disabled
                  />
                  <Select
                    label="Department"
                    name="department"
                    value={profileData.department || ''}
                    onChange={handleChange}
                    options={[
                      { value: 'IT', label: 'Information Technology' },
                      { value: 'SE', label: 'Software Engineering' },
                      { value: 'DS', label: 'Data Science' },
                      { value: 'CSNE', label: 'Cyber Security' },
                      { value: 'Other', label: 'Other' },
                    ]}
                  />
                  <Select
                    label="Position"
                    name="position"
                    value={profileData.position || ''}
                    onChange={handleChange}
                    options={[
                      { value: 'Lecturer', label: 'Lecturer' },
                      { value: 'Senior Lecturer', label: 'Senior Lecturer' },
                      { value: 'Professor', label: 'Professor' },
                    ]}
                  />
                </div>
              </Card>
            )}

            {/* Expert Specific Info */}
            {isExpert && (
              <Card title="Expertise Details" icon={Award}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Current GPA"
                    name="gpa"
                    type="number"
                    step="0.01"
                    value={profileData.gpa || ''}
                    onChange={handleChange}
                    placeholder="e.g., 3.85"
                  />
                  <Select
                    label="Tutoring Experience"
                    name="tutoringExperience"
                    value={profileData.tutoringExperience || ''}
                    onChange={handleChange}
                    options={[
                      { value: 'None', label: 'No prior experience' },
                      { value: 'Basic', label: 'Basic experience' },
                      { value: 'Gold', label: 'Extensive (Gold tier)' },
                    ]}
                  />
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Modules & Stats */}
          <div className="space-y-8">
            {/* Modules (Student/Lecturer) */}
            {(isStudent || isLecturer) && (
              <Card title={isLecturer ? 'Teaching Modules' : 'Enrolled Modules'} icon={BookOpen}>
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 mb-2">
                    {isLecturer ? 'Select the modules you are currently coordinating.' : 'Select the modules you are studying this semester.'}
                  </p>
                  <div className="max-h-64 overflow-y-auto border rounded-md p-2 space-y-1">
                    {allModules.map(m => (
                      <label key={m.code} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={(isLecturer ? profileData.teachingModules : profileData.enrolledModules)?.includes(m.code)}
                          onChange={(e) => {
                            const field = isLecturer ? 'teachingModules' : 'enrolledModules';
                            const current = profileData[field] || [];
                            if (e.target.checked) {
                              setProfileData({ ...profileData, [field]: [...current, m.code] });
                            } else {
                              setProfileData({ ...profileData, [field]: current.filter(c => c !== m.code) });
                            }
                          }}
                          className="rounded text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{m.code}</span>
                          <span className="text-xs text-gray-500">{m.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Account Status */}
            <Card title="Account Verification">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account Role</span>
                  <Badge variant="primary-outline">{user.role}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verification Status</span>
                  <Badge variant={user.status === 'active' ? 'success' : 'warning'}>
                    {user.status === 'active' ? 'Verified' : 'Pending Approval'}
                  </Badge>
                </div>
                {isExpert && !profileData.transcript && (
                   <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                     <p className="text-xs text-amber-800 flex gap-2">
                       <AlertCircle className="w-4 h-4 flex-shrink-0" />
                       Please upload your academic transcript to verify your GPA.
                     </p>
                     <Button size="sm" variant="outline" className="mt-2 w-full border-amber-300 text-amber-700">
                        Upload Transcript
                     </Button>
                   </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
