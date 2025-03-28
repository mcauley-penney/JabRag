import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load your GitHub App credentials
const APP_ID = process.env.APP_ID; // or hardcode your App ID here
const PRIVATE_KEY_PATH = path.join(__dirname, './jabrag.private-key.pem'); // Path to your downloaded .pem file

// Read private key from file
const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

/**
 * Generates a JWT for GitHub App authentication
 * @returns {string} A signed JWT
 */
export function generateGitHubAppJWT() {
  const now = Math.floor(Date.now() / 1000); // current time in seconds
  const payload = {
    iat: now - 60, // issued at (backdated a little for safety)
    exp: now + (10 * 60), // expires in 10 minutes
    iss: APP_ID, // GitHub App ID
  };

  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

  return token;
}
