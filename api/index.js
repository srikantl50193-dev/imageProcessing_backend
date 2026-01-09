// Load environment variables FIRST
require('dotenv').config();

// Import and export the Express app
const app = require('../dist/index.js').default;
module.exports = app;
