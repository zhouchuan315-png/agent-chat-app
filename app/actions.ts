'use server';

import { signIn as logtoSignIn, signOut as logtoSignOut } from '@logto/next/server-actions';
import { logtoConfig } from './logto';

export async function handleSignIn() {
  await logtoSignIn(logtoConfig);
}

export async function handleSignOut() {
  await logtoSignOut(logtoConfig);
}
