// // lib/auth.js
// import supabase from './supabaseClient';

// const signIn = async (provider) => {
//   const redirectURL = `${supabase.auth.redirectTo}/api/auth/callback`;
//   const { data, error } = await supabase.auth.signInWithOAuth({
//     provider,
//     options: {
//       redirectTo: redirectURL,
//     },
//   });
//   if (error) {
//     console.error('Error during sign in:', error.message);
//   }
// };
// libs/auth.js
// app/signin/page.js
import { useState } from 'react';
import signIn from '../../libs/auth'; // Ensure this path is correct based on your project structure

export default function SignIn() {
  const [error, setError] = useState(null);

  const handleSignIn = async (provider) => {
    setError(null);
    console.log(`Attempting to sign in with ${provider}`);
    const result = await signIn(provider);
    if (result.error) {
      console.error('Sign-in error:', result.error);
      setError(result.error);
    }
  };

  return (
    <div>
      <button onClick={() => handleSignIn('google')}>Sign in with Google</button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
