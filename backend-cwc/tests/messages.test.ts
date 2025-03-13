import request from "supertest";
import app, { connectDB } from "../server";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import Message, { MessageInterface } from "../models/messages_model";
import User, { UserInterface } from "../models/user_model";

const testUser1: UserInterface & { accessToken?: string } = {
  email: "testuser1@test.com",
  password: "testpassword",
};

const testUser2: UserInterface & { accessToken?: string } = {
  email: "testuser2@test.com",
  password: "testpassword",
};

let testMessage1: MessageInterface;
let testMessage2: MessageInterface;

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  jest.setTimeout(30000);
  console.log("Jest starting!");

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  await connectDB();

  await User.deleteMany();
  await Message.deleteMany();

  let res = await request(app).post("/api/auth/register").send(testUser1);
  expect(res.status).toBe(201);

  res = await request(app).post("/api/auth/login").send(testUser1);
  expect(res.status).toBe(200);
  testUser1.accessToken = res.body.accessToken;
  testUser1._id = res.body.id;

  res = await request(app).post("/api/auth/register").send(testUser2);
  expect(res.status).toBe(201);

  res = await request(app).post("/api/auth/login").send(testUser2);
  expect(res.status).toBe(200);
  testUser2.accessToken = res.body.accessToken;
  testUser2._id = res.body.id;

  testMessage1 = {
    senderId: testUser1._id!,
    receiverId: testUser2._id!,
    content: "Hello from user1 to user2",
    messageRead: false,
  };

  testMessage2 = {
    senderId: testUser2._id!,
    receiverId: testUser1._id!,
    content: "Reply from user2 to user1",
    messageRead: false,
  };
});

