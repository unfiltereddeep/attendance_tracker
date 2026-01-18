// Data Management
const DataManager = {
    getSubjects: function() {
        const data = localStorage.getItem('subjects');
        return data ? JSON.parse(data) : [];
    },

    saveSubjects: function(subjects) {
        localStorage.setItem('subjects', JSON.stringify(subjects));
    },

    getSchedule: function() {
        const data = localStorage.getItem('schedule');
        return data ? JSON.parse(data) : {
            monday: [], tuesday: [], wednesday: [], thursday: [],
            friday: [], saturday: [], sunday: []
        };
    },

    saveSchedule: function(schedule) {
        localStorage.setItem('schedule', JSON.stringify(schedule));
    },

    getAttendance: function() {
        const data = localStorage.getItem('attendance');
        return data ? JSON.parse(data) : [];
    },

    saveAttendance: function(attendance) {
        localStorage.setItem('attendance', JSON.stringify(attendance));
    }
};

// Utility Functions
const Utils = {
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    getDayName: function(date) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[new Date(date).getDay()];
    },

    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    },

    getTodayDate: function() {
        return this.formatDate(new Date());
    },

    validateUniqueSubject: function(name, excludeId = null) {
        const subjects = DataManager.getSubjects();
        const normalizedName = name.toLowerCase().trim();
        return !subjects.some(s => s.name.toLowerCase().trim() === normalizedName && s.id !== excludeId);
    }
};

