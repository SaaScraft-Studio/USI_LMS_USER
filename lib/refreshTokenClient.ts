// lib/refreshTokenClient.ts
'use client'

/**
 * ⚠️ DISABLED ON PURPOSE
 *
 * We use httpOnly cookie-based auth + Next.js middleware.
 * Client-side refresh token handling causes infinite loops.
 *
 * Token refresh must be handled server-side only.
 */

export async function refreshTokenClient(): Promise<boolean> {
  // ❌ DO NOT refresh tokens on client
  // ❌ DO NOT touch localStorage
  // ❌ DO NOT redirect from here

  return false
}