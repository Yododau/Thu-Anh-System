-- ============================================================
-- Schema cho Supabase — chạy trong SQL Editor của project Supabase
-- (Project → SQL Editor → New query → dán toàn bộ → Run)
--
-- Bản cập nhật 03/09/2026: chuyển sang mô hình B″ (SPEC mục 11b)
--   1 token = 1 công ty + 1 đợt, nhân viên tự nhận diện bằng
--   họ tên + ngày sinh, SO KHỚP BÊN TRONG SERVER qua hàm verify_employee.
-- ============================================================

-- ============================================================
-- 1. Bảng lưu thông tin nộp (chờ app C# tải về rồi xoá)
-- ============================================================
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  token text not null,
  ma_nv text,                      -- MỚI: khoá nối ngược về bản ghi Kintone
  ho_ten_nv text,                  -- LUÔN là tên chuẩn từ Kintone, không phải chữ nhân viên gõ
  ngay_sinh date,                  -- MỚI
  quoc_tich text,                  -- MỚI: nhân viên tự chọn (vietnam/philippines/indonesia/myanmar/khac)
  quoc_tich_lech boolean default false, -- MỚI: cờ báo HR khi lệch với dữ liệu Kintone
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

-- Nếu bảng submissions đã tồn tại từ bản trước, chạy thêm 4 dòng này:
alter table submissions add column if not exists ma_nv text;
alter table submissions add column if not exists ngay_sinh date;
alter table submissions add column if not exists quoc_tich text;
alter table submissions add column if not exists quoc_tich_lech boolean default false;

alter table submissions enable row level security;

-- Cho phép ai cũng INSERT (ghi mới) bằng anon key — không cho SELECT/UPDATE/DELETE
-- (app C# đọc/xoá bằng service_role key riêng, không public trên web)
drop policy if exists "allow anon insert" on submissions;
create policy "allow anon insert"
  on submissions
  for insert
  to anon
  with check (true);

-- KHÔNG tạo policy nào cho select/update/delete với role anon
-- => mặc định RLS sẽ chặn hết, kể cả liệt kê dữ liệu người khác.

-- ============================================================
-- 2. Bảng roster — danh sách nhân viên của từng đợt
--    App C# đẩy lên khi tạo đợt (bằng service_role key), xoá khi đóng đợt.
-- ============================================================
create table if not exists roster (
  id uuid primary key default gen_random_uuid(),
  token text not null,             -- token của công ty + đợt
  ma_nv text not null,             -- record id bên Kintone
  ten_kintone text not null,       -- nguyên văn trường 名前
  ten_chuan text not null,         -- ten_kintone đã chuẩn hoá theo SPEC mục 12
  ngay_sinh date not null,
  quoc_tich text,                  -- có thể null nếu Kintone không có trường này
  loai_tu_cach text,               -- "tokutei_gino" thì web hiện thêm 2 câu quê nhà
  created_at timestamptz not null default now()
);

create index if not exists roster_token_dob_idx on roster (token, ngay_sinh);

alter table roster enable row level security;

-- KHÔNG tạo policy nào cho anon trên bảng này.
-- => anon không đọc, không liệt kê, không ghi được. Chỉ truy cập qua hàm
--    verify_employee bên dưới (security definer, bỏ qua RLS một cách có kiểm soát).

-- ============================================================
-- 3. Hàm nhận diện nhân viên
--
-- ⚠️ ĐIỂM QUAN TRỌNG NHẤT CỦA THIẾT KẾ (SPEC mục 11b):
-- Việc so khớp tên PHẢI nằm trong hàm này. Hàm chỉ trả về đúng 1 người khớp,
-- hoặc không trả gì. TUYỆT ĐỐI không trả danh sách ứng viên về trình duyệt —
-- làm vậy là lộ họ tên của người trùng ngày sinh, dù có so khớp bằng JS sau đó.
--
-- Quy tắc (khớp y hệt bản demo trong js/main.js):
--   - lọc theo (token, ngay_sinh)
--   - nếu chỉ có 1 ứng viên: khớp tuyệt đối / cùng bộ từ / Levenshtein <= 2
--   - nếu có >= 2 ứng viên trùng ngày sinh: TẮT tha lỗi, chỉ khớp tuyệt đối
--     hoặc cùng bộ từ
--   - khớp nhiều hơn 1 người => coi như không tìm thấy
-- ============================================================

-- Levenshtein có sẵn trong extension fuzzystrmatch
create extension if not exists fuzzystrmatch;

-- Sắp xếp các từ trong tên để so "cùng bộ từ, khác thứ tự"
create or replace function ten_sap_xep(p_ten text)
returns text
language sql
immutable
as $$
  select coalesce(
    (select string_agg(w, ' ' order by w)
     from unnest(string_to_array(trim(p_ten), ' ')) as w
     where w <> ''),
    ''
  );
$$;

create or replace function verify_employee(
  p_token text,
  p_ten_chuan text,
  p_ngay_sinh date
)
returns table (ma_nv text, ten_kintone text, ngay_sinh date, quoc_tich text, loai_tu_cach text)
language plpgsql
security definer
set search_path = public
as $$
declare
  so_ung_vien int;
  cho_tha_loi boolean;
  so_khop int;
begin
  select count(*) into so_ung_vien
  from roster r
  where r.token = p_token and r.ngay_sinh = p_ngay_sinh;

  if so_ung_vien = 0 then
    return; -- không trả gì
  end if;

  -- trùng ngày sinh từ 2 người trở lên -> tắt phần tha lỗi gõ sai
  cho_tha_loi := (so_ung_vien = 1);

  select count(*) into so_khop
  from roster r
  where r.token = p_token
    and r.ngay_sinh = p_ngay_sinh
    and (
      r.ten_chuan = p_ten_chuan
      or ten_sap_xep(r.ten_chuan) = ten_sap_xep(p_ten_chuan)
      or (cho_tha_loi and levenshtein(r.ten_chuan, p_ten_chuan) <= 2)
    );

  if so_khop <> 1 then
    return; -- không khớp ai, hoặc khớp mập mờ nhiều người -> không trả gì
  end if;

  return query
  select r.ma_nv, r.ten_kintone, r.ngay_sinh, r.quoc_tich, r.loai_tu_cach
  from roster r
  where r.token = p_token
    and r.ngay_sinh = p_ngay_sinh
    and (
      r.ten_chuan = p_ten_chuan
      or ten_sap_xep(r.ten_chuan) = ten_sap_xep(p_ten_chuan)
      or (cho_tha_loi and levenshtein(r.ten_chuan, p_ten_chuan) <= 2)
    );
end;
$$;

revoke all on function verify_employee(text, text, date) from public;
grant execute on function verify_employee(text, text, date) to anon;

-- ============================================================
-- 4. Storage bucket cho ảnh
-- Vào Storage (giao diện Supabase) -> New bucket -> đặt tên
-- "submission-photos" -> để Private (không public).
-- Sau đó chạy tiếp phần policy dưới đây trong SQL Editor.
-- ============================================================

drop policy if exists "allow anon upload to submission-photos" on storage.objects;
create policy "allow anon upload to submission-photos"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'submission-photos');

-- KHÔNG tạo policy select cho anon -> không ai list/đọc lại được ảnh
-- người khác bằng anon key, kể cả chính người vừa nộp.
