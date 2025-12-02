import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { UserService } from "./user.service";

const createPatient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.createPatient(req);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Patient created successfully",
      data: result,
    });
  }
);
const createAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.createAdmin(req);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Admin created successfully",
      data: result,
    });
  }
);
const createDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.createDoctor(req);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Doctor created successfully",
      data: result,
    });
  }
);
const getAllFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { limit, page } = req.query;
    const result = await UserService.getAllFromDB({
      page: Number(page),
      limit: Number(limit),
    });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Users retrieved successfully",
      data: result,
    });
  }
);

export const UserController = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllFromDB,
};