// Subject Management
const SubjectManager = {
    init: function() {
        this.renderSubjects();
        this.setupEventListeners();
    },

    setupEventListeners: function() {
        const addBtn = document.getElementById('add-subject-btn');
        const nameInput = document.getElementById('subject-name-input');

        addBtn.addEventListener('click', () => this.addSubject());
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addSubject();
        });
    },

    addSubject: function() {
        const nameInput = document.getElementById('subject-name-input');
        const name = nameInput.value.trim();

        if (!name) {
            alert('Please enter a subject name');
            return;
        }

        if (!Utils.validateUniqueSubject(name)) {
            alert('Subject name must be unique');
            return;
        }

        const subjects = DataManager.getSubjects();
        const newSubject = {
            id: Utils.generateId(),
            name: name,
            redThreshold: 40,
            yellowThreshold: 75
        };

        subjects.push(newSubject);
        DataManager.saveSubjects(subjects);
        nameInput.value = '';
        this.renderSubjects();
        ScheduleManager.renderSchedule();
        AttendanceManager.updateExtraClassDropdown();
        DashboardManager.updateDashboard();
    },

    editSubject: function(id) {
        const subjects = DataManager.getSubjects();
        const subject = subjects.find(s => s.id === id);
        if (!subject) return;

        const newName = prompt('Enter new subject name:', subject.name);
        if (!newName || !newName.trim()) return;

        const trimmedName = newName.trim();
        if (!Utils.validateUniqueSubject(trimmedName, id)) {
            alert('Subject name must be unique');
            return;
        }

        subject.name = trimmedName;
        DataManager.saveSubjects(subjects);
        this.renderSubjects();
        ScheduleManager.renderSchedule();
        AttendanceManager.updateExtraClassDropdown();
        DashboardManager.updateDashboard();
    },

    editThresholds: function(id) {
        const subjects = DataManager.getSubjects();
        const subject = subjects.find(s => s.id === id);
        if (!subject) return;

        // Use existing thresholds or defaults
        const redThreshold = subject.redThreshold !== undefined ? subject.redThreshold : 40;
        const yellowThreshold = subject.yellowThreshold !== undefined ? subject.yellowThreshold : 75;

        // Create modal form for editing thresholds
        const modal = document.getElementById('threshold-modal');
        if (!modal) {
            // Create modal if it doesn't exist
            const modalHtml = `
                <div id="threshold-modal" class="modal">
                    <div class="modal-content">
                        <h3 id="threshold-modal-title">Edit Attendance Thresholds</h3>
                        <div class="threshold-form">
                            <div class="form-group">
                                <label for="threshold-red">Red Threshold (below %):</label>
                                <input type="number" id="threshold-red" min="0" max="100" step="1">
                            </div>
                            <div class="form-group">
                                <label for="threshold-yellow">Yellow Threshold (minimum %):</label>
                                <input type="number" id="threshold-yellow" min="0" max="100" step="1">
                            </div>
                            <p class="threshold-info">Red: &lt; Red Threshold<br>Yellow: Red Threshold to Yellow Threshold<br>Green: &gt; Yellow Threshold</p>
                        </div>
                        <div class="modal-buttons">
                            <button id="threshold-save" class="btn btn-primary">Save</button>
                            <button id="threshold-cancel" class="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        const thresholdModal = document.getElementById('threshold-modal');
        document.getElementById('threshold-modal-title').textContent = `Edit Attendance Thresholds - ${subject.name}`;
        document.getElementById('threshold-red').value = redThreshold;
        document.getElementById('threshold-yellow').value = yellowThreshold;

        thresholdModal.classList.add('active');

        const closeModal = () => {
            thresholdModal.classList.remove('active');
        };

        document.getElementById('threshold-save').onclick = () => {
            const newRed = parseInt(document.getElementById('threshold-red').value);
            const newYellow = parseInt(document.getElementById('threshold-yellow').value);

            if (isNaN(newRed) || isNaN(newYellow)) {
                alert('Please enter valid numbers');
                return;
            }

            if (newRed < 0 || newRed > 100 || newYellow < 0 || newYellow > 100) {
                alert('Thresholds must be between 0 and 100');
                return;
            }

            if (newRed >= newYellow) {
                alert('Red threshold must be less than Yellow threshold');
                return;
            }

            subject.redThreshold = newRed;
            subject.yellowThreshold = newYellow;
            DataManager.saveSubjects(subjects);
            
            closeModal();
            DashboardManager.updateDashboard();
        };

        document.getElementById('threshold-cancel').onclick = closeModal;

        thresholdModal.onclick = (e) => {
            if (e.target === thresholdModal) closeModal();
        };
    },

    deleteSubject: function(id) {
        const subjects = DataManager.getSubjects();
        const subject = subjects.find(s => s.id === id);
        if (!subject) return;

        ModalManager.show(
            `Are you sure you want to delete "${subject.name}"? This will also remove all schedule entries and attendance records for this subject.`,
            () => {
                const filteredSubjects = subjects.filter(s => s.id !== id);
                DataManager.saveSubjects(filteredSubjects);

                // Remove from schedule
                const schedule = DataManager.getSchedule();
                Object.keys(schedule).forEach(day => {
                    schedule[day] = schedule[day].filter(e => e.subjectId !== id);
                });
                DataManager.saveSchedule(schedule);

                // Remove attendance records
                const attendance = DataManager.getAttendance();
                const filteredAttendance = attendance.filter(a => a.subjectId !== id);
                DataManager.saveAttendance(filteredAttendance);

                this.renderSubjects();
                ScheduleManager.renderSchedule();
                AttendanceManager.updateExtraClassDropdown();
                DashboardManager.updateDashboard();
            }
        );
    },

    renderSubjects: function() {
        const container = document.getElementById('subjects-list');
        const subjects = DataManager.getSubjects();

        if (subjects.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No subjects added yet.</p>';
            return;
        }

        container.innerHTML = subjects.map(subject => `
            <div class="subject-item">
                <span>${subject.name}</span>
                <div class="subject-item-actions">
                    <button class="btn btn-small btn-secondary btn-edit" onclick="SubjectManager.editSubject('${subject.id}')">Edit</button>
                    <button class="btn btn-small btn-secondary btn-thresholds" onclick="SubjectManager.editThresholds('${subject.id}')">Thresholds</button>
                    <button class="btn btn-small btn-danger btn-delete" onclick="SubjectManager.deleteSubject('${subject.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }
};

// Schedule Management
const ScheduleManager = {
    init: function() {
        this.renderSchedule();
        this.setupEventListeners();
        this.highlightToday();
    },

    setupEventListeners: function() {
        document.querySelectorAll('.btn-add-entry').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const day = e.target.getAttribute('data-day');
                this.addScheduleEntry(day);
            });
        });
    },

    highlightToday: function() {
        const today = Utils.getDayName(new Date());
        document.querySelectorAll('.schedule-day').forEach(day => {
            day.classList.remove('today');
            if (day.getAttribute('data-day') === today) {
                day.classList.add('today');
            }
        });
    },

    addScheduleEntry: function(day) {
        const subjects = DataManager.getSubjects();
        if (subjects.length === 0) {
            alert('Please add at least one subject first');
            return;
        }

        const container = document.getElementById(`schedule-${day}`);
        const entryId = Utils.generateId();
        const entryHtml = `
            <div class="schedule-entry-form" data-entry-id="${entryId}">
                <select class="schedule-subject-select">
                    <option value="">Select Subject</option>
                    ${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                </select>
                <input type="number" class="schedule-hours-input" placeholder="Hours" min="0.5" step="0.5" value="1">
                <button class="btn btn-small btn-primary" onclick="ScheduleManager.saveEntry('${day}', '${entryId}')">Save</button>
                <button class="btn btn-small btn-secondary" onclick="ScheduleManager.cancelEntry('${day}', '${entryId}')">Cancel</button>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', entryHtml);
    },

    saveEntry: function(day, entryId) {
        const form = document.querySelector(`[data-entry-id="${entryId}"]`);
        const subjectId = form.querySelector('.schedule-subject-select').value;
        const hours = parseFloat(form.querySelector('.schedule-hours-input').value);

        if (!subjectId) {
            alert('Please select a subject');
            return;
        }

        if (!hours || hours <= 0) {
            alert('Please enter valid hours');
            return;
        }

        const schedule = DataManager.getSchedule();
        schedule[day].push({ id: entryId, subjectId: subjectId, hours: hours });
        DataManager.saveSchedule(schedule);
        this.renderSchedule();
    },

    cancelEntry: function(day, entryId) {
        const form = document.querySelector(`[data-entry-id="${entryId}"]`);
        form.remove();
    },

    deleteScheduleEntry: function(day, entryId) {
        const schedule = DataManager.getSchedule();
        schedule[day] = schedule[day].filter(e => e.id !== entryId);
        DataManager.saveSchedule(schedule);
        this.renderSchedule();
    },

    renderSchedule: function() {
        const schedule = DataManager.getSchedule();
        const subjects = DataManager.getSubjects();
        const subjectMap = {};
        subjects.forEach(s => subjectMap[s.id] = s);

        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
            const container = document.getElementById(`schedule-${day}`);
            const entries = schedule[day] || [];

            if (entries.length === 0) {
                container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.875rem;">No classes scheduled</p>';
                return;
            }

            container.innerHTML = entries.map(entry => {
                const subject = subjectMap[entry.subjectId];
                if (!subject) return '';

                return `
                    <div class="schedule-entry">
                        <div class="schedule-entry-info">
                            <div class="schedule-entry-subject">${subject.name}</div>
                            <div class="schedule-entry-hours">${entry.hours} hour${entry.hours !== 1 ? 's' : ''}</div>
                        </div>
                        <button class="btn btn-small btn-danger" onclick="ScheduleManager.deleteScheduleEntry('${day}', '${entry.id}')">Delete</button>
                    </div>
                `;
            }).join('');
        });
    }
};

// Attendance Management
const AttendanceManager = {
    currentDate: null,

    init: function() {
        const today = Utils.getTodayDate();
        document.getElementById('attendance-date').value = today;
        this.currentDate = today;
        this.setupEventListeners();
        this.updateExtraClassDropdown();
        this.renderAttendanceHistory();
    },

    setupEventListeners: function() {
        document.getElementById('attendance-date').addEventListener('change', (e) => {
            this.currentDate = e.target.value;
        });

        document.getElementById('load-recommendations-btn').addEventListener('click', () => {
            this.loadRecommendations();
        });

        document.getElementById('add-extra-class-btn').addEventListener('click', () => {
            this.addExtraClass();
        });

        // Load recommendations on page load
        this.loadRecommendations();
    },

    updateExtraClassDropdown: function() {
        const select = document.getElementById('extra-subject-select');
        const subjects = DataManager.getSubjects();
        select.innerHTML = '<option value="">Select Subject</option>' +
            subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    },

    loadRecommendations: function() {
        const date = this.currentDate || document.getElementById('attendance-date').value;
        if (!date) {
            alert('Please select a date');
            return;
        }

        const day = Utils.getDayName(date);
        const schedule = DataManager.getSchedule();
        const scheduledEntries = schedule[day] || [];
        const subjects = DataManager.getSubjects();
        const subjectMap = {};
        subjects.forEach(s => subjectMap[s.id] = s);

        const container = document.getElementById('attendance-recommendations');
        
        if (scheduledEntries.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No classes scheduled for this day.</p>';
            return;
        }

        const attendance = DataManager.getAttendance();
        const dateStr = Utils.formatDate(date);

        container.innerHTML = scheduledEntries.map(entry => {
            const subject = subjectMap[entry.subjectId];
            if (!subject) return '';

            // Check if already marked
            const existing = attendance.find(a => 
                a.subjectId === entry.subjectId && a.date === dateStr && !a.isExtra
            );

            if (existing) {
                return `
                    <div class="attendance-item">
                        <div class="attendance-item-header">
                            <span class="attendance-item-subject">${subject.name}</span>
                            <span class="attendance-item-hours">${existing.hours} hour${existing.hours !== 1 ? 's' : ''}</span>
                        </div>
                        <p style="color: var(--text-secondary); margin-bottom: 12px;">Already marked as: <strong>${existing.status}</strong></p>
                        <button class="btn btn-small btn-danger" onclick="AttendanceManager.deleteAttendance('${existing.id}')">Delete Attendance</button>
                    </div>
                `;
            }

            const entryId = Utils.generateId();
            return `
                <div class="attendance-item" data-entry-id="${entryId}">
                    <div class="attendance-item-header">
                        <span class="attendance-item-subject">${subject.name}</span>
                        <span class="attendance-item-hours">${entry.hours} hour${entry.hours !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="hours-control">
                        <button onclick="AttendanceManager.adjustHours('${entryId}', -0.5)">−</button>
                        <input type="number" id="hours-${entryId}" value="${entry.hours}" min="0.5" step="0.5" readonly>
                        <button onclick="AttendanceManager.adjustHours('${entryId}', 0.5)">+</button>
                    </div>
                    <div class="status-buttons">
                        <button class="status-btn present" onclick="AttendanceManager.markAttendance('${entryId}', '${entry.subjectId}', 'present', this)">Present</button>
                        <button class="status-btn absent" onclick="AttendanceManager.markAttendance('${entryId}', '${entry.subjectId}', 'absent', this)">Absent</button>
                        <button class="status-btn cancelled" onclick="AttendanceManager.markAttendance('${entryId}', '${entry.subjectId}', 'cancelled', this)">Cancelled</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    adjustHours: function(entryId, delta) {
        const input = document.getElementById(`hours-${entryId}`);
        const current = parseFloat(input.value) || 1;
        const newValue = Math.max(0.5, current + delta);
        input.value = newValue;
    },

    markAttendance: function(entryId, subjectId, status, buttonElement) {
        const date = this.currentDate || document.getElementById('attendance-date').value;
        const dateStr = Utils.formatDate(date);
        const input = document.getElementById(`hours-${entryId}`);
        const hours = parseFloat(input.value) || 1;

        // Check for duplicates
        const attendance = DataManager.getAttendance();
        const existing = attendance.find(a => 
            a.subjectId === subjectId && a.date === dateStr && !a.isExtra
        );

        if (existing) {
            alert('Attendance for this subject on this date is already marked');
            return;
        }

        let attendedUnits = 0;
        let totalUnits = 0;

        if (status === 'present') {
            attendedUnits = hours;
            totalUnits = hours;
        } else if (status === 'absent') {
            attendedUnits = 0;
            totalUnits = hours;
        } else if (status === 'cancelled') {
            attendedUnits = 0;
            totalUnits = 0;
        }

        const newEntry = {
            id: Utils.generateId(),
            subjectId: subjectId,
            date: dateStr,
            status: status,
            hours: hours,
            attendedUnits: attendedUnits,
            totalUnits: totalUnits,
            isExtra: false
        };

        attendance.push(newEntry);
        DataManager.saveAttendance(attendance);
        
        // Highlight selected button
        const item = document.querySelector(`[data-entry-id="${entryId}"]`);
        if (item && buttonElement) {
            item.querySelectorAll('.status-btn').forEach(btn => btn.classList.remove('active'));
            buttonElement.classList.add('active');
        }

        // Update dashboard and global summary
        DashboardManager.updateDashboard();
        GlobalSummaryManager.updateSummary();

        // Reload recommendations to show marked status
        setTimeout(() => {
            this.loadRecommendations();
            this.renderAttendanceHistory();
        }, 500);
    },

    addExtraClass: function() {
        const subjectId = document.getElementById('extra-subject-select').value;
        const hours = parseFloat(document.getElementById('extra-hours-input').value) || 1;
        const status = document.getElementById('extra-status-select').value;
        const date = this.currentDate || document.getElementById('attendance-date').value;

        if (!subjectId) {
            alert('Please select a subject');
            return;
        }

        if (!hours || hours <= 0) {
            alert('Please enter valid hours');
            return;
        }

        const dateStr = Utils.formatDate(date);
        const attendance = DataManager.getAttendance();

        let attendedUnits = 0;
        let totalUnits = 0;

        if (status === 'present') {
            attendedUnits = hours;
            totalUnits = hours;
        } else if (status === 'absent') {
            attendedUnits = 0;
            totalUnits = hours;
        }

        const newEntry = {
            id: Utils.generateId(),
            subjectId: subjectId,
            date: dateStr,
            status: status,
            hours: hours,
            attendedUnits: attendedUnits,
            totalUnits: totalUnits,
            isExtra: true
        };

        attendance.push(newEntry);
        DataManager.saveAttendance(attendance);

        document.getElementById('extra-subject-select').value = '';
        document.getElementById('extra-hours-input').value = '1';
        document.getElementById('extra-status-select').value = 'present';

        this.renderAttendanceHistory();
        DashboardManager.updateDashboard();
        GlobalSummaryManager.updateSummary();
    },

    deleteAttendance: function(attendanceId) {
        const attendance = DataManager.getAttendance();
        const entry = attendance.find(a => a.id === attendanceId);
        if (!entry) return;

        const subjects = DataManager.getSubjects();
        const subject = subjects.find(s => s.id === entry.subjectId);
        const subjectName = subject ? subject.name : 'this subject';

        ModalManager.show(
            `Are you sure you want to delete attendance for "${subjectName}" on ${entry.date}?`,
            () => {
                const filtered = attendance.filter(a => a.id !== attendanceId);
                DataManager.saveAttendance(filtered);
                this.loadRecommendations();
                this.renderAttendanceHistory();
                DashboardManager.updateDashboard();
                GlobalSummaryManager.updateSummary();
            }
        );
    },

    renderAttendanceHistory: function() {
        const container = document.getElementById('attendance-history-list');
        const attendance = DataManager.getAttendance();
        const subjects = DataManager.getSubjects();
        const subjectMap = {};
        subjects.forEach(s => subjectMap[s.id] = s);

        if (attendance.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No attendance records found.</p>';
            return;
        }

        // Sort by date (newest first)
        const sortedAttendance = [...attendance].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        container.innerHTML = sortedAttendance.map(entry => {
            const subject = subjectMap[entry.subjectId];
            if (!subject) return '';

            const statusLabel = entry.status.charAt(0).toUpperCase() + entry.status.slice(1);
            const extraLabel = entry.isExtra ? ' (Extra Class)' : '';
            const statusClass = entry.status === 'present' ? 'present' : 
                              entry.status === 'absent' ? 'absent' : 
                              entry.status === 'cancelled' ? 'cancelled' : 'extra';

            return `
                <div class="attendance-history-item">
                    <div class="attendance-history-info">
                        <div class="attendance-history-header">
                            <span class="attendance-history-subject">${subject.name}${extraLabel}</span>
                            <span class="attendance-history-date">${entry.date}</span>
                        </div>
                        <div class="attendance-history-details">
                            <span class="status-badge ${statusClass}">${statusLabel}</span>
                            <span class="attendance-history-hours">${entry.hours} hour${entry.hours !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    <button class="btn btn-small btn-danger" onclick="AttendanceManager.deleteAttendance('${entry.id}')">Delete</button>
                </div>
            `;
        }).join('');
    }
};

// Dashboard Manager
const DashboardManager = {
    updateDashboard: function() {
        const subjects = DataManager.getSubjects();
        const attendance = DataManager.getAttendance();
        const container = document.getElementById('dashboard-grid');

        if (subjects.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No subjects to display. Add subjects to see dashboard.</p>';
            return;
        }

        container.innerHTML = subjects.map(subject => {
            const subjectAttendance = attendance.filter(a => a.subjectId === subject.id);
            
            const totalUnits = subjectAttendance.reduce((sum, a) => sum + a.totalUnits, 0);
            const attendedUnits = subjectAttendance.reduce((sum, a) => sum + a.attendedUnits, 0);
            const cancelledUnits = subjectAttendance.filter(a => a.status === 'cancelled').reduce((sum, a) => sum + a.hours, 0);
            
            const attendancePercent = totalUnits > 0 ? (attendedUnits / totalUnits) * 100 : 0;
            
            // Use subject-specific thresholds, fallback to defaults for old subjects
            const redThreshold = subject.redThreshold !== undefined ? subject.redThreshold : 40;
            const yellowThreshold = subject.yellowThreshold !== undefined ? subject.yellowThreshold : 75;
            
            let colorClass = 'red';
            if (attendancePercent > yellowThreshold) {
                colorClass = 'green';
            } else if (attendancePercent >= redThreshold) {
                colorClass = 'yellow';
            }

            return `
                <div class="dashboard-card ${colorClass}">
                    <div class="dashboard-card-title">${subject.name}</div>
                    <div class="dashboard-stats">
                        <div class="dashboard-stat">
                            <span class="dashboard-stat-label">Total Units</span>
                            <span class="dashboard-stat-value">${totalUnits.toFixed(1)}</span>
                        </div>
                        <div class="dashboard-stat">
                            <span class="dashboard-stat-label">Attended Units</span>
                            <span class="dashboard-stat-value">${attendedUnits.toFixed(1)}</span>
                        </div>
                        <div class="dashboard-stat">
                            <span class="dashboard-stat-label">Cancelled Units</span>
                            <span class="dashboard-stat-value">${cancelledUnits.toFixed(1)}</span>
                        </div>
                    </div>
                    <div class="dashboard-attendance">
                        <span class="dashboard-attendance-label">Attendance</span>
                        <span class="dashboard-attendance-value">${attendancePercent.toFixed(1)}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }
};

// Global Summary Manager
const GlobalSummaryManager = {
    updateSummary: function() {
        const subjects = DataManager.getSubjects();
        const attendance = DataManager.getAttendance();

        const totalSubjects = subjects.length;
        const totalUnits = attendance.reduce((sum, a) => sum + a.totalUnits, 0);
        const attendedUnits = attendance.reduce((sum, a) => sum + a.attendedUnits, 0);
        const overallAttendance = totalUnits > 0 ? (attendedUnits / totalUnits) * 100 : 0;

        document.getElementById('total-subjects').textContent = totalSubjects;
        document.getElementById('total-units').textContent = totalUnits.toFixed(1);
        document.getElementById('attended-units').textContent = attendedUnits.toFixed(1);
        document.getElementById('overall-attendance').textContent = overallAttendance.toFixed(1) + '%';
    }
};

// Reports Manager
const ReportsManager = {
    init: function() {
        this.updateSubjectDropdown();
        this.setupEventListeners();
    },

    setupEventListeners: function() {
        document.getElementById('export-csv-btn').addEventListener('click', () => {
            this.exportCSV();
        });
    },

    updateSubjectDropdown: function() {
        const select = document.getElementById('report-subject-select');
        const subjects = DataManager.getSubjects();
        select.innerHTML = '<option value="">Select Subject (or leave empty for all)</option>' +
            subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    },

    filterAttendanceData: function(subjectId, startDate, endDate) {
        const attendance = DataManager.getAttendance();
        const subjects = DataManager.getSubjects();
        const subjectMap = {};
        subjects.forEach(s => subjectMap[s.id] = s);

        let filtered = attendance;

        if (subjectId) {
            filtered = filtered.filter(a => a.subjectId === subjectId);
        }

        if (startDate) {
            filtered = filtered.filter(a => a.date >= startDate);
        }

        if (endDate) {
            filtered = filtered.filter(a => a.date <= endDate);
        }

        // Sort by date
        filtered.sort((a, b) => a.date.localeCompare(b.date));

        return filtered.map(entry => ({
            date: entry.date,
            subject: subjectMap[entry.subjectId] ? subjectMap[entry.subjectId].name : 'Unknown',
            hours: entry.hours,
            type: entry.isExtra ? 'Extra' : 'Regular',
            status: entry.status.charAt(0).toUpperCase() + entry.status.slice(1)
        }));
    },

    generateCSV: function(data) {
        const headers = ['Date', 'Subject', 'Hours', 'Type', 'Status'];
        const csvContent = [
            headers.join(','),
            ...data.map(row => [
                row.date,
                `"${row.subject}"`,
                row.hours,
                row.type,
                row.status
            ].join(','))
        ].join('\n');

        return csvContent;
    },

    downloadCSV: function(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    exportCSV: function() {
        const subjectId = document.getElementById('report-subject-select').value;
        const startDate = document.getElementById('report-start-date').value;
        const endDate = document.getElementById('report-end-date').value;

        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }

        if (startDate > endDate) {
            alert('Start date cannot be after end date');
            return;
        }

        const filteredData = this.filterAttendanceData(subjectId, startDate, endDate);

        if (filteredData.length === 0) {
            alert('No attendance data found for the selected criteria');
            return;
        }

        const csvContent = this.generateCSV(filteredData);
        const subjectName = subjectId ? DataManager.getSubjects().find(s => s.id === subjectId)?.name || 'Unknown' : 'All_Subjects';
        const filename = `attendance_report_${subjectName}_${startDate}_to_${endDate}.csv`;

        this.downloadCSV(csvContent, filename);
        alert(`CSV exported successfully as ${filename}`);
    }
};

// Modal Manager
const ModalManager = {
    show: function(message, onConfirm) {
        const modal = document.getElementById('confirm-modal');
        const messageEl = document.getElementById('modal-message');
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');

        messageEl.textContent = message;
        modal.classList.add('active');

        const closeModal = () => {
            modal.classList.remove('active');
        };

        confirmBtn.onclick = () => {
            onConfirm();
            closeModal();
        };

        cancelBtn.onclick = closeModal;

        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
    }
};

// Page Navigation Manager
const PageNavigationManager = {
    init: function() {
        this.setupNavigation();
    },

    setupNavigation: function() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetPage = btn.getAttribute('data-page');
                this.showPage(targetPage);
            });
        });
    },

    showPage: function(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`page-${pageId}`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Activate corresponding nav button
        const activeBtn = document.querySelector(`[data-page="${pageId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Update dashboard and summary when returning to home
        if (pageId === 'home') {
            DashboardManager.updateDashboard();
            GlobalSummaryManager.updateSummary();
        }

        // Update attendance history when viewing mark attendance page
        if (pageId === 'mark-attendance') {
            AttendanceManager.renderAttendanceHistory();
        }

        // Initialize reports page
        if (pageId === 'reports') {
            ReportsManager.init();
        }
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    PageNavigationManager.init();
    SubjectManager.init();
    ScheduleManager.init();
    AttendanceManager.init();
    DashboardManager.updateDashboard();
    GlobalSummaryManager.updateSummary();
});

