import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { ScheduleService } from "./schedule.service";
import pick from "../../helper/pick";
import { IJWTPayload } from "../../types/common";

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
  async (
    req: Request & { user?: IJWTPayload },
    res: Response,
    next: NextFunction
  ) => {
    const options = pick(req.query, ["page", "limit", "sortOrder", "sortBy"]); //pagination, sorting
    const filters = pick(req.query, ["startDateTime", "endDateTime"]); //filtering

    const user = req.user;

    const result = await ScheduleService.schedulesForDoctor(
      user as IJWTPayload,
      filters,
      options
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Schedule retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);
const deleteScheduleFromDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ScheduleService.deleteScheduleFromDB(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Schedule deleted successfully",
      data: result,
    });
  }
);

export const ScheduleController = {
  createSchedule,
  schedulesForDoctor,
  deleteScheduleFromDB,
};
