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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const socket_io_1 = require("socket.io");
const server_1 = __importStar(require("./server"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const messages_model_1 = __importDefault(require("./models/messages_model"));
const PORT = process.env.PORT || 8080;
const BASE_URL = process.env.BASE_URL;
const isProduction = ((_a = process.env.NODE_ENV) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase()) === 'production';
let server;
if (isProduction) {
    const options = {
        key: fs_1.default.readFileSync('/home/st111/client-key.pem'),
        cert: fs_1.default.readFileSync('/home/st111/client-cert.pem')
    };
    server = https_1.default.createServer(options, server_1.default);
}
else {
    server = http_1.default.createServer(server_1.default);
}
const io = new socket_io_1.Server(server, {
    cors: {
        origin: BASE_URL,
        methods: ["GET", "POST"],
        credentials: true,
    },
});
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on('sendMessage', (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const savedMessage = yield messages_model_1.default.create({
                senderId: data.senderId,
                receiverId: data.receiverId,
                content: data.content,
            });
            const fullMessage = Object.assign(Object.assign({}, data), { _id: savedMessage._id, createdAt: savedMessage.createdAt });
            io.emit('message', fullMessage);
        }
        catch (error) {
            console.error("Error saving message:", error);
        }
    }));
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});
(0, server_1.connectDB)().then(() => {
    server_1.default.use(express_1.default.static(path_1.default.join(__dirname, "../frontend-cwc/dist")));
    server_1.default.get("*", (req, res) => {
        res.sendFile(path_1.default.join(__dirname, "../frontend-cwc/dist/index.html"));
    });
    server.listen(PORT, () => {
        console.log(`✅ ${isProduction ? "HTTPS" : "HTTP"} Server listening on port ${PORT}`);
    });
}).catch((error) => {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
});
