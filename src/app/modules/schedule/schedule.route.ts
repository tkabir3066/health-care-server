import { Router } from "express";
import { ScheduleController } from "./schedule.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.DOCTOR),
  ScheduleController.schedulesForDoctor
);

router.post("/", auth(UserRole.ADMIN), ScheduleController.createSchedule);

router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  ScheduleController.deleteScheduleFromDB
);

export const ScheduleRoutes = router;
