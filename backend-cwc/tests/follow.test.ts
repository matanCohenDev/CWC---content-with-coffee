import request from "supertest";
import app, { connectDB } from "../server";
import User, { UserInterface } from "../models/user_model";
import Follow from "../models/follow_model";
import mongoose from "mongoose";

interface ExtendedUser extends UserInterface {
  accessToken?: string;
  _id?: string;
}

let user1: ExtendedUser = {
  email: "user1@test.com",
  password: "password1",
};

let user2: ExtendedUser = {
  email: "user2@test.com",
  password: "password2",
};

beforeAll(async () => {
  console.log("Starting Follow tests...");
  await connectDB();
  await User.deleteMany();
  await Follow.deleteMany();

  let res = await request(app).post("/api/auth/register").send(user1);
  expect(res.status).toBe(201);
  res = await request(app).post("/api/auth/login").send(user1);
  expect(res.status).toBe(200);
  expect(res.body.accessToken).toBeDefined();
  user1.accessToken = res.body.accessToken;
  user1._id = res.body.id;

  res = await request(app).post("/api/auth/register").send(user2);
  expect(res.status).toBe(201);
  res = await request(app).post("/api/auth/login").send(user2);
  expect(res.status).toBe(200);
  expect(res.body.accessToken).toBeDefined();
  user2.accessToken = res.body.accessToken;
  user2._id = res.body.id;
});

afterAll(async () => {
  console.log("Closing Follow tests...");
  await User.deleteMany();
  await Follow.deleteMany();
  await mongoose.connection.close();
});

const baseUrl = "/api/follow";

describe("Follow Endpoints", () => {
  test("User1 successfully follows User2", async () => {
    const res = await request(app)
      .post(baseUrl + "/follow")
      .set("Authorization", `Bearer ${user1.accessToken}`)
      .send({ followingId: user2._id });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Followed");
  });

  test("User1 cannot follow User2 twice", async () => {
    const res = await request(app)
      .post(baseUrl + "/follow")
      .set("Authorization", `Bearer ${user1.accessToken}`)
      .send({ followingId: user2._id });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Already following");
  });

  test("Get all followers for User2", async () => {
    const res = await request(app).get(baseUrl + `/followers/${user2._id}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    const followerIds = res.body.map((entry: any) => entry.followerId);
    expect(followerIds).toContain(user1._id);
  });

  test("Get all following for User1", async () => {
    const res = await request(app).get(baseUrl + `/following/${user1._id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("following");
    expect(Array.isArray(res.body.following)).toBe(true);
    expect(res.body.following.length).toBeGreaterThanOrEqual(1);
    const followingIds = res.body.following.map((entry: any) => entry.followingId);
    expect(followingIds).toContain(user2._id);
  });

  test("User1 successfully unfollows User2", async () => {
    const res = await request(app)
      .post(baseUrl + "/unfollow")
      .set("Authorization", `Bearer ${user1.accessToken}`)
      .send({ followingId: user2._id });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Successfully unfollowed");
    expect(res.body).toHaveProperty("success", true);
  });

  test("Unfollowing when not following returns error", async () => {
    const res = await request(app)
      .post(baseUrl + "/unfollow")
      .set("Authorization", `Bearer ${user1.accessToken}`)
      .send({ followingId: user2._id });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Not following");
  });

  test("Get followers for User2 returns empty after unfollow", async () => {
    const res = await request(app).get(baseUrl + `/followers/${user2._id}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test("Get following for User1 returns empty after unfollow", async () => {
    const res = await request(app).get(baseUrl + `/following/${user1._id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("following");
    expect(Array.isArray(res.body.following)).toBe(true);
    expect(res.body.following.length).toBe(0);
  });

  test("Follow endpoint fails with missing followingId", async () => {
    const res = await request(app)
      .post(baseUrl + "/follow")
      .set("Authorization", `Bearer ${user1.accessToken}`)
      .send({ followingId: "" });
    expect(res.status).toBe(400);
  });

  test("Follow endpoint fails without authentication", async () => {
    const res = await request(app)
      .post(baseUrl + "/follow")
      .send({ followingId: user2._id });
    expect(res.status).toBe(401);
  });
});
