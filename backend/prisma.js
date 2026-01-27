import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.ts'
import { logger, LOG_TYPES } from "./utility/logger.js";

const connectionString = `${process.env.DATABASE_URL}`

if(!connectionString){
    throw new Error("DATABASE_URL is not defined in environment variables");
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function checkConnection() {
  try {
    // Actually query the database to test connection
    await prisma.$queryRaw`SELECT 1`;
    logger('Successfully connected to the database', LOG_TYPES.SUCCESS);
  } catch (error) {
    logger(`Database connection failed: ${error.message}`, LOG_TYPES.ERROR);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();

export { prisma }

