import { ROLES, STAFF_ROLES, FAMILY_ROLES } from '../config/constants.js';

/**
 * Restricts access to specific user roles
 * @param {string[]} allowedRoles
 */
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required.',
        code: 'UNAUTHENTICATED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
        code: 'ROLE_FORBIDDEN',
        requiredRoles: allowedRoles
      });
    }

    next();
  };
};

/**
 * Convenience middleware for staff-only routes (Teacher, Headmaster, Admin)
 */
export const requireStaff = requireRole(STAFF_ROLES);

/**
 * Middleware for Principal/Headmaster and District Admin routes
 */
export const requireHeadmasterOrAdmin = requireRole([ROLES.HEADMASTER, ROLES.ADMIN]);

/**
 * Critical Privacy Middleware: Enforces strict data isolation for Parents and Students.
 * If user is 'parent' or 'student', they can NEVER access any other student's data.
 * Any attempt to access another student's ID returns 403 Forbidden.
 */
export const authorizeStudentScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication required.',
      code: 'UNAUTHENTICATED'
    });
  }

  const { role, studentId } = req.user;

  // For parent and student, verify privacy boundaries
  if (FAMILY_ROLES.includes(role)) {
    if (!studentId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: No linked student record associated with this account.',
        code: 'NO_LINKED_STUDENT'
      });
    }

    // Check requested resource id in route params (e.g. /students/:id, /students/:id/attendance)
    const targetStudentId = req.params.id || req.params.studentId;

    if (targetStudentId !== undefined) {
      const requestedId = Number(targetStudentId);
      if (requestedId !== Number(studentId)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: Institutional student data privacy rules strictly forbid accessing another student\'s record.',
          code: 'STUDENT_DATA_PRIVACY_RESTRICTION',
          authorizedStudentId: studentId,
          attemptedStudentId: requestedId
        });
      }
    }

    // Check query params if specified (e.g. ?studentId=2 or ?student_id=2)
    const queryStudentId = req.query.studentId || req.query.student_id;
    if (queryStudentId !== undefined) {
      const requestedQueryId = Number(queryStudentId);
      if (requestedQueryId !== Number(studentId)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You are strictly scoped to your own linked child record.',
          code: 'STUDENT_DATA_PRIVACY_RESTRICTION',
          authorizedStudentId: studentId
        });
      }
    }

    // Always inject the scoped student ID for safe controller filtering
    req.scopedStudentId = Number(studentId);
  } else {
    // Staff roles (teacher, headmaster, admin) have school/cluster scope
    req.scopedStudentId = req.query.studentId || req.query.student_id ? Number(req.query.studentId || req.query.student_id) : null;
  }

  next();
};
