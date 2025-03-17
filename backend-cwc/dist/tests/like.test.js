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
const post_model_1 = __importDefault(require("../models/post_model"));
const like_model_1 = __importDefault(require("../models/like_model"));
let testUser = {
    email: "test@test.com",
    password: "testpassword",
};
let testPost;
let testLike;
let mongoServer;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    jest.setTimeout(30000);
    console.log("Jest starting Like tests!");
    mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();
    yield (0, server_1.connectDB)();
    yield user_model_1.default.deleteMany();
    yield post_model_1.default.deleteMany();
    yield like_model_1.default.deleteMany();
    const registerRes = yield (0, supertest_1.default)(server_1.default)
        .post("/api/auth/register")
        .send(testUser);
    expect(registerRes.status).toBe(201);
    const loginRes = yield (0, supertest_1.default)(server_1.default)
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
    const postRes = yield (0, supertest_1.default)(server_1.default)
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
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Closing Like tests...");
    yield user_model_1.default.deleteMany();
    yield post_model_1.default.deleteMany();
    yield like_model_1.default.deleteMany();
    yield mongoose_1.default.connection.close();
    if (mongoServer) {
        yield mongoServer.stop();
    }
}));
const baseUrl = "/api/like";
describe("Like Endpoints", () => {
    describe("POST /createLike", () => {
        test("Create like success", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .post(baseUrl + "/createLike")
                .set("Authorization", `Bearer ${testUser.accessToken}`)
                .send(testLike);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body.data).toHaveProperty("_id");
            testLike._id = res.body.data._id;
        }));
        test("Should fail if postId is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .post(baseUrl + "/createLike")
                .set("Authorization", `Bearer ${testUser.accessToken}`)
                .send(Object.assign(Object.assign({}, testLike), { postId: "" }));
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        }));
        test("Should fail if userId is missing (token not provided)", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .post(baseUrl + "/createLike")
                .send(testLike);
            expect(res.status).toBe(401);
        }));
        test("Should return 500 if Like.create throws error", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalCreate = like_model_1.default.create;
            jest.spyOn(like_model_1.default, "create").mockImplementationOnce(() => {
                throw new Error("Simulated error in create");
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .post(baseUrl + "/createLike")
                .set("Authorization", `Bearer ${testUser.accessToken}`)
                .send(testLike);
            expect(res.status).toBe(500);
            like_model_1.default.create = originalCreate;
        }));
    });
    describe("GET /getLikesByPostId/:postId", () => {
        test("Get likes by post id success", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/getLikesByPostId/" + testPost._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(Array.isArray(res.body.likes)).toBe(true);
            expect(res.body.likes.length).toBeGreaterThanOrEqual(1);
        }));
        test("Should return 200 and an empty array if no likes found for given postId", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakePostId = new mongoose_1.default.Types.ObjectId().toString();
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/getLikesByPostId/" + fakePostId)
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.likes)).toBe(true);
            expect(res.body.likes.length).toBe(0);
        }));
        test("Should return 500 if Like.find throws error in getLikesByPostId", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalFind = like_model_1.default.find;
            jest.spyOn(like_model_1.default, "find").mockImplementationOnce(() => {
                throw new Error("Simulated error in find");
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/getLikesByPostId/" + testPost._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(500);
            like_model_1.default.find = originalFind;
        }));
    });
    describe("GET /getLikes", () => {
        test("Should get all likes", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/getLikes")
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(Array.isArray(res.body.likes)).toBe(true);
        }));
        test("Should return 500 if Like.find throws error in getLikes", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalFind = like_model_1.default.find;
            jest.spyOn(like_model_1.default, "find").mockImplementationOnce(() => {
                throw new Error("Simulated error in find");
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/getLikes")
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(500);
            like_model_1.default.find = originalFind;
        }));
    });
    describe("DELETE /deleteLike/:likeId", () => {
        test("Delete like success", () => __awaiter(void 0, void 0, void 0, function* () {
            const createRes = yield (0, supertest_1.default)(server_1.default)
                .post(baseUrl + "/createLike")
                .set("Authorization", `Bearer ${testUser.accessToken}`)
                .send(testLike);
            expect(createRes.status).toBe(201);
            testLike._id = createRes.body.data._id;
            const res = yield (0, supertest_1.default)(server_1.default)
                .delete(baseUrl + "/deleteLike/" + testLike._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
        }));
        test("Should return 404 when deleting a non-existent like", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeId = new mongoose_1.default.Types.ObjectId().toString();
            const res = yield (0, supertest_1.default)(server_1.default)
                .delete(baseUrl + "/deleteLike/" + fakeId)
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(404);
        }));
        test("Should return 500 if Like.findByIdAndDelete throws error", () => __awaiter(void 0, void 0, void 0, function* () {
            const tempLike = yield like_model_1.default.create({
                userId: testUser._id,
                postId: testPost._id,
            });
            const originalFindByIdAndDelete = like_model_1.default.findByIdAndDelete;
            jest.spyOn(like_model_1.default, "findByIdAndDelete").mockImplementationOnce(() => {
                throw new Error("Simulated error in delete");
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .delete(baseUrl + "/deleteLike/" + tempLike._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(500);
            like_model_1.default.findByIdAndDelete = originalFindByIdAndDelete;
            yield like_model_1.default.findByIdAndDelete(tempLike._id);
        }));
    });
    test("Create like with invalid token", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/createLike")
            .set("Authorization", `Bearer invalidToken`)
            .send(testLike);
        expect(res.status).toBe(401);
    }));
});
