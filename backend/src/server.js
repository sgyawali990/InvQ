require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db'); 

const PORT = process.env.PORT || 4000;  

// START SERVER
async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`InvQ Backend running on http://localhost:${PORT}`);
            console.log(`Store Routes: http://localhost:${PORT}/store`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();