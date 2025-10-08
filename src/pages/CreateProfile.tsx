
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function CreateProfile() {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileCreation = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (!user) {
        throw new Error('User not authenticated');
      }
      const { error } = await supabase.from('users').upsert({ id: user.id, username, country });
      if (error) {
        throw error;
      }
      alert('Profile created successfully!');
    } catch (error: unknown) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleProfileCreation}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? '<span>Loading...</span>' : '<span>Create Profile</span>'}
      </button>
    </form>
  );
}
