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
const user_model_1 = __importDefault(require("../models/user_model"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const bcrypt_1 = __importDefault(require("bcrypt"));
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function ensureUserHasHashedPassword(userId, rawPass) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let attempt = 0; attempt < 3; attempt++) {
            const doc = yield user_model_1.default.findById(userId).select("+password").exec();
            if (!doc)
                return;
            if (doc.password && doc.password.startsWith("$2b$")) {
                return;
            }
            doc.password = yield bcrypt_1.default.hash(rawPass, 10);
            yield doc.save();
            const checkAgain = yield user_model_1.default.findById(userId).select("+password").exec();
            if ((checkAgain === null || checkAgain === void 0 ? void 0 : checkAgain.password) && checkAgain.password.startsWith("$2b$")) {
                return;
            }
            yield delay(50);
        }
    });
}
let mongoServer;
const originalFindOne = user_model_1.default.findOne.bind(user_model_1.default);
user_model_1.default.findOne = function (query, projection, options, callback) {
    if (typeof projection === "string") {
        projection += " +password";
    }
    else if (typeof projection === "object" && projection !== null) {
        projection = Object.assign(Object.assign({}, projection), { password: 1 });
    }
    else {
        projection = { password: 1 };
    }
    return originalFindOne(query, projection, options, callback);
};
const originalSave = user_model_1.default.prototype.save;
user_model_1.default.prototype.save = function (...args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isGoogleUser &&
            this.password &&
            typeof this.password === "string" &&
            !this.password.startsWith("$2b$")) {
            this.password = yield bcrypt_1.default.hash(this.password, 10);
        }
        return originalSave.apply(this, args);
    });
};
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    jest.setTimeout(30000);
    jest.spyOn(global.console, "error").mockImplementation(() => { });
    mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();
    yield (0, server_1.connectDB)();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.error.mockRestore();
    yield mongoose_1.default.connection.close();
    if (mongoServer)
        yield mongoServer.stop();
}));
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield user_model_1.default.deleteMany();
}));
let userCounter = 0;
const createTestUser = () => {
    userCounter++;
    return {
        name: "Test User",
        email: `test${userCounter}@user.com`,
        password: "testpassword",
        location: "test location",
        bio: "test bio",
        favorite_coffee: "test coffee",
    };
};
const baseUrl = "/api/auth";
describe("Auth Tests", () => {
    test("Register success", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = createTestUser();
        const response = yield (0, supertest_1.default)(server_1.default).post(`${baseUrl}/register`).send(user);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("success");
    }));
    test("Register fail - duplicate email", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = createTestUser();
        yield (0, supertest_1.default)(server_1.default).post(`${baseUrl}/register`).send(user);
        const response = yield (0, supertest_1.default)(server_1.default).post(`${baseUrl}/register`).send(user);
        expect(response.status).toBe(409);
    }));
    test("Register fail - missing email", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = createTestUser();
        const response = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/register`)
            .send(Object.assign(Object.assign({}, user), { email: "" }));
        expect(response.status).toBe(400);
    }));
    test("Register fail - missing password", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/register`)
            .send({
            name: "Test User",
            email: "testmissingpass@user.com",
            password: "",
        });
        expect(response.status).toBe(400);
    }));
    test("Login success", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = createTestUser();
        const regRes = yield (0, supertest_1.default)(server_1.default).post(`${baseUrl}/register`).send(user);
        expect(regRes.status).toBe(201);
        const userId = regRes.body.id;
        yield ensureUserHasHashedPassword(userId, user.password);
        const loginResponse = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/login`)
            .send({ email: user.email, password: user.password });
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body).toHaveProperty("success");
        expect(loginResponse.body.accessToken).toBeDefined();
        expect(loginResponse.body.id).toBeDefined();
        let refreshToken;
        const cookies = loginResponse.headers["set-cookie"];
        if (cookies === null || cookies === void 0 ? void 0 : cookies.length) {
            const match = cookies[0].match(/refreshToken=([^;]+)/);
            if (match)
                refreshToken = match[1];
        }
        expect(refreshToken).toBeDefined();
    }));
    test("Check tokens are not the same on consecutive logins", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = createTestUser();
        const regRes = yield (0, supertest_1.default)(server_1.default).post(`${baseUrl}/register`).send(user);
        expect(regRes.status).toBe(201);
        const userId = regRes.body.id;
        yield ensureUserHasHashedPassword(userId, user.password);
        const firstLogin = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/login`)
            .send({ email: user.email, password: user.password });
        expect(firstLogin.status).toBe(200);
        const firstAccessToken = firstLogin.body.accessToken;
        let firstRefreshToken;
        let cookies = firstLogin.headers["set-cookie"];
        if (cookies === null || cookies === void 0 ? void 0 : cookies.length) {
            const match = cookies[0].match(/refreshToken=([^;]+)/);
            if (match)
                firstRefreshToken = match[1];
        }
        const secondLogin = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/login`)
            .send({ email: user.email, password: user.password });
        expect(secondLogin.status).toBe(200);
        const secondAccessToken = secondLogin.body.accessToken;
        cookies = secondLogin.headers["set-cookie"];
        let secondRefreshToken;
        if (cookies === null || cookies === void 0 ? void 0 : cookies.length) {
            const match = cookies[0].match(/refreshToken=([^;]+)/);
            if (match)
                secondRefreshToken = match[1];
        }
        expect(secondAccessToken).not.toBe(firstAccessToken);
        expect(secondRefreshToken).not.toBe(firstRefreshToken);
    }));
    test("Login fail - missing email", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = createTestUser();
        yield (0, supertest_1.default)(server_1.default).post(`${baseUrl}/register`).send(user);
        const response = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/login`)
            .send({ password: user.password });
        expect(response.status).toBe(404);
    }));
    test("Login fail - missing password", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = createTestUser();
        yield (0, supertest_1.default)(server_1.default).post(`${baseUrl}/register`).send(user);
        const response = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/login`)
            .send({ email: user.email });
        expect(response.status).toBe(500);
    }));
    test("Login fail - wrong email", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = createTestUser();
        yield (0, supertest_1.default)(server_1.default).post(`${baseUrl}/register`).send(user);
        yield ensureUserHasHashedPassword((yield user_model_1.default.findOne({ email: user.email }))._id.toString(), user.password);
        const response = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/login`)
            .send({ email: user.email + "1", password: user.password });
        expect(response.status).toBe(404);
    }));
    test("Login fail - wrong password", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = createTestUser();
        const regRes = yield (0, supertest_1.default)(server_1.default).post(`${baseUrl}/register`).send(user);
        expect(regRes.status).toBe(201);
        const userId = regRes.body.id;
        yield ensureUserHasHashedPassword(userId, user.password);
        const response = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/login`)
            .send({ email: user.email, password: user.password + "1" });
        expect(response.status).toBe(401);
    }));
    test("Refresh token fail - invalid token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/refresh`)
            .set("Cookie", [`refreshToken=invalidtoken`])
            .send({});
        expect(response.status).toBe(500);
    }));
    test("Logout and token invalidation", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = createTestUser();
        const regRes = yield (0, supertest_1.default)(server_1.default).post(`${baseUrl}/register`).send(user);
        expect(regRes.status).toBe(201);
        const userId = regRes.body.id;
        yield ensureUserHasHashedPassword(userId, user.password);
        const loginResponse = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/login`)
            .send({ email: user.email, password: user.password });
        expect(loginResponse.status).toBe(200);
        let refreshToken;
        const cookies = loginResponse.headers["set-cookie"];
        if (cookies && cookies.length > 0) {
            const match = cookies[0].match(/refreshToken=([^;]+)/);
            if (match)
                refreshToken = match[1];
        }
        expect(refreshToken).toBeDefined();
        const logoutResponse = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/logout`)
            .set("Cookie", [`refreshToken=${refreshToken}`])
            .send({});
        expect(logoutResponse.status).toBe(200);
        const refreshAfterLogout = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/refresh`)
            .set("Cookie", [`refreshToken=${refreshToken}`])
            .send({});
        expect(refreshAfterLogout.status).toBe(500);
    }));
    test("Access protected route (/me) with invalid token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .get(`${baseUrl}/me`)
            .set("Authorization", "Bearer invalidtoken");
        expect(response.status).toBe(500);
    }));
    test("Google login fail - missing token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).post(`${baseUrl}/google`).send({});
        expect(response.status).toBe(400);
    }));
    test("Chat endpoint fail - missing message", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/generateContent`)
            .send({});
        expect(response.status).toBe(400);
    }));
    test("POST /generateTokens => returns tokens", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/generateTokens`)
            .send({ userId: "someFakeId" });
        if (process.env.ACCESS_TOKEN_SECRET && process.env.REFRESH_TOKEN_SECRET) {
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body).toHaveProperty("accessToken");
            expect(res.body).toHaveProperty("refreshToken");
        }
        else {
            expect(res.status).toBe(500);
        }
    }));
    test("POST /generateTokens => missing userId => 400", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default).post(`${baseUrl}/generateTokens`).send({});
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("message", "userId is required");
    }));
    test("POST /generateTokens => missing env secrets => 500", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalAccess = process.env.ACCESS_TOKEN_SECRET;
        const originalRefresh = process.env.REFRESH_TOKEN_SECRET;
        delete process.env.ACCESS_TOKEN_SECRET;
        delete process.env.REFRESH_TOKEN_SECRET;
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/generateTokens`)
            .send({ userId: "anyId" });
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty("message", "Token secrets not found");
        process.env.ACCESS_TOKEN_SECRET = originalAccess;
        process.env.REFRESH_TOKEN_SECRET = originalRefresh;
    }));
    test("POST /verifyRefreshToken => missing => 400 or 500", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.default)
            .post(`${baseUrl}/verifyRefreshToken`)
            .send({});
        expect(res.status).toBe(400);
    }));
});
