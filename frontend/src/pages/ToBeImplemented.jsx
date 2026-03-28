import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import { AlertCircle } from 'lucide-react';

const ToBeImplemented = ({ title }) => {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-4 py-12 px-6 flex-col text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            </div>
            <p className="text-blue-700 max-w-md">
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ToBeImplemented;
