import request from "supertest";
import app, { connectDB } from "../server";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import User, { UserInterface } from "../models/user_model";
import Post, { PostInterface } from "../models/post_model";
import Like, { LikeInterface } from "../models/like_model";

let testUser: UserInterface & { accessToken?: string } = {
  email: "test@test.com",
  password: "testpassword",
};

let testPost: PostInterface;
let testLike: LikeInterface;

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  jest.setTimeout(30000);

  console.log("Jest starting Like tests!");

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

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
  if (mongoServer) {
    await mongoServer.stop();
  }
});

const baseUrl = "/api/like";

describe("Like Endpoints", () => {
  describe("POST /createLike", () => {
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

    test("Should fail if postId is missing", async () => {
      const res = await request(app)
        .post(baseUrl + "/createLike")
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send({ ...testLike, postId: "" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("Should fail if userId is missing (token not provided)", async () => {
      const res = await request(app)
        .post(baseUrl + "/createLike")
        .send(testLike);
      expect(res.status).toBe(401);
    });

    test("Should return 500 if Like.create throws error", async () => {
      const originalCreate = Like.create;
      jest.spyOn(Like, "create").mockImplementationOnce(() => {
        throw new Error("Simulated error in create");
      });
      const res = await request(app)
        .post(baseUrl + "/createLike")
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send(testLike);
      expect(res.status).toBe(500);
      Like.create = originalCreate;
    });
  });

  describe("GET /getLikesByPostId/:postId", () => {
    test("Get likes by post id success", async () => {
      const res = await request(app)
        .get(baseUrl + "/getLikesByPostId/" + testPost._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.likes)).toBe(true);
      expect(res.body.likes.length).toBeGreaterThanOrEqual(1);
    });

    test("Should return 200 and an empty array if no likes found for given postId", async () => {
      const fakePostId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(baseUrl + "/getLikesByPostId/" + fakePostId)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.likes)).toBe(true);
      expect(res.body.likes.length).toBe(0);
    });

    test("Should return 500 if Like.find throws error in getLikesByPostId", async () => {
      const originalFind = Like.find;
      jest.spyOn(Like, "find").mockImplementationOnce(() => {
        throw new Error("Simulated error in find");
      });
      const res = await request(app)
        .get(baseUrl + "/getLikesByPostId/" + testPost._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(500);
      Like.find = originalFind;
    });
  });

  describe("GET /getLikes", () => {
    test("Should get all likes", async () => {
      const res = await request(app)
        .get(baseUrl + "/getLikes")
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.likes)).toBe(true);
    });

    test("Should return 500 if Like.find throws error in getLikes", async () => {
      const originalFind = Like.find;
      jest.spyOn(Like, "find").mockImplementationOnce(() => {
        throw new Error("Simulated error in find");
      });
      const res = await request(app)
        .get(baseUrl + "/getLikes")
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(500);
      Like.find = originalFind;
    });
  });

  describe("DELETE /deleteLike/:likeId", () => {
    test("Delete like success", async () => {
      const createRes = await request(app)
        .post(baseUrl + "/createLike")
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send(testLike);
      expect(createRes.status).toBe(201);
      testLike._id = createRes.body.data._id;

      const res = await request(app)
        .delete(baseUrl + "/deleteLike/" + testLike._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("Should return 404 when deleting a non-existent like", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .delete(baseUrl + "/deleteLike/" + fakeId)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(404);
    });

    test("Should return 500 if Like.findByIdAndDelete throws error", async () => {
      const tempLike = await Like.create({
        userId: testUser._id,
        postId: testPost._id,
      });
      const originalFindByIdAndDelete = Like.findByIdAndDelete;
      jest.spyOn(Like, "findByIdAndDelete").mockImplementationOnce(() => {
        throw new Error("Simulated error in delete");
      });
      const res = await request(app)
        .delete(baseUrl + "/deleteLike/" + tempLike._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(500);
      Like.findByIdAndDelete = originalFindByIdAndDelete;
      await Like.findByIdAndDelete(tempLike._id);
    });
  });

  test("Create like with invalid token", async () => {
    const res = await request(app)
      .post(baseUrl + "/createLike")
      .set("Authorization", `Bearer invalidToken`)
      .send(testLike);
    expect(res.status).toBe(401);
  });
});
