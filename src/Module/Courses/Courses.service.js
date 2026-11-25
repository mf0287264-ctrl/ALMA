import coursesRepository from './Courses.repository.js';
import modulesRepository from '../Modules/Modules.repository.js';
import lessonsRepository from '../Lessons/Lessons.repository.js';
import studentsRepository from '../Students/Students.repository.js';
import { isPublishedLesson } from '../../Whiteboard/lessonSummary.js';

class CoursesService {
  async createCourse(data) {
    return await coursesRepository.create(data);
  }

  async getAllCourses(filter, user = null) {
    const courses = await coursesRepository.findAll(filter);
    const userEnrolledIds = user?.enrolled_courses?.map(id => id.toString()) || [];

    const coursesWithModules = await Promise.all(
      courses.map(async (course) => {
        const modulesCount = await modulesRepository.countByCourse(course._id);
        const isEnrolled = userEnrolledIds.includes(course._id.toString());
        return {
          ...course,
          modules_count: modulesCount,
          is_enrolled: isEnrolled,
        };
      })
    );
    return coursesWithModules;
  }

  async getCourseById(id, user = null) {
    const course = await coursesRepository.findById(id);
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }

    // Always fetch modules using the resolved course._id
    const author = user?.role === 'admin' || (user?.role === 'teacher' && String(course.created_by) === String(user._id));
    const modules = await modulesRepository.findAll({ course_id: course._id, ...(!author ? { status: { $ne: 'draft' } } : {}) });

    // For each module, attach lessons
    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await lessonsRepository.findAll({ module_id: mod._id });
        return {
          ...mod,
          // Catalog access never delivers the lesson body or its answer keys.
          lessons: lessons.filter(l => author || (l.status !== 'draft' && isPublishedLesson(l))).map(l => ({ _id: l._id, title: l.title || l.topic, topic: l.topic || l.title, module_id: l.module_id, course_id: l.course_id, target_duration_minutes: l.target_duration_minutes || 15 })),
        };
      })
    );

    let isEnrolled = false;
    if (user) {
      if (user.enrolled_courses && Array.isArray(user.enrolled_courses)) {
        isEnrolled = user.enrolled_courses.some(eId => eId.toString() === course._id.toString());
      } else {
        isEnrolled = await studentsRepository.isEnrolled(user._id, course._id);
      }
    }

    return {
      ...course,
      modules: modulesWithLessons,
      is_enrolled: isEnrolled,
    };
  }

  async enrollStudent(courseIdOrSlug, studentId) {
    const course = await coursesRepository.findById(courseIdOrSlug);
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }
    await studentsRepository.enrollCourse(studentId, course._id);
    return { course_id: course._id, is_enrolled: true };
  }

  async checkStudentEnrollment(courseIdOrSlug, studentId) {
    const course = await coursesRepository.findById(courseIdOrSlug);
    if (!course) return false;
    return await studentsRepository.isEnrolled(studentId, course._id);
  }

  async updateCourse(id, data) {
    const course = await coursesRepository.update(id, data);
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }
    return course;
  }

  async deleteCourse(id) {
    const result = await coursesRepository.delete(id);
    if (!result || result.deletedCount === 0) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }
    return result;
  }
}

export default new CoursesService();
