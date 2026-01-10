export default function handler(req, res) {
  // Enable CORS - Allow all Vercel origins for this demo
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Simple response like test.js
  res.status(200).json({
    status: 'OK',
    message: 'Upload endpoint works with CORS!',
    timestamp: new Date().toISOString(),
    method: req.method
  });
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
};// Force redeploy v4 - CORS wildcard fix
// Force backend redeploy - wildcard CORS for all origins
