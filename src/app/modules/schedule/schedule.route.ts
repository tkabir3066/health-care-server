import { Router } from "express";
import { ScheduleController } from "./schedule.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "@prisma/client";




const router=Router()

router.get("/", auth(UserRole.ADMIN, UserRole.DOCTOR),ScheduleController.schedulesForDoctor)

router.post("/", ScheduleController.createSchedule)

router.delete("/:id", ScheduleController.deleteScheduleFromDB)

export const ScheduleRoutes=router