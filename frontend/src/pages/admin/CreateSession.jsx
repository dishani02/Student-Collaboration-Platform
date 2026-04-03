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
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

const initialForm = {
  title: "",
  moduleCode: "",
  description: "",
  requiredStudents: 25,
  requiredExperts: 1,
};

const AdminCreateSession = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [moduleError, setModuleError] = useState("");
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setModulesLoading(true);
        setModuleError("");

        const res = await API.get("/modules");
        setModules(res.data.modules || []);
      } catch (error) {
        setModuleError("Failed to load modules");
        toast.error("Unable to load modules");
      } finally {
        setModulesLoading(false);
      }
    };

    fetchModules();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setForm(initialForm);
    toast.success("Form reset successfully");
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      toast.error("Session title is required");
      return false;
    }

    if (form.title.trim().length < 5) {
      toast.error("Title must be at least 5 characters long");
      return false;
    }

    if (!form.moduleCode) {
      toast.error("Please select a module");
      return false;
    }

    if (!form.description.trim()) {
      toast.error("Description is required");
      return false;
    }

    if (form.description.trim().length < 20) {
      toast.error("Description must be at least 20 characters long");
      return false;
    }

    if (form.requiredStudents < 1) {
      toast.error("Required students must be at least 1");
      return false;
    }

    if (form.requiredExperts < 1) {
      toast.error("Required experts must be at least 1");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
    };

    try {
      setLoading(true);
      await API.post("/sessions", payload);
      toast.success("Session announcement created successfully");
      navigate("/admin/sessions");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled =
    loading || modulesLoading || modules.length === 0 || !!moduleError;

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
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="e.g., Data Structures Revision Session"
                      required
                      className="bg-white"
                    />
                    <p className="text-xs text-gray-500">
                      Title length: {form.title.trim().length} characters
                    </p>

                    <div>
                      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <BookOpen size={16} className="text-primary-600" />
                        Module Code <span className="text-red-500">*</span>
                      </label>

                      <select
                        value={form.moduleCode}
                        onChange={(e) =>
                          handleChange("moduleCode", e.target.value)
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        required
                        disabled={modulesLoading || modules.length === 0}
                      >
                        <option value="">
                          {modulesLoading
                            ? "Loading modules..."
                            : "Select module"}
                        </option>
                        {modules.map((m) => (
                          <option key={m.code} value={m.code}>
                            {m.code} - {m.name}
                          </option>
                        ))}
                      </select>

                      {moduleError && (
                        <p className="mt-2 text-xs text-red-500">
                          {moduleError}
                        </p>
                      )}

                      {!modulesLoading &&
                        !moduleError &&
                        modules.length === 0 && (
                          <p className="mt-2 text-xs text-amber-600">
                            No modules available right now.
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) =>
                          handleChange("description", e.target.value)
                        }
                        rows={5}
                        maxLength={500}
                        className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        placeholder="Describe the session topic, learning outcomes, and who should join..."
                        required
                      />
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <p>
                          Add a clear description so students know what the
                          session covers.
                        </p>
                        <span>{form.description.length}/500</span>
                      </div>
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
                          handleChange(
                            "requiredStudents",
                            Math.max(1, Number(e.target.value) || 1),
                          )
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
                          handleChange(
                            "requiredExperts",
                            Math.max(1, Number(e.target.value) || 1),
                          )
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
                    disabled={isSubmitDisabled}
                    className="w-full bg-primary-600 shadow-md hover:bg-primary-700 sm:w-auto"
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
