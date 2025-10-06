import React from 'react';
import { X, TrendingUp, Calendar, Target, Award } from 'lucide-react';
import { Subject } from '../types';

interface AnalyticsModalProps {
  subjects: Subject[];
  onClose: () => void;
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ subjects, onClose }) => {
  const calculateAttendancePercentage = (subject: Subject): number => {
    if (subject.records.length === 0) return 0;
    const presentCount = subject.records.filter(record => record.status === 'present').length;
    return (presentCount / subject.records.length) * 100;
  };

  const getOverallStats = () => {
    let totalPresent = 0;
    let totalClasses = 0;
    
    subjects.forEach(subject => {
      totalClasses += subject.records.length;
      totalPresent += subject.records.filter(r => r.status === 'present').length;
    });
    
    return {
      overall: totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0,
      totalClasses,
      present: totalPresent,
      absent: totalClasses - totalPresent
    };
  };

  const getSubjectsStats = () => {
    return subjects.map(subject => ({
      ...subject,
      percentage: calculateAttendancePercentage(subject),
      present: subject.records.filter(r => r.status === 'present').length,
      absent: subject.records.filter(r => r.status === 'absent').length
    })).sort((a, b) => b.percentage - a.percentage);
  };

  const getInsights = () => {
    const stats = getOverallStats();
    const subjectsStats = getSubjectsStats();
    const insights = [];

    // Overall performance insight
    if (stats.overall >= 85) {
      insights.push({
        type: 'success',
        title: 'Excellent Attendance',
        message: `You're doing great with ${stats.overall.toFixed(1)}% overall attendance!`
      });
    } else if (stats.overall >= 75) {
      insights.push({
        type: 'warning',
        title: 'Good Attendance',
        message: `You're meeting the minimum requirement with ${stats.overall.toFixed(1)}% attendance.`
      });
    } else {
      insights.push({
        type: 'danger',
        title: 'Attendance Alert',
        message: `Your ${stats.overall.toFixed(1)}% attendance is below the 75% requirement.`
      });
    }

    // Best performing subject
    const bestSubject = subjectsStats[0];
    if (bestSubject && bestSubject.records.length > 0) {
      insights.push({
        type: 'info',
        title: 'Best Performing Subject',
        message: `${bestSubject.name} has your highest attendance at ${bestSubject.percentage.toFixed(1)}%`
      });
    }

    // Subjects needing attention
    const lowSubjects = subjectsStats.filter(s => s.percentage < 75);
    if (lowSubjects.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Subjects Needing Attention',
        message: `${lowSubjects.length} subject(s) are below 75% attendance threshold.`
      });
    }

    return insights;
  };

  const overallStats = getOverallStats();
  const subjectsStats = getSubjectsStats();
  const insights = getInsights();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Overall Stats */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Overall</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {overallStats.overall.toFixed(1)}%
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Present</span>
                </div>
                <div className="text-2xl font-bold text-green-700">{overallStats.present}</div>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-rose-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <X className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Absent</span>
                </div>
                <div className="text-2xl font-bold text-red-700">{overallStats.absent}</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Total</span>
                </div>
                <div className="text-2xl font-bold text-purple-700">{overallStats.totalClasses}</div>
              </div>
            </div>
          </div>

          {/* Subject-wise Performance */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Performance</h3>
            <div className="space-y-3">
              {subjectsStats.map((subject) => (
                <div key={subject.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{subject.name}</h4>
                      <p className="text-sm text-gray-600">{subject.code}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        subject.percentage >= 75 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {subject.percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {subject.present}P / {subject.absent}A
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        subject.percentage >= 85 ? 'bg-green-500' :
                        subject.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(subject.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'success' ? 'bg-green-50 border-green-500' :
                    insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                    insight.type === 'danger' ? 'bg-red-50 border-red-500' :
                    'bg-blue-50 border-blue-500'
                  }`}
                >
                  <h4 className={`font-medium mb-1 ${
                    insight.type === 'success' ? 'text-green-700' :
                    insight.type === 'warning' ? 'text-yellow-700' :
                    insight.type === 'danger' ? 'text-red-700' :
                    'text-blue-700'
                  }`}>
                    {insight.title}
                  </h4>
                  <p className={`text-sm ${
                    insight.type === 'success' ? 'text-green-600' :
                    insight.type === 'warning' ? 'text-yellow-600' :
                    insight.type === 'danger' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {insight.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;