import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './DB/db.connection.js';
import errorHandler from './Middleware/error.middleware.js';

// Route Imports
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

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
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
