export default function handler(req, res) {
  // Simple response without any complex setup
  res.status(200).json({
    status: 'OK',
    message: 'Basic Vercel API route works!',
    timestamp: new Date().toISOString(),
    method: req.method
  });
}