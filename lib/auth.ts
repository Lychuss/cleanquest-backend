import dotenv from "dotenv";
dotenv.config();

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from "./prisma.js";

export const auth = betterAuth({
    advanced: {
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true,
        },
    },
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: ["http://localhost:3000", "https://cleanquest-frontend.vercel.app", `${process.env.VERCEL_BASE_URL}`],
    database: prismaAdapter(prisma, {provider: "postgresql"}),
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await prisma.character.create({
                        data: {
                                userId: user.id,
                                ingameName: user.name
                        }
                    })
                }
            }
        }
    },
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
