import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "../generated/prisma/client.js";
import prismaRandom from "prisma-extension-random";
import { PrismaPg } from "@prisma/adapter-pg";

export const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({ adapter }).$extends(prismaRandom());