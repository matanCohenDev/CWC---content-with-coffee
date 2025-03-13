import request from "supertest";
import app, { connectDB } from "../server";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import User, { UserInterface } from "../models/user_model";
import Post, { PostInterface } from "../models/post_model";
import Comment, { CommentInterface } from "../models/comment_model";

const testUser: UserInterface & { accessToken?: string } = {
  email: "test@gmail.com",
  password: "testpassword",
};

let testPost: PostInterface;
let testComment: CommentInterface;

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  jest.setTimeout(30000);

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

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
    userId: testUser._id!,
    content: "Test post content",
  };
  const postRes = await request(app)
    .post("/api/post/createPost")
    .set("Authorization", `Bearer ${testUser.accessToken}`)
    .send(testPost);
  expect(postRes.status).toBe(201);
  testPost._id = postRes.body.data._id;

  testComment = {
    userId: testUser._id!,
    postId: testPost._id!,
    content: "Initial test comment",
  };
  const commentRes = await request(app)
    .post("/api/comment/createComment")
    .set("Authorization", `Bearer ${testUser.accessToken}`)
    .send(testComment);
  expect(commentRes.status).toBe(201);
  testComment._id = commentRes.body.data._id;
});

afterAll(async () => {
  // Clean up
  await User.deleteMany();
  await Post.deleteMany();
  await Comment.deleteMany();

  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

const baseUrl = "/api/comment";

describe("Comment Endpoints", () => {
  describe("POST /createComment", () => {
    test("Should create a comment successfully", async () => {
      const newComment = {
        userId: testUser._id!,
        postId: testPost._id!,
        content: "A new comment for testing create",
      };
      const res = await request(app)
        .post(baseUrl + "/createComment")
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send(newComment);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("_id");
    });

    test("Should fail if content is missing", async () => {
      const res = await request(app)
        .post(baseUrl + "/createComment")
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send({ ...testComment, content: "" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
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

    test("Should return 500 if Comment.create throws an error", async () => {
      jest.spyOn(Comment, "create").mockImplementationOnce(() => {
        throw new Error("Simulated error");
      });
      const res = await request(app)
        .post(baseUrl + "/createComment")
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send(testComment);
      expect(res.status).toBe(500);
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

    test("Should return 500 if Comment.find throws error", async () => {
      jest.spyOn(Comment, "find").mockImplementationOnce(() => {
        throw new Error("Simulated error");
      });
      const res = await request(app).get(baseUrl + "/getComments");
      expect(res.status).toBe(500);
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

    test("Should return 500 if Comment.findById throws error", async () => {
      jest.spyOn(Comment, "findById").mockImplementationOnce(() => {
        throw new Error("Simulated error");
      });
      const res = await request(app).get(baseUrl + "/getCommentById/" + testComment._id);
      expect(res.status).toBe(500);
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

    test("Should return 500 if Comment.find throws error in getCommentsByPostId", async () => {
      jest.spyOn(Comment, "find").mockImplementationOnce(() => {
        throw new Error("Simulated error");
      });
      const res = await request(app)
        .get(baseUrl + "/getCommentsByPostId/" + testPost._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(500);
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

    test("Should fail update if not authorized (userId mismatch)", async () => {
      const fakeUserId = new mongoose.Types.ObjectId().toString();
      const otherComment = await Comment.create({
        userId: fakeUserId,
        postId: testPost._id,
        content: "Comment from another user",
      });
      const res = await request(app)
        .put(baseUrl + "/updateComment/" + otherComment._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send({ content: "Trying unauthorized update" });
      expect(res.status).toBe(403);
    });

    test("Should return 500 if Comment.findById throws error in updateComment", async () => {
      jest.spyOn(Comment, "findById").mockImplementationOnce(() => {
        throw new Error("Simulated error");
      });
      const res = await request(app)
        .put(baseUrl + "/updateComment/" + testComment._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send({ content: "new content" });
      expect(res.status).toBe(500);
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

    test("Should return 500 if Comment.findByIdAndDelete throws error", async () => {
      const tempComment = await Comment.create({
        userId: testUser._id,
        postId: testPost._id,
        content: "Temporary comment",
      });
      jest.spyOn(Comment, "findByIdAndDelete").mockImplementationOnce(() => {
        throw new Error("Simulated error");
      });
      const res = await request(app)
        .delete(baseUrl + "/deleteComment/" + tempComment._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(500);
      await Comment.findByIdAndDelete(tempComment._id);
    });
  });

  describe("GET /getComments after deletion", () => {
    test("Should not return the deleted comment", async () => {
      const res = await request(app).get(baseUrl + "/getComments");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.comments)).toBe(true);
      const deletedCommentExists = res.body.comments.some(
        (c: any) => c._id === testComment._id
      );
      expect(deletedCommentExists).toBe(false);
    });
  });
});
