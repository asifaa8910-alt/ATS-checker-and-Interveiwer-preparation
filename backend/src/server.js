const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { connectDB } = require('./config/db');
const { verifyGeminiConnection } = require('./utils/gemini');
const app = require('./app');

// Connect to Database
connectDB();

// Verify Gemini Connection
verifyGeminiConnection();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
