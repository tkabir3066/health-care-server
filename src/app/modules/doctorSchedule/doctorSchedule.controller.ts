import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { DoctorScheduleService } from "./doctorSchedule.service";
import { sendResponse } from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { IJWTPayload } from "../../types/common";

const createDoctorSchedule = catchAsync(
  async (
    req: Request & { user?: IJWTPayload },
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user;
    const result = await DoctorScheduleService.createDoctorSchedule(
      user as IJWTPayload,
      req.body
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Schedule created successfully",
      data: result,
    });
  }
);

export const DoctorScheduleController = {
  createDoctorSchedule,
};
