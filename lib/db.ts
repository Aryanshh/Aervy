import { PrismaClient } from "@prisma/client";
import { createMockDatabaseClient } from "./mock-db";

const globalForDb = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  mockDb: ReturnType<typeof createMockDatabaseClient> | undefined;
};

// Default to in-memory pilot database if DEMO_MODE=true or DATABASE_URL is not set / contains placeholder
const useDemoMock =
  process.env.DEMO_MODE === "true" ||
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.includes("placeholder");

let dbInstance: PrismaClient;

if (useDemoMock) {
  if (!globalForDb.mockDb) {
    globalForDb.mockDb = createMockDatabaseClient();
  }
  dbInstance = globalForDb.mockDb as unknown as PrismaClient;
} else {
  if (!globalForDb.prisma) {
    globalForDb.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }
  dbInstance = globalForDb.prisma;
}

export const db = dbInstance;
