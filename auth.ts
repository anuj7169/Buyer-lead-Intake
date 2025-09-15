import { cookies } from 'next/headers';

export function getUser() {
  // Demo login: use a cookie called 'user' to simulate auth
  const cookieStore = cookies();
  const user = cookieStore.get('user');
  return user ? { email: user.value } : null;
}

export function loginDemo() {
  // Set cookie 'user' demo for login simulation
  return new Response('Logged in', {
    status: 200,
    headers: {
      'Set-Cookie': `user=demo@company.com; Path=/; HttpOnly; Max-Age=3600`,
    },
  });
}

export function logoutDemo() {
  return new Response('Logged out', {
    status: 200,
    headers: {
      'Set-Cookie': `user=; Path=/; HttpOnly; Max-Age=0`,
    },
  });
}
