// // lib/supabaseClient.js
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// const getURL = () => {
//   let url = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
//   url = url.startsWith('http') ? url : `https://${url}`;
//   url = url.endsWith('/') ? url : `${url}/`;
//   return url;
// };

// const supabase = createClientComponentClient({
//   supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
//   supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//   options: {
//     auth: {
//       redirectTo: getURL(),
//     },
//   },
// });

// export default supabase;
// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

