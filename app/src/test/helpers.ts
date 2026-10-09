import { prisma } from "../../../lib/prisma.ts"
import { auth } from "../../../lib/auth.ts"
import request from "supertest"
import { app } from "../../app.ts"


let counter: number = 0;

type LoginData = {
    name: string,
    email: string,
    emailVerified: boolean,
    image: null | string,
    createdAt: Date,
    updatedAt: Date,
    id: string
}

export type CreateUser = { 
    email: string, 
    password: string,
    user: LoginData
}

export const createUser = async ():Promise<CreateUser> => {
    counter += 1;
    const name = `user${counter}`;
    const email = `user${counter}@gmail.com`
    const password = "test1234";

    await auth.api.signUpEmail({
        body: {
            name: name,
            email: email,
            password: password
        }
    })

    const user:LoginData = await prisma.user.findUniqueOrThrow({ where: { email: email }})

    const data: CreateUser = {
        user: user,
        email: email,
        password: password
    }

    return data;
}

export const loginUser = async (email: string, password: string) => {

    const res = await request(app)
        .post("/api/auth/sign-in/email")
        .send({
            email: email,
            password: password
        })

    const cookies = res.headers["set-cookie"];
    if (!cookies) throw new Error("Cookie is not set!")
    return cookies;
}