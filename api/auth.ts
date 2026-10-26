import type { VercelRequest, VercelResponse } from '@vercel/node';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const { username, password } = req.body || {};

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = `token_vercel_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    res.status(200).json({
      success: true,
      token,
      user: {
        username: ADMIN_USERNAME,
        name: 'Administrador (Vercel)',
        role: 'Administrator',
      },
    });
  } else {
    res.status(401).json({
      success: false,
      error: `Credenciales inválidas. Usa ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`,
    });
  }
}
