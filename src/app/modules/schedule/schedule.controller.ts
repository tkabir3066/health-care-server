import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { ScheduleService } from "./schedule.service";
import pick from "../../helper/pick";

const createSchedule = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ScheduleService.createSchedule(req.body);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Schedule created successfully",
      data: result,
    });
  }
);


const schedulesForDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
     const options = pick(req.query, ["page", "limit", "sortOrder", "sortBy"]); //pagination, sorting
     const filters = pick(req.query, ["startDateTime", "endDateTime"]); //filtering
    const result = await ScheduleService.schedulesForDoctor(filters, options);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Schedule created successfully",
      data: result,
    });
  }
);

export const ScheduleController = {
  createSchedule,
  schedulesForDoctor
};
