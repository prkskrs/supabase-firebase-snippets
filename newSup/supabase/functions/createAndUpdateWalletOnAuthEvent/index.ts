import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhmdvzfzwyqosqwemehc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVobWR2emZ6d3lxb3Nxd2VtZWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQzOTE4NDUsImV4cCI6MTk5OTk2Nzg0NX0.ff-55rwOXg6EZrFzCgyx4UwX2I5lnhjoKBe777GF6LE';
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event: any) => {
  const { eventType, session } = event;

  // Check if it's a user signup event or login event
  if (eventType === 'user.signup' || eventType === 'user.login') {
    const user_id = session.user.id;

    // Check if the user is already listed in the wallet table
    const { data, error } = await supabase
      .from('wallet')
      .select('*')
      .eq('user_id', user_id);

    if (error) {
      return { statusCode: 500, body: error.message };
    }

    // If the user is not listed, create a new record in the wallet table
    if (data.length === 0) {
      const { data: newWalletData, error: newWalletError } = await supabase
        .from('wallet')
        .insert([{ user_id, balance: 0 }]);

      if (newWalletError) {
        return { statusCode: 500, body: newWalletError.message };
      }

      return { statusCode: 200, body: newWalletData };
    }
  }

  return { statusCode: 200, body: 'No action required.' };
};
