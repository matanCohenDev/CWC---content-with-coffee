import request from "supertest";
import app, { connectDB } from "../server";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import Post, { PostInterface } from "../models/post_model";
import User, { UserInterface } from "../models/user_model";

const testUser: UserInterface & { accessToken?: string } = {
  email: "test@test.com",
  password: "testpassword",
};

let testPost: PostInterface;
let nonExistentPostId = new mongoose.Types.ObjectId().toString(); // For 404 tests
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  jest.setTimeout(30000);

  console.log("Jest starting!");

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  await connectDB();

  await Post.deleteMany();
  await User.deleteMany();

  await request(app).post("/api/auth/register").send(testUser);
  const response = await request(app).post("/api/auth/login").send(testUser);
  expect(response.status).toBe(200);

  testUser.accessToken = response.body.accessToken;
  testUser._id = response.body.id;
  expect(testUser.accessToken).toBeDefined();

  testPost = {
    userId: testUser._id!,
    content: "test content",
  };
});

afterAll(async () => {
  console.log("Server closing");
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

const baseUrl = "/api/post";

describe("Post Endpoints (original tests)", () => {
  test("Create post success", async () => {
    const response = await request(app)
      .post(baseUrl + "/createPost")
      .set("Authorization", `Bearer ${testUser.accessToken}`)
      .send(testPost);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("_id");
    testPost._id = response.body.data._id;
  });

  test("Create post fail by missing content", async () => {
    const response = await request(app)
      .post(baseUrl + "/createPost")
      .set("Authorization", `Bearer ${testUser.accessToken}`)
      .send({ ...testPost, content: "" });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });

  test("Create post fail by missing userId", async () => {
    const response = await request(app)
      .post(baseUrl + "/createPost")
      .send({ ...testPost });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Access Denied: Token missing");
  });

  test("Get all posts", async () => {
    const response = await request(app).get(baseUrl + "/getPosts");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(Array.isArray(response.body.posts)).toBe(true);
    expect(response.body.posts.length).toBe(1);
  });

  test("Get post by userId", async () => {
    const response = await request(app)
      .get(baseUrl + "/getPostByUserId/" + testUser._id)
      .set("Authorization", `Bearer ${testUser.accessToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(Array.isArray(response.body.posts)).toBe(true);
    expect(response.body.posts.length).toBe(1);
  });

  test("Get post by id", async () => {
    const response = await request(app).get(baseUrl + "/getPostById/" + testPost._id);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.post).toHaveProperty("_id", testPost._id);
  });

  test("Update post by id", async () => {
    const updatedContent = "updated content";
    const response = await request(app)
      .put(baseUrl + "/updatePostById/" + testPost._id)
      .set("Authorization", `Bearer ${testUser.accessToken}`)
      .send({ content: updatedContent });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data.content).toBe(updatedContent);
  });

  test("Delete post by id", async () => {
    const response = await request(app)
      .delete(baseUrl + "/deletePostById/" + testPost._id)
      .set("Authorization", `Bearer ${testUser.accessToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
  });

  test("Get all posts after delete", async () => {
    const response = await request(app).get(baseUrl + "/getPosts");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(Array.isArray(response.body.posts)).toBe(true);
    expect(response.body.posts.length).toBe(0);
  });

  test("Create post with invalid token", async () => {
    const response = await request(app)
      .post(baseUrl + "/createPost")
      .set("Authorization", "Bearer invalid_token")
      .send(testPost);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Access Denied: Invalid token");
  });
});

describe("Additional Post Route Tests (like/comment)", () => {
  let postIdForActions: string = "";

  beforeAll(async () => {
    const response = await request(app)
      .post(baseUrl + "/createPost")
      .set("Authorization", `Bearer ${testUser.accessToken}`)
      .send({ userId: testUser._id, content: "Post for like/comment" });
    expect(response.status).toBe(201);
    postIdForActions = response.body.data._id;
  });

  test("like a post success", async () => {
    const res = await request(app)
      .post(`${baseUrl}/likePost/${postIdForActions}`)
      .set("Authorization", `Bearer ${testUser.accessToken}`)
      .send();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data.likesCount).toBe(1);
  });

  test("like a post invalid token => 401", async () => {
    const res = await request(app)
      .post(`${baseUrl}/likePost/${postIdForActions}`)
      .set("Authorization", "Bearer invalid_token")
      .send();
    expect(res.status).toBe(401);
  });

  test("like a non-existent post => 404", async () => {
    const res = await request(app)
      .post(`${baseUrl}/likePost/${nonExistentPostId}`)
      .set("Authorization", `Bearer ${testUser.accessToken}`)
      .send();
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("success", false);
  });

  test("remove like success", async () => {
    const res = await request(app)
      .delete(`${baseUrl}/removeLike/${postIdForActions}`)
      .set("Authorization", `Bearer ${testUser.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data.likesCount).toBe(0);
  });

  test("remove like invalid token => 401", async () => {
    const res = await request(app)
      .delete(`${baseUrl}/removeLike/${postIdForActions}`)
      .set("Authorization", "Bearer invalid_token");
    expect(res.status).toBe(401);
  });

  test("remove like from non-existent post => 404", async () => {
    const res = await request(app)
      .delete(`${baseUrl}/removeLike/${nonExistentPostId}`)
      .set("Authorization", `Bearer ${testUser.accessToken}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("success", false);
  });

  test("commentPost success", async () => {
    const res = await request(app)
      .post(`${baseUrl}/commentPost/${postIdForActions}`)
      .set("Authorization", `Bearer ${testUser.accessToken}`)
      .send();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data.commentsCount).toBe(1);
  });

  test("commentPost invalid token => 401", async () => {
    const res = await request(app)
      .post(`${baseUrl}/commentPost/${postIdForActions}`)
      .set("Authorization", "Bearer invalid_token");
    expect(res.status).toBe(401);
  });

  test("commentPost on non-existent post => 404", async () => {
    const res = await request(app)
      .post(`${baseUrl}/commentPost/${nonExistentPostId}`)
      .set("Authorization", `Bearer ${testUser.accessToken}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("success", false);
  });

  test("removeComment success", async () => {
    const res = await request(app)
      .delete(`${baseUrl}/removeComment/${postIdForActions}`)
      .set("Authorization", `Bearer ${testUser.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data.commentsCount).toBe(0);
  });

  test("removeComment invalid token => 401", async () => {
    const res = await request(app)
      .delete(`${baseUrl}/removeComment/${postIdForActions}`)
      .set("Authorization", "Bearer invalid_token");
    expect(res.status).toBe(401);
  });

  test("removeComment on non-existent post => 404", async () => {
    const res = await request(app)
      .delete(`${baseUrl}/removeComment/${nonExistentPostId}`)
      .set("Authorization", `Bearer ${testUser.accessToken}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("success", false);
  });

  test("like post with invalid ID format => 404 or 500", async () => {
    const res = await request(app)
      .post(`${baseUrl}/likePost/abc123`)
      .set("Authorization", `Bearer ${testUser.accessToken}`);
    expect([404, 500]).toContain(res.status);
  });
});


describe("Extra Error Simulation for Post Controller", () => {
  test("Simulate error in Post.create", async () => {
    const originalCreate = Post.create;
    jest.spyOn(Post, "create").mockImplementationOnce(() => {
      throw new Error("Simulated error in Post.create");
    });

    const response = await request(app)
      .post(baseUrl + "/createPost")
      .set("Authorization", `Bearer ${testUser.accessToken}`)
      .send({ userId: testUser._id, content: "Error test" });
    expect(response.status).toBe(500);

    Post.create = originalCreate;
  });

  test("Simulate error in User.findById when creating a post", async () => {
    const originalFindById = User.findById;
    jest.spyOn(User, "findById").mockImplementationOnce(() => {
      throw new Error("Simulated error in User.findById");
    });

    const response = await request(app)
      .post(baseUrl + "/createPost")
      .set("Authorization", `Bearer ${testUser.accessToken}`)
      .send({ userId: testUser._id, content: "User find error" });
    expect(response.status).toBe(500);

    User.findById = originalFindById;
  });

  test("Simulate error in Post.findById for updatePostById", async () => {
    const originalFindById = Post.findById;
    jest.spyOn(Post, "findById").mockImplementationOnce(() => {
      throw new Error("Simulated error in Post.findById");
    });

    const response = await request(app)
      .put(baseUrl + "/updatePostById/abc123")
      .set("Authorization", `Bearer ${testUser.accessToken}`)
      .send({ content: "No update" });
    expect([500, 404]).toContain(response.status);

    Post.findById = originalFindById;
  });

  test("Simulate error in post.save during updatePostById", async () => {
    const createRes = await request(app)
      .post(baseUrl + "/createPost")
      .set("Authorization", `Bearer ${testUser.accessToken}`)
      .send({ userId: testUser._id, content: "Post to be updated" });
    expect(createRes.status).toBe(201);

    const postId = createRes.body.data._id;
    const postInstance = await Post.findById(postId);
    if (!postInstance) throw new Error("Post was not created as expected.");

    const originalSave = postInstance.save;
    postInstance.save = jest.fn().mockImplementationOnce(() => {
      throw new Error("Simulated error in post.save");
    });

    jest.spyOn(Post, "findById").mockResolvedValueOnce(postInstance as any);

    const updateRes = await request(app)
      .put(baseUrl + `/updatePostById/${postId}`)
      .set("Authorization", `Bearer ${testUser.accessToken}`)
      .send({ content: "New content" });

    expect(updateRes.status).toBe(500);

    postInstance.save = originalSave;
    jest.restoreAllMocks();
  });
});
