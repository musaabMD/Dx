import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export async function handleExamSelect(userId, examName) {
  try {
    // Update only the examname for the existing user
    const { data, error } = await supabase
      .from('user_data')
      .update({ examname: examName })
      .eq('user_id', userId)
      .select();

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      console.log('Exam selection updated successfully');
    } else {
      console.log('No matching user found. Update had no effect.');
    }
  } catch (error) {
    console.error('Error updating selected exam:', error);
  }
}