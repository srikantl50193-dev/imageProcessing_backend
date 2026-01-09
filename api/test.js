export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://image-processing-ui-lovat.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle actual requests
  if (req.method === 'GET') {
    res.status(200).json({
      status: 'OK',
      message: 'Vercel API route is working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}