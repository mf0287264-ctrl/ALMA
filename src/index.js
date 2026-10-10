require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./DB/db.connection');
const errorHandler = require('./Middleware/error.middleware');

// Route Imports
const studentsRoutes = require('./Module/Students/Students.routes');
const teachersRoutes = require('./Module/Teachers/Teachers.routes');
const adminsRoutes = require('./Module/Admins/Admins.routes');
const coursesRoutes = require('./Module/Courses/Courses.routes');
const modulesRoutes = require('./Module/Modules/Modules.routes');
const lessonsRoutes = require('./Module/Lessons/Lessons.routes');
const lessonGenerationsRoutes = require('./Module/LessonGenerations/LessonGenerations.routes');
const assessmentsRoutes = require('./Module/Assessments/Assessments.routes');
const quizzesRoutes = require('./Module/Quizzes/Quizzes.routes');
const achievementsRoutes = require('./Module/Achievements/Achievements.routes');

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

module.exports = app;
