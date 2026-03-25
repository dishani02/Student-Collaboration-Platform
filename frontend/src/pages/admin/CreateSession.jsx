import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import API from "../../utils/api";
import {
  ArrowLeft,
  CalendarDays,
  Users,
  BookOpen,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminCreateSession = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState({
    title: "",
    moduleCode: "",
    description: "",
    requiredStudents: 25,
    requiredExperts: 1,
  });

  useEffect(() => {
    API.get("/modules")
      .then((res) => setModules(res.data.modules || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.moduleCode || !form.description) {
      toast.error("Title, module code and description are required");
      return;
    }

    try {
      setLoading(true);
      await API.post("/sessions", form);
      toast.success("Session announcement created successfully");
      navigate("/admin/sessions");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/40 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate("/admin/sessions")}
            className="mb-6 text-gray-700 hover:bg-white hover:shadow-sm"
          >
            Back to Sessions
          </Button>

          <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 p-6 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
                <CalendarDays size={28} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Create Session Announcement
                </h1>
                <p className="mt-2 text-sm sm:text-base text-white/90 max-w-2xl">
                  Create a new academic support session for students and
                  experts. Fill in the details below to publish the
                  announcement.
                </p>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5 sm:px-8">
              <h2 className="text-xl font-semibold text-gray-900">
                Session Details
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Complete the form to create a new session announcement.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8 sm:py-8">
              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-primary-600" />
                    <h3 className="text-base font-semibold text-gray-800">
                      Basic Information
                    </h3>
                  </div>

                  <div className="space-y-5">
                    <Input
                      label="Title"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      placeholder="e.g., Data Structures Revision Session"
                      required
                      className="bg-white"
                    />

                    <div>
                      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <BookOpen size={16} className="text-primary-600" />
                        Module Code <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.moduleCode}
                        onChange={(e) =>
                          setForm({ ...form, moduleCode: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                        required
                      >
                        <option value="">Select module</option>
                        {modules.map((m) => (
                          <option key={m.code} value={m.code}>
                            {m.code} - {m.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                        rows={5}
                        className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                        placeholder="Describe the session topic, learning outcomes, and who should join..."
                        required
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Add a clear description so students know what the
                        session covers.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Users size={18} className="text-primary-600" />
                    <h3 className="text-base font-semibold text-gray-800">
                      Participation Requirements
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="rounded-xl border border-primary-100 bg-primary-50/40 p-4">
                      <Input
                        type="number"
                        label="Required Students (min)"
                        value={form.requiredStudents}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            requiredStudents: parseInt(e.target.value) || 25,
                          })
                        }
                        min={1}
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Minimum number of students needed for the session.
                      </p>
                    </div>

                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                      <Input
                        type="number"
                        label="Required Experts"
                        value={form.requiredExperts}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            requiredExperts: parseInt(e.target.value) || 1,
                          })
                        }
                        min={1}
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Number of experts or tutors expected for this session.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => navigate("/admin/sessions")}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 shadow-md"
                  >
                    Create Announcement
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminCreateSession;
