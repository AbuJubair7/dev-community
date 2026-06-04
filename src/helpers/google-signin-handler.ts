import { OAuth2Client } from 'google-auth-library';
import { UnauthorizedException } from '@nestjs/common';
import 'dotenv/config';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI;

// console.log('Google OAuth Config:', {
//   clientId: clientId,
//   clientSecret: clientSecret,
//   redirectUri: redirectUri,
// });

if (!clientId || !clientSecret || !redirectUri) {
  throw new Error('Missing Google OAuth environment variables.');
}

const client = new OAuth2Client(clientId, clientSecret, redirectUri);

export function getGoogleAuthLink(): string {
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });
  return authUrl;
}

export async function handleGoogleCallback(code: string): Promise<{
  email: string;
  name: string;
}> {
  try {
    const { tokens } = await client.getToken(code);
    console.log('Google OAuth Tokens:', tokens);

    if (!tokens.id_token) {
      throw new UnauthorizedException('Google did not return an ID token.');
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw new UnauthorizedException('Invalid Google token data');
    }

    const { email, name } = payload;
    return { email, name: name || 'Google User' };
  } catch {
    throw new UnauthorizedException('Failed to verify Google token');
  }
}
