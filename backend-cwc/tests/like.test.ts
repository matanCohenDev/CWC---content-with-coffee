import request from "supertest";
import app, { connectDB } from "../server";
import User, { UserInterface } from "../models/user_model";
import Post, { PostInterface } from "../models/post_model";
import Like, { LikeInterface } from "../models/like_model";
import mongoose from "mongoose";

let testUser: UserInterface & { accessToken?: string } = {
  email: "test@test.com",
  password: "testpassword",
};

let testPost: PostInterface;
let testLike: LikeInterface;

beforeAll(async () => {
  console.log("Jest starting Like tests!");
  await connectDB();
  await User.deleteMany();
  await Post.deleteMany();
  await Like.deleteMany();

  const registerRes = await request(app)
    .post("/api/auth/register")
    .send(testUser);
  expect(registerRes.status).toBe(201);

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send(testUser);
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.accessToken).toBeDefined();
  testUser.accessToken = loginRes.body.accessToken;
  testUser._id = loginRes.body.id;

  testPost = {
    userId: loginRes.body.id,
    content: "Test post for like",
  };

  const postRes = await request(app)
    .post("/api/post/createPost")
    .set("Authorization", `Bearer ${testUser.accessToken}`)
    .send(testPost);
  expect(postRes.status).toBe(201);
  expect(postRes.body).toHaveProperty("success");
  testPost._id = postRes.body.data._id;

  testLike = {
    userId: loginRes.body.id,
    postId: postRes.body.data._id,
  };
});

afterAll(async () => {
  console.log("Closing Like tests...");
  await User.deleteMany();
  await Post.deleteMany();
  await Like.deleteMany();
  await mongoose.connection.close();
});

const baseUrl = "/api/like";

describe("Like Endpoints", () => {
  test("Create like success", async () => {
    const res = await request(app)
      .post(baseUrl + "/createLike")
      .set("Authorization", `Bearer ${testUser.accessToken}`)
      .send(testLike);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data).toHaveProperty("_id");
    testLike._id = res.body.data._id;
  });

  test("Get likes by post id success", async () => {
    const res = await request(app)
      .get(baseUrl + "/getLikesByPostId/" + testPost._id)
      .set("Authorization", `Bearer ${testUser.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(Array.isArray(res.body.likes)).toBe(true);
    expect(res.body.likes.length).toBeGreaterThanOrEqual(1);
  });

  test("Delete like success", async () => {
    const res = await request(app)
      .delete(baseUrl + "/deleteLike/" + testLike._id)
      .set("Authorization", `Bearer ${testUser.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  test("Create like with invalid token", async () => {
    const res = await request(app)
      .post(baseUrl + "/createLike")
      .set("Authorization", `Bearer invalidToken`)
      .send(testLike);
    expect(res.status).toBe(401);
  });
});
