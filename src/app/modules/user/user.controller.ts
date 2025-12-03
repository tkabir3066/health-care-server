import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { UserService } from "./user.service";
import pick from "../../helper/pick";
import { userFilterableFields } from "./user.constant";

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
    // page,limit,sortOrder,sortBy --> pagination, sorting
    //fields, searchTerm --> searching, filtering

    const filters = pick(req.query, userFilterableFields); //searching, filtering
    const options = pick(req.query, ["page", "limit", "sortOrder", "sortBy"]); //pagination, sorting
    /*     const { limit, page, searchTerm, sortBy, sortOrder, role, status } =
      req.query;
    const result = await UserService.getAllFromDB({
      page: Number(page),
      limit: Number(limit),
      searchTerm,
      sortBy,
      sortOrder,
      role,
      status,
    }); */

    const result = await UserService.getAllFromDB(filters, options);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Users retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

export const UserController = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllFromDB,
};
