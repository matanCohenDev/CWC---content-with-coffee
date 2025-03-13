import request from "supertest";
import app, { connectDB } from "../server";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import User, { UserInterface } from "../models/user_model";

interface ExtendedUser extends UserInterface {
  accessToken?: string;
  _id?: string;
}

let testUser: ExtendedUser = {
  email: "user@test.com",
  password: "testpassword",
};

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  jest.setTimeout(30000);
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  await connectDB();

  await User.deleteMany();

  const registerRes = await request(app).post("/api/auth/register").send(testUser);
  expect(registerRes.status).toBe(201);

  const loginRes = await request(app).post("/api/auth/login").send(testUser);
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.accessToken).toBeDefined();
  testUser.accessToken = loginRes.body.accessToken;
  testUser._id = loginRes.body.id;
});

afterAll(async () => {
  await User.deleteMany();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

const baseUrl = "/api/user";

describe("User Endpoints", () => {
  describe("GET /getUserById/:id", () => {
    test("Should get user by valid id", async () => {
      const res = await request(app)
        .get(baseUrl + "/getUserById/" + testUser._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", testUser._id);
      expect(res.body).toHaveProperty("email", testUser.email);
    });

    test("Should return 404 for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(baseUrl + "/getUserById/" + fakeId)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(404);
    });

    test("Should return 500 if User.findById throws error", async () => {
      const originalFindById = User.findById;
      jest.spyOn(User, "findById").mockImplementationOnce(() => {
        throw new Error("Simulated error in findById");
      });
      const res = await request(app)
        .get(baseUrl + "/getUserById/" + testUser._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(500);
      User.findById = originalFindById;
    });
  });

  describe("GET /getUsers", () => {
    test("Should return an array of users", async () => {
      const res = await request(app)
        .get(baseUrl + "/getUsers")
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    test("Should return 500 if User.find throws error", async () => {
      const originalFind = User.find;
      jest.spyOn(User, "find").mockImplementationOnce(() => {
        throw new Error("Simulated error in find");
      });
      const res = await request(app)
        .get(baseUrl + "/getUsers")
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(500);
      User.find = originalFind;
    });
  });

  describe("DELETE /deleteUser/:id", () => {
    let tempUser: ExtendedUser;
    beforeEach(async () => {
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send({
          email: "temp@test.com",
          password: "temppassword",
        });
      expect(registerRes.status).toBe(201);
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "temp@test.com",
          password: "temppassword",
        });
      expect(loginRes.status).toBe(200);
      tempUser = {
        email: "temp@test.com",
        password: "temppassword",
        accessToken: loginRes.body.accessToken,
        _id: loginRes.body.id,
      };
    });

    test("Should delete existing user successfully", async () => {
      const res = await request(app)
        .delete(baseUrl + "/deleteUser/" + tempUser._id)
        .set("Authorization", `Bearer ${tempUser.accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "User deleted successfully");

      const res2 = await request(app)
        .delete(baseUrl + "/deleteUser/" + tempUser._id)
        .set("Authorization", `Bearer ${tempUser.accessToken}`);
      expect(res2.status).toBe(404);
    });

    test("Should return 500 if User.findByIdAndDelete throws error", async () => {
      const originalFindByIdAndDelete = User.findByIdAndDelete;
      jest.spyOn(User, "findByIdAndDelete").mockImplementationOnce(() => {
        throw new Error("Simulated error in deleteUser");
      });
      const res = await request(app)
        .delete(baseUrl + "/deleteUser/" + testUser._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(res.status).toBe(500);
      User.findByIdAndDelete = originalFindByIdAndDelete;
    });
  });

  describe("PUT /updateUser/:id", () => {
    test("Should update an existing user successfully", async () => {
      const newData = { name: "Updated Name", bio: "New bio" };
      const res = await request(app)
        .put(baseUrl + "/updateUser/" + testUser._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send(newData);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "User updated successfully");

      const getRes = await request(app)
        .get(baseUrl + "/getUserById/" + testUser._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body).toHaveProperty("name", newData.name);
      expect(getRes.body).toHaveProperty("bio", newData.bio);
    });

    test("Should return 404 when updating a non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .put(baseUrl + "/updateUser/" + fakeId)
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send({ name: "No User" });
      expect(res.status).toBe(404);
    });

    test("Should return 500 if User.findByIdAndUpdate throws error", async () => {
      const originalFindByIdAndUpdate = User.findByIdAndUpdate;
      jest.spyOn(User, "findByIdAndUpdate").mockImplementationOnce(() => {
        throw new Error("Simulated error in updateUser");
      });
      const res = await request(app)
        .put(baseUrl + "/updateUser/" + testUser._id)
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send({ name: "Error User" });
      expect(res.status).toBe(500);
      User.findByIdAndUpdate = originalFindByIdAndUpdate;
    });
  });
});
