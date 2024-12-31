import request from 'supertest';
import app, { connectDB } from '../server';
import Message, { MessageInterface } from '../models/messages_model';
import mongoose from 'mongoose';
import User, { UserInterface } from '../models/user_model';

const testUser1: UserInterface & { accessToken?: string } = {
    email: 'testuser1@test.com',
    password: 'testpassword',
};
const testUser2: UserInterface & { accessToken?: string } = {
    email: 'testuser2@test.com',
    password: 'testpassword',
};
let testMessage1: MessageInterface;
let testMessage2: MessageInterface;


beforeAll(async () => {
    console.log('Jest starting!');
    await connectDB();
    await User.deleteMany();
    await Message.deleteMany();
    const responseTestUser1 = await request(app).post("/api/auth/register").send(testUser1);
    const responseTestUser2 = await request(app).post("/api/auth/register").send(testUser2);
    const responseLoginTestUser1 = await request(app).post("/api/auth/login").send(testUser1);
    expect(responseLoginTestUser1.status).toBe(200);
    testUser1.accessToken = responseLoginTestUser1.body.accessToken;   
    testUser1.refreshToken = responseLoginTestUser1.body.refreshToken;
    testUser1._id = responseLoginTestUser1.body.id;
    testMessage1 = {
        senderId: responseTestUser1.body.id,
        receiverId: responseTestUser2.body.id,
        content: 'test message',
        messageRead: false,
    };
    testMessage2 = {
        senderId: responseTestUser2.body.id,
        receiverId: responseTestUser1.body.id,
        content: 'test message',
        messageRead: false,
    };


});

afterAll(async () => {
    console.log('server closing');
   
    await mongoose.connection.close();
});
const baseUrl = '/api/messages';

describe('Test Messages', () => {
    test('creat new message between 2 users', async () => {
         const responseSendMessage = await request(app).post(baseUrl+"/SendMessage")
        .send(testMessage1)
        .set('Authorization', `Bearer ${testUser1.accessToken}`);
        expect(responseSendMessage.status).toBe(201);
        expect(responseSendMessage.body.messageId).toBeDefined();
        expect(responseSendMessage.body).toHaveProperty('success', true);
        testMessage1.messageId = responseSendMessage.body.messageId;
        const responseLogoutTestUser1 = await request(app).post("/api/auth/logout")
        .send({refreshToken: testUser1.refreshToken});
        expect(responseLogoutTestUser1.status).toBe(200);
        const responseLoginTestUser2 = await request(app).post("/api/auth/login").send(testUser2);
        expect(responseLoginTestUser2.status).toBe(200);
        testUser2.accessToken = responseLoginTestUser2.body.accessToken;
        testUser2.refreshToken = responseLoginTestUser2.body.refreshToken;
        testUser2._id = responseLoginTestUser2.body.id;
        const responseGetMessagesBetweenUsers = await request(app)
        .get(baseUrl + "/GetMessagesBetweenUsers")
        .query({ senderId: testMessage1.senderId, receiverId: testMessage1.receiverId })
        .set('Authorization', `Bearer ${testUser2.accessToken}`);
        expect(responseGetMessagesBetweenUsers.status).toBe(200);
        expect(responseGetMessagesBetweenUsers.body.data).toHaveLength(1);
        const responseSendMessage2 = await request(app).post(baseUrl+"/SendMessage")
        .send(testMessage2)
        .set('Authorization', `Bearer ${testUser2.accessToken}`);
        expect(responseSendMessage2.status).toBe(201);
        expect(responseSendMessage2.body.messageId).toBeDefined();
        expect(responseSendMessage2.body).toHaveProperty('success', true);
        testMessage2.messageId = responseSendMessage2.body.messageId;

    });
    test('get all messages of a user', async () => {
        const responseGetAllMessages = await request(app)
        .get(baseUrl+"/GetAllMessages")
        .query({ userId: testMessage1.senderId })
        .set('Authorization', `Bearer ${testUser1.accessToken}`);
        expect(responseGetAllMessages.status).toBe(200);
        expect(responseGetAllMessages.body.data).toHaveLength(2);
    });
    test('mark message as read', async () => {
        const responseMarkMessageAsRead = await request(app)
        .put(baseUrl+"/MarkMessageAsRead")
        .send({ messageId: testMessage2.messageId })
        .set('Authorization', `Bearer ${testUser1.accessToken}`);
        expect(responseMarkMessageAsRead.status).toBe(200);
        expect(responseMarkMessageAsRead.body).toHaveProperty('success', true);
        const responseGetMessagesBetweenUsers = await request(app)
        .get(baseUrl + "/GetMessagesBetweenUsers")
        .query({ senderId: testMessage2.senderId, receiverId: testMessage2.receiverId })
        .set('Authorization', `Bearer ${testUser2.accessToken}`);
        expect(responseGetMessagesBetweenUsers.status).toBe(200);
        expect(responseGetMessagesBetweenUsers.body.data[1].messageRead).toBe(true);
    });
    test('delete message', async () => {
        const responseDeleteMessage = await request(app)
        .delete(baseUrl+"/DeleteMessage")
        .send({ messageId: testMessage2.messageId })
        .set('Authorization', `Bearer ${testUser1.accessToken}`);
        expect(responseDeleteMessage.status).toBe(201);
        expect(responseDeleteMessage.body).toHaveProperty('success', true);
        const responseGetAllMessages = await request(app)
        .get(baseUrl+"/GetAllMessages")
        .query({ userId: testMessage2.senderId })
        .set('Authorization', `Bearer ${testUser1.accessToken}`);
        expect(responseGetAllMessages.status).toBe(200);
        expect(responseGetAllMessages.body.data).toHaveLength(1);
    });

});


