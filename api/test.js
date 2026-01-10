export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://image-processing-e9o9uni0k-srikant-lakshminarayans-projects.vercel.app');
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