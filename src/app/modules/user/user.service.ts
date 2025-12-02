import { Request } from "express";
import { prisma } from "../../config/db";
import { envVars } from "../../config/env";
import bcryptjs from "bcryptjs";
import { FileUploader } from "../../helper/fileUploader";
import { UserRole } from "@prisma/client";

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
const createAdmin = async (req: Request) => {
  if (req.file) {
    const uploadedResult = await FileUploader.uploadToCloudinary(req.file);
    req.body.admin.profilePhoto = uploadedResult?.secure_url;
  }
  const hashedPassword = await bcryptjs.hash(
    req.body.password,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.admin.email,
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    });

    const createdAdminData = await tnx.admin.create({
      data: req.body.admin,
    });

    return createdAdminData;
  });

  return result;
};

const createDoctor = async (req: Request) => {
  if (req.file) {
    const uploadedResult = await FileUploader.uploadToCloudinary(req.file);
    req.body.doctor.profilePhoto = uploadedResult?.secure_url;
  }
  const hashedPassword = await bcryptjs.hash(
    req.body.password,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.doctor.email,
        password: hashedPassword,
        role: UserRole.DOCTOR,
      },
    });

    const createdDoctorData = await tnx.doctor.create({
      data: req.body.doctor,
    });

    return createdDoctorData;
  });

  return result;
};

const getAllFromDB = async ({
  page,
  limit,
  searchTerm,
  sortBy,
  sortOrder,
}: {
  page: number;
  limit: number;
  searchTerm: any;
  sortBy: any;
  sortOrder: any;
}) => {
  const pageNumber = page || 1;
  const limitNUmber = limit || 10;
  const skip = (pageNumber - 1) * limitNUmber;
  const result = await prisma.user.findMany({
    skip: skip,
    take: limitNUmber,
    where: {
      email: {
        contains: searchTerm,
        mode: "insensitive",
      },
    },
    orderBy:
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  return result;
};
export const UserService = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllFromDB,
};
