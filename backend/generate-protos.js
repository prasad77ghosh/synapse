import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const protoDir = path.join(__dirname, 'proto');
const services = ['auth-service', 'user-service']; // Add more services here

// Get all proto files
const protoFiles = fs.readdirSync(protoDir)
  .filter(f => f.endsWith('.proto'))
  .map(f => path.join(protoDir, f))
  .join(' ');

if (!protoFiles) {
  console.error('❌ No .proto files found in proto folder');
  process.exit(1);
}

services.forEach(service => {
  const outDir = path.join(__dirname, service, 'src/grpc');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  try {
    // Use ts-proto via npx directly (no --plugin needed)
    execSync(
      `npx ts-proto ${protoFiles} --output ${outDir} --nestJs --outputServices generic-definitions`,
      { stdio: 'inherit' }
    );
    console.log(`✅ Generated proto types for ${service}`);
  } catch (err) {
    console.error(`❌ Failed to generate types for ${service}`);
    console.error(err);
  }
});

console.log('🎉 All proto files generated successfully!');
