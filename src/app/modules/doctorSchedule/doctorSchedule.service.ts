import { prisma } from "../../config/db";
import { IJWTPayload } from "../../types/common";

const createDoctorSchedule = async (
  user: IJWTPayload,
  payload: { scheduleIds: string[] }
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));

  return await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
    skipDuplicates: true,
  });
};

export const DoctorScheduleService = {
  createDoctorSchedule,
};
