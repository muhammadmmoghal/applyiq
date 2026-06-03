import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Status = "Interested" | "In Progress" | "Applied" | "Interview" | "Offer" | "Rejected";

export interface Application {
  id: string;
  created_at: string;
  company: string;
  role: string;
  date_applied: string;
  status: Status;
  job_link: string | null;
  follow_up_date: string | null;
  notes: string | null;
  company_logo_url: string | null;
}
