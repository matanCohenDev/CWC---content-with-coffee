import request from "supertest";
import app,  { connectDB } from "../server";
import Post , {PostInterface} from "../models/post_model";
import User , {UserInterface} from "../models/user_model";
import Like , {LikeInterface} from "../models/like_model";
import mongoose from "mongoose";

let testUser: UserInterface & {accessToken?: string};
let testPost: PostInterface;
let testLike: LikeInterface;

beforeAll(async () => {
    console.log("Jest starting!");
    await connectDB();
    await User.deleteMany();
    await Post.deleteMany();
    await Like.deleteMany();

    testUser = {
        email: "test@test.com",
        password: "testpassword",
    }
    await request(app).post("/api/auth/register").send(testUser);
    const responseLoginUser = await request(app).post("/api/auth/login").send(testUser);
    expect(responseLoginUser.status).toBe(200);
    expect(responseLoginUser.body.accessToken).toBeDefined();
    expect(responseLoginUser.body.refreshToken).toBeDefined();
    expect(responseLoginUser.body.id).toBeDefined();
    testUser.accessToken = responseLoginUser.body.accessToken;
    testUser.refreshToken = responseLoginUser.body.refreshToken;
    testUser._id = responseLoginUser.body.id;

    testPost = {
        userId: responseLoginUser.body.id,
        content: "test content",
    }

    const responseCreatePost = await request(app).post("/api/post/createPost")
        .set("Authorization", `Bearer ${testUser.accessToken}`).send(testPost);
    expect(responseCreatePost.status).toBe(201);
    expect(responseCreatePost.body).toHaveProperty("success");
    testPost._id = responseCreatePost.body.data._id;

    testLike = {
        userId: responseLoginUser.body.id,
        postId: responseCreatePost.body.data._id,
    }
});

afterAll(async () => {
    console.log("server closing");
    await User.deleteMany();
    await Post.deleteMany();
    await mongoose.connection.close();
});

const baseUrl = "/api/like";

describe("Like Tests", () => {
    test("Create like success", async () => {
        const response = await request(app)
            .post(baseUrl + "/createLike")
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send(testLike);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("success");
        testLike._id = response.body.data._id;
    });

    test("Get likes by post id success", async () => {
        const response = await request(app)
            .get(baseUrl + "/getLikesByPostId/" + testPost._id)
            .set("Authorization", `Bearer ${testUser.accessToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success");
        expect(response.body.likes).toHaveLength(1);
    });

    test("Delete like success", async () => {
        const response = await request(app)
            .delete(baseUrl + "/deleteLike/" + testLike._id)
            .set("Authorization", `Bearer ${testUser.accessToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success");
    });
    
    test("creat like with invalid token", async () => {
        const response = await request(app)
            .post(baseUrl + "/createLike")
            .set("Authorization", `Bearer invalidToken`)
            .send(testLike);
        expect(response.status).toBe(401);
    });
});



