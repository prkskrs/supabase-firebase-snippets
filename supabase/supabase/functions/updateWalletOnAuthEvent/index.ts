import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhmdvzfzwyqosqwemehc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVobWR2emZ6d3lxb3Nxd2VtZWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQzOTE4NDUsImV4cCI6MTk5OTk2Nzg0NX0.ff-55rwOXg6EZrFzCgyx4UwX2I5lnhjoKBe777GF6LE';
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event: any) => {
  try {
    const { user_id, email } = event.payload;

    const { data: walletData, error } = await supabase
      .from('wallet')
      .select()
      .eq('user_id', user_id)
      .single();

    if (error) {
      throw new Error('Failed to fetch wallet data');
    }

    if (!walletData) {
      const { data: newWalletData, error: walletError } = await supabase
        .from('wallet')
        .insert([{ user_id, balance: 0 }])
        .single();

      if (walletError) {
        throw new Error('Failed to create wallet record');
      }

      console.log('New wallet record created:', newWalletData);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Wallet record checked or created successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
