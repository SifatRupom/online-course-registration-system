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

                <div style="margin-top: 1rem;">
                    ${isEnrolled ? `
                        <button class="btn btn-danger btn-sm" style="width: 100%;" onclick="handleDropCourse('${c.id}')">
                            <i class="fas fa-minus-circle"></i> Drop Course
                        </button>
                    ` : `
                        <button class="btn btn-primary" style="width: 100%;" ${isFull ? 'disabled' : ''} onclick="handleRegisterCourse('${c.id}')">
                            <i class="fas fa-plus-circle"></i> ${isFull ? 'Course Full' : 'Register Now'}
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

/* Student: Enrolled Schedule Timetable View */
function renderEnrolledSchedule() {
    const tbody = document.getElementById('enrolledScheduleTableBody');
    if (!tbody) return;

    const enrolledCourses = window.courseStore.getStudentEnrolledCourses();

    if (enrolledCourses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-secondary); padding: 2rem;">No courses registered yet. Browse the catalog to enroll!</td></tr>`;
        return;
    }

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

/* Admin Portal Course List & Form */
function renderAdminCourseTable() {
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
