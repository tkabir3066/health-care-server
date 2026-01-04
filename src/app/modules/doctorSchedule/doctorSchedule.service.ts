import { prisma } from "../../config/db";

const createDoctorSchedule = async (
  user: any,
  payload: { scheduleIds: string[] }
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  // Check existing schedules
  const existingSchedules = await prisma.doctorSchedules.findMany({
    where: {
      doctorId: doctorData.id,
      scheduleId: {
        in: payload.scheduleIds,
      },
    },
  });

  const existingScheduleIds = new Set(
    existingSchedules.map((schedule) => schedule.scheduleId)
  );

  const newScheduleIds = payload.scheduleIds.filter(
    (scheduleId) => !existingScheduleIds.has(scheduleId)
  );

  let createdCount = 0;

  if (newScheduleIds.length > 0) {
    const doctorScheduleData = newScheduleIds.map((scheduleId) => ({
      doctorId: doctorData.id,
      scheduleId: scheduleId,
    }));

    const result = await prisma.doctorSchedules.createMany({
      data: doctorScheduleData,
    });

    createdCount = result.count;
  }

  return {
    totalRequested: payload.scheduleIds.length,
    alreadyExisted: existingSchedules.length,
    newlyCreated: createdCount,
    duplicateScheduleIds: Array.from(existingScheduleIds),
  };
};

export const DoctorScheduleService = {
  createDoctorSchedule,
};
