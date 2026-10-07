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
        ipAddress: {
            ipAddressHeaders: ['x-fowarded-for']
        }
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
                                ingameName: user.name.split(" ")[0] || 'UNKNOWN'
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
    },
    rateLimit: {
        window: 60,
        enabled: true,
        max: 100,
        storage: 'database',
        customRules: {
            "/sign-in/email": { window: 60, max: 5},
            "/sign-in/google": { window: 60, max: 5},
            "/sign-up/email": { window: 60, max: 5}
        }
    },
});
