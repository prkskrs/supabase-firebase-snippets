// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.0";


const supabaseUrl = 'https://uhmdvzfzwyqosqwemehc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVobWR2emZ6d3lxb3Nxd2VtZWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQzOTE4NDUsImV4cCI6MTk5OTk2Nzg0NX0.ff-55rwOXg6EZrFzCgyx4UwX2I5lnhjoKBe777GF6LE';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Hello from Functions!")

serve(async (req) => {
  const { name } = await req.json()
  const data = {
    message: `Hello ${name}!`,
  }


  let { data: orders, error } = await supabase
    .from('orders')
    .select('*')


  return new Response(
    JSON.stringify({ data, orders }),
    { headers: { "Content-Type": "application/json" } },
  )
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
