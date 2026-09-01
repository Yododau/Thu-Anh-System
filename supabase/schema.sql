-- ============================================================
-- Schema cho Supabase — chạy trong SQL Editor của project Supabase
-- (Project → SQL Editor → New query → dán toàn bộ → Run)
-- ============================================================

-- 1. Bảng lưu thông tin nộp (chờ app C# tải về rồi xoá)
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  token text not null,
  ho_ten_nv text,
  cong_ty text,
  nhom_g text,
  dot_thu text,
  tinh_trang_hon_nhan text,        -- "co" (đã kết hôn) | "khong"
  co_nguoi_than_o_nhat text,       -- "co" | "khong" — trả lời câu 在日親族
  nguoi_than_o_nhat jsonb,         -- mảng người thân tại Nhật (rỗng nếu câu trên = "khong")
  lien_he_que_nha jsonb,           -- {soDienThoai, diaChi} — chỉ có với diện Tokutei Gino, null nếu không
  photo_path text,                 -- đường dẫn file trong bucket storage
  submitted_at timestamptz not null default now()
);

alter table submissions enable row level security;

-- Cho phép ai cũng INSERT (ghi mới) bằng anon key — không cho SELECT/UPDATE/DELETE
-- (app C# đọc/xoá bằng service_role key riêng, không public trên web)
create policy "allow anon insert"
  on submissions
  for insert
  to anon
  with check (true);

-- KHÔNG tạo policy nào cho select/update/delete với role anon
-- => mặc định RLS sẽ chặn hết, kể cả liệt kê dữ liệu người khác.

-- ============================================================
-- 2. Storage bucket cho ảnh
-- Vào Storage (giao diện Supabase) -> New bucket -> đặt tên
-- "submission-photos" -> để Private (không public).
-- Sau đó chạy tiếp phần policy dưới đây trong SQL Editor.
-- ============================================================

create policy "allow anon upload to submission-photos"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'submission-photos');

-- KHÔNG tạo policy select cho anon -> không ai list/đọc lại được ảnh
-- người khác bằng anon key, kể cả chính người vừa nộp.
