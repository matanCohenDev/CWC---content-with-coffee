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
const comment_model_1 = __importDefault(require("../models/comment_model"));
const testUser = {
    email: "test@gmail.com",
    password: "testpassword",
};
let testPost;
let testComment;
let mongoServer;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    jest.setTimeout(30000);
    mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();
    yield (0, server_1.connectDB)();
    yield user_model_1.default.deleteMany();
    yield post_model_1.default.deleteMany();
    yield comment_model_1.default.deleteMany();
    const registerRes = yield (0, supertest_1.default)(server_1.default).post("/api/auth/register").send(testUser);
    expect(registerRes.status).toBe(201);
    const loginRes = yield (0, supertest_1.default)(server_1.default).post("/api/auth/login").send(testUser);
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.accessToken).toBeDefined();
    testUser.accessToken = loginRes.body.accessToken;
    testUser._id = loginRes.body.id;
    testPost = {
        userId: testUser._id,
        content: "Test post content",
    };
    const postRes = yield (0, supertest_1.default)(server_1.default)
        .post("/api/post/createPost")
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send(testPost);
    expect(postRes.status).toBe(201);
    testPost._id = postRes.body.data._id;
    testComment = {
        userId: testUser._id,
        postId: testPost._id,
        content: "Initial test comment",
    };
    const commentRes = yield (0, supertest_1.default)(server_1.default)
        .post("/api/comment/createComment")
        .set("Authorization", `Bearer ${testUser.accessToken}`)
        .send(testComment);
    expect(commentRes.status).toBe(201);
    testComment._id = commentRes.body.data._id;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Clean up
    yield user_model_1.default.deleteMany();
    yield post_model_1.default.deleteMany();
    yield comment_model_1.default.deleteMany();
    yield mongoose_1.default.connection.close();
    if (mongoServer) {
        yield mongoServer.stop();
    }
}));
const baseUrl = "/api/comment";
describe("Comment Endpoints", () => {
    describe("POST /createComment", () => {
        test("Should create a comment successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const newComment = {
                userId: testUser._id,
                postId: testPost._id,
                content: "A new comment for testing create",
            };
            const res = yield (0, supertest_1.default)(server_1.default)
                .post(baseUrl + "/createComment")
                .set("Authorization", `Bearer ${testUser.accessToken}`)
                .send(newComment);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body.data).toHaveProperty("_id");
        }));
        test("Should fail if content is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .post(baseUrl + "/createComment")
                .set("Authorization", `Bearer ${testUser.accessToken}`)
                .send(Object.assign(Object.assign({}, testComment), { content: "" }));
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        }));
        test("Should fail if userId is missing (implicitly set by middleware)", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .post(baseUrl + "/createComment")
                .send(Object.assign(Object.assign({}, testComment), { userId: "" }));
            expect(res.status).toBe(401);
        }));
        test("Should fail if postId is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .post(baseUrl + "/createComment")
                .set("Authorization", `Bearer ${testUser.accessToken}`)
                .send(Object.assign(Object.assign({}, testComment), { postId: "" }));
            expect(res.status).toBe(400);
        }));
        test("Should fail with invalid token", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .post(baseUrl + "/createComment")
                .set("Authorization", `Bearer invalid_token`)
                .send(testComment);
            expect(res.status).toBe(401);
        }));
        test("Should return 500 if Comment.create throws an error", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(comment_model_1.default, "create").mockImplementationOnce(() => {
                throw new Error("Simulated error");
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .post(baseUrl + "/createComment")
                .set("Authorization", `Bearer ${testUser.accessToken}`)
                .send(testComment);
            expect(res.status).toBe(500);
        }));
    });
    describe("GET /getComments", () => {
        test("Should get all comments", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default).get(baseUrl + "/getComments");
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(Array.isArray(res.body.comments)).toBe(true);
            expect(res.body.comments.length).toBeGreaterThanOrEqual(1);
        }));
        test("Should return 500 if Comment.find throws error", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(comment_model_1.default, "find").mockImplementationOnce(() => {
                throw new Error("Simulated error");
            });
            const res = yield (0, supertest_1.default)(server_1.default).get(baseUrl + "/getComments");
            expect(res.status).toBe(500);
        }));
    });
    describe("GET /getCommentById/:commentId", () => {
        test("Should get comment by id", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default).get(baseUrl + "/getCommentById/" + testComment._id);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body.comment).toHaveProperty("_id", testComment._id);
        }));
        test("Should return 404 for non-existent comment", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeId = new mongoose_1.default.Types.ObjectId().toString();
            const res = yield (0, supertest_1.default)(server_1.default).get(baseUrl + "/getCommentById/" + fakeId);
            expect(res.status).toBe(404);
        }));
        test("Should return 500 if Comment.findById throws error", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(comment_model_1.default, "findById").mockImplementationOnce(() => {
                throw new Error("Simulated error");
            });
            const res = yield (0, supertest_1.default)(server_1.default).get(baseUrl + "/getCommentById/" + testComment._id);
            expect(res.status).toBe(500);
        }));
    });
    describe("GET /getCommentsByPostId/:postId", () => {
        test("Should get comments for a specific post", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/getCommentsByPostId/" + testComment.postId)
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(Array.isArray(res.body.comments)).toBe(true);
            expect(res.body.comments.length).toBeGreaterThanOrEqual(1);
        }));
        test("Should return 404 if no comments for given postId", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakePostId = new mongoose_1.default.Types.ObjectId().toString();
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/getCommentsByPostId/" + fakePostId)
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(404);
        }));
        test("Should return 500 if Comment.find throws error in getCommentsByPostId", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(comment_model_1.default, "find").mockImplementationOnce(() => {
                throw new Error("Simulated error");
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/getCommentsByPostId/" + testPost._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(500);
        }));
    });
    describe("PUT /updateComment/:commentId", () => {
        test("Should update comment content successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const updatedContent = "Updated test comment";
            const res = yield (0, supertest_1.default)(server_1.default)
                .put(baseUrl + "/updateComment/" + testComment._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`)
                .send({ content: updatedContent });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
        }));
        test("Should fail update with missing content", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .put(baseUrl + "/updateComment/" + testComment._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`)
                .send({ content: "" });
            expect(res.status).not.toBe(200);
        }));
        test("Should fail update if comment not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeId = new mongoose_1.default.Types.ObjectId().toString();
            const res = yield (0, supertest_1.default)(server_1.default)
                .put(baseUrl + "/updateComment/" + fakeId)
                .set("Authorization", `Bearer ${testUser.accessToken}`)
                .send({ content: "Attempt update" });
            expect(res.status).toBe(404);
        }));
        test("Should fail update if not authorized (userId mismatch)", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeUserId = new mongoose_1.default.Types.ObjectId().toString();
            const otherComment = yield comment_model_1.default.create({
                userId: fakeUserId,
                postId: testPost._id,
                content: "Comment from another user",
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .put(baseUrl + "/updateComment/" + otherComment._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`)
                .send({ content: "Trying unauthorized update" });
            expect(res.status).toBe(403);
        }));
        test("Should return 500 if Comment.findById throws error in updateComment", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(comment_model_1.default, "findById").mockImplementationOnce(() => {
                throw new Error("Simulated error");
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .put(baseUrl + "/updateComment/" + testComment._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`)
                .send({ content: "new content" });
            expect(res.status).toBe(500);
        }));
    });
    describe("DELETE /deleteComment/:commentId", () => {
        test("Should delete comment successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .delete(baseUrl + "/deleteComment/" + testComment._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
        }));
        test("Should return 404 when trying to delete already deleted comment", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .delete(baseUrl + "/deleteComment/" + testComment._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(404);
        }));
        test("Should return 500 if Comment.findByIdAndDelete throws error", () => __awaiter(void 0, void 0, void 0, function* () {
            const tempComment = yield comment_model_1.default.create({
                userId: testUser._id,
                postId: testPost._id,
                content: "Temporary comment",
            });
            jest.spyOn(comment_model_1.default, "findByIdAndDelete").mockImplementationOnce(() => {
                throw new Error("Simulated error");
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .delete(baseUrl + "/deleteComment/" + tempComment._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(500);
            yield comment_model_1.default.findByIdAndDelete(tempComment._id);
        }));
    });
    describe("GET /getComments after deletion", () => {
        test("Should not return the deleted comment", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default).get(baseUrl + "/getComments");
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(Array.isArray(res.body.comments)).toBe(true);
            const deletedCommentExists = res.body.comments.some((c) => c._id === testComment._id);
            expect(deletedCommentExists).toBe(false);
        }));
    });
});
