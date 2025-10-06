import React, { useState } from 'react';
import { CreditCard as Edit3, Trash2, Calendar, TrendingUp, User, CheckCircle, XCircle } from 'lucide-react';
import { Subject } from '../types';

interface SubjectCardProps {
  subject: Subject;
  onEdit: (id: string, name: string, code: string) => void;
  onDelete: (id: string) => void;
  onMarkAttendance: () => void;
  attendancePercentage: number;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  onEdit,
  onDelete,
  onMarkAttendance,
  attendancePercentage
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(subject.name);
  const [editCode, setEditCode] = useState(subject.code);

  const handleEdit = () => {
    onEdit(subject.id, editName.trim(), editCode.trim());
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${subject.name}? This action cannot be undone.`)) {
      onDelete(subject.id);
    }
  };

  const presentCount = subject.records.filter(r => r.status === 'present').length;
  const absentCount = subject.records.filter(r => r.status === 'absent').length;
  const totalClasses = subject.records.length;

  const getStatusColor = () => {
    if (attendancePercentage >= 85) return 'text-green-600 bg-green-50';
    if (attendancePercentage >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getProgressColor = () => {
    if (attendancePercentage >= 85) return 'bg-green-500';
    if (attendancePercentage >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Subject Name"
            />
            <input
              type="text"
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Subject Code"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(subject.name);
                  setEditCode(subject.code);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{subject.name}</h3>
                <p className="text-sm text-gray-600 font-medium">{subject.code}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Attendance Percentage */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Attendance</span>
                <span className={`text-sm font-bold px-2 py-1 rounded-full ${getStatusColor()}`}>
                  {attendancePercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
                  style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-lg font-bold text-green-600">{presentCount}</span>
                </div>
                <p className="text-xs text-gray-600">Present</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-lg font-bold text-red-600">{absentCount}</span>
                </div>
                <p className="text-xs text-gray-600">Absent</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-lg font-bold text-blue-600">{totalClasses}</span>
                </div>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onMarkAttendance}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <User className="h-4 w-4" />
              Mark Attendance
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SubjectCard;