export interface AttendanceRecord {
  id: string;
  date: Date;
  status: 'present' | 'absent';
  note?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  records: AttendanceRecord[];
  createdAt: Date;
}