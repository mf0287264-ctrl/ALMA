import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { database_connect } from './DB/db.connection.js';
import errorHandler from './Middleware/error.middleware.js';
import { getRedisClient } from './Utils/redis.util.js';

// Route Imports
import authRoutes from './Module/Auth/Auth.routes.js';
import usersRoutes from './Module/Users/Users.routes.js';
import parentsRoutes from './Module/Parents/Parents.routes.js';
import studentsRoutes from './Module/Students/Students.routes.js';
import teachersRoutes from './Module/Teachers/Teachers.routes.js';
import adminsRoutes from './Module/Admins/Admins.routes.js';
import coursesRoutes from './Module/Courses/Courses.routes.js';
import modulesRoutes from './Module/Modules/Modules.routes.js';
import lessonsRoutes from './Module/Lessons/Lessons.routes.js';
import lessonGenerationsRoutes from './Module/LessonGenerations/LessonGenerations.routes.js';
import assessmentsRoutes from './Module/Assessments/Assessments.routes.js';
import quizzesRoutes from './Module/Quizzes/Quizzes.routes.js';
import achievementsRoutes from './Module/Achievements/Achievements.routes.js';
import postsRoutes from './Module/Posts/Posts.routes.js';
import messagesRoutes from './Module/Messages/Messages.routes.js';
import teacherGroupsRoutes from './Module/TeacherGroups/TeacherGroups.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
database_connect();

// Initialize Redis (eager connect so errors surface at startup)
getRedisClient();

// Middleware
app.use(cors());
app.use(express.json());

// Enable access to uploaded static files
app.use('/uploads', express.static('uploads'));
app.use('/uploaded', express.static('uploaded'));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/parents', parentsRoutes);
app.use('/api/v1/students', studentsRoutes);
app.use('/api/v1/teachers', teachersRoutes);
app.use('/api/v1/admins', adminsRoutes);
app.use('/api/v1/courses', coursesRoutes);
app.use('/api/v1/modules', modulesRoutes);
app.use('/api/v1/lessons', lessonsRoutes);
app.use('/api/v1/lesson-generations', lessonGenerationsRoutes);
app.use('/api/v1/assessments', assessmentsRoutes);
app.use('/api/v1/quizzes', quizzesRoutes);
app.use('/api/v1/achievements', achievementsRoutes);
app.use('/api/v1/posts', postsRoutes);
app.use('/api/v1/messages', messagesRoutes);
app.use('/api/v1/teacher-groups', teacherGroupsRoutes);

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    project: 'ALMA Academy API',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[ALMA Academy API] Server running on port ${PORT}`);
});

export default app;
