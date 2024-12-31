import request from "supertest";
import app , { connectDB } from "../server";
import Post , { PostInterface } from "../models/post_model";
import User , { UserInterface } from "../models/user_model";
import Comment , {CommentInterface} from "../models/comment_model";
import mongoose from "mongoose";

const testUser: UserInterface & {accessToken? : string} = {
    email: "test@gmail.com",
    password: "testpassword",
}
let testPost: PostInterface;
let testComment: CommentInterface;

beforeAll(async () => {
    console.log("Jest starting!");
    await connectDB();
    await User.deleteMany();
    await Post.deleteMany();
    await Comment.deleteMany();

    await request(app).post("/api/auth/register").send(testUser);
    const responseLoginUser = await request(app).post("/api/auth/login").send(testUser);
    expect(responseLoginUser.status).toBe(200);
    expect(responseLoginUser.body.accessToken).toBeDefined();
    expect(responseLoginUser.body.refreshToken).toBeDefined();
    expect(responseLoginUser.body.id).toBeDefined();
    testUser.accessToken = responseLoginUser.body.accessToken;
    testUser.refreshToken = responseLoginUser.body.refreshToken;
    testUser._id = responseLoginUser.body.id;

    testPost = {
        userId: responseLoginUser.body.id,
        content: "test content",
    }

    const responseCreatePost = await request(app).post("/api/post/createPost")
    .set("Authorization", `Bearer ${testUser.accessToken}`).send(testPost);
    expect(responseCreatePost.status).toBe(201);
    expect(responseCreatePost.body).toHaveProperty("success");
    testPost._id = responseCreatePost.body.data._id;

    testComment = {
        userId: responseLoginUser.body.id,
        postId: responseCreatePost.body.data._id,
        content: "test comment",
    }
});

afterAll(async () => {
    console.log("server closing");
    await mongoose.connection.close();
});

const baseUrl = "/api/comment";

describe("Comment Tests", () => {
    test("Create comment success", async () => {
        const response = await request(app)
            .post(baseUrl + "/createComment")
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send(testComment);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("success");
        testComment._id = response.body.data._id; 
    });

    test("Create comment fail by missing content", async () => {
        const response = await request(app).post(baseUrl + "/createComment")
        .send({...testComment , content: ""});
        expect(response.status).not.toBe(201);
        expect(response.body).not.toHaveProperty("success");
    });

    test("Create comment fail by missing userId", async () => {
        const response = await request(app).post(baseUrl + "/createComment")
        .send({...testComment , userId: ""});
        expect(response.status).not.toBe(201);
        expect(response.body).not.toHaveProperty("success");
    });

    test("Create comment fail by missing postId", async () => {
        const response = await request(app).post(baseUrl + "/createComment")
        .send({...testComment , postId: ""});
        expect(response.status).not.toBe(201);
        expect(response.body).not.toHaveProperty("success");
    });

    test("Get all comments", async () => {
        const response = await request(app).get(baseUrl + "/getComments");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success");
        expect(response.body.comments.length).toBe(1);
    });

    test("Get comments by postId", async () => {
        const response = await request(app)
        .get(baseUrl + "/getCommentByPostId/" + testComment.postId)
        .set("Authorization", `Bearer ${testUser.accessToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success");
        expect(response.body.comments.length).toBe(1);
    });

    test("Get comment by id", async () => {
        const response = await request(app).get(baseUrl + "/getCommentById/" + testComment._id);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success");
    });

    test("Update comment success", async () => {
        const response = await request(app)
            .put(baseUrl + "/updateComment/" + testComment._id)
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send({...testComment , content: "updated comment"});
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success");
    });

    test("Update comment fail by missing content", async () => {
        const response = await request(app)
            .put(baseUrl + "/updateComment/" + testComment._id)
            .set("Authorization", `Bearer ${testUser.accessToken}`)
            .send({...testComment , content: ""});
        expect(response.status).not.toBe(200);
        expect(response.body).not.toHaveProperty("success");
    });

    test("Delete comment success", async () => {
        const response = await request(app)
            .delete(baseUrl + "/deleteComment/" + testComment._id)
            .set("Authorization", `Bearer ${testUser.accessToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success");
    });

    test("Get all comments after delete", async () => {
        const response = await request(app).get(baseUrl + "/getComments");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success");
        expect(response.body.comments.length).toBe(0);
    });

    test("Create comment with invalid token", async () => {
        const response = await request(app).post(baseUrl + "/createComment")
            .set("Authorization", `Bearer invalid_token`).send(testComment);
        expect(response.status).toBe(401);
        expect(response.body).not.toHaveProperty("success");
    });
});
