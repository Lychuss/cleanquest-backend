import { resetAndSeedTest } from "./seed.ts";
import { prisma } from "../../../lib/prisma.ts";
import { createUser, loginUser } from "./helpers.ts";
import request from "supertest"
import app from "../../app.js";

import type { CreateUser } from "./helpers.ts";

beforeEach( async () => {
    await resetAndSeedTest();
})

afterAll( async () => {
    await prisma.$disconnect();
})

describe("user signup", () => {
    test("user input its information", async () => {
        const res = await request(app)
            .post("/api/auth/sign-up/email")
            .send({ name: "user", email: "user@gmail.com", password: "test1234"})
        
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            token: expect.any(String),
            user: {
                name: "user",
                email: "user@gmail.com",
                id: expect.any(String)
            }
        })
    })
})

describe("user login",() => {

    test("user input its information", async () => {
        const data:CreateUser = await createUser();

        const res = await request(app)
            .post("/api/auth/sign-in/email")
            .send({ email: data.email, password: data.password})

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            token: expect.any(String),
            redirect: false,
            user: {
                email: "user1@gmail.com",
                name: "user1",
                image: null,
                id: expect.any(String)
            }
        })
    })
})
