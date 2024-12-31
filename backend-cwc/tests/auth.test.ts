import request from "supertest";
import app , { connectDB } from "../server";
import User , { UserInterface } from "../models/user_model";
import mongoose from "mongoose";
import Post from "../models/post_model";

beforeAll(async () => {
    console.log("Jest starting!");
    await connectDB();
    await User.deleteMany();
    await Post.deleteMany();
});

afterAll(async () => {
    console.log("server closing");
    await mongoose.connection.close();
});

type UserType = UserInterface & {
    accessToken?: string;
};
  
const testUser: UserType = {
    email: "test@user.com",
    password: "testpassword",
    location: "test location",
    bio: "test bio",
    favorite_coffee: "test coffee",
}
  
const baseUrl = "/api/auth";

describe("Auth Tests", () => {
    test("Register success", async () => {
        const response = await request(app).post(baseUrl + "/register").send(testUser);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("success");
    });

    test("Register fail", async () => {
        const response = await request(app).post(baseUrl + "/register").send(testUser);
        expect(response.status).not.toBe(200);
        expect(response.body).not.toHaveProperty("success");
    });

    test("Register fail - missing email", async () => {
        const response = await request(app).post(baseUrl + "/register").send({...testUser, email: ""});
        expect(response.status).not.toBe(200);
        expect(response.body).not.toHaveProperty("success");
    });

    test("Register fail - missing password", async () => {
        const response = await request(app).post(baseUrl + "/register").send({email:"test@test.com", password: ""});
        expect(response.status).not.toBe(200);
        expect(response.body).not.toHaveProperty("success");
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
        testUser._id = response.body.id;
    });

    test("Check tokens are not the same", async () => {
        const response = await request(app).post(baseUrl + "/login").send(testUser);
        const accessToken = response.body.accessToken;
        const refreshToken = response.body.refreshToken;

        expect(accessToken).not.toBe(testUser.accessToken);
        expect(refreshToken).not.toBe(testUser.refreshToken);
    });

    test("Login fail - missing email", async () => {
        const response = await request(app).post(baseUrl + "/login").send({password: testUser.password});
        expect(response.status).not.toBe(200);
        expect(response.body).not.toHaveProperty("success");
    });

    test("Login fail - missing password", async () => {
        const response = await request(app).post(baseUrl + "/login").send({email: testUser.email});
        expect(response.status).not.toBe(200);
        expect(response.body).not.toHaveProperty("success");
    });

    test("Login fail - wrong email", async () => {
        const response = await request(app).post(baseUrl + "/login").send({...testUser , email: testUser.email + "1"});
        expect(response.status).not.toBe(200);
        expect(response.body).not.toHaveProperty("success");
    });

    test("Login fail - wrong password", async () => {
        const response = await request(app).post(baseUrl + "/login").send({...testUser , password: testUser.password + "1"});
        expect(response.status).not.toBe(200);
        expect(response.body).not.toHaveProperty("success");
    });

    test("Auth refresh token success", async () => {
        const response = await request(app).post(baseUrl + "/refresh").send({refreshToken: testUser.refreshToken});
        expect(response.status).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;
    });

    test("double use of refresh token", async () => {
        const response = await request(app).post(baseUrl + "/refresh").send({refreshToken: testUser.refreshToken});
        expect(response.status).toBe(200);
        const refreshTokenNew = response.body.refreshToken;

        const response2 = await request(app).post(baseUrl + "/refresh").send({refreshToken: testUser.refreshToken});
        expect(response2.status).not.toBe(200);

        const response3 = await request(app).post(baseUrl + "/refresh").send({refreshToken: refreshTokenNew});
        expect(response3.status).not.toBe(200);
    });

    test("Test logout", async () => {
        const response = await request(app).post(baseUrl + "/login").send(testUser);
        expect(response.status).toBe(200);
        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;

        const response2 = await request(app).post(baseUrl + "/logout").send({refreshToken: testUser.refreshToken});
        expect(response2.status).toBe(200);

        const response3 = await request(app).post(baseUrl + "/refresh").send({refreshToken: testUser.refreshToken});
        expect(response3.status).not.toBe(200);
    });

    jest.setTimeout(10000);

    test("Test timeout token" , async () => {
        const response = await request(app).post(baseUrl + "/login").send(testUser);
        expect(response.status).toBe(200);
        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;

        await new Promise((r) => setTimeout(r, 5000));

        const response2 = await request(app).post("/api/post/createPost").set("Authorization", `Bearer ${testUser.accessToken}`)
        .send({userId: testUser._id, content: "test content"});

        expect(response2.status).not.toBe(201);

        const response3 = await request(app).post(baseUrl + "/refresh").send({refreshToken: testUser.refreshToken});
        expect(response3.status).toBe(200);
        testUser.accessToken = response3.body.accessToken;

        const response4 = await request(app).post("/api/post/createPost").set("Authorization", `Bearer ${testUser.accessToken}`)
        .send({userId: testUser._id, content: "test content"});
        expect(response4.status).toBe(201);
    });
});

