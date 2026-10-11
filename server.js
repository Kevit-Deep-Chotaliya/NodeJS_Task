require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error('MONGO_URI is missing in .env');
        }

        if (!process.env.JWT_KEY) {
            throw new Error('JWT_KEY is missing in .env');
        }

        await mongoose.connect(process.env.MONGO_URL);

        console.log('MongoDB connected successfully.');

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Startup failed:', error.message);
        process.exit(1);
    }
}

startServer();