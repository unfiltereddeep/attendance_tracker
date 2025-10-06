import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, TrendingUp, AlertTriangle, Calendar, BarChart3 } from 'lucide-react';
import SubjectCard from './components/SubjectCard';
import AddSubjectModal from './components/AddSubjectModal';
import AttendanceModal from './components/AttendanceModal';
import AnalyticsModal from './components/AnalyticsModal';
import AlertsPanel from './components/AlertsPanel';
import { Subject, AttendanceRecord } from './types';

function App() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedSubjects = localStorage.getItem('attendanceTracker_subjects');
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
  }, []);

  // Save data to localStorage whenever subjects change
  useEffect(() => {
    localStorage.setItem('attendanceTracker_subjects', JSON.stringify(subjects));
    updateAlerts();
  }, [subjects]);

  const updateAlerts = () => {
    const lowAttendanceSubjects = subjects.filter(subject => {
      const percentage = calculateAttendancePercentage(subject);
      return percentage < 75;
    });
    setAlerts(lowAttendanceSubjects.map(subject => 
      `${subject.name} attendance is ${calculateAttendancePercentage(subject).toFixed(1)}% (Below 75%)`
    ));
  };

  const calculateAttendancePercentage = (subject: Subject): number => {
    if (subject.records.length === 0) return 0;
    const presentCount = subject.records.filter(record => record.status === 'present').length;
    return (presentCount / subject.records.length) * 100;
  };

  const addSubject = (name: string, code: string) => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name,
      code,
      records: [],
      createdAt: new Date()
    };
    setSubjects([...subjects, newSubject]);
    setShowAddModal(false);
  };

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter(subject => subject.id !== id));
  };

  const editSubject = (id: string, name: string, code: string) => {
    setSubjects(subjects.map(subject => 
      subject.id === id ? { ...subject, name, code } : subject
    ));
  };

  const addAttendanceRecord = (subjectId: string, records: AttendanceRecord[]) => {
    setSubjects(subjects.map(subject => 
      subject.id === subjectId 
        ? { ...subject, records: [...subject.records, ...records] }
        : subject
    ));
    setShowAttendanceModal(false);
    setSelectedSubject(null);
  };

  const openAttendanceModal = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowAttendanceModal(true);
  };

  const getOverallStats = () => {
    if (subjects.length === 0) return { overall: 0, totalClasses: 0, present: 0 };
    
    let totalPresent = 0;
    let totalClasses = 0;
    
    subjects.forEach(subject => {
      totalClasses += subject.records.length;
      totalPresent += subject.records.filter(r => r.status === 'present').length;
    });
    
    return {
      overall: totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0,
      totalClasses,
      present: totalPresent
    };
  };

  const stats = getOverallStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Student Attendance Tracker
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Track your attendance across all subjects with real-time insights and automated compliance monitoring
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Overall Attendance</h3>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${stats.overall >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.overall.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Subjects</h3>
              <BookOpen className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{subjects.length}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Classes Attended</h3>
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{stats.present}</span>
              <span className="text-gray-600">/ {stats.totalClasses}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Compliance Status</h3>
              <AlertTriangle className={`h-5 w-5 ${alerts.length > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-bold ${alerts.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {alerts.length > 0 ? `${alerts.length} Alert${alerts.length > 1 ? 's' : ''}` : 'Good'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Add Subject
          </button>
          
          <button
            onClick={() => setShowAnalyticsModal(true)}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg border border-gray-200"
          >
            <BarChart3 className="h-5 w-5" />
            Analytics
          </button>
        </div>

        {/* Alerts Panel */}
        {alerts.length > 0 && <AlertsPanel alerts={alerts} />}

        {/* Subjects Grid */}
        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onEdit={editSubject}
                onDelete={deleteSubject}
                onMarkAttendance={() => openAttendanceModal(subject)}
                attendancePercentage={calculateAttendancePercentage(subject)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="p-6 bg-white rounded-full w-32 h-32 mx-auto mb-6 shadow-lg">
              <BookOpen className="h-20 w-20 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No subjects added yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start tracking your attendance by adding your first subject
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Add Your First Subject
            </button>
          </div>
        )}

        {/* Modals */}
        {showAddModal && (
          <AddSubjectModal
            onClose={() => setShowAddModal(false)}
            onAdd={addSubject}
          />
        )}

        {showAttendanceModal && selectedSubject && (
          <AttendanceModal
            subject={selectedSubject}
            onClose={() => {
              setShowAttendanceModal(false);
              setSelectedSubject(null);
            }}
            onAdd={addAttendanceRecord}
          />
        )}

        {showAnalyticsModal && (
          <AnalyticsModal
            subjects={subjects}
            onClose={() => setShowAnalyticsModal(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;