import { NextFunction, Request, Response, Router } from "express";
import { UserController } from "./user.controller";
import { FileUploader } from "../../helper/fileUploader";
import { UserValidation } from "./user.validation";
import { UserRole } from "@prisma/client";
import { auth } from "../../middlewares/auth";

const router = Router();

router.get(
  "/",
  // auth(UserRole.ADMIN, UserRole.DOCTOR),
  UserController.getAllFromDB
);

router.post(
  "/create-patient",
  FileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createPatientValidationSchema.parse(
      JSON.parse(req.body.data)
    );

    return UserController.createPatient(req, res, next);
  }
);
router.post(
  "/create-admin",
  auth(UserRole.ADMIN),
  FileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createAdminValidationSchema.parse(
      JSON.parse(req.body.data)
    );

    return UserController.createAdmin(req, res, next);
  }
);
router.post(
  "/create-doctor",
  auth(UserRole.ADMIN),
  FileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createDoctorValidationSchema.parse(
      JSON.parse(req.body.data)
    );

    return UserController.createDoctor(req, res, next);
  }
);

export const UserRoutes = router;
