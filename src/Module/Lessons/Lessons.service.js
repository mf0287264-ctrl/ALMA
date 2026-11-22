import lessonsRepository from './Lessons.repository.js';
import { prepareLessonWhiteboards } from '../../Whiteboard/prepareLessonWhiteboards.js';
import coursesRepository from '../Courses/Courses.repository.js';
import modulesRepository from '../Modules/Modules.repository.js';
import studentsRepository from '../Students/Students.repository.js';
import teacherGroupsRepository from '../TeacherGroups/TeacherGroups.repository.js';

class LessonsService {
  async createLesson(data) {
    return await lessonsRepository.create(prepareLessonWhiteboards(data));
  }

  async getAllLessons(filter, options) {
    return await lessonsRepository.findAll(filter, options);
  }

  async getMyLessons(user = null) {
    let student = null;
    if (user?._id) {
      student = await studentsRepository.findById(user._id);
    }

    const enrolledCourseIds = student?.enrolled_courses || [];
    let availableLessons = [];

    // All courses cache for fast title lookup
    const allCourses = await coursesRepository.findAll({});
    const coursesMap = new Map();
    allCourses.forEach((c) => {
      coursesMap.set(c._id.toString(), c.title);
    });

    // All modules cache for fast title lookup
    const allModules = await modulesRepository.findAll({});
    const modulesMap = new Map();
    allModules.forEach((m) => {
      modulesMap.set(m._id.toString(), m.title);
    });

    // Strictly fetch lessons belonging to the enrolled courses of the logged in student
    if (enrolledCourseIds.length > 0) {
      availableLessons = await lessonsRepository.findByCourseIds(enrolledCourseIds);
    }

    // Enrich available lessons with course & module titles
    const enrichedAvailable = availableLessons.map((l) => {
      const courseIdStr = l.course_id ? l.course_id.toString() : null;
      const moduleIdStr = l.module_id ? l.module_id.toString() : null;
      return {
        ...l,
        topic: l.topic || l.title || 'Lesson',
        course_title: courseIdStr ? coursesMap.get(courseIdStr) || 'Platform Course' : 'Platform Course',
        module_title: moduleIdStr ? modulesMap.get(moduleIdStr) || 'Core Module' : 'Core Module',
        target_duration_minutes: l.target_duration_minutes || l.estimated_duration_minutes || 15,
        status: 'not started',
      };
    });

    // Teacher group lessons strictly for the student's assigned teacher or joined teacher groups
    let teacherLessonsRaw = [];
    if (student?.teacher_id) {
      teacherLessonsRaw = await lessonsRepository.findTeacherLessons(student.teacher_id);
    }
    const enrichedTeacherLessons = teacherLessonsRaw.map((l) => {
      const courseIdStr = l.course_id ? l.course_id.toString() : null;
      const moduleIdStr = l.module_id ? l.module_id.toString() : null;
      return {
        ...l,
        topic: l.topic || l.title || 'Teacher Lesson',
        course_title: courseIdStr ? coursesMap.get(courseIdStr) || 'Classroom Room' : 'Teacher Classroom',
        module_title: moduleIdStr ? modulesMap.get(moduleIdStr) || 'Assigned Group Lesson' : 'Assigned Group Lesson',
        target_duration_minutes: l.target_duration_minutes || l.estimated_duration_minutes || 15,
        status: 'active',
      };
    });

    // Also include lessons from joined Teacher Groups
    if (student?._id) {
      try {
        const studentGroups = await teacherGroupsRepository.findByStudentId(student._id);
        studentGroups.forEach((group) => {
          (group.lessons || []).forEach((gl) => {
            enrichedTeacherLessons.push({
              _id: gl._id.toString(),
              topic: gl.topic || gl.title,
              title: gl.title,
              course_title: group.name,
              module_title: `${group.subject} · Code: ${group.class_code}`,
              programming_language: gl.programming_language || 'Python',
              target_duration_minutes: gl.duration_minutes || 15,
              grade_level: group.grade_level,
              status: 'active',
              teacher_name: group.teacher_name,
              is_group_lesson: true,
            });
          });
        });
      } catch (grpErr) {
        console.error('Error fetching student group lessons:', grpErr);
      }
    }

    return {
      available_lessons: enrichedAvailable,
      teacher_lessons: enrichedTeacherLessons,
      enrolled_course_ids: enrolledCourseIds,
    };
  }

  async getLessonById(id) {
    const lesson = await lessonsRepository.findById(id);
    if (!lesson) {
      const error = new Error('Lesson not found');
      error.statusCode = 404;
      throw error;
    }

    let courseTitle = 'Platform Course';
    if (lesson.course_id) {
      const course = await coursesRepository.findById(lesson.course_id);
      if (course) courseTitle = course.title;
    }

    let moduleTitle = 'Core Module';
    if (lesson.module_id) {
      const mod = await modulesRepository.findById(lesson.module_id);
      if (mod) moduleTitle = mod.title;
    }

    return {
      ...lesson,
      topic: lesson.topic || lesson.title,
      course_title: courseTitle,
      module_title: moduleTitle,
    };
  }

  async updateLesson(id, data) {
    const lesson = await lessonsRepository.update(id, prepareLessonWhiteboards(data));
    if (!lesson) {
      const error = new Error('Lesson not found');
      error.statusCode = 404;
      throw error;
    }
    return lesson;
  }

  async deleteLesson(id) {
    const lesson = await lessonsRepository.delete(id);
    if (!lesson) {
      const error = new Error('Lesson not found');
      error.statusCode = 404;
      throw error;
    }
    return lesson;
  }
}

export default new LessonsService();
