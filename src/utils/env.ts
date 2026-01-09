export const env = {
  get PORT() { return parseInt(process.env.PORT || '3000', 10); },
  get NODE_ENV() { return process.env.NODE_ENV || 'development'; },
  get PHOTOROOM_API_KEY() { return process.env.PHOTOROOM_API_KEY; },
  get CLOUDINARY_CLOUD_NAME() { return process.env.CLOUDINARY_CLOUD_NAME; },
  get CLOUDINARY_API_KEY() { return process.env.CLOUDINARY_API_KEY; },
  get CLOUDINARY_API_SECRET() { return process.env.CLOUDINARY_API_SECRET; },
  get MAX_FILE_SIZE() { return parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); },
  get ALLOWED_ORIGINS() { return process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']; },
};

export function validateEnvironment(): void {
  const requiredVars = [
    'PHOTOROOM_API_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  const missing = requiredVars.filter(varName => !env[varName as keyof typeof env]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease set these environment variables before running the application.');
    console.error('Check the README.md for setup instructions.');
    process.exit(1);
  }

  console.log('✅ Environment variables validated successfully');
}