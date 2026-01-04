import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { DoctorScheduleService } from "./doctorSchedule.service";
import { sendResponse } from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createDoctorSchedule = catchAsync(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const user = req.user;
    const result = await DoctorScheduleService.createDoctorSchedule(
      user,
      req.body
    );

    const message =
      result.newlyCreated > 0
        ? `${result.newlyCreated} Doctor Schedule(s) created successfully`
        : "No new schedules were created - all schedules already exist";

    sendResponse(res, {
      success: true,
      statusCode:
        result.newlyCreated > 0 ? StatusCodes.CREATED : StatusCodes.OK,
      message,
      data: result,
    });
  }
);

export const DoctorScheduleController = {
  createDoctorSchedule,
};
