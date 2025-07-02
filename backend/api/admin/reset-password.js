import bcrypt from 'bcryptjs';
import { findUserById, updateUser } from '../supabase-service.js';

const SALT_ROUNDS = 12;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, newPassword } = req.body;
  if (!userId || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Invalid user ID or password too short' });
  }

  try {
    const passwordHash = bcrypt.hashSync(newPassword, 10);
    const updatedUser = await updateUser(userId, { password_hash: passwordHash });
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Admin reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
} 