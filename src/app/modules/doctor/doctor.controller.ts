import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { DoctorService } from "./doctor.service";
import pick from "../../helper/pick";
import { doctorFilterableFields } from "./doctor.constant";

const getAllFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const filters = pick(req.query, doctorFilterableFields);
    const result = await DoctorService.getAllFromDB(filters, options);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Doctor retrieved successfully",
      data: result,
    });
  }
);

const updateIntoDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await DoctorService.updateIntoDB(id, req.body);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Doctor updated successfully",
      data: result,
    });
  }
);

export const DoctorController = {
  getAllFromDB,
  updateIntoDB,
};
