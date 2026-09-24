/* App Controller - UI Logic, Events, and Role Views */
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

let currentRole = 'student';

function initApp() {
    setupRoleSwitcher();
    setupNavigation();
    setupSearchAndFilters();
    setupStudentForms();
    setupAdminForms();
    setupInstructorForms();
    renderCurrentRoleView();
}

/* Modern Role Switching Handlers */
window.toggleRoleDropdown = function (e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('roleDropdown');
    if (dropdown) {
        dropdown.classList.toggle('open');
    }
};

window.selectRole = function (role) {
    currentRole = role;

    // Update Dropdown UI Button Label & Icon
    const labelElem = document.getElementById('selectedRoleLabel');
    const iconElem = document.getElementById('roleBtnIcon');

    if (role === 'student') {
        if (labelElem) labelElem.textContent = 'Student Portal';
        if (iconElem) iconElem.className = 'fas fa-user-graduate role-btn-icon';
    } else if (role === 'instructor') {
        if (labelElem) labelElem.textContent = 'Instructor Portal';
        if (iconElem) iconElem.className = 'fas fa-chalkboard-teacher role-btn-icon';
    } else if (role === 'admin') {
        if (labelElem) labelElem.textContent = 'System Admin';
        if (iconElem) iconElem.className = 'fas fa-user-shield role-btn-icon';
    }

    // Update active class in dropdown items
    const items = document.querySelectorAll('#roleDropdownMenu .dropdown-item');
    items.forEach(item => {
        if (item.getAttribute('data-value') === role) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Close dropdown menu
    const dropdown = document.getElementById('roleDropdown');
    if (dropdown) dropdown.classList.remove('open');

    updateHeaderUserProfile();
    renderCurrentRoleView();
    showToast(`Switched view to ${role.toUpperCase()} role`, 'info');
};

function setupRoleSwitcher() {
    // Close role dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('roleDropdown');
        if (dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
}

/* Helper to sync Header Profile Badge */
function updateHeaderUserProfile() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userRoleLabel = document.getElementById('userRoleLabel');
    const headerLogoutBtn = document.getElementById('headerLogoutBtn');

    if (!userAvatar || !userName || !userRoleLabel) return;

    if (currentRole === 'student') {
        const activeStudent = JSON.parse(localStorage.getItem('active_student_session') || 'null');
        if (activeStudent) {
            const initials = activeStudent.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            userAvatar.textContent = initials || 'ST';
            userName.textContent = activeStudent.name;
            userRoleLabel.textContent = `Student ID: ${activeStudent.studentId || '2024-1-60-042'}`;
            if (headerLogoutBtn) headerLogoutBtn.style.display = 'inline-flex';
        } else {
            userAvatar.textContent = 'ST';
            userName.textContent = 'Guest Student';
            userRoleLabel.textContent = 'Please Sign In';
            if (headerLogoutBtn) headerLogoutBtn.style.display = 'none';
        }
    } else if (currentRole === 'instructor') {
        const activeInstructor = JSON.parse(localStorage.getItem('active_instructor_session') || 'null');
        if (activeInstructor) {
            const initials = activeInstructor.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            userAvatar.textContent = initials || 'SJ';
            userName.textContent = activeInstructor.name;
            userRoleLabel.textContent = `Dept of ${activeInstructor.dept || 'CSE'}`;
            if (headerLogoutBtn) headerLogoutBtn.style.display = 'inline-flex';
        } else {
            userAvatar.textContent = 'SJ';
            userName.textContent = 'Faculty Guest';
            userRoleLabel.textContent = 'Please Sign In';
            if (headerLogoutBtn) headerLogoutBtn.style.display = 'none';
        }
    } else if (currentRole === 'admin') {
        const activeAdmin = JSON.parse(localStorage.getItem('active_admin_session') || 'null');
        if (activeAdmin) {
            userAvatar.textContent = 'SA';
            userName.textContent = activeAdmin.name;
            userRoleLabel.textContent = activeAdmin.role || 'Office of Registrar';
            if (headerLogoutBtn) headerLogoutBtn.style.display = 'inline-flex';
        } else {
            userAvatar.textContent = 'SA';
            userName.textContent = 'Admin Guest';
            userRoleLabel.textContent = 'Please Sign In';
            if (headerLogoutBtn) headerLogoutBtn.style.display = 'none';
        }
    }
}

/* Header Logout Handler */
window.handleHeaderLogout = function () {
    if (currentRole === 'student') {
        window.handleStudentLogout();
    } else if (currentRole === 'instructor') {
        window.handleInstructorLogout();
    } else if (currentRole === 'admin') {
        window.handleAdminLogout();
    }
};

/* Sidebar Navigation Handler */
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = item.getAttribute('data-view');

            const activeStudent = JSON.parse(localStorage.getItem('active_student_session') || 'null');
            if (currentRole === 'student' && !activeStudent) {
                showToast('Please log in to access student services.', 'warning');
                return;
            }

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
    const sidebar = document.querySelector('.sidebar');

    // Hide sidebar and nav sections by default
    studentNav.style.display = 'none';
    instructorNav.style.display = 'none';
    adminNav.style.display = 'none';
    if (sidebar) sidebar.style.display = 'none';

    updateHeaderUserProfile();

    // Show appropriate default section
    const views = document.querySelectorAll('.view-section');
    views.forEach(v => v.classList.remove('active'));

    if (currentRole === 'student') {
        const activeStudent = JSON.parse(localStorage.getItem('active_student_session') || 'null');
        if (activeStudent) {
            studentNav.style.display = 'block';
            if (sidebar) sidebar.style.display = 'flex';

            const authSection = document.getElementById('studentAuthContainer');
            if (authSection) authSection.classList.remove('active');
            document.getElementById('viewStudentCatalog').classList.add('active');
            renderStudentCreditTracker();
            renderStudentCatalog();
            renderEnrolledSchedule();
        } else {
            if (sidebar) sidebar.style.display = 'none';
            studentNav.style.display = 'none';
            const authSection = document.getElementById('studentAuthContainer');
            if (authSection) authSection.classList.add('active');
        }
    } else if (currentRole === 'instructor') {
        const activeInstructor = JSON.parse(localStorage.getItem('active_instructor_session') || 'null');
        if (activeInstructor) {
            instructorNav.style.display = 'block';
            if (sidebar) sidebar.style.display = 'flex';
            document.getElementById('viewInstructorPortal').classList.add('active');
            renderInstructorRoster();
        } else {
            if (sidebar) sidebar.style.display = 'none';
            instructorNav.style.display = 'none';
            document.getElementById('viewInstructorPortal').classList.add('active');
            renderInstructorRoster();
        }
    } else if (currentRole === 'admin') {
        const activeAdmin = JSON.parse(localStorage.getItem('active_admin_session') || 'null');
        if (activeAdmin) {
            adminNav.style.display = 'block';
            if (sidebar) sidebar.style.display = 'flex';
            document.getElementById('viewAdminPortal').classList.add('active');
            renderAdminCourseTable();
        } else {
            if (sidebar) sidebar.style.display = 'none';
            adminNav.style.display = 'none';
            document.getElementById('viewAdminPortal').classList.add('active');
            renderAdminCourseTable();
        }
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

/* Student Authentication Tab Switcher */
window.switchStudentAuthTab = function (tab) {
    const loginTab = document.getElementById('tabStudentLogin');
    const regTab = document.getElementById('tabStudentRegister');
    const loginForm = document.getElementById('studentLoginForm');
    const regForm = document.getElementById('studentRegisterForm');

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

/* Handle Student Login */
window.handleStudentLogin = function (e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const email = document.getElementById('studentEmail')?.value?.trim();
    const pass = document.getElementById('studentPass')?.value;

    const storedStudents = JSON.parse(localStorage.getItem('registered_students') || '[]');
    const isDefaultStudent = (email === 'alex.rivera@univ.edu' && pass === 'student123');
    const foundStudent = storedStudents.find(s => s.email === email && s.pass === pass);

    if (isDefaultStudent || foundStudent) {
        const studentData = foundStudent || {
            name: 'Alex Rivera',
            email: 'alex.rivera@univ.edu',
            studentId: '2024-1-60-042',
            dept: 'CSE'
        };
        localStorage.setItem('active_student_session', JSON.stringify(studentData));
        showToast(`Welcome back, ${studentData.name}! Student Portal unlocked.`, 'success');
        renderCurrentRoleView();
    } else {
        showToast('Invalid student credentials! Demo login: alex.rivera@univ.edu / student123', 'error');
    }
    return false;
};

/* Handle Student Registration */
window.handleStudentRegister = function (e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const name = document.getElementById('regStudentName')?.value?.trim();
    const email = document.getElementById('regStudentEmail')?.value?.trim();
    const studentId = document.getElementById('regStudentId')?.value?.trim();
    const dept = document.getElementById('regStudentDept')?.value;
    const pass = document.getElementById('regStudentPass')?.value;

    const storedStudents = JSON.parse(localStorage.getItem('registered_students') || '[]');
    if (storedStudents.some(s => s.email === email) || email === 'alex.rivera@univ.edu') {
        showToast('A student account with this email already exists!', 'error');
        return false;
    }

    const newStudent = { name, email, studentId, dept, pass };
    storedStudents.push(newStudent);
    localStorage.setItem('registered_students', JSON.stringify(storedStudents));
    localStorage.setItem('active_student_session', JSON.stringify(newStudent));

    showToast(`Student account for ${name} registered successfully!`, 'success');
    renderCurrentRoleView();
    return false;
};

/* Handle Student Logout */
window.handleStudentLogout = function () {
    localStorage.removeItem('active_student_session');
    showToast('Logged out of Student Portal.', 'info');
    renderCurrentRoleView();
};

/* Student Form Listeners */
function setupStudentForms() {
    const loginForm = document.getElementById('studentLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', window.handleStudentLogin);
    }

    const registerForm = document.getElementById('studentRegisterForm');
    if (registerForm) {
        registerForm.addEventListener('submit', window.handleStudentRegister);
    }
}

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
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
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
    return false;
};

/* Handle Admin Registration */
window.handleAdminRegister = function (e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const name = document.getElementById('regAdminName')?.value;
    const email = document.getElementById('regAdminEmail')?.value;
    const role = document.getElementById('regAdminRole')?.value;
    const pass = document.getElementById('regAdminPass')?.value;

    const storedAdmins = JSON.parse(localStorage.getItem('registered_admins') || '[]');
    if (storedAdmins.some(a => a.email === email) || email === 'admin@univ.edu') {
        showToast('An admin account with this email already exists!', 'error');
        return false;
    }

    const newAdmin = { name, email, role, pass };
    storedAdmins.push(newAdmin);
    localStorage.setItem('registered_admins', JSON.stringify(storedAdmins));
    localStorage.setItem('active_admin_session', JSON.stringify(newAdmin));

    showToast(`Admin account for ${name} registered successfully!`, 'success');
    renderAdminCourseTable();
    return false;
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

/* Instructor Authentication Tab Switcher */
window.switchInstructorAuthTab = function (tab) {
    const loginTab = document.getElementById('tabInstructorLogin');
    const regTab = document.getElementById('tabInstructorRegister');
    const loginForm = document.getElementById('instructorLoginForm');
    const regForm = document.getElementById('instructorRegisterForm');

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

/* Handle Instructor Login */
window.handleInstructorLogin = function (e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const email = document.getElementById('instructorEmail')?.value;
    const pass = document.getElementById('instructorPass')?.value;

    const storedInstructors = JSON.parse(localStorage.getItem('registered_instructors') || '[]');
    const isDefaultInstructor = (email === 'instructor@univ.edu' && pass === 'faculty123');
    const foundInstructor = storedInstructors.find(i => i.email === email && i.pass === pass);

    if (isDefaultInstructor || foundInstructor) {
        const instData = foundInstructor || { name: 'Dr. Sarah Jenkins', email: 'instructor@univ.edu', dept: 'CSE' };
        localStorage.setItem('active_instructor_session', JSON.stringify(instData));
        showToast(`Welcome back, ${instData.name}! Faculty Portal unlocked.`, 'success');
        renderInstructorRoster();
    } else {
        showToast('Invalid faculty credentials! Demo login: instructor@univ.edu / faculty123', 'error');
    }
    return false;
};

/* Handle Instructor Registration */
window.handleInstructorRegister = function (e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const name = document.getElementById('regInstructorName')?.value;
    const email = document.getElementById('regInstructorEmail')?.value;
    const dept = document.getElementById('regInstructorDept')?.value;
    const pass = document.getElementById('regInstructorPass')?.value;

    const storedInstructors = JSON.parse(localStorage.getItem('registered_instructors') || '[]');
    if (storedInstructors.some(i => i.email === email) || email === 'instructor@univ.edu') {
        showToast('A faculty account with this email already exists!', 'error');
        return false;
    }

    const newInstructor = { name, email, dept, pass };
    storedInstructors.push(newInstructor);
    localStorage.setItem('registered_instructors', JSON.stringify(storedInstructors));
    localStorage.setItem('active_instructor_session', JSON.stringify(newInstructor));

    showToast(`Faculty account for ${name} registered successfully!`, 'success');
    renderInstructorRoster();
    return false;
};

/* Handle Instructor Logout */
window.handleInstructorLogout = function () {
    localStorage.removeItem('active_instructor_session');
    showToast('Logged out of Faculty Portal.', 'info');
    renderInstructorRoster();
};

/* Instructor Form Listeners */
function setupInstructorForms() {
    const loginForm = document.getElementById('instructorLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', window.handleInstructorLogin);
    }

    const registerForm = document.getElementById('instructorRegisterForm');
    if (registerForm) {
        registerForm.addEventListener('submit', window.handleInstructorRegister);
    }
}

/* Instructor Portal view */
function renderInstructorRoster() {
    const authContainer = document.getElementById('instructorAuthContainer');
    const dashboardContent = document.getElementById('instructorDashboardContent');
    const statusLabel = document.getElementById('instructorStatusLabel');
    const activeInstructor = JSON.parse(localStorage.getItem('active_instructor_session') || 'null');

    if (activeInstructor) {
        if (authContainer) authContainer.style.display = 'none';
        if (dashboardContent) dashboardContent.style.display = 'block';
        if (statusLabel) statusLabel.textContent = `Authenticated as: ${activeInstructor.name} (Department of ${activeInstructor.dept || 'CSE'})`;
    } else {
        if (authContainer) authContainer.style.display = 'block';
        if (dashboardContent) dashboardContent.style.display = 'none';
        return;
    }

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
