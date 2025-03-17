"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importStar(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const messages_model_1 = __importDefault(require("../models/messages_model"));
const user_model_1 = __importDefault(require("../models/user_model"));
const testUser1 = {
    email: "testuser1@test.com",
    password: "testpassword",
};
const testUser2 = {
    email: "testuser2@test.com",
    password: "testpassword",
};
let testMessage1;
let testMessage2;
let mongoServer;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    jest.setTimeout(30000);
    console.log("Jest starting!");
    mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();
    yield (0, server_1.connectDB)();
    yield user_model_1.default.deleteMany();
    yield messages_model_1.default.deleteMany();
    let res = yield (0, supertest_1.default)(server_1.default).post("/api/auth/register").send(testUser1);
    expect(res.status).toBe(201);
    res = yield (0, supertest_1.default)(server_1.default).post("/api/auth/login").send(testUser1);
    expect(res.status).toBe(200);
    testUser1.accessToken = res.body.accessToken;
    testUser1._id = res.body.id;
    res = yield (0, supertest_1.default)(server_1.default).post("/api/auth/register").send(testUser2);
    expect(res.status).toBe(201);
    res = yield (0, supertest_1.default)(server_1.default).post("/api/auth/login").send(testUser2);
    expect(res.status).toBe(200);
    testUser2.accessToken = res.body.accessToken;
    testUser2._id = res.body.id;
    testMessage1 = {
        senderId: testUser1._id,
        receiverId: testUser2._id,
        content: "Hello from user1 to user2",
        messageRead: false,
    };
    testMessage2 = {
        senderId: testUser2._id,
        receiverId: testUser1._id,
        content: "Reply from user2 to user1",
        messageRead: false,
    };
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Closing server...");
    yield user_model_1.default.deleteMany();
    yield messages_model_1.default.deleteMany();
    yield mongoose_1.default.connection.close();
    if (mongoServer) {
        yield mongoServer.stop();
    }
}));
const baseUrl = "/api/message";
describe("Messages Endpoints", () => {
    describe("POST /SendMessage", () => {
        test("Send a message from user1 to user2", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .post(baseUrl + "/SendMessage")
                .set("Authorization", `Bearer ${testUser1.accessToken}`)
                .send(testMessage1);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body).toHaveProperty("messageId");
            testMessage1.messageId = res.body.messageId;
        }));
        test("Send a message from user2 to user1", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .post(baseUrl + "/SendMessage")
                .set("Authorization", `Bearer ${testUser2.accessToken}`)
                .send(testMessage2);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body).toHaveProperty("messageId");
            testMessage2.messageId = res.body.messageId;
        }));
        test("Fail to send a message with missing content", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .post(baseUrl + "/SendMessage")
                .set("Authorization", `Bearer ${testUser1.accessToken}`)
                .send({ senderId: testUser1._id, receiverId: testUser2._id });
            expect(res.status).toBe(400);
        }));
        test("Should return 500 if Message.create throws error in SendMessage", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalCreate = messages_model_1.default.create;
            jest.spyOn(messages_model_1.default, "create").mockImplementationOnce(() => {
                throw new Error("Simulated error in Message.create");
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .post(baseUrl + "/SendMessage")
                .set("Authorization", `Bearer ${testUser1.accessToken}`)
                .send({ senderId: testUser1._id, receiverId: testUser2._id, content: "Test error" });
            expect(res.status).toBe(500);
            messages_model_1.default.create = originalCreate;
        }));
        test("Fail to send message without authentication", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .post(baseUrl + "/SendMessage")
                .send(testMessage1);
            expect(res.status).toBe(401);
        }));
    });
    describe("GET /GetAllMessages", () => {
        test("Get all messages for user1", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/GetAllMessages")
                .query({ userId: testUser1._id })
                .set("Authorization", `Bearer ${testUser1.accessToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body.data.length).toBe(2);
        }));
        test("Fail to get messages with missing userId", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/GetAllMessages")
                .set("Authorization", `Bearer ${testUser1.accessToken}`);
            expect(res.status).toBe(400);
        }));
        test("Should return 500 if Message.find throws error in GetAllMessages", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalFind = messages_model_1.default.find;
            jest.spyOn(messages_model_1.default, "find").mockImplementationOnce(() => {
                throw new Error("Simulated error in Message.find");
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/GetAllMessages")
                .query({ userId: testUser1._id })
                .set("Authorization", `Bearer ${testUser1.accessToken}`);
            expect(res.status).toBe(500);
            messages_model_1.default.find = originalFind;
        }));
    });
    describe("GET /GetMessagesBetweenUsers", () => {
        test("Get messages exchanged between user1 and user2", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/GetMessagesBetweenUsers")
                .query({ senderId: testUser1._id, receiverId: testUser2._id })
                .set("Authorization", `Bearer ${testUser2.accessToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        }));
        test("Fail to get messages between users with missing senderId", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/GetMessagesBetweenUsers")
                .query({ receiverId: testUser2._id })
                .set("Authorization", `Bearer ${testUser1.accessToken}`);
            expect(res.status).toBe(400);
        }));
        test("Should return 500 if Message.find throws error in GetMessagesBetweenUsers", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalFind = messages_model_1.default.find;
            jest.spyOn(messages_model_1.default, "find").mockImplementationOnce(() => {
                throw new Error("Simulated error in Message.find");
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/GetMessagesBetweenUsers")
                .query({ senderId: testUser1._id, receiverId: testUser2._id })
                .set("Authorization", `Bearer ${testUser2.accessToken}`);
            expect(res.status).toBe(500);
            messages_model_1.default.find = originalFind;
        }));
    });
    describe("PUT /MarkMessageAsRead", () => {
        test("Mark message as read", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .put(baseUrl + "/MarkMessageAsRead")
                .set("Authorization", `Bearer ${testUser1.accessToken}`)
                .send({ messageId: testMessage2.messageId });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            const getRes = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/GetMessagesBetweenUsers")
                .query({ senderId: testUser2._id, receiverId: testUser1._id })
                .set("Authorization", `Bearer ${testUser1.accessToken}`);
            expect(getRes.status).toBe(200);
            const updatedMessage = getRes.body.data.find((msg) => msg._id === testMessage2.messageId);
            expect(updatedMessage).toBeDefined();
            expect(updatedMessage.messageRead).toBe(true);
        }));
        test("Fail to mark message as read with missing messageId", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .put(baseUrl + "/MarkMessageAsRead")
                .set("Authorization", `Bearer ${testUser1.accessToken}`)
                .send({});
            expect(res.status).toBe(400);
        }));
        test("Should return 500 if Message.findById throws error in MarkMessageAsRead", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalFindById = messages_model_1.default.findById;
            jest.spyOn(messages_model_1.default, "findById").mockImplementationOnce(() => {
                throw new Error("Simulated error in findById");
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .put(baseUrl + "/MarkMessageAsRead")
                .set("Authorization", `Bearer ${testUser1.accessToken}`)
                .send({ messageId: testMessage2.messageId });
            expect(res.status).toBe(500);
            messages_model_1.default.findById = originalFindById;
        }));
    });
    describe("DELETE /DeleteMessage", () => {
        test("Delete a message", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .delete(baseUrl + "/DeleteMessage")
                .set("Authorization", `Bearer ${testUser1.accessToken}`)
                .send({ messageId: testMessage2.messageId });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("success", true);
            const getRes = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/GetMessagesBetweenUsers")
                .query({ senderId: testUser2._id, receiverId: testUser1._id })
                .set("Authorization", `Bearer ${testUser1.accessToken}`);
            expect(getRes.status).toBe(200);
            const deletedMsg = getRes.body.data.find((msg) => msg._id === testMessage2.messageId);
            expect(deletedMsg).toBeUndefined();
        }));
        test("Fail to delete message with missing messageId", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .delete(baseUrl + "/DeleteMessage")
                .set("Authorization", `Bearer ${testUser1.accessToken}`)
                .send({});
            expect(res.status).toBe(400);
        }));
        test("Should return 500 if Message.findByIdAndDelete throws error in DeleteMessage", () => __awaiter(void 0, void 0, void 0, function* () {
            const tempMessage = yield messages_model_1.default.create({
                senderId: testUser1._id,
                receiverId: testUser2._id,
                content: "Temporary message for delete error",
                messageRead: false,
            });
            const originalFindByIdAndDelete = messages_model_1.default.findByIdAndDelete;
            jest.spyOn(messages_model_1.default, "findByIdAndDelete").mockImplementationOnce(() => {
                throw new Error("Simulated error in delete");
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .delete(baseUrl + "/DeleteMessage")
                .set("Authorization", `Bearer ${testUser1.accessToken}`)
                .send({ messageId: tempMessage._id });
            expect(res.status).toBe(500);
            messages_model_1.default.findByIdAndDelete = originalFindByIdAndDelete;
            yield messages_model_1.default.findByIdAndDelete(tempMessage._id);
        }));
    });
});
