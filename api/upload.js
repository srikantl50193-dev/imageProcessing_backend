export default function handler(req, res) {
  // Enable CORS - Allow all Vercel origins for this demo
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Simple response without any complex setup
  // Simple upload response for testing
  const imageId = Date.now().toString();

  res.status(200).json({
    success: true,
    id: imageId,
    publicUrl: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjZTVlN2ViIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIyMDAiIHk9IjIwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMxMTE4MjciIGZvbnQtd2VpZ2h0PSJib2xkIj7inIUgVXBsb2FkIFdvcmtzPC90ZXh0Pjx0ZXh0IHg9IjIwMCIgeT0iMjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZiNzI4MCI+SUQ6ICR7aW1hZ2VJZH08L3RleHQ+PC9zdmc+`.replace('${imageId}', imageId),
    cloudinaryId: `processed_${imageId}`,
    originalSize: 1024000,
    processedSize: 800000,
    message: 'Upload works with CORS!',
    timestamp: new Date().toISOString(),
    method: req.method
  });
}