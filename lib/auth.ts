import dotenv from "dotenv";
dotenv.config();

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from "./prisma.js";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: ["http://localhost:3000"],
    database: prismaAdapter(prisma, {provider: "postgresql"}),
    emailAndPassword: {
            enabled: true,
            autoSignIn: true,
            maxPasswordLength: 12
        },
    socialProviders: {
            google: 
                {
                    clientId: process.env.GOOGLE_CLIENT_ID!,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET!
                }
        },
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["google"],
        }
    }
});
