/* App Controller - UI Logic, Events, and Role Views */
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

let currentRole = 'student';

function initApp() {
    setupRoleSwitcher();
    setupNavigation();
    setupSearchAndFilters();
    setupAdminForms();
    renderCurrentRoleView();
}

/* Role Switching Handler */
function setupRoleSwitcher() {
    const roleSelect = document.getElementById('roleSelect');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userRoleLabel = document.getElementById('userRoleLabel');

    if (roleSelect) {
        roleSelect.addEventListener('change', (e) => {
            currentRole = e.target.value;
            const student = window.courseStore.getStudent();

            if (currentRole === 'student') {
                userAvatar.textContent = 'AR';
                userName.textContent = student.name;
                userRoleLabel.textContent = 'Student ID: 2024-1-60-042';
            } else if (currentRole === 'instructor') {
                userAvatar.textContent = 'SJ';
                userName.textContent = 'Dr. Sarah Jenkins';
                userRoleLabel.textContent = 'Department of CSE';
            } else if (currentRole === 'admin') {
                userAvatar.textContent = 'SA';
                userName.textContent = 'System Admin';
                userRoleLabel.textContent = 'Office of the Registrar';
            }

            renderCurrentRoleView();
            showToast(`Switched view to ${currentRole.toUpperCase()} role`, 'info');
        });
    }
}

/* Sidebar Navigation Handler */
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = item.getAttribute('data-view');

            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            const views = document.querySelectorAll('.view-section');
            views.forEach(v => v.classList.remove('active'));

            const targetSection = document.getElementById(targetView);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

/* Filter & Search setup */
function setupSearchAndFilters() {
    const searchInput = document.getElementById('courseSearchInput');
    const deptFilter = document.getElementById('deptFilterSelect');

    if (searchInput) searchInput.addEventListener('input', renderStudentCatalog);
    if (deptFilter) deptFilter.addEventListener('change', renderStudentCatalog);
}

/* Main Render Controller */
function renderCurrentRoleView() {
    const studentNav = document.getElementById('studentNavSection');
    const instructorNav = document.getElementById('instructorNavSection');
    const adminNav = document.getElementById('adminNavSection');

    // Reset visibility of role nav items
    studentNav.style.display = currentRole === 'student' ? 'block' : 'none';
    instructorNav.style.display = currentRole === 'instructor' ? 'block' : 'none';
    adminNav.style.display = currentRole === 'admin' ? 'block' : 'none';

    // Show appropriate default section
    const views = document.querySelectorAll('.view-section');
    views.forEach(v => v.classList.remove('active'));

    if (currentRole === 'student') {
        document.getElementById('viewStudentCatalog').classList.add('active');
        renderStudentCreditTracker();
        renderStudentCatalog();
        renderEnrolledSchedule();
    } else if (currentRole === 'instructor') {
        document.getElementById('viewInstructorPortal').classList.add('active');
        renderInstructorRoster();
    } else if (currentRole === 'admin') {
        document.getElementById('viewAdminPortal').classList.add('active');
        renderAdminCourseTable();
    }
}

/* Student: Credit Tracker Bar */
function renderStudentCreditTracker() {
    const student = window.courseStore.getStudent();
    const enrolledCredits = window.courseStore.getTotalEnrolledCredits();
    const maxCredits = student.maxCreditLimit;
    const pct = Math.min(100, Math.round((enrolledCredits / maxCredits) * 100));

    const totalNumEl = document.getElementById('totalCreditsNum');
    const progressBar = document.getElementById('creditProgressBar');
    const progressText = document.getElementById('creditProgressText');

    if (totalNumEl) totalNumEl.textContent = enrolledCredits;
    if (progressText) progressText.textContent = `${enrolledCredits} / ${maxCredits} Credits (${pct}%)`;

    if (progressBar) {
        progressBar.style.width = `${pct}%`;
        progressBar.className = 'progress-fill';
        if (pct >= 100) {
            progressBar.classList.add('limit-exceeded');
        } else if (pct >= 75) {
            progressBar.classList.add('limit-near');
        }
    }
}

