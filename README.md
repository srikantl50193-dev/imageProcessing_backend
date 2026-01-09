# Image Transformation Service Backend

A TypeScript-based backend service for image processing that removes backgrounds using Photoroom API and applies horizontal flipping.

## Features

- **Image Upload**: Accept image uploads via REST API
- **Background Removal**: Integrates with Photoroom API (free tier available)
- **Horizontal Flip**: Automatically flips processed images
- **Cloud Hosting**: Stores processed images on Cloudinary (free tier)
- **Image Management**: Retrieve and delete processed images

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Photoroom API key (free tier available at [photoroom.com/api](https://www.photoroom.com/api))
- Cloudinary account (free tier available at [cloudinary.com](https://cloudinary.com))

## Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**

   Copy the environment variables and configure them:

   ```bash
   # Create .env file with your API keys
   cp .env.example .env
   ```

   Required environment variables:
   ```env
   PORT=3000
   NODE_ENV=development

   # Get from https://www.photoroom.com/api (free tier available)
   PHOTOROOM_API_KEY=your_photoroom_api_key_here

   # Get from https://cloudinary.com (free tier available)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Build and run:**
   ```bash
   # Development mode
   npm run dev

   # Production build
   npm run build
   npm start
   ```

## API Endpoints

### Upload Image
```http
POST /api/images/upload
Content-Type: multipart/form-data

Form field: image (file)
```

**Response:**
```json
{
  "success": true,
  "imageId": "uuid-string",
  "message": "Image upload started. Check status for completion.",
  "statusUrl": "/api/images/uuid-string/status"
}
```

### Check Processing Status
```http
GET /api/images/:id/status
```

**Response:**
```json
{
  "id": "uuid-string",
  "status": "processing|completed|failed",
  "publicUrl": "https://cloudinary-url",
  "processedAt": "2024-01-01T00:00:00.000Z"
}
```

### Get Processed Image
```http
GET /api/images/:id
```
Redirects to the hosted image URL.

### Delete Image
```http
DELETE /api/images/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

### Health Check
```http
GET /health
```

## Usage Example

```javascript
// Upload an image
const formData = new FormData();
formData.append('image', imageFile);

const uploadResponse = await fetch('/api/images/upload', {
  method: 'POST',
  body: formData
});

const { imageId, statusUrl } = await uploadResponse.json();

// Check processing status
const statusResponse = await fetch(statusUrl);
const status = await statusResponse.json();

if (status.status === 'completed') {
  // Image is ready
  window.open(status.publicUrl, '_blank');
}
```

## Architecture

- **Express.js**: Web framework
- **TypeScript**: Type safety
- **Multer**: File upload handling
- **Sharp**: Image processing
- **Photoroom API**: Background removal
- **Cloudinary**: Image hosting
- **In-memory storage**: Image metadata (demo purposes)

## Error Handling

The service includes comprehensive error handling for:
- Invalid file types/sizes
- API failures
- Network timeouts
- Processing errors

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Deployment

This service can be deployed to:
- Heroku
- Vercel
- AWS EC2
- DigitalOcean
- Any Node.js hosting platform

Make sure to set environment variables in your deployment platform.

## Free Credits

- **Photoroom**: Offers free tier for development and testing
- **Cloudinary**: Generous free tier (25GB storage, 25GB monthly bandwidth)

## License

ISC