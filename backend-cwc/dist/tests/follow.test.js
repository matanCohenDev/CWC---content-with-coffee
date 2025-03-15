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
const user_model_1 = __importDefault(require("../models/user_model"));
const follow_model_1 = __importDefault(require("../models/follow_model"));
let user1 = {
    email: "user1@test.com",
    password: "password1",
};
let user2 = {
    email: "user2@test.com",
    password: "password2",
};
let mongoServer;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    jest.setTimeout(30000);
    console.log("Starting Follow tests...");
    mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();
    yield (0, server_1.connectDB)();
    yield user_model_1.default.deleteMany();
    yield follow_model_1.default.deleteMany();
    let res = yield (0, supertest_1.default)(server_1.default).post("/api/auth/register").send(user1);
    expect(res.status).toBe(201);
    res = yield (0, supertest_1.default)(server_1.default).post("/api/auth/login").send(user1);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    user1.accessToken = res.body.accessToken;
    user1._id = res.body.id;
    res = yield (0, supertest_1.default)(server_1.default).post("/api/auth/register").send(user2);
    expect(res.status).toBe(201);
    res = yield (0, supertest_1.default)(server_1.default).post("/api/auth/login").send(user2);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    user2.accessToken = res.body.accessToken;
    user2._id = res.body.id;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Closing Follow tests...");
    yield user_model_1.default.deleteMany();
    yield follow_model_1.default.deleteMany();
    yield mongoose_1.default.connection.close();
    if (mongoServer) {
        yield mongoServer.stop();
    }
}));
const baseUrl = "/api/follow";
describe("Follow Endpoints", () => {
    test("User1 successfully follows User2", () => __awaiter(void 0, void 0, void 0, function* () {
        yield follow_model_1.default.deleteMany({ followerId: user1._id, followingId: user2._id });
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/follow")
            .set("Authorization", `Bearer ${user1.accessToken}`)
            .send({ followingId: user2._id });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message", "Followed");
    }));
    test("User1 cannot follow User2 twice", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/follow")
            .set("Authorization", `Bearer ${user1.accessToken}`)
            .send({ followingId: user2._id });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("message", "Already following");
    }));
    test("Follow endpoint fails with missing followingId", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/follow")
            .set("Authorization", `Bearer ${user1.accessToken}`)
            .send({ followingId: "" });
        expect(res.status).toBe(400);
    }));
    test("Follow endpoint fails without authentication", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/follow")
            .send({ followingId: user2._id });
        expect(res.status).toBe(401);
    }));
    test("Simulate error during follow (during Follow.prototype.save)", () => __awaiter(void 0, void 0, void 0, function* () {
        yield follow_model_1.default.deleteMany({ followerId: user1._id, followingId: user2._id });
        const originalSave = follow_model_1.default.prototype.save;
        follow_model_1.default.prototype.save = jest.fn().mockImplementationOnce(() => {
            throw new Error("Simulated save error");
        });
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/follow")
            .set("Authorization", `Bearer ${user1.accessToken}`)
            .send({ followingId: user2._id });
        expect(res.status).toBe(500);
        follow_model_1.default.prototype.save = originalSave;
    }));
    test("Re-follow User2 after simulation error", () => __awaiter(void 0, void 0, void 0, function* () {
        yield follow_model_1.default.deleteMany({ followerId: user1._id, followingId: user2._id });
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/follow")
            .set("Authorization", `Bearer ${user1.accessToken}`)
            .send({ followingId: user2._id });
        expect(res.status).toBe(200);
    }));
    test("Get all followers for User2", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default).get(baseUrl + `/followers/${user2._id}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        const followerIds = res.body.map((entry) => entry.followerId);
        expect(followerIds).toContain(user1._id);
    }));
    test("Get all following for User1", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default).get(baseUrl + `/following/${user1._id}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("following");
        expect(Array.isArray(res.body.following)).toBe(true);
        expect(res.body.following.length).toBeGreaterThanOrEqual(1);
        const followingIds = res.body.following.map((entry) => entry.followingId);
        expect(followingIds).toContain(user2._id);
    }));
    test("Simulate error when incrementing user counters", () => __awaiter(void 0, void 0, void 0, function* () {
        yield follow_model_1.default.deleteMany({ followerId: user1._id, followingId: user2._id });
        const originalUserSave = user_model_1.default.prototype.save;
        user_model_1.default.prototype.save = jest.fn().mockImplementationOnce(() => {
            throw new Error("Simulated error in user.save");
        });
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/follow")
            .set("Authorization", `Bearer ${user1.accessToken}`)
            .send({ followingId: user2._id });
        expect(res.status).toBe(500);
        user_model_1.default.prototype.save = originalUserSave;
    }));
    test("User1 successfully unfollows User2", () => __awaiter(void 0, void 0, void 0, function* () {
        yield follow_model_1.default.deleteMany({ followerId: user1._id, followingId: user2._id });
        yield follow_model_1.default.create({ followerId: user1._id, followingId: user2._id });
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/unfollow")
            .set("Authorization", `Bearer ${user1.accessToken}`)
            .send({ followingId: user2._id });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message", "Successfully unfollowed");
        expect(res.body).toHaveProperty("success", true);
    }));
    test("Unfollowing when not following returns error", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/unfollow")
            .set("Authorization", `Bearer ${user1.accessToken}`)
            .send({ followingId: user2._id });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("message", "Not following");
    }));
    test("Get followers for User2 returns empty after unfollow", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default).get(baseUrl + `/followers/${user2._id}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    }));
    test("Get following for User1 returns empty after unfollow", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default).get(baseUrl + `/following/${user1._id}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("following");
        expect(Array.isArray(res.body.following)).toBe(true);
        expect(res.body.following.length).toBe(0);
    }));
    test("Unfollow endpoint fails without authentication", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/unfollow")
            .send({ followingId: user2._id });
        expect(res.status).toBe(401);
    }));
    test("Simulate error during unfollow when retrieving followingUser", () => __awaiter(void 0, void 0, void 0, function* () {
        yield follow_model_1.default.deleteMany({ followerId: user1._id, followingId: user2._id });
        yield follow_model_1.default.create({ followerId: user1._id, followingId: user2._id });
        const originalFindById = user_model_1.default.findById;
        user_model_1.default.findById = jest.fn().mockImplementationOnce(() => {
            throw new Error("Simulated error in findById");
        });
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/unfollow")
            .set("Authorization", `Bearer ${user1.accessToken}`)
            .send({ followingId: user2._id });
        expect(res.status).toBe(500);
        user_model_1.default.findById = originalFindById;
    }));
    test("getAllFollowersByUserId returns 500 if Follow.find throws error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFind = follow_model_1.default.find;
        follow_model_1.default.find = jest.fn().mockImplementationOnce(() => {
            throw new Error("Simulated error");
        });
        const res = yield (0, supertest_1.default)(server_1.default).get(baseUrl + `/followers/${user2._id}`);
        expect(res.status).toBe(500);
        follow_model_1.default.find = originalFind;
    }));
    test("getAllFollowingByUserId returns 500 if Follow.find throws error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFind = follow_model_1.default.find;
        follow_model_1.default.find = jest.fn().mockImplementationOnce(() => {
            throw new Error("Simulated error");
        });
        const res = yield (0, supertest_1.default)(server_1.default).get(baseUrl + `/following/${user1._id}`);
        expect(res.status).toBe(500);
        follow_model_1.default.find = originalFind;
    }));
});