/* Student: Render Course Catalog Cards */
function renderStudentCatalog() {
    renderDashboardStats();
    const container = document.getElementById('courseCatalogGrid');
    if (!container) return;

    const searchTerm = (document.getElementById('courseSearchInput')?.value || '').toLowerCase();
    const deptFilter = document.getElementById('deptFilterSelect')?.value || 'ALL';

    const courses = window.courseStore.getCourses();
    const student = window.courseStore.getStudent();
    const enrolledIds = student.registeredCourseIds;

    const filtered = courses.filter(c => {
        const matchesSearch = c.code.toLowerCase().includes(searchTerm) || c.title.toLowerCase().includes(searchTerm) || c.instructor.toLowerCase().includes(searchTerm);
        const matchesDept = deptFilter === 'ALL' || c.dept === deptFilter;
        return matchesSearch && matchesDept;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; color: var(--c-soft-sage);"></i>
                <p>No courses found matching your criteria.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(c => {
        const isEnrolled = enrolledIds.includes(c.id);
        const prereqCheck = window.RegistrationValidator.checkPrerequisite(c, student);
        const seatsLeft = c.capacity - c.enrolledCount;
        const isFull = seatsLeft <= 0;

        return `
            <div class="course-card">
                <div>
                    <div class="card-top">
                        <span class="course-code-badge">${c.code}</span>
                        <span class="credits-badge">${c.credits} Credits</span>
                    </div>
                    <h3 class="course-title">${c.title}</h3>
                    
                    <div class="course-meta-list" style="margin-top: 1rem;">
                        <div class="meta-item"><i class="fas fa-building"></i> Dept: <strong>${c.dept}</strong></div>
                        <div class="meta-item"><i class="fas fa-user-tie"></i> Faculty: ${c.instructor}</div>
                        <div class="meta-item"><i class="far fa-clock"></i> ${c.schedule} (${c.room})</div>
                        <div class="meta-item"><i class="fas fa-users"></i> Seats Available: <strong>${seatsLeft} / ${c.capacity}</strong></div>
                        <div class="meta-item" style="margin-top: 0.5rem;">
                            <span class="prereq-pill ${prereqCheck.valid ? 'prereq-met' : 'prereq-missing'}">
                                <i class="fas ${prereqCheck.valid ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                                Prerequisite: ${c.prereq}
                            </span>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button class="btn btn-outline btn-sm" style="flex: 1;" onclick="openCourseModal('${c.id}')">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                    ${isEnrolled ? `
                        <button class="btn btn-danger btn-sm" style="flex: 1;" onclick="handleDropCourse('${c.id}')">
                            <i class="fas fa-minus-circle"></i> Drop
                        </button>
                    ` : `
                        <button class="btn btn-primary btn-sm" style="flex: 1;" ${isFull ? 'disabled' : ''} onclick="handleRegisterCourse('${c.id}')">
                            <i class="fas fa-plus-circle"></i> ${isFull ? 'Full' : 'Register'}
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

/* Render Dashboard Banner Stats */
function renderDashboardStats() {
    const courses = window.courseStore.getCourses();
    const enrolled = window.courseStore.getStudentEnrolledCourses();

    const statOffered = document.getElementById('statTotalOffered');
    const statEnrolled = document.getElementById('statMyEnrolledCount');

    if (statOffered) statOffered.textContent = courses.length;
    if (statEnrolled) statEnrolled.textContent = enrolled.length;
}

/* Student: Enrolled Schedule Timetable & Visual Matrix View */
function renderEnrolledSchedule() {
    const tbody = document.getElementById('enrolledScheduleTableBody');
    const enrolledCourses = window.courseStore.getStudentEnrolledCourses();

    if (tbody) {
        if (enrolledCourses.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-secondary); padding: 2rem;">No courses registered yet. Browse the catalog to enroll!</td></tr>`;
        } else {
            tbody.innerHTML = enrolledCourses.map(c => `
                <tr>
                    <td><strong style="color: var(--c-soft-sage);">${c.code}</strong></td>
                    <td>${c.title}</td>
                    <td><span class="credits-badge">${c.credits} Credits</span></td>
                    <td>${c.schedule}</td>
                    <td>${c.room}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="handleDropCourse('${c.id}')">
                            <i class="fas fa-trash-alt"></i> Drop
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    renderVisualTimetableMatrix(enrolledCourses);
}

/* Render Visual Timetable Matrix (Sun - Thu) */
function renderVisualTimetableMatrix(enrolledCourses) {
    const matrixContainer = document.getElementById('visualTimetableMatrix');
    if (!matrixContainer) return;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
    const timeSlots = [
        { label: '08:30 - 10:00', start: '08:30', end: '10:00' },
        { label: '10:00 - 11:30', start: '10:00', end: '11:30' },
        { label: '11:30 - 01:00', start: '11:30', end: '13:00' },
        { label: '02:00 - 03:30', start: '14:00', end: '15:30' }
    ];

    let html = `<div></div>` + days.map(d => `<div class="matrix-header">${d}</div>`).join('');

    timeSlots.forEach(slot => {
        html += `<div class="matrix-time-col">${slot.label}</div>`;
        days.forEach(day => {
            const match = enrolledCourses.find(c => {
                const hasDay = c.days.includes(day);
                const hasTime = (c.startTime >= slot.start && c.startTime < slot.end) || (c.endTime > slot.start && c.endTime <= slot.end);
                return hasDay && hasTime;
            });

            if (match) {
                html += `
                    <div class="matrix-cell has-class">
                        <div class="class-pill-title">${match.code}</div>
                        <div class="class-pill-meta">${match.room}</div>
                    </div>
                `;
            } else {
                html += `<div class="matrix-cell"></div>`;
            }
        });
    });

    matrixContainer.innerHTML = html;
}

/* Course Details Modal Controls */
window.openCourseModal = function (courseId) {
    const courses = window.courseStore.getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const modal = document.getElementById('courseDetailModal');
    const title = document.getElementById('modalCourseTitle');
    const body = document.getElementById('modalCourseBody');

    if (title) title.textContent = `${course.code}: ${course.title}`;

    if (body) {
        body.innerHTML = `
            <div class="course-detail-header">
                <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 0.75rem;">${course.description || 'Comprehensive university degree course.'}</p>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.85rem;">
                    <span><i class="fas fa-building" style="color: var(--c-soft-sage);"></i> Dept: <strong>${course.dept}</strong></span>
                    <span><i class="fas fa-graduation-cap" style="color: var(--c-soft-sage);"></i> Credits: <strong>${course.credits}</strong></span>
                    <span><i class="fas fa-user-tie" style="color: var(--c-soft-sage);"></i> Faculty: <strong>${course.instructor}</strong></span>
                </div>
            </div>

            <div style="margin-bottom: 1.25rem;">
                <h4 style="color: var(--c-soft-sage); font-size: 0.88rem; text-transform: uppercase; margin-bottom: 0.5rem;">Syllabus Topics Covered</h4>
                <ul class="syllabus-list">
                    ${(course.syllabus || ['Core Theoretical Principles', 'Practical Lab Implementations']).map(item => `<li><i class="fas fa-chevron-right"></i> ${item}</li>`).join('')}
                </ul>
            </div>

            <div style="margin-bottom: 1.5rem; background: var(--c-forest-accent); padding: 0.85rem 1rem; border-radius: var(--radius-md); font-size: 0.85rem;">
                <span style="color: var(--c-soft-sage); font-weight: 700;">Assessment Weightage:</span>
                <p style="color: var(--c-light-mint); margin-top: 0.25rem;">${course.assessment || 'Midterm: 30%, Final: 50%, Continuous: 20%'}</p>
            </div>

            <div style="text-align: right;">
                <button class="btn btn-outline" onclick="closeCourseModal()">Close</button>
            </div>
        `;
    }

    if (modal) modal.classList.add('active');
};

window.closeCourseModal = function () {
    const modal = document.getElementById('courseDetailModal');
    if (modal) modal.classList.remove('active');
};


/* Enrollment Event Handler */
window.handleRegisterCourse = function (courseId) {
    const courses = window.courseStore.getCourses();
    const targetCourse = courses.find(c => c.id === courseId);
    const student = window.courseStore.getStudent();
    const currentCredits = window.courseStore.getTotalEnrolledCredits();
    const enrolledCourses = window.courseStore.getStudentEnrolledCourses();

    if (!targetCourse) return;

    // 1. Check Prerequisite
    const prereqResult = window.RegistrationValidator.checkPrerequisite(targetCourse, student);
    if (!prereqResult.valid) {
        showToast(prereqResult.reason, 'error');
        return;
    }

    // 2. Check Credit Limit
    const creditResult = window.RegistrationValidator.checkCreditLimit(targetCourse, currentCredits, student.maxCreditLimit);
    if (!creditResult.valid) {
        showToast(creditResult.reason, 'warning');
        return;
    }

    // 3. Check Schedule Conflict
    const conflictResult = window.RegistrationValidator.checkScheduleConflict(targetCourse, enrolledCourses);
    if (!conflictResult.valid) {
        showToast(conflictResult.reason, 'error');
        return;
    }

    // Process Registration
    const success = window.courseStore.registerCourse(courseId);
    if (success) {
        showToast(`Successfully enrolled in ${targetCourse.code}: ${targetCourse.title}!`, 'success');
        renderStudentCreditTracker();
        renderStudentCatalog();
        renderEnrolledSchedule();
    }
};

/* Drop Course Handler */
window.handleDropCourse = function (courseId) {
    const courses = window.courseStore.getCourses();
    const course = courses.find(c => c.id === courseId);
    if (confirm(`Are you sure you want to drop ${course ? course.code : 'this course'}?`)) {
        window.courseStore.dropCourse(courseId);
        showToast(`Dropped course ${course ? course.code : ''}`, 'warning');
        renderStudentCreditTracker();
        renderStudentCatalog();
        renderEnrolledSchedule();
    }
};

/* Admin Authentication Tab Switcher */
window.switchAdminAuthTab = function (tab) {
    const loginTab = document.getElementById('tabAdminLogin');
    const regTab = document.getElementById('tabAdminRegister');
    const loginForm = document.getElementById('adminLoginForm');
    const regForm = document.getElementById('adminRegisterForm');

    if (tab === 'login') {
        if (loginTab) loginTab.className = 'btn btn-primary btn-sm';
        if (regTab) regTab.className = 'btn btn-outline btn-sm';
        if (loginForm) loginForm.style.display = 'block';
        if (regForm) regForm.style.display = 'none';
    } else {
        if (loginTab) loginTab.className = 'btn btn-outline btn-sm';
        if (regTab) regTab.className = 'btn btn-primary btn-sm';
        if (loginForm) loginForm.style.display = 'none';
        if (regForm) regForm.style.display = 'block';
    }
};

/* Handle Admin Login */
window.handleAdminLogin = function (e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail')?.value;
    const pass = document.getElementById('adminPass')?.value;

    const storedAdmins = JSON.parse(localStorage.getItem('registered_admins') || '[]');
    const isDefaultAdmin = (email === 'admin@univ.edu' && pass === 'admin123');
    const foundAdmin = storedAdmins.find(a => a.email === email && a.pass === pass);

    if (isDefaultAdmin || foundAdmin) {
        const adminData = foundAdmin || { name: 'System Administrator', email: 'admin@univ.edu', role: 'Chief Registrar' };
        localStorage.setItem('active_admin_session', JSON.stringify(adminData));
        showToast(`Welcome back, ${adminData.name}! Admin Portal unlocked.`, 'success');
        renderAdminCourseTable();
    } else {
        showToast('Invalid admin credentials! Demo login: admin@univ.edu / admin123', 'error');
    }
};

/* Handle Admin Registration */
window.handleAdminRegister = function (e) {
    e.preventDefault();
    const name = document.getElementById('regAdminName')?.value;
    const email = document.getElementById('regAdminEmail')?.value;
    const role = document.getElementById('regAdminRole')?.value;
    const pass = document.getElementById('regAdminPass')?.value;

    const storedAdmins = JSON.parse(localStorage.getItem('registered_admins') || '[]');
    if (storedAdmins.some(a => a.email === email) || email === 'admin@univ.edu') {
        showToast('An admin account with this email already exists!', 'error');
        return;
    }

    const newAdmin = { name, email, role, pass };
    storedAdmins.push(newAdmin);
    localStorage.setItem('registered_admins', JSON.stringify(storedAdmins));
    localStorage.setItem('active_admin_session', JSON.stringify(newAdmin));

    showToast(`Admin account for ${name} registered successfully!`, 'success');
    renderAdminCourseTable();
};

/* Handle Admin Logout */
window.handleAdminLogout = function () {
    localStorage.removeItem('active_admin_session');
    showToast('Logged out of System Admin Portal.', 'info');
    renderAdminCourseTable();
};

/* Admin Portal Course List & Form */
function renderAdminCourseTable() {
    const authContainer = document.getElementById('adminAuthContainer');
    const dashboardContent = document.getElementById('adminDashboardContent');
    const statusLabel = document.getElementById('adminStatusLabel');
    const activeAdmin = JSON.parse(localStorage.getItem('active_admin_session') || 'null');

    if (activeAdmin) {
        if (authContainer) authContainer.style.display = 'none';
        if (dashboardContent) dashboardContent.style.display = 'block';
        if (statusLabel) statusLabel.textContent = `Authenticated as: ${activeAdmin.name} (${activeAdmin.role || 'System Administrator'})`;
    } else {
        if (authContainer) authContainer.style.display = 'block';
        if (dashboardContent) dashboardContent.style.display = 'none';
        return;
    }

    const tbody = document.getElementById('adminCourseTableBody');
    if (!tbody) return;

    const courses = window.courseStore.getCourses();

    tbody.innerHTML = courses.map(c => `
        <tr>
            <td><strong>${c.code}</strong></td>
            <td>${c.title}</td>
            <td>${c.dept}</td>
            <td>${c.credits}</td>
            <td>${c.instructor}</td>
            <td>${c.schedule}</td>
            <td>${c.prereq}</td>
            <td>${c.enrolledCount} / ${c.capacity}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="handleAdminDeleteCourse('${c.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function setupAdminForms() {
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', window.handleAdminLogin);
    }

    const registerForm = document.getElementById('adminRegisterForm');
    if (registerForm) {
        registerForm.addEventListener('submit', window.handleAdminRegister);
    }

    const form = document.getElementById('addCourseForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const code = document.getElementById('newCourseCode').value.trim();
            const title = document.getElementById('newCourseTitle').value.trim();
            const dept = document.getElementById('newCourseDept').value;
            const credits = parseInt(document.getElementById('newCourseCredits').value, 10);
            const instructor = document.getElementById('newCourseInstructor').value.trim();
            const daysStr = document.getElementById('newCourseDays').value; // e.g. Mon,Wed
            const startTime = document.getElementById('newCourseStart').value;
            const endTime = document.getElementById('newCourseEnd').value;
            const room = document.getElementById('newCourseRoom').value.trim();
            const prereq = document.getElementById('newCoursePrereq').value.trim() || 'None';
            const capacity = parseInt(document.getElementById('newCourseCapacity').value, 10) || 30;

            const daysArr = daysStr.split(',').map(d => d.trim());
            const schedule = `${daysStr} ${startTime} - ${endTime}`;

            window.courseStore.addCourse({
                code, title, dept, credits, instructor,
                days: daysArr, startTime, endTime, schedule,
                room, prereq, capacity
            });

            form.reset();
            renderAdminCourseTable();
            renderStudentCatalog();
            showToast(`Added new course ${code} to catalog!`, 'success');
        });
    }
}

window.handleAdminDeleteCourse = function (courseId) {
    if (confirm('Are you sure you want to delete this course from the institution catalog?')) {
        window.courseStore.deleteCourse(courseId);
        renderAdminCourseTable();
        renderStudentCatalog();
        showToast('Course removed from system catalog', 'warning');
    }
};

/* Instructor Portal view */
function renderInstructorRoster() {
    const tbody = document.getElementById('instructorRosterTableBody');
    if (!tbody) return;

    // Seed mock roster for Instructor view
    const mockStudents = [
        { id: '2024-1-60-042', name: 'Alex Rivera', dept: 'CSE', grade: 'A', status: 'Enrolled' },
        { id: '2024-1-60-019', name: 'Jordan Hayes', dept: 'CSE', grade: 'A-', status: 'Enrolled' },
        { id: '2024-1-60-088', name: 'Samantha Reed', dept: 'EEE', grade: 'B+', status: 'Enrolled' },
        { id: '2024-1-60-104', name: 'Marcus Brody', dept: 'CSE', grade: 'A', status: 'Enrolled' }
    ];

    tbody.innerHTML = mockStudents.map(s => `
        <tr>
            <td><strong>${s.id}</strong></td>
            <td>${s.name}</td>
            <td>${s.dept}</td>
            <td><span class="prereq-pill prereq-met">${s.status}</span></td>
            <td>
                <select class="filter-select" style="padding: 0.3rem 0.6rem; font-size: 0.82rem;">
                    <option ${s.grade === 'A' ? 'selected' : ''}>A</option>
                    <option ${s.grade === 'A-' ? 'selected' : ''}>A-</option>
                    <option ${s.grade === 'B+' ? 'selected' : ''}>B+</option>
                    <option ${s.grade === 'B' ? 'selected' : ''}>B</option>
                </select>
            </td>
        </tr>
    `).join('');
}

/* Toast Notifications Helper */
function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    if (type === 'error') icon = 'fa-times-circle';

    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
