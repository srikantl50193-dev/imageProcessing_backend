export default function handler(req, res) {
  // Enable CORS - Allow all Vercel origins for this demo
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Simple response without any complex setup
  res.status(200).json({
    status: 'OK',
    message: 'Basic Vercel API route works!',
    timestamp: new Date().toISOString(),
    method: req.method
  });
}