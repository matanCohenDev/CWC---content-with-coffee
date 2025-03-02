import app, { connectDB } from "./server";
import path from "path";
import express from "express";

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
    console.log("✅ Registering API routes before serving frontend");

    app._router.stack.forEach((route: any) => {
        if (route.route && route.route.path) {
            console.log(`Registered route: ${route.route.path}`);
        }
    });

    app.use(express.static(path.join(__dirname, "../frontend-cwc/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend-cwc/dist/index.html"));
    });

    app.listen(PORT, () => {
        console.log(`✅ Server listening on port ${PORT}`);
    });

}).catch((error) => {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
});
