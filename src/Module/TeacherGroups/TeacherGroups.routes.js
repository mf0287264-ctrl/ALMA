import express from "express";
import teacherGroupsController from "./TeacherGroups.controller.js";
import { authenticate } from "../../Middleware/auth.middleware.js";

const router = express.Router();

// 1. Create a new class group (Teacher only)
router.post("/", authenticate, teacherGroupsController.createGroup);

// 2. Get my groups (Teacher gets authored groups; Student gets joined groups)
router.get("/my-groups", authenticate, teacherGroupsController.getMyGroups);

// 3. Join a group with class code (Student)
router.post("/join", authenticate, teacherGroupsController.joinWithCode);

// 4. Get group details (Teacher & enrolled students)
router.get("/:id", authenticate, teacherGroupsController.getGroupById);

// 5. Add a student directly to group (Teacher only)
router.post("/:id/students", authenticate, teacherGroupsController.addStudentDirect);

// 6. Remove a student from group (Teacher only)
router.delete("/:id/students/:studentId", authenticate, teacherGroupsController.removeStudent);

// 7. Add generated lesson to group (Teacher only)
router.post("/:id/lessons", authenticate, teacherGroupsController.addLesson);

// 8. Add task to group (Teacher only)
router.post("/:id/tasks", authenticate, teacherGroupsController.addTask);

// 9. Send message to group chat
router.post("/:id/messages", authenticate, teacherGroupsController.sendMessage);

// 10. Get group chat message history
router.get("/:id/messages", authenticate, teacherGroupsController.getMessages);

export default router;
