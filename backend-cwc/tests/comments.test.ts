import request from "supertest";
import app, { connectDB } from "../server";
import User, { UserInterface } from "../models/user_model";
import Post, { PostInterface } from "../models/post_model";
import Comment, { CommentInterface } from "../models/comment_model";
import mongoose from "mongoose";

const testUser: UserInterface & { accessToken?: string } = {
  email: "test@gmail.com",
  password: "testpassword",
};

let testPost: PostInterface;
let testComment: CommentInterface;

beforeAll(async () => {
  console.log("Jest starting!");
  await connectDB();
  await User.deleteMany();
  await Post.deleteMany();
  await Comment.deleteMany();

  const registerRes = await request(app).post("/api/auth/register").send(testUser);
  expect(registerRes.status).toBe(201);

  const loginRes = await request(app).post("/api/auth/login").send(testUser);
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.accessToken).toBeDefined();
  testUser.accessToken = loginRes.body.accessToken;
  testUser._id = loginRes.body.id;

  testPost = {
    userId: loginRes.body.id,
    content: "Test post content",
  };

  const postRes = await request(app)
    .post("/api/post/createPost")
    .set("Authorization", `Bearer ${testUser.accessToken}`)
    .send(testPost);
  expect(postRes.status).toBe(201);
  testPost._id = postRes.body.data._id;

  testComment = {
    userId: loginRes.body.id,
    postId: postRes.body.data._id,
    content: "Initial test comment",
  };
});

afterAll(async () => {
  console.log("Closing server...");
  await User.deleteMany();
  await Post.deleteMany();
  await Comment.deleteMany();
  await mongoose.connection.close();
});

const baseUrl = "/api/comment";

describe("Comment Endpoints", () => {
  describe("POST /createComment", () => {
    test("Should create a comment successfully", async () => {
      const res = await request(app)
        .post(baseUrl + "/createComment")
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send(testComment);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("_id");
      testComment._id = res.body.data._id;
    });

    test("Should fail if content is missing", async () => {
      const res = await request(app)
        .post(baseUrl + "/createComment")
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send({ ...testComment, content: "" });
      expect(res.status).toBe(400);
      expect(res.body).not.toHaveProperty("success");
    });

    test("Should fail if userId is missing (implicitly set by middleware)", async () => {
      const res = await request(app)
        .post(baseUrl + "/createComment")
        .send({ ...testComment, userId: "" });
      expect(res.status).toBe(401);
    });

    test("Should fail if postId is missing", async () => {
      const res = await request(app)
        .post(baseUrl + "/createComment")
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send({ ...testComment, postId: "" });
      expect(res.status).toBe(400);
    });

    test("Should fail with invalid token", async () => {
      const res = await request(app)
        .post(baseUrl + "/createComment")
        .set("Authorization", `Bearer invalid_token`)
        .send(testComment);
      expect(res.status).toBe(401);
    });
  });

  describe("GET /getComments", () => {
    test("Should get all comments", async () => {
      const res = await request(app).get(baseUrl + "/getComments");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.comments)).toBe(true);
      expect(res.body.comments.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("GET /getCommentById/:commentId", () => {
    test("Should get comment by id", async () => {
      const res = await request(app).get(baseUrl + "/getCommentById/" + testComment._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.comment).toHaveProperty("_id", testComment._id);
    });

    test("Should return 404 for non-existent comment", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(baseUrl + "/getCommentById/" + fakeId);
      expect(res.status).toBe(404);
    });
  });

  describe("GET /getCommentsByPostId/:postId", () => {
    test("Should get comments for a specific post", async () => {
      const res = await request(app)
        .get(baseUrl + "/getCommentsByPostId/" + testComment.postId)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.comments)).toBe(true);
      expect(res.body.comments.length).toBeGreaterThanOrEqual(1);
    });

    test("Should return 404 if no comments for given postId", async () => {
      const fakePostId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(baseUrl + "/getCommentsByPostId/" + fakePostId)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /updateComment/:commentId", () => {
    test("Should update comment content successfully", async () => {
      const updatedContent = "Updated test comment";
      const res = await request(app)
        .put(baseUrl + "/updateComment/" + testComment._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send({ content: updatedContent });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("Should fail update with missing content", async () => {
      const res = await request(app)
        .put(baseUrl + "/updateComment/" + testComment._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send({ content: "" });
      expect(res.status).not.toBe(200);
    });

    test("Should fail update if comment not found", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .put(baseUrl + "/updateComment/" + fakeId)
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send({ content: "Attempt update" });
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /deleteComment/:commentId", () => {
    test("Should delete comment successfully", async () => {
      const res = await request(app)
        .delete(baseUrl + "/deleteComment/" + testComment._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("Should return 404 when trying to delete already deleted comment", async () => {
      const res = await request(app)
        .delete(baseUrl + "/deleteComment/" + testComment._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe("GET /getComments after deletion", () => {
    test("Should return empty comment list after deletion", async () => {
      const res = await request(app).get(baseUrl + "/getComments");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.comments)).toBe(true);
      expect(res.body.comments.length).toBe(0);
    });
  });
});
