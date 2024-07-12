import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function fetchExamsData() {
    const supabase = createServerComponentClient({ cookies });

    try {
        const { data, error } = await supabase
            .from('exams')
            .select('examname, fileCount, questionCount');

        if (error) {
            throw new Error(error.message);
        }

        return { examsData: data, connectionError: null, examsError: null };
    } catch (error) {
        if (error.name === 'FetchError') {
            return { examsData: null, connectionError: error.message, examsError: null };
        } else {
            return { examsData: null, connectionError: null, examsError: error.message };
        }
    }
}
