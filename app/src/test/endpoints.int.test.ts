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

describe("GET /character/profile/:userId/view-stats", () => {

    test("no token but requesting an endpoint", async () => {
        const res = await request(app)
            .get("/cleanquest/character/profile/pUlJruRdv5E8zMukcx8PVxCMtNkZciDs/view-stats")

        expect(res.status).toBe(401);
        expect(res.body).toMatchObject({
            error: "Unauthorized",
            success: false
        })
    })

    test("got a token and requesting an endpoint", async () => {
        const data: CreateUser = await createUser();
        const cookie = await loginUser(data.email, data.password);

        const res = await request(app)
            .get(`/cleanquest/character/profile/${data.user?.id}/view-stats`).set("Cookie", cookie)
        
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            message: "Data retrieve successfully",
            success: true,
            data: {},
            importantTask: [],
            completedTask: [],
            totalCompletion: {}
        })
    })
})