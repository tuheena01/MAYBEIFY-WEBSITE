import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-maybeify-2026');

/**
 * Verifies the JWT auth token from cookies.
 * Returns the decoded payload (e.g., { userId, role }) if valid, or null otherwise.
 */
export async function verifyAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });

    return payload;
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}
