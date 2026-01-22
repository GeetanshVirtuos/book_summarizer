-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "summary" TEXT,
    "styled_summary" TEXT,
    "audio_link" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
