import assessmentsRepository from './Assessments.repository.js';
import coursesRepository from '../Courses/Courses.repository.js';
import modulesRepository from '../Modules/Modules.repository.js';
import studentsRepository from '../Students/Students.repository.js';

class AssessmentsService {
  async createAssessment(data) {
    return await assessmentsRepository.create(data);
  }

  async getAllAssessments(filter, user = null) {
    let student = null;
    if (user?._id) {
      student = await studentsRepository.findById(user._id);
    }

    const query = { ...filter };

    // If logged in student, strictly show assessments for their enrolled courses
    if (student) {
      const enrolledIds = student.enrolled_courses || [];
      if (enrolledIds.length === 0) {
        return [];
      }
      query.course_id = { $in: enrolledIds };
    }

    const list = await assessmentsRepository.findAll(query);
    const allCourses = await coursesRepository.findAll({});
    const coursesMap = new Map();
    allCourses.forEach((c) => coursesMap.set(c._id.toString(), c.title));

    const allModules = await modulesRepository.findAll({});
    const modulesMap = new Map();
    allModules.forEach((m) => modulesMap.set(m._id.toString(), m.title));

    // Fetch user's submissions to mark completed status and real scores
    let userSubmissions = [];
    if (student) {
      userSubmissions = await assessmentsRepository.findSubmissionsByStudent(student._id);
    }
    const submissionsMap = new Map();
    userSubmissions.forEach((sub) => {
      submissionsMap.set(sub.assessment_id.toString(), sub);
    });

    return list.map((a) => {
      const cId = a.course_id ? a.course_id.toString() : null;
      const mId = a.module_id ? a.module_id.toString() : null;
      const sub = submissionsMap.get(a._id.toString());

      return {
        ...a,
        course_title: cId ? coursesMap.get(cId) || 'Platform Course' : 'Platform Course',
        module_title: mId ? modulesMap.get(mId) || '' : '',
        status: sub ? 'completed' : 'available',
        user_score: sub ? sub.score_percent : null,
        passed: sub ? sub.passed : null,
      };
    });
  }

  async getAssessmentById(id) {
    const assessment = await assessmentsRepository.findById(id);
    if (!assessment) {
      const error = new Error('Assessment not found');
      error.statusCode = 404;
      throw error;
    }

    let courseTitle = 'Platform Course';
    if (assessment.course_id) {
      const course = await coursesRepository.findById(assessment.course_id);
      if (course) courseTitle = course.title;
    }

    let moduleTitle = '';
    if (assessment.module_id) {
      const mod = await modulesRepository.findById(assessment.module_id);
      if (mod) moduleTitle = mod.title;
    }

    return {
      ...assessment,
      course_title: courseTitle,
      module_title: moduleTitle,
    };
  }

  async submitAssessment(assessmentId, studentId, data) {
    const assessment = await assessmentsRepository.findById(assessmentId);
    if (!assessment) {
      const error = new Error('Assessment not found');
      error.statusCode = 404;
      throw error;
    }

    const submission = await assessmentsRepository.saveSubmission({
      ...data,
      student_id: studentId,
      assessment_id: assessment._id,
      course_id: assessment.course_id,
    });

    return submission;
  }

  async getMyResult(assessmentId, studentId) {
    const submission = await assessmentsRepository.findLatestSubmission(studentId, assessmentId);
    if (!submission) {
      // If no submission yet, return null
      return null;
    }

    let courseTitle = 'Platform Course';
    if (submission.course_id) {
      const course = await coursesRepository.findById(submission.course_id);
      if (course) courseTitle = course.title;
    }

    return {
      ...submission,
      course_title: courseTitle,
    };
  }

  async updateAssessment(id, data) {
    const assessment = await assessmentsRepository.update(id, data);
    if (!assessment) {
      const error = new Error('Assessment not found');
      error.statusCode = 404;
      throw error;
    }
    return assessment;
  }

  async deleteAssessment(id) {
    const assessment = await assessmentsRepository.delete(id);
    if (!assessment) {
      const error = new Error('Assessment not found');
      error.statusCode = 404;
      throw error;
    }
    return assessment;
  }
}

export default new AssessmentsService();
