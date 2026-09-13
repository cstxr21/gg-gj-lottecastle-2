import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 클라이언트 — 9단계.
 *
 * 전 현장이 하나의 `inquiries` 테이블을 공유하고 `site` 컬럼으로 구분한다.
 * anon key는 INSERT만 가능하고 조회는 RLS가 막는다(개인정보 보호).
 *
 * ⚠️ 새 현장에서 `create table`/`create policy`를 다시 돌리지 않는다 —
 *    공유 프로젝트에 테이블·정책이 이미 있다(9단계 §2·§6).
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** 환경변수가 하나라도 없으면 null — 라우트가 503으로 응답한다(§5-3) */
export function getSupabase(): SupabaseClient | null {
  if (!URL || !ANON) return null;
  return createClient(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** `inquiries` 한 행 — 9단계 §2 스키마와 1:1 */
export type Inquiry = {
  site: string;
  name: string;
  phone: string;
  preferred_time: string | null;
  agreed: boolean;
  source: string | null;
  user_agent: string | null;
};
