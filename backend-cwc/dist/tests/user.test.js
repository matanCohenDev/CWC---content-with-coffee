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
let testUser = {
    email: "user@test.com",
    password: "testpassword",
};
let mongoServer;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    jest.setTimeout(30000);
    mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();
    yield (0, server_1.connectDB)();
    yield user_model_1.default.deleteMany();
    const registerRes = yield (0, supertest_1.default)(server_1.default).post("/api/auth/register").send(testUser);
    expect(registerRes.status).toBe(201);
    const loginRes = yield (0, supertest_1.default)(server_1.default).post("/api/auth/login").send(testUser);
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.accessToken).toBeDefined();
    testUser.accessToken = loginRes.body.accessToken;
    testUser._id = loginRes.body.id;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield user_model_1.default.deleteMany();
    yield mongoose_1.default.connection.close();
    if (mongoServer) {
        yield mongoServer.stop();
    }
}));
const baseUrl = "/api/user";
describe("User Endpoints", () => {
    describe("GET /getUserById/:id", () => {
        test("Should get user by valid id", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/getUserById/" + testUser._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("_id", testUser._id);
            expect(res.body).toHaveProperty("email", testUser.email);
        }));
        test("Should return 404 for non-existent user", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeId = new mongoose_1.default.Types.ObjectId().toString();
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/getUserById/" + fakeId)
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(404);
        }));
        test("Should return 500 if User.findById throws error", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalFindById = user_model_1.default.findById;
            jest.spyOn(user_model_1.default, "findById").mockImplementationOnce(() => {
                throw new Error("Simulated error in findById");
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/getUserById/" + testUser._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(500);
            user_model_1.default.findById = originalFindById;
        }));
    });
    describe("GET /getUsers", () => {
        test("Should return an array of users", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/getUsers")
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
        }));
        test("Should return 500 if User.find throws error", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalFind = user_model_1.default.find;
            jest.spyOn(user_model_1.default, "find").mockImplementationOnce(() => {
                throw new Error("Simulated error in find");
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/getUsers")
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(500);
            user_model_1.default.find = originalFind;
        }));
    });
    describe("DELETE /deleteUser/:id", () => {
        let tempUser;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const registerRes = yield (0, supertest_1.default)(server_1.default)
                .post("/api/auth/register")
                .send({
                email: "temp@test.com",
                password: "temppassword",
            });
            expect(registerRes.status).toBe(201);
            const loginRes = yield (0, supertest_1.default)(server_1.default)
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
        }));
        test("Should delete existing user successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.default)
                .delete(baseUrl + "/deleteUser/" + tempUser._id)
                .set("Authorization", `Bearer ${tempUser.accessToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message", "User deleted successfully");
            const res2 = yield (0, supertest_1.default)(server_1.default)
                .delete(baseUrl + "/deleteUser/" + tempUser._id)
                .set("Authorization", `Bearer ${tempUser.accessToken}`);
            expect(res2.status).toBe(404);
        }));
        test("Should return 500 if User.findByIdAndDelete throws error", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalFindByIdAndDelete = user_model_1.default.findByIdAndDelete;
            jest.spyOn(user_model_1.default, "findByIdAndDelete").mockImplementationOnce(() => {
                throw new Error("Simulated error in deleteUser");
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .delete(baseUrl + "/deleteUser/" + testUser._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(res.status).toBe(500);
            user_model_1.default.findByIdAndDelete = originalFindByIdAndDelete;
        }));
    });
    describe("PUT /updateUser/:id", () => {
        test("Should update an existing user successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const newData = { name: "Updated Name", bio: "New bio" };
            const res = yield (0, supertest_1.default)(server_1.default)
                .put(baseUrl + "/updateUser/" + testUser._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`)
                .send(newData);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message", "User updated successfully");
            const getRes = yield (0, supertest_1.default)(server_1.default)
                .get(baseUrl + "/getUserById/" + testUser._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`);
            expect(getRes.status).toBe(200);
            expect(getRes.body).toHaveProperty("name", newData.name);
            expect(getRes.body).toHaveProperty("bio", newData.bio);
        }));
        test("Should return 404 when updating a non-existent user", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeId = new mongoose_1.default.Types.ObjectId().toString();
            const res = yield (0, supertest_1.default)(server_1.default)
                .put(baseUrl + "/updateUser/" + fakeId)
                .set("Authorization", `Bearer ${testUser.accessToken}`)
                .send({ name: "No User" });
            expect(res.status).toBe(404);
        }));
        test("Should return 500 if User.findByIdAndUpdate throws error", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalFindByIdAndUpdate = user_model_1.default.findByIdAndUpdate;
            jest.spyOn(user_model_1.default, "findByIdAndUpdate").mockImplementationOnce(() => {
                throw new Error("Simulated error in updateUser");
            });
            const res = yield (0, supertest_1.default)(server_1.default)
                .put(baseUrl + "/updateUser/" + testUser._id)
                .set("Authorization", `Bearer ${testUser.accessToken}`)
                .send({ name: "Error User" });
            expect(res.status).toBe(500);
            user_model_1.default.findByIdAndUpdate = originalFindByIdAndUpdate;
        }));
    });
});
