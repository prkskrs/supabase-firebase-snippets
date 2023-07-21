const { createClient } = require('@supabase/supabase-js');
const http = require('http');

const supabaseUrl = 'https://uhmdvzfzwyqosqwemehc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVobWR2emZ6d3lxb3Nxd2VtZWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQzOTE4NDUsImV4cCI6MTk5OTk2Nzg0NX0.ff-55rwOXg6EZrFzCgyx4UwX2I5lnhjoKBe777GF6LE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function handleRequest(req, res) {
  const userId = req.headers['x-user-id'];
  // const { balance } = req.body

  if (!userId) {
    console.error('User ID not provided');
    return res.writeHead(400).end('User ID not provided');
  }
  console.log(userId);

  const { data: walletData, error } = await supabase
    .from('wallet')
    .select('*')
    .eq('user_id', userId);

  console.log(userId);
  console.log(walletData);

  if (error) {
    console.error('Error fetching wallet:', error.message);
    return res.writeHead(500).end('Error fetching wallet');
  }

  const userExists = walletData && walletData.length > 0;
  console.log(userExists);

  if (!userExists) {
    const { data: newRecord, error: creationError } = await supabase
      .from('wallet')
      .insert([{ user_id: userId, balance: 0 }]);

    if (creationError) {
      console.error('Error creating wallet record:', creationError.message);
      return res.writeHead(500).end('Error creating wallet record');
    }

    console.log('New wallet record created:', newRecord);
  } else {
    const { data: updatedRecord, error: updateError } = await supabase
      .from('wallet')
      .update({ balance: walletData[0].balance + 0 })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating wallet record:', updateError.message);
      return res.writeHead(500).end('Error updating wallet record');
    }

    console.log('Wallet record updated:', updatedRecord);
  }

  res.writeHead(200).end('Wallet record created/updated successfully');
}

const server = http.createServer(handleRequest);

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
