import { addMinutes, addDays } from "date-fns";
import { prisma } from "../../config/db";
import { IOptions, PaginationHelper } from "../../helper/paginationHelper";
import { Prisma } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { IJWTPayload } from "../../types/common";

interface CreateSchedulePayload {
  startTime: string; // Format: "HH:mm"
  endTime: string;
  startDate: string | Date;
  endDate: string | Date;
}

const createSchedule = async (payload: CreateSchedulePayload) => {
  const { startTime, endTime, startDate, endDate } = payload;
  const intervalTime = 30;
  const schedulesToCreate: any[] = [];

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const dayStartDateTime = new Date(year, month, day, startHour, startMinute);
    const dayEndDateTime = new Date(year, month, day, endHour, endMinute);

    let slotStart = new Date(dayStartDateTime);

    while (slotStart < dayEndDateTime) {
      const slotEnd = addMinutes(slotStart, intervalTime);

      if (slotEnd <= dayEndDateTime) {
        schedulesToCreate.push({
          startDateTime: new Date(slotStart),
          endDateTime: new Date(slotEnd),
        });
      }

      slotStart = addMinutes(slotStart, intervalTime);
    }

    currentDate.setTime(addDays(currentDate, 1).getTime());
  }

  // Single bulk insert with automatic duplicate handling
  const result = await prisma.schedule.createMany({
    data: schedulesToCreate,
    skipDuplicates: true, // Prevents errors on duplicate entries
  });

  return result;
};

const schedulesForDoctor = async (
  user: IJWTPayload,
  filters: any,
  options: IOptions
) => {
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

  const doctorSchedules = await prisma.doctorSchedules.findMany({
    where: {
      doctor: {
        email: user.email,
      },
    },
    select: {
      scheduleId: true,
    },
  });

  const doctorScheduleIds = doctorSchedules.map(
    (schedule) => schedule.scheduleId
  );

  const result = await prisma.schedule.findMany({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorScheduleIds,
      },
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.schedule.count({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorScheduleIds,
      },
    },
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

const deleteScheduleFromDB = async (id: string) => {
  const result = await prisma.schedule.deleteMany();

  return result;
};

export const ScheduleService = {
  createSchedule,
  schedulesForDoctor,
  deleteScheduleFromDB,
};
