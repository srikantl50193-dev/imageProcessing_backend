import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';

export default async function handler(req, res) {
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const form = formidable({ multiples: false });

    const [fields, files] = await form.parse(req);

    // Check if file was uploaded
    if (!files.image || !files.image[0]) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const file = files.image[0];
    const imageId = uuidv4();

    // Here you would process the image with Photoroom API
    // For now, just return a mock response
    const result = {
      id: imageId,
      originalSize: file.size || 0,
      processedSize: file.size || 0, // Mock processed size
      publicUrl: `https://cloudinary.com/mock/${imageId}.jpg`, // Mock URL
      cloudinaryId: `mock_${imageId}`,
      message: 'Image uploaded successfully (mock processing)'
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
};