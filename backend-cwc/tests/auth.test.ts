import request from "supertest";
import app, { connectDB } from "../server";
import User, { UserInterface } from "../models/user_model";
import mongoose from "mongoose";

beforeAll(async () => {
    console.log("Jest starting!");
    await connectDB();
    await User.deleteMany();
});

afterAll(async () => {
    console.log("server closing");
    await mongoose.connection.close();
});

type UserType = UserInterface & {
    accessToken?: string;
    refreshToken?: string;
};

const testUser: UserType = {
    email: "test@user.com",
    password: "testpassword",
    location: "test location",
    bio: "test bio",
    favorite_coffee: "test coffee",
};

const baseUrl = "/api/auth";

describe("Auth Tests", () => {
    test("Register success", async () => {
        const response = await request(app).post(baseUrl + "/register").send(testUser);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("success");
    });

    test("Register fail - duplicate email", async () => {
        const response = await request(app).post(baseUrl + "/register").send(testUser);
        expect(response.status).toBe(409);
    });

    test("Register fail - missing email", async () => {
        const response = await request(app).post(baseUrl + "/register").send({...testUser, email: ""});
        expect(response.status).toBe(400);
    });

    test("Register fail - missing password", async () => {
        const response = await request(app).post(baseUrl + "/register").send({email:"test2@user.com", password: ""});
        expect(response.status).toBe(400);
    });

    test("Login success", async () => {
        const response = await request(app).post(baseUrl + "/login").send(testUser);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success");
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        expect(response.body.id).toBeDefined();
        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;
    });

    test("Check tokens are not the same on consecutive logins", async () => {
        const response = await request(app).post(baseUrl + "/login").send(testUser);
        expect(response.status).toBe(200);
        const accessToken = response.body.accessToken;
        const refreshToken = response.body.refreshToken;
        expect(accessToken).not.toBe(testUser.accessToken);
        expect(refreshToken).not.toBe(testUser.refreshToken);
    });

    test("Login fail - missing email", async () => {
        const response = await request(app).post(baseUrl + "/login").send({password: testUser.password});
        expect(response.status).toBe(400);
    });

    test("Login fail - missing password", async () => {
        const response = await request(app).post(baseUrl + "/login").send({email: testUser.email});
        expect(response.status).toBe(400);
    });

    test("Login fail - wrong email", async () => {
        const response = await request(app).post(baseUrl + "/login").send({...testUser, email: testUser.email + "1"});
        expect(response.status).toBe(404);
    });

    test("Login fail - wrong password", async () => {
        const response = await request(app).post(baseUrl + "/login").send({...testUser, password: testUser.password + "1"});
        expect(response.status).toBe(401);
    });

    test("Refresh token success", async () => {
        const response = await request(app).post(baseUrl + "/refresh").send({refreshToken: testUser.refreshToken});
        expect(response.status).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;
    });

    test("Refresh token fail - invalid token", async () => {
        const response = await request(app).post(baseUrl + "/refresh").send({refreshToken: "invalidtoken"});
        expect(response.status).toBe(401);
    });

    test("Double use of refresh token", async () => {
        const response = await request(app).post(baseUrl + "/refresh").send({refreshToken: testUser.refreshToken});
        expect(response.status).toBe(200);
        const newRefreshToken = response.body.refreshToken;

        const response2 = await request(app).post(baseUrl + "/refresh").send({refreshToken: testUser.refreshToken});
        expect(response2.status).not.toBe(200);

        const response3 = await request(app).post(baseUrl + "/refresh").send({refreshToken: newRefreshToken});
        expect(response3.status).not.toBe(200);
    });

    test("Logout and token invalidation", async () => {
        const response = await request(app).post(baseUrl + "/login").send(testUser);
        expect(response.status).toBe(200);
        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;

        const response2 = await request(app).post(baseUrl + "/logout").send({refreshToken: testUser.refreshToken});
        expect(response2.status).toBe(200);

        const response3 = await request(app).post(baseUrl + "/refresh").send({refreshToken: testUser.refreshToken});
        expect(response3.status).toBe(401);
    });

    test("Access protected route (/me) with invalid token", async () => {
        const response = await request(app)
          .get(baseUrl + "/me")
          .set("Authorization", "Bearer invalidtoken");
        expect(response.status).toBe(401);
    });

    test("Google login fail - missing token", async () => {
        const response = await request(app).post(baseUrl + "/google").send({});
        expect(response.status).toBe(400);
    });

    test("Chat endpoint fail - missing message", async () => {
        const response = await request(app).post(baseUrl + "/generateContent").send({});
        expect(response.status).toBe(400);
    });

    jest.setTimeout(15000);

    test("Test timeout and token refresh", async () => {
        const response = await request(app).post(baseUrl + "/login").send(testUser);
        expect(response.status).toBe(200);
        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;

        await new Promise((r) => setTimeout(r, 5000));

        const response2 = await request(app)
            .post("/api/post/createPost")
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send({userId: testUser._id, content: "test content"});
        expect(response2.status).not.toBe(201);

        const response3 = await request(app).post(baseUrl + "/refresh").send({refreshToken: testUser.refreshToken});
        expect(response3.status).toBe(200);
        testUser.accessToken = response3.body.accessToken;

        const response4 = await request(app)
            .post("/api/post/createPost")
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send({userId: testUser._id, content: "test content"});
        expect(response4.status).toBe(201);
    });
});
