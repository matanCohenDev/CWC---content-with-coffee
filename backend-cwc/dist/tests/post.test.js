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
const post_model_1 = __importDefault(require("../models/post_model"));
const user_model_1 = __importDefault(require("../models/user_model"));
const testUser = {
    email: "test@test.com",
    password: "testpassword",
};
let testPost;
let nonExistentPostId = new mongoose_1.default.Types.ObjectId().toString(); // For 404 tests
let mongoServer;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    jest.setTimeout(30000);
    console.log("Jest starting!");
    mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();
    yield (0, server_1.connectDB)();
    yield post_model_1.default.deleteMany();
    yield user_model_1.default.deleteMany();
    yield (0, supertest_1.default)(server_1.default).post("/api/auth/register").send(testUser);
    const response = yield (0, supertest_1.default)(server_1.default).post("/api/auth/login").send(testUser);
    expect(response.status).toBe(200);
    testUser.accessToken = response.body.accessToken;
    testUser._id = response.body.id;
    expect(testUser.accessToken).toBeDefined();
    testPost = {
        userId: testUser._id,
        content: "test content",
    };
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Server closing");
    yield mongoose_1.default.connection.close();
    if (mongoServer) {
        yield mongoServer.stop();
    }
}));
const baseUrl = "/api/post";
describe("Post Endpoints (original tests)", () => {
    test("Create post success", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/createPost")
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send(testPost);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body.data).toHaveProperty("_id");
        testPost._id = response.body.data._id;
    }));
    test("Create post fail by missing content", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/createPost")
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send(Object.assign(Object.assign({}, testPost), { content: "" }));
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("success", false);
    }));
    test("Create post fail by missing userId", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/createPost")
            .send(Object.assign({}, testPost));
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Access Denied: Token missing");
    }));
    test("Get all posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).get(baseUrl + "/getPosts");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(Array.isArray(response.body.posts)).toBe(true);
        expect(response.body.posts.length).toBe(1);
    }));
    test("Get post by userId", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .get(baseUrl + "/getPostByUserId/" + testUser._id)
            .set("Authorization", `Bearer ${testUser.accessToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(Array.isArray(response.body.posts)).toBe(true);
        expect(response.body.posts.length).toBe(1);
    }));
    test("Get post by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).get(baseUrl + "/getPostById/" + testPost._id);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body.post).toHaveProperty("_id", testPost._id);
    }));
    test("Update post by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const updatedContent = "updated content";
        const response = yield (0, supertest_1.default)(server_1.default)
            .put(baseUrl + "/updatePostById/" + testPost._id)
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send({ content: updatedContent });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body.data.content).toBe(updatedContent);
    }));
    test("Delete post by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .delete(baseUrl + "/deletePostById/" + testPost._id)
            .set("Authorization", `Bearer ${testUser.accessToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
    }));
    test("Get all posts after delete", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).get(baseUrl + "/getPosts");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(Array.isArray(response.body.posts)).toBe(true);
        expect(response.body.posts.length).toBe(0);
    }));
    test("Create post with invalid token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/createPost")
            .set("Authorization", "Bearer invalid_token")
            .send(testPost);
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Access Denied: Invalid token");
    }));
});
describe("Additional Post Route Tests (like/comment)", () => {
    let postIdForActions = "";
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/createPost")
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send({ userId: testUser._id, content: "Post for like/comment" });
        expect(response.status).toBe(201);
        postIdForActions = response.body.data._id;
    }));
    test("like a post success", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/likePost/${postIdForActions}`)
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send();
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body.data.likesCount).toBe(1);
    }));
    test("like a post invalid token => 401", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/likePost/${postIdForActions}`)
            .set("Authorization", "Bearer invalid_token")
            .send();
        expect(res.status).toBe(401);
    }));
    test("like a non-existent post => 404", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/likePost/${nonExistentPostId}`)
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send();
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("success", false);
    }));
    test("remove like success", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .delete(`${baseUrl}/removeLike/${postIdForActions}`)
            .set("Authorization", `Bearer ${testUser.accessToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body.data.likesCount).toBe(0);
    }));
    test("remove like invalid token => 401", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .delete(`${baseUrl}/removeLike/${postIdForActions}`)
            .set("Authorization", "Bearer invalid_token");
        expect(res.status).toBe(401);
    }));
    test("remove like from non-existent post => 404", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .delete(`${baseUrl}/removeLike/${nonExistentPostId}`)
            .set("Authorization", `Bearer ${testUser.accessToken}`);
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("success", false);
    }));
    test("commentPost success", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/commentPost/${postIdForActions}`)
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send();
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body.data.commentsCount).toBe(1);
    }));
    test("commentPost invalid token => 401", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/commentPost/${postIdForActions}`)
            .set("Authorization", "Bearer invalid_token");
        expect(res.status).toBe(401);
    }));
    test("commentPost on non-existent post => 404", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/commentPost/${nonExistentPostId}`)
            .set("Authorization", `Bearer ${testUser.accessToken}`);
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("success", false);
    }));
    test("removeComment success", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .delete(`${baseUrl}/removeComment/${postIdForActions}`)
            .set("Authorization", `Bearer ${testUser.accessToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body.data.commentsCount).toBe(0);
    }));
    test("removeComment invalid token => 401", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .delete(`${baseUrl}/removeComment/${postIdForActions}`)
            .set("Authorization", "Bearer invalid_token");
        expect(res.status).toBe(401);
    }));
    test("removeComment on non-existent post => 404", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .delete(`${baseUrl}/removeComment/${nonExistentPostId}`)
            .set("Authorization", `Bearer ${testUser.accessToken}`);
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("success", false);
    }));
    test("like post with invalid ID format => 404 or 500", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/likePost/abc123`)
            .set("Authorization", `Bearer ${testUser.accessToken}`);
        expect([404, 500]).toContain(res.status);
    }));
});
describe("Extra Error Simulation for Post Controller", () => {
    test("Simulate error in Post.create", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalCreate = post_model_1.default.create;
        jest.spyOn(post_model_1.default, "create").mockImplementationOnce(() => {
            throw new Error("Simulated error in Post.create");
        });
        const response = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/createPost")
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send({ userId: testUser._id, content: "Error test" });
        expect(response.status).toBe(500);
        post_model_1.default.create = originalCreate;
    }));
    test("Simulate error in User.findById when creating a post", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindById = user_model_1.default.findById;
        jest.spyOn(user_model_1.default, "findById").mockImplementationOnce(() => {
            throw new Error("Simulated error in User.findById");
        });
        const response = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/createPost")
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send({ userId: testUser._id, content: "User find error" });
        expect(response.status).toBe(500);
        user_model_1.default.findById = originalFindById;
    }));
    test("Simulate error in Post.findById for updatePostById", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindById = post_model_1.default.findById;
        jest.spyOn(post_model_1.default, "findById").mockImplementationOnce(() => {
            throw new Error("Simulated error in Post.findById");
        });
        const response = yield (0, supertest_1.default)(server_1.default)
            .put(baseUrl + "/updatePostById/abc123")
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send({ content: "No update" });
        expect([500, 404]).toContain(response.status);
        post_model_1.default.findById = originalFindById;
    }));
    test("Simulate error in post.save during updatePostById", () => __awaiter(void 0, void 0, void 0, function* () {
        const createRes = yield (0, supertest_1.default)(server_1.default)
            .post(baseUrl + "/createPost")
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send({ userId: testUser._id, content: "Post to be updated" });
        expect(createRes.status).toBe(201);
        const postId = createRes.body.data._id;
        const postInstance = yield post_model_1.default.findById(postId);
        if (!postInstance)
            throw new Error("Post was not created as expected.");
        const originalSave = postInstance.save;
        postInstance.save = jest.fn().mockImplementationOnce(() => {
            throw new Error("Simulated error in post.save");
        });
        jest.spyOn(post_model_1.default, "findById").mockResolvedValueOnce(postInstance);
        const updateRes = yield (0, supertest_1.default)(server_1.default)
            .put(baseUrl + `/updatePostById/${postId}`)
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send({ content: "New content" });
        expect(updateRes.status).toBe(500);
        postInstance.save = originalSave;
        jest.restoreAllMocks();
    }));
});
