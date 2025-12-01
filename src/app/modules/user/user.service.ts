import { Request } from "express";
import { prisma } from "../../config/db";
import { envVars } from "../../config/env";
import { CreatePatientInput } from "./user.interface";
import bcryptjs from "bcryptjs";
import { FileUploader } from "../../helper/fileUploader";

const createPatient = async (req: Request) => {
  if (req.file) {
    const uploadedResult = await FileUploader.uploadToCloudinary(req.file);
    req.body.patient.profilePhoto = uploadedResult?.secure_url;
  }
  const hashedPassword = await bcryptjs.hash(
    req.body.password,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.patient.email,
        password: hashedPassword,
      },
    });

    return await tnx.patient.create({
      data: req.body.patient,
    });
  });

  return result;
};

export const UserService = {
  createPatient,
};
