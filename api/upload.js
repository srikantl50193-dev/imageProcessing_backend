// Clean, minimal upload handler for CORS testing
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simple CORS test response
    const imageId = Date.now().toString();

    res.status(200).json({
      success: true,
      id: imageId,
      publicUrl: `data:image/svg+xml;base64,${Buffer.from(`<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#ffffff" stroke="#e1e3e9" stroke-width="2"/><text x="200" y="180" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" fill="#1f293d" font-weight="bold">✅ CORS Working</text><text x="200" y="220" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#6b7280">ID: ${imageId}</text></svg>`).toString('base64')}`,
      cloudinaryId: `processed_${imageId}`,
      originalSize: 1024000,
      processedSize: 800000,
      message: 'CORS working - upload endpoint responding!'
    });

  } catch (error) {
    console.error('❌ Upload failed:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
}