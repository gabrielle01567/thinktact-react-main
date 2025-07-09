import supabase from '../supabase-service.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.query;
  console.log('Queried email:', email); // Debug log
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    console.log('Supabase result:', { data, error }); // Debug log

    if (error || !data) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Optionally, omit sensitive fields like password and security_answer
    const { password, security_answer, ...safeUser } = data;
    res.status(200).json(safeUser);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
} 