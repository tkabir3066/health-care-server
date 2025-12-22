import { addMinutes, addDays } from "date-fns";
import { prisma } from "../../config/db";
import { IOptions, PaginationHelper } from "../../helper/paginationHelper";
import { Prisma } from "@prisma/client";

const createSchedule = async (payload: any) => {
  // Destructure payload
  const { startTime, endTime, startDate, endDate } = payload;
  const intervalTime = 30; // 30-minute slots
  const schedules: any[] = [];

  // Parse start and end dates
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  console.log({ startDate, endDate, startTime, endTime });

  // Loop over each day from startDate to endDate (inclusive)
  while (currentDate <= lastDate) {
    // Extract year, month, day from currentDate
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-based
    const day = currentDate.getDate();

    // Parse startTime "HH:mm"
    const [startHourStr, startMinuteStr] = startTime.split(":");
    const startHour = parseInt(startHourStr, 10);
    const startMinute = parseInt(startMinuteStr, 10);

    // Parse endTime "HH:mm"
    const [endHourStr, endMinuteStr] = endTime.split(":");
    const endHour = parseInt(endHourStr, 10);
    const endMinute = parseInt(endMinuteStr, 10);

    // Create start and end Date objects for this day
    const dayStartDateTime = new Date(year, month, day, startHour, startMinute);
    const dayEndDateTime = new Date(year, month, day, endHour, endMinute);

    // Start from dayStartDateTime and create slots until dayEndDateTime
    let slotStart = new Date(dayStartDateTime); // Copy to avoid mutating original

    while (slotStart < dayEndDateTime) {
      // Calculate slot end time (start + 30 minutes)
      const slotEnd = addMinutes(slotStart, intervalTime);

      // Only create slot if it ends by or before dayEndDateTime
      if (slotEnd <= dayEndDateTime) {
        const scheduleData = {
          startDateTime: slotStart,
          endDateTime: slotEnd,
        };

        // Check if this exact slot already exists
        const existingSchedule = await prisma.schedule.findFirst({
          where: scheduleData,
        });

        // Create only if not already present
        if (!existingSchedule) {
          const result = await prisma.schedule.create({
            data: scheduleData,
          });
          schedules.push(result);
        }
      }

      // Move to next slot: advance slotStart by 30 minutes
      slotStart = addMinutes(slotStart, intervalTime);
    }

    // Move to next day
    currentDate.setTime(addDays(currentDate, 1).getTime());
  }

  return schedules;
};

const schedulesForDoctor = async (filters: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    PaginationHelper.calculatePagination(options);

  const { startDateTime: filterStartDateTime, endDateTime: filterEndDateTime } =
    filters;

  const andConditions: Prisma.ScheduleWhereInput[] = [];

  if (filterStartDateTime && filterStartDateTime) {
    andConditions.push({
      AND: [
        {
          startDateTime: {
            gte: filterStartDateTime,
          },
        },
        {
          endDateTime: {
            lte: filterEndDateTime,
          },
        },
      ],
    });
  }

  const whereConditions: Prisma.ScheduleWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const result = await prisma.schedule.findMany({
    where: whereConditions,
    skip,
    take:limit,
     orderBy: {
      [sortBy]: sortOrder,
    },
  });

   const total = await prisma.schedule.count({
    where: whereConditions,
  });

    return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

export const ScheduleService = {
  createSchedule,
  schedulesForDoctor,
};
