/* Validator Module - Enrollment Rules & Schedule Conflict Engine */
class RegistrationValidator {
    /**
     * Checks if prerequisite for target course is met by student.
     */
    static checkPrerequisite(targetCourse, student) {
        if (!targetCourse.prereq || targetCourse.prereq.toLowerCase() === 'none') {
            return { valid: true };
        }

        const requiredPrereqCode = targetCourse.prereq.toUpperCase();
        const completed = student.completedCourses || [];
        const registered = window.courseStore.getStudentEnrolledCourses().map(c => c.code);

        const hasCompleted = completed.includes(requiredPrereqCode) || registered.includes(requiredPrereqCode);

        if (hasCompleted) {
            return { valid: true };
        }

        return {
            valid: false,
            reason: `Prerequisite missing! You must complete ${requiredPrereqCode} before enrolling in ${targetCourse.code}.`
        };
    }

    /**
     * Checks if adding a course exceeds the credit hour limit.
     */
    static checkCreditLimit(targetCourse, currentCredits, maxLimit) {
        if (currentCredits + targetCourse.credits > maxLimit) {
            return {
                valid: false,
                reason: `Credit limit exceeded! Enrolling adds ${targetCourse.credits} credits (Total: ${currentCredits + targetCourse.credits}), exceeding your maximum ${maxLimit} credit limit.`
            };
        }
        return { valid: true };
    }

    /**
     * Checks for day & time schedule conflicts with currently enrolled courses.
     */
    static checkScheduleConflict(targetCourse, enrolledCourses) {
        for (const enrolled of enrolledCourses) {
            if (enrolled.id === targetCourse.id) continue;

            // Check if there are overlapping days
            const commonDays = targetCourse.days.filter(day => enrolled.days.includes(day));
            if (commonDays.length > 0) {
                // Check if time intervals overlap
                const tStart = this.parseTime(targetCourse.startTime);
                const tEnd = this.parseTime(targetCourse.endTime);
                const eStart = this.parseTime(enrolled.startTime);
                const eEnd = this.parseTime(enrolled.endTime);

                // Overlap condition: (tStart < eEnd) && (tEnd > eStart)
                if (tStart < eEnd && tEnd > eStart) {
                    return {
                        valid: false,
                        reason: `Schedule Conflict! ${targetCourse.code} (${targetCourse.schedule}) overlaps with enrolled course ${enrolled.code} (${enrolled.schedule}) on ${commonDays.join(', ')}.`
                    };
                }
            }
        }

        return { valid: true };
    }

    /**
     * Helper to parse HH:MM strings into numeric minutes since midnight.
     */
    static parseTime(timeStr) {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }
}

window.RegistrationValidator = RegistrationValidator;