afterAll(async () => {
  console.log("Closing server...");

  await User.deleteMany();
  await Message.deleteMany();

  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

const baseUrl = "/api/message";

describe("Messages Endpoints", () => {
  describe("POST /SendMessage", () => {
    test("Send a message from user1 to user2", async () => {
      const res = await request(app)
        .post(baseUrl + "/SendMessage")
        .set("Authorization", `Bearer ${testUser1.accessToken}`)
        .send(testMessage1);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("messageId");
      testMessage1.messageId = res.body.messageId;
    });

    test("Send a message from user2 to user1", async () => {
      const res = await request(app)
        .post(baseUrl + "/SendMessage")
        .set("Authorization", `Bearer ${testUser2.accessToken}`)
        .send(testMessage2);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("messageId");
      testMessage2.messageId = res.body.messageId;
    });

    test("Fail to send a message with missing content", async () => {
      const res = await request(app)
        .post(baseUrl + "/SendMessage")
        .set("Authorization", `Bearer ${testUser1.accessToken}`)
        .send({ senderId: testUser1._id, receiverId: testUser2._id });
      expect(res.status).toBe(400);
    });

    test("Should return 500 if Message.create throws error in SendMessage", async () => {
      const originalCreate = Message.create;
      jest.spyOn(Message, "create").mockImplementationOnce(() => {
        throw new Error("Simulated error in Message.create");
      });
      const res = await request(app)
        .post(baseUrl + "/SendMessage")
        .set("Authorization", `Bearer ${testUser1.accessToken}`)
        .send({ senderId: testUser1._id, receiverId: testUser2._id, content: "Test error" });
      expect(res.status).toBe(500);
      Message.create = originalCreate;
    });

    test("Fail to send message without authentication", async () => {
      const res = await request(app)
        .post(baseUrl + "/SendMessage")
        .send(testMessage1);
      expect(res.status).toBe(401);
    });
  });

  describe("GET /GetAllMessages", () => {
    test("Get all messages for user1", async () => {
      const res = await request(app)
        .get(baseUrl + "/GetAllMessages")
        .query({ userId: testUser1._id })
        .set("Authorization", `Bearer ${testUser1.accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data.length).toBe(2);
    });

    test("Fail to get messages with missing userId", async () => {
      const res = await request(app)
        .get(baseUrl + "/GetAllMessages")
        .set("Authorization", `Bearer ${testUser1.accessToken}`);
      expect(res.status).toBe(400);
    });

    test("Should return 500 if Message.find throws error in GetAllMessages", async () => {
      const originalFind = Message.find;
      jest.spyOn(Message, "find").mockImplementationOnce(() => {
        throw new Error("Simulated error in Message.find");
      });
      const res = await request(app)
        .get(baseUrl + "/GetAllMessages")
        .query({ userId: testUser1._id })
        .set("Authorization", `Bearer ${testUser1.accessToken}`);
      expect(res.status).toBe(500);
      Message.find = originalFind;
    });
  });

  describe("GET /GetMessagesBetweenUsers", () => {
    test("Get messages exchanged between user1 and user2", async () => {
      const res = await request(app)
        .get(baseUrl + "/GetMessagesBetweenUsers")
        .query({ senderId: testUser1._id, receiverId: testUser2._id })
        .set("Authorization", `Bearer ${testUser2.accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    test("Fail to get messages between users with missing senderId", async () => {
      const res = await request(app)
        .get(baseUrl + "/GetMessagesBetweenUsers")
        .query({ receiverId: testUser2._id })
        .set("Authorization", `Bearer ${testUser1.accessToken}`);
      expect(res.status).toBe(400);
    });

    test("Should return 500 if Message.find throws error in GetMessagesBetweenUsers", async () => {
      const originalFind = Message.find;
      jest.spyOn(Message, "find").mockImplementationOnce(() => {
        throw new Error("Simulated error in Message.find");
      });
      const res = await request(app)
        .get(baseUrl + "/GetMessagesBetweenUsers")
        .query({ senderId: testUser1._id, receiverId: testUser2._id })
        .set("Authorization", `Bearer ${testUser2.accessToken}`);
      expect(res.status).toBe(500);
      Message.find = originalFind;
    });
  });

  describe("PUT /MarkMessageAsRead", () => {
    test("Mark message as read", async () => {
      const res = await request(app)
        .put(baseUrl + "/MarkMessageAsRead")
        .set("Authorization", `Bearer ${testUser1.accessToken}`)
        .send({ messageId: testMessage2.messageId });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);

      const getRes = await request(app)
        .get(baseUrl + "/GetMessagesBetweenUsers")
        .query({ senderId: testUser2._id, receiverId: testUser1._id })
        .set("Authorization", `Bearer ${testUser1.accessToken}`);
      expect(getRes.status).toBe(200);
      const updatedMessage = getRes.body.data.find(
        (msg: any) => msg._id === testMessage2.messageId
      );
      expect(updatedMessage).toBeDefined();
      expect(updatedMessage.messageRead).toBe(true);
    });

    test("Fail to mark message as read with missing messageId", async () => {
      const res = await request(app)
        .put(baseUrl + "/MarkMessageAsRead")
        .set("Authorization", `Bearer ${testUser1.accessToken}`)
        .send({});
      expect(res.status).toBe(400);
    });

    test("Should return 500 if Message.findById throws error in MarkMessageAsRead", async () => {
      const originalFindById = Message.findById;
      jest.spyOn(Message, "findById").mockImplementationOnce(() => {
        throw new Error("Simulated error in findById");
      });
      const res = await request(app)
        .put(baseUrl + "/MarkMessageAsRead")
        .set("Authorization", `Bearer ${testUser1.accessToken}`)
        .send({ messageId: testMessage2.messageId });
      expect(res.status).toBe(500);
      Message.findById = originalFindById;
    });
  });

  describe("DELETE /DeleteMessage", () => {
    test("Delete a message", async () => {
      const res = await request(app)
        .delete(baseUrl + "/DeleteMessage")
        .set("Authorization", `Bearer ${testUser1.accessToken}`)
        .send({ messageId: testMessage2.messageId });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);

      const getRes = await request(app)
        .get(baseUrl + "/GetMessagesBetweenUsers")
        .query({ senderId: testUser2._id, receiverId: testUser1._id })
        .set("Authorization", `Bearer ${testUser1.accessToken}`);
      expect(getRes.status).toBe(200);
      const deletedMsg = getRes.body.data.find(
        (msg: any) => msg._id === testMessage2.messageId
      );
      expect(deletedMsg).toBeUndefined();
    });

    test("Fail to delete message with missing messageId", async () => {
      const res = await request(app)
        .delete(baseUrl + "/DeleteMessage")
        .set("Authorization", `Bearer ${testUser1.accessToken}`)
        .send({});
      expect(res.status).toBe(400);
    });

    test("Should return 500 if Message.findByIdAndDelete throws error in DeleteMessage", async () => {
      const tempMessage = await Message.create({
        senderId: testUser1._id,
        receiverId: testUser2._id,
        content: "Temporary message for delete error",
        messageRead: false,
      });
      const originalFindByIdAndDelete = Message.findByIdAndDelete;
      jest.spyOn(Message, "findByIdAndDelete").mockImplementationOnce(() => {
        throw new Error("Simulated error in delete");
      });
      const res = await request(app)
        .delete(baseUrl + "/DeleteMessage")
        .set("Authorization", `Bearer ${testUser1.accessToken}`)
        .send({ messageId: tempMessage._id });
      expect(res.status).toBe(500);
      Message.findByIdAndDelete = originalFindByIdAndDelete;
      await Message.findByIdAndDelete(tempMessage._id);
    });
  });
});
