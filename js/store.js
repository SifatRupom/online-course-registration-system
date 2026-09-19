/* Store Module - LocalStorage State Management & Seed Data */
const STORAGE_KEY = 'sdp_course_registration_v1';

const initialCourses = [
    {
        id: 'c1',
        code: 'CSE101',
        title: 'Structured Programming Language',
        dept: 'CSE',
        credits: 3,
        instructor: 'Dr. Sarah Jenkins',
        schedule: 'Mon/Wed 09:00 AM - 10:30 AM',
        days: ['Mon', 'Wed'],
        startTime: '09:00',
        endTime: '10:30',
        room: 'Lab 302',
        prereq: 'None',
        capacity: 30,
        enrolledCount: 18,
        description: 'Fundamentals of structured C programming, control flow structures, functions, pointers, array manipulation, memory allocation, and file I/O operations.',
        syllabus: ['C Fundamentals & Variables', 'Control Structures & Loops', 'Functions & Recursion', 'Pointers & Dynamic Memory', 'File Handling & Structs'],
        assessment: 'Midterm: 30%, Final Exam: 40%, Lab Work: 20%, Quizzes: 10%'
    },
    {
        id: 'c2',
        code: 'CSE210',
        title: 'Data Structures & Algorithms',
        dept: 'CSE',
        credits: 3,
        instructor: 'Dr. Sarah Jenkins',
        schedule: 'Mon/Wed 10:30 AM - 12:00 PM',
        days: ['Mon', 'Wed'],
        startTime: '10:30',
        endTime: '12:00',
        room: 'Auditorium A',
        prereq: 'CSE101',
        capacity: 25,
        enrolledCount: 12,
        description: 'Comprehensive analysis of linear and non-linear data structures including stacks, queues, linked lists, binary trees, heaps, graph algorithms, and time complexity estimation.',
        syllabus: ['Asymptotic Notation (Big O)', 'Linked Lists & Stacks/Queues', 'Trees & BST Traversal', 'Graph Traversal (DFS/BFS)', 'Sorting & Searching Algorithms'],
        assessment: 'Assignments: 20%, Midterm: 30%, Final Exam: 40%, Lab: 10%'
    },
    {
        id: 'c3',
        code: 'CSE301',
        title: 'Software Engineering & ISD',
        dept: 'CSE',
        credits: 4,
        instructor: 'Prof. Michael Vance',
        schedule: 'Tue/Thu 10:00 AM - 12:00 PM',
        days: ['Tue', 'Thu'],
        startTime: '10:00',
        endTime: '12:00',
        room: 'Room 405',
        prereq: 'CSE210',
        capacity: 35,
        enrolledCount: 22,
        description: 'Software development lifecycle, Agile methodologies, requirement engineering (SRS), UML system modeling, architectural design patterns, software testing, and Git version control.',
        syllabus: ['Agile & Scrum Framework', 'Requirement Analysis (SRS)', 'UML Class & Sequence Diagrams', 'Design Patterns (MVC/Singleton)', 'Git Workflow & Unit Testing'],
        assessment: 'Project Presentation: 30%, Midterm: 20%, Final: 30%, Lab Tasks: 20%'
    },
    {
        id: 'c4',
        code: 'EEE101',
        title: 'Electrical Circuits & Analysis',
        dept: 'EEE',
        credits: 3,
        instructor: 'Dr. Robert Vance',
        schedule: 'Mon/Wed 09:00 AM - 10:30 AM',
        days: ['Mon', 'Wed'],
        startTime: '09:00',
        endTime: '10:30',
        room: 'Lab E1',
        prereq: 'None',
        capacity: 40,
        enrolledCount: 30,
        description: 'Basic circuit concepts, Ohm’s Law, Kirchhoff’s laws, mesh and nodal analysis, Thevenin/Norton equivalents, RLC circuits, and AC power analysis.',
        syllabus: ['DC Circuit Laws & Mesh Analysis', 'Network Theorems (Thevenin/Norton)', 'Capacitors & Inductors', 'Sinusoidal Steady State', 'AC Power & Resonance'],
        assessment: 'Lab Experiments: 25%, Quizzes: 15%, Midterm: 25%, Final Exam: 35%'
    },
    {
        id: 'c5',
        code: 'MAT101',
        title: 'Differential & Integral Calculus',
        dept: 'MATH',
        credits: 3,
        instructor: 'Prof. Elena Rostova',
        schedule: 'Sun/Tue 08:30 AM - 10:00 AM',
        days: ['Sun', 'Tue'],
        startTime: '08:30',
        endTime: '10:00',
        room: 'Hall 101',
        prereq: 'None',
        capacity: 50,
        enrolledCount: 41,
        description: 'Functions, limits, continuity, derivatives, optimization problems, definite/indefinite integrals, techniques of integration, and applications in computer science.',
        syllabus: ['Limits & Continuity', 'Rules of Differentiation', 'Applications of Derivatives', 'Definite & Indefinite Integrals', 'Series & Sequences'],
        assessment: 'Midterm 1: 25%, Midterm 2: 25%, Final Exam: 40%, Homework: 10%'
    },
    {
        id: 'c6',
        code: 'BBA202',
        title: 'Principles of Financial Accounting',
        dept: 'BBA',
        credits: 3,
        instructor: 'Dr. Karen White',
        schedule: 'Sun/Tue 11:30 AM - 01:00 PM',
        days: ['Sun', 'Tue'],
        startTime: '11:30',
        endTime: '13:00',
        room: 'Room 201',
        prereq: 'None',
        capacity: 30,
        enrolledCount: 15,
        description: 'Introduction to financial reporting, accounting cycle, journal entries, ledger accounts, balance sheets, income statements, and cash flow analysis.',
        syllabus: ['Accounting Equation & Double Entry', 'Journalizing & Ledger Posting', 'Trial Balance & Adjusting Entries', 'Financial Statements Analysis', 'Internal Controls & Inventory'],
        assessment: 'Quizzes & Cases: 20%, Midterm: 30%, Final Project: 15%, Final Exam: 35%'
    }
];

const initialUser = {
    student: {
        id: 'STU-2024-001',
        name: 'Alex Rivera',
        email: 'alex.rivera@univ.edu',
        completedCourses: ['MAT101', 'CSE101'], // Completed prerequisites
        registeredCourseIds: ['c1'], // Currently enrolled in CSE101 (3 credits)
        maxCreditLimit: 15
    },
    instructor: {
        id: 'INS-102',
        name: 'Dr. Sarah Jenkins',
        dept: 'CSE',
        assignedCourseCodes: ['CSE101', 'CSE210']
    },
    admin: {
        id: 'ADM-001',
        name: 'System Administrator',
        role: 'Admin'
    }
};

class CourseStore {
    constructor() {
        this.loadState();
    }

    loadState() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                this.courses = parsed.courses || initialCourses;
                this.user = parsed.user || initialUser;
            } catch (e) {
                this.resetState();
            }
        } else {
            this.resetState();
        }
    }

    saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            courses: this.courses,
            user: this.user
        }));
    }

    resetState() {
        this.courses = JSON.parse(JSON.stringify(initialCourses));
        this.user = JSON.parse(JSON.stringify(initialUser));
        this.saveState();
    }

    getCourses() {
        return this.courses;
    }

    getStudent() {
        return this.user.student;
    }

    getStudentEnrolledCourses() {
        return this.courses.filter(c => this.user.student.registeredCourseIds.includes(c.id));
    }

    getTotalEnrolledCredits() {
        return this.getStudentEnrolledCourses().reduce((sum, c) => sum + c.credits, 0);
    }

    registerCourse(courseId) {
        if (!this.user.student.registeredCourseIds.includes(courseId)) {
            this.user.student.registeredCourseIds.push(courseId);
            const course = this.courses.find(c => c.id === courseId);
            if (course) {
                course.enrolledCount += 1;
            }
            this.saveState();
            return true;
        }
        return false;
    }

    dropCourse(courseId) {
        const index = this.user.student.registeredCourseIds.indexOf(courseId);
        if (index > -1) {
            this.user.student.registeredCourseIds.splice(index, 1);
            const course = this.courses.find(c => c.id === courseId);
            if (course && course.enrolledCount > 0) {
                course.enrolledCount -= 1;
            }
            this.saveState();
            return true;
        }
        return false;
    }

    addCourse(courseData) {
        const newCourse = {
            id: 'c_' + Date.now(),
            ...courseData,
            enrolledCount: 0
        };
        this.courses.push(newCourse);
        this.saveState();
        return newCourse;
    }

    deleteCourse(courseId) {
        this.courses = this.courses.filter(c => c.id !== courseId);
        this.user.student.registeredCourseIds = this.user.student.registeredCourseIds.filter(id => id !== courseId);
        this.saveState();
    }
}

window.courseStore = new CourseStore();
