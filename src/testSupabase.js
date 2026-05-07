import { supabase } from "./lib/supabase"; 

export async function testSupabase() {
    const { data, error } = await supabase
        .from("fichas")
        .select("*")

    console.log("Data:", data);
    console.log("Error:", error);
}