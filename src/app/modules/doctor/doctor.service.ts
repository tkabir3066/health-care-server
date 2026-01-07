import { Prisma } from "@prisma/client";
import { doctorSearchableFields } from "./doctor.constant";
import { IOptions, PaginationHelper } from "../../helper/paginationHelper";
import { prisma } from "../../config/db";
import { IDoctorUpdateInput } from "./doctor.interface";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { openai } from "../../helper/openRouter";

const getAllFromDB = async (filters: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    PaginationHelper.calculatePagination(options);
  const { searchTerm, specialties, ...filterData } = filters;

  const andConditions: Prisma.DoctorWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // "", "medicine"
  if (specialties && specialties.length > 0) {
    andConditions.push({
      doctorSpecialties: {
        some: {
          specialities: {
            title: {
              contains: specialties,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));

    andConditions.push(...filterConditions);
  }

  const whereConditions: Prisma.DoctorWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });

  const total = await prisma.doctor.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const updateIntoDB = async (
  id: string,
  payload: Partial<IDoctorUpdateInput>
) => {
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const { specialties, ...doctorData } = payload;

  return await prisma.$transaction(async (tnx) => {
    if (specialties && specialties.length > 0) {
      const deleteSpecialtyIds = specialties.filter(
        (specialty) => specialty.isDeleted
      );

      for (const specialty of deleteSpecialtyIds) {
        await tnx.doctorSpecialties.deleteMany({
          where: {
            doctorId: id,
            specialitiesId: specialty.specialtyId,
          },
        });
      }

      const createSpecialtyIds = specialties.filter(
        (specialty) => !specialty.isDeleted
      );

      for (const specialty of createSpecialtyIds) {
        await tnx.doctorSpecialties.create({
          data: {
            doctorId: id,
            specialitiesId: specialty.specialtyId,
          },
        });
      }
    }

    const updatedData = await tnx.doctor.update({
      where: {
        id: doctorInfo.id,
      },
      data: doctorData,
      include: {
        doctorSpecialties: {
          include: {
            specialities: true,
          },
        },
      },

      //  doctor - doctorSpecailties - specialities
    });

    return updatedData;
  });
};

const getAISuggestion = async (payload: { symptoms: string }) => {
  //Implementation for getting AI suggestions
  if (!(payload && payload.symptoms)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Symptoms is required!");
  }

  const doctors = await prisma.doctor.findMany({
    where: {
      isDeleted: false,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });

  // Create AI prompt for doctor recommendation
  const prompt = `You are a medical triage assistant. Based on the patient's symptoms, recommend the most appropriate medical specialties from the available options.



Patient Symptoms: ${payload.symptoms}

Analyze the symptoms and provide:
1. A list of recommended specialties (use only specialties from the available list)
2. Clear reasoning for your recommendations
3. Urgency level (low, medium, high, or emergency)

Respond in JSON format with full individual doctor data`;

  const completion = await openai.chat.completions.create({
    model: "mistralai/devstral-2512:free",
    messages: [
      {
        role: "system",
        content: "You are a professional medical AI assistant.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
};
export const DoctorService = {
  getAllFromDB,
  updateIntoDB,
  getAISuggestion,
};
