-- AlterTable
ALTER TABLE "doctor_schedules" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "schedules_startDateTime_endDateTime_idx" ON "schedules"("startDateTime", "endDateTime");
