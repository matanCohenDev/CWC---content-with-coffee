import request from "supertest";
import app, { connectDB } from "../server";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import User, { UserInterface } from "../models/user_model";
import Follow from "../models/follow_model";

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

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  jest.setTimeout(30000);

  console.log("Starting Follow tests...");

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
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
  if (mongoServer) {
    await mongoServer.stop();
  }
});

const baseUrl = "/api/follow";

describe("Follow Endpoints", () => {
  test("User1 successfully follows User2", async () => {
    await Follow.deleteMany({ followerId: user1._id, followingId: user2._id });

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

  test("Simulate error during follow (during Follow.prototype.save)", async () => {
    await Follow.deleteMany({ followerId: user1._id, followingId: user2._id });

    const originalSave = Follow.prototype.save;
    Follow.prototype.save = jest.fn().mockImplementationOnce(() => {
      throw new Error("Simulated save error");
    });

    const res = await request(app)
      .post(baseUrl + "/follow")
      .set("Authorization", `Bearer ${user1.accessToken}`)
      .send({ followingId: user2._id });
    expect(res.status).toBe(500);

    Follow.prototype.save = originalSave;
  });

  
  test("Re-follow User2 after simulation error", async () => {
    await Follow.deleteMany({ followerId: user1._id, followingId: user2._id });
    const res = await request(app)
      .post(baseUrl + "/follow")
      .set("Authorization", `Bearer ${user1.accessToken}`)
      .send({ followingId: user2._id });
    expect(res.status).toBe(200);
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

  test("Simulate error when incrementing user counters", async () => {
    
    await Follow.deleteMany({ followerId: user1._id, followingId: user2._id });

    const originalUserSave = User.prototype.save;
    User.prototype.save = jest.fn().mockImplementationOnce(() => {
      throw new Error("Simulated error in user.save");
    });

    const res = await request(app)
      .post(baseUrl + "/follow")
      .set("Authorization", `Bearer ${user1.accessToken}`)
      .send({ followingId: user2._id });
    expect(res.status).toBe(500);

    User.prototype.save = originalUserSave;
  });

  test("User1 successfully unfollows User2", async () => {
    await Follow.deleteMany({ followerId: user1._id, followingId: user2._id });
    await Follow.create({ followerId: user1._id, followingId: user2._id });

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

  test("Unfollow endpoint fails without authentication", async () => {
    const res = await request(app)
      .post(baseUrl + "/unfollow")
      .send({ followingId: user2._id });
    expect(res.status).toBe(401);
  });

  test("Simulate error during unfollow when retrieving followingUser", async () => {
    await Follow.deleteMany({ followerId: user1._id, followingId: user2._id });
    await Follow.create({ followerId: user1._id, followingId: user2._id });

    const originalFindById = User.findById;
    User.findById = jest.fn().mockImplementationOnce(() => {
      throw new Error("Simulated error in findById");
    });

    const res = await request(app)
      .post(baseUrl + "/unfollow")
      .set("Authorization", `Bearer ${user1.accessToken}`)
      .send({ followingId: user2._id });
    expect(res.status).toBe(500);

    User.findById = originalFindById;
  });

  test("getAllFollowersByUserId returns 500 if Follow.find throws error", async () => {
    const originalFind = Follow.find;
    Follow.find = jest.fn().mockImplementationOnce(() => {
      throw new Error("Simulated error");
    });
    const res = await request(app).get(baseUrl + `/followers/${user2._id}`);
    expect(res.status).toBe(500);
    Follow.find = originalFind;
  });

  test("getAllFollowingByUserId returns 500 if Follow.find throws error", async () => {
    const originalFind = Follow.find;
    Follow.find = jest.fn().mockImplementationOnce(() => {
      throw new Error("Simulated error");
    });
    const res = await request(app).get(baseUrl + `/following/${user1._id}`);
    expect(res.status).toBe(500);
    Follow.find = originalFind;
  });
});
