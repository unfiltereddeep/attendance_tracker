import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface AlertsPanelProps {
  alerts: string[];
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="p-1">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-800 mb-2">
            Attendance Compliance Alert{alerts.length > 1 ? 's' : ''}
          </h3>
          <div className="space-y-1">
            {alerts.map((alert, index) => (
              <p key={index} className="text-red-700 text-sm">
                • {alert}
              </p>
            ))}
          </div>
          <p className="text-red-600 text-sm mt-2 font-medium">
            Action needed: Attend more classes to maintain 75% minimum attendance requirement
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlertsPanel;