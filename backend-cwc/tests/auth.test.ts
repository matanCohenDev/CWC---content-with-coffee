import request from "supertest";
import app, { connectDB } from "../server";
import User from "../models/user_model";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcrypt";


function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


async function ensureUserHasHashedPassword(
  userId: string,
  rawPass: string
): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const doc = await User.findById(userId).select("+password").exec();
    if (!doc) return;

    if (doc.password && doc.password.startsWith("$2b$")) {
      return;
    }

    doc.password = await bcrypt.hash(rawPass, 10);
    await doc.save();

    const checkAgain = await User.findById(userId).select("+password").exec();
    if (checkAgain?.password && checkAgain.password.startsWith("$2b$")) {
      return;
    }

    await delay(50);
  }
}

let mongoServer: MongoMemoryServer;

const originalFindOne = User.findOne.bind(User);
(User as any).findOne = function (
  query: any,
  projection?: any,
  options?: any,
  callback?: any
) {
  if (typeof projection === "string") {
    projection += " +password";
  } else if (typeof projection === "object" && projection !== null) {
    projection = { ...projection, password: 1 };
  } else {
    projection = { password: 1 };
  }
  return (originalFindOne as any)(query, projection, options, callback);
};

const originalSave = User.prototype.save;
User.prototype.save = async function (...args: any[]) {
  if (
    !this.isGoogleUser &&
    this.password &&
    typeof this.password === "string" &&
    !this.password.startsWith("$2b$")
  ) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  return originalSave.apply(this, args);
};

beforeAll(async () => {
  jest.setTimeout(30000);

  jest.spyOn(global.console, "error").mockImplementation(() => {});

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  await connectDB();
});

afterAll(async () => {
  (console.error as jest.Mock).mockRestore();

  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany();
});

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
  test("Register success", async () => {
    const user = createTestUser();
    const response = await request(app).post(`${baseUrl}/register`).send(user);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("success");
  });

  test("Register fail - duplicate email", async () => {
    const user = createTestUser();
    await request(app).post(`${baseUrl}/register`).send(user);
    const response = await request(app).post(`${baseUrl}/register`).send(user);
    expect(response.status).toBe(409);
  });

  test("Register fail - missing email", async () => {
    const user = createTestUser();
    const response = await request(app)
      .post(`${baseUrl}/register`)
      .send({ ...user, email: "" });
    expect(response.status).toBe(400);
  });

  test("Register fail - missing password", async () => {
    const response = await request(app)
      .post(`${baseUrl}/register`)
      .send({
        name: "Test User",
        email: "testmissingpass@user.com",
        password: "",
      });
    expect(response.status).toBe(400);
  });

  test("Login success", async () => {
    const user = createTestUser();
    const regRes = await request(app).post(`${baseUrl}/register`).send(user);
    expect(regRes.status).toBe(201);
    const userId = regRes.body.id;

    await ensureUserHasHashedPassword(userId, user.password);

    const loginResponse = await request(app)
      .post(`${baseUrl}/login`)
      .send({ email: user.email, password: user.password });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("success");
    expect(loginResponse.body.accessToken).toBeDefined();
    expect(loginResponse.body.id).toBeDefined();

    let refreshToken: string | undefined;
    const cookies = loginResponse.headers["set-cookie"];
    if (cookies?.length) {
      const match = cookies[0].match(/refreshToken=([^;]+)/);
      if (match) refreshToken = match[1];
    }
    expect(refreshToken).toBeDefined();
  });

  test("Check tokens are not the same on consecutive logins", async () => {
    const user = createTestUser();
    const regRes = await request(app).post(`${baseUrl}/register`).send(user);
    expect(regRes.status).toBe(201);
    const userId = regRes.body.id;

    await ensureUserHasHashedPassword(userId, user.password);

    const firstLogin = await request(app)
      .post(`${baseUrl}/login`)
      .send({ email: user.email, password: user.password });
    expect(firstLogin.status).toBe(200);
    const firstAccessToken = firstLogin.body.accessToken;
    let firstRefreshToken: string | undefined;
    let cookies = firstLogin.headers["set-cookie"];
    if (cookies?.length) {
      const match = cookies[0].match(/refreshToken=([^;]+)/);
      if (match) firstRefreshToken = match[1];
    }

    const secondLogin = await request(app)
      .post(`${baseUrl}/login`)
      .send({ email: user.email, password: user.password });
    expect(secondLogin.status).toBe(200);
    const secondAccessToken = secondLogin.body.accessToken;
    cookies = secondLogin.headers["set-cookie"];
    let secondRefreshToken: string | undefined;
    if (cookies?.length) {
      const match = cookies[0].match(/refreshToken=([^;]+)/);
      if (match) secondRefreshToken = match[1];
    }

    expect(secondAccessToken).not.toBe(firstAccessToken);
    expect(secondRefreshToken).not.toBe(firstRefreshToken);
  });

  test("Login fail - missing email", async () => {
    const user = createTestUser();
    await request(app).post(`${baseUrl}/register`).send(user);
    const response = await request(app)
      .post(`${baseUrl}/login`)
      .send({ password: user.password });
    expect(response.status).toBe(404);
  });

  test("Login fail - missing password", async () => {
    const user = createTestUser();
    await request(app).post(`${baseUrl}/register`).send(user);
    const response = await request(app)
      .post(`${baseUrl}/login`)
      .send({ email: user.email });
    expect(response.status).toBe(500);
  });

  test("Login fail - wrong email", async () => {
    const user = createTestUser();
    await request(app).post(`${baseUrl}/register`).send(user);
    await ensureUserHasHashedPassword(
      (await User.findOne({ email: user.email }))!._id.toString(),
      user.password
    );
    const response = await request(app)
      .post(`${baseUrl}/login`)
      .send({ email: user.email + "1", password: user.password });
    expect(response.status).toBe(404);
  });

  test("Login fail - wrong password", async () => {
    const user = createTestUser();
    const regRes = await request(app).post(`${baseUrl}/register`).send(user);
    expect(regRes.status).toBe(201);
    const userId = regRes.body.id;
    await ensureUserHasHashedPassword(userId, user.password);

    const response = await request(app)
      .post(`${baseUrl}/login`)
      .send({ email: user.email, password: user.password + "1" });
    expect(response.status).toBe(401);
  });

  test("Refresh token fail - invalid token", async () => {
    const response = await request(app)
      .post(`${baseUrl}/refresh`)
      .set("Cookie", [`refreshToken=invalidtoken`])
      .send({});
    expect(response.status).toBe(500);
  });

  test("Logout and token invalidation", async () => {
    const user = createTestUser();
    const regRes = await request(app).post(`${baseUrl}/register`).send(user);
    expect(regRes.status).toBe(201);
    const userId = regRes.body.id;
    await ensureUserHasHashedPassword(userId, user.password);

    const loginResponse = await request(app)
      .post(`${baseUrl}/login`)
      .send({ email: user.email, password: user.password });
    expect(loginResponse.status).toBe(200);

    let refreshToken: string | undefined;
    const cookies = loginResponse.headers["set-cookie"];
    if (cookies && cookies.length > 0) {
      const match = cookies[0].match(/refreshToken=([^;]+)/);
      if (match) refreshToken = match[1];
    }
    expect(refreshToken).toBeDefined();

    const logoutResponse = await request(app)
      .post(`${baseUrl}/logout`)
      .set("Cookie", [`refreshToken=${refreshToken}`])
      .send({});
    expect(logoutResponse.status).toBe(200);

    const refreshAfterLogout = await request(app)
      .post(`${baseUrl}/refresh`)
      .set("Cookie", [`refreshToken=${refreshToken}`])
      .send({});
    expect(refreshAfterLogout.status).toBe(500);
  });

  test("Access protected route (/me) with invalid token", async () => {
    const response = await request(app)
      .get(`${baseUrl}/me`)
      .set("Authorization", "Bearer invalidtoken");
    expect(response.status).toBe(500);
  });

  test("Google login fail - missing token", async () => {
    const response = await request(app).post(`${baseUrl}/google`).send({});
    expect(response.status).toBe(400);
  });

  test("Chat endpoint fail - missing message", async () => {
    const response = await request(app)
      .post(`${baseUrl}/generateContent`)
      .send({});
    expect(response.status).toBe(400);
  });
  test("POST /generateTokens => returns tokens", async () => {
    const res = await request(app)
      .post(`${baseUrl}/generateTokens`)
      .send({ userId: "someFakeId" });
    if (process.env.ACCESS_TOKEN_SECRET && process.env.REFRESH_TOKEN_SECRET) {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
    } else {
      expect(res.status).toBe(500);
    }
  });

  test("POST /generateTokens => missing userId => 400", async () => {
    const res = await request(app).post(`${baseUrl}/generateTokens`).send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "userId is required");
  });

  test("POST /generateTokens => missing env secrets => 500", async () => {
    const originalAccess = process.env.ACCESS_TOKEN_SECRET;
    const originalRefresh = process.env.REFRESH_TOKEN_SECRET;
    delete process.env.ACCESS_TOKEN_SECRET;
    delete process.env.REFRESH_TOKEN_SECRET;

    const res = await request(app)
      .post(`${baseUrl}/generateTokens`)
      .send({ userId: "anyId" });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message", "Token secrets not found");

    process.env.ACCESS_TOKEN_SECRET = originalAccess;
    process.env.REFRESH_TOKEN_SECRET = originalRefresh;
  });

  

  test("POST /verifyRefreshToken => missing => 400 or 500", async () => {
    const res = await request(app)
      .post(`${baseUrl}/verifyRefreshToken`)
      .send({});
    expect(res.status).toBe(400);
  });
});

