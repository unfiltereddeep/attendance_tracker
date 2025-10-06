import React, { useState } from 'react';
import { X, Calendar, Plus, Check, UserCheck, UserX } from 'lucide-react';
import { Subject, AttendanceRecord } from '../types';

interface AttendanceModalProps {
  subject: Subject;
  onClose: () => void;
  onAdd: (subjectId: string, records: AttendanceRecord[]) => void;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ subject, onClose, onAdd }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'present' | 'absent'>('present');
  const [note, setNote] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [batchDates, setBatchDates] = useState<{ date: string; status: 'present' | 'absent' }[]>([]);

  const handleSingleAdd = () => {
    const record: AttendanceRecord = {
      id: Date.now().toString(),
      date: new Date(selectedDate),
      status,
      note: note.trim() || undefined
    };
    onAdd(subject.id, [record]);
  };

  const handleBatchAdd = () => {
    const records: AttendanceRecord[] = batchDates.map((item, index) => ({
      id: `${Date.now()}-${index}`,
      date: new Date(item.date),
      status: item.status
    }));
    onAdd(subject.id, records);
  };

  const addBatchDate = () => {
    setBatchDates([...batchDates, { date: selectedDate, status: 'present' }]);
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const removeBatchDate = (index: number) => {
    setBatchDates(batchDates.filter((_, i) => i !== index));
  };

  const updateBatchStatus = (index: number, newStatus: 'present' | 'absent') => {
    setBatchDates(batchDates.map((item, i) => 
      i === index ? { ...item, status: newStatus } : item
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Mark Attendance</h2>
            <p className="text-gray-600">{subject.name} ({subject.code})</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setBatchMode(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                !batchMode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Single Entry
            </button>
            <button
              onClick={() => setBatchMode(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                batchMode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Batch Entry
            </button>
          </div>

          {!batchMode ? (
            /* Single Entry Mode */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attendance Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setStatus('present')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      status === 'present'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <UserCheck className="h-6 w-6 mx-auto mb-2" />
                    <span className="font-medium">Present</span>
                  </button>
                  <button
                    onClick={() => setStatus('absent')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      status === 'absent'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <UserX className="h-6 w-6 mx-auto mb-2" />
                    <span className="font-medium">Absent</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={2}
                  placeholder="Add any additional notes..."
                />
              </div>

              <button
                onClick={handleSingleAdd}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" />
                Mark Attendance
              </button>
            </div>
          ) : (
            /* Batch Entry Mode */
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={addBatchDate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  disabled={batchDates.some(item => item.date === selectedDate)}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              {batchDates.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <h3 className="font-medium text-gray-700">Dates to Add:</h3>
                  {batchDates.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="flex-1">{new Date(item.date).toLocaleDateString()}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateBatchStatus(index, 'present')}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            item.status === 'present'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-green-200'
                          }`}
                        >
                          P
                        </button>
                        <button
                          onClick={() => updateBatchStatus(index, 'absent')}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            item.status === 'absent'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-red-200'
                          }`}
                        >
                          A
                        </button>
                      </div>
                      <button
                        onClick={() => removeBatchDate(index)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {batchDates.length > 0 && (
                <button
                  onClick={handleBatchAdd}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Add {batchDates.length} Record{batchDates.length > 1 ? 's' : ''}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;