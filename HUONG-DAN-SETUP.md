# Hướng dẫn setup demo (Supabase + GitHub Pages)

Làm theo đúng thứ tự 4 bước dưới đây. Mất khoảng 20–30 phút.

> **Lưu ý thứ tự:** làm Supabase TRƯỚC, GitHub SAU. Vì file `js/config.js` cần điền
> URL + key của Supabase; làm ngược lại sẽ phải upload file này lên GitHub 2 lần.

## Bước 1 — Tạo project Supabase (~10 phút)

1. Vào **supabase.com** → đăng ký/đăng nhập (free) → **New project**.
2. Đặt tên project tuỳ ý, chọn vùng gần Nhật (Tokyo hoặc Singapore), đặt mật khẩu database (lưu lại, không cần dùng ngay).
3. Đợi project khởi tạo xong (~2 phút).
4. Vào **Storage** (menu bên trái) → **New bucket** → đặt tên chính xác là `submission-photos` → để **Private** (KHÔNG bật Public) → Create.
5. Vào **SQL Editor** (menu bên trái) → **New query** → mở file `supabase/schema.sql` trong gói này, copy toàn bộ nội dung, dán vào → bấm **Run**. Chạy thành công sẽ thấy "Success. No rows returned".

## Bước 2 — Lấy URL + anon key, dán vào `js/config.js` (~3 phút)

1. Trong Supabase, vào **Project Settings → API**.
2. Copy **Project URL** (dạng `https://xxxxx.supabase.co`).
3. Copy **anon public** key (chuỗi dài, KHÔNG copy nhầm sang `service_role` — key đó tuyệt đối không được đưa lên web public).
4. Mở file `js/config.js`, dán 2 giá trị trên vào 2 dòng đầu:
   ```js
   const SUPABASE_CONFIG = {
     url: "https://xxxxx.supabase.co",       // dán Project URL
     anonKey: "eyJhbGciOi...",                // dán anon public key
     bucket: "submission-photos",
   };
   ```
5. Lưu file lại.

## Bước 3 — Tạo repo GitHub + bật Pages (~7 phút)

1. Đăng nhập tài khoản GitHub hiện có của anh (dùng chung được, không cần tài khoản mới).
2. Vào **github.com/new**, đặt tên repo (vd `thu-anh-nv-demo`), chọn **Public**, không cần tick "Add README". Bấm **Create repository**.
3. Upload toàn bộ file trong thư mục `App` (`index.html`, thư mục `css/`, `js/`, `supabase/`) lên repo — cách nhanh nhất là dùng link **"uploading an existing file"** trên trang repo trống rồi kéo thả cả thư mục vào. Nhớ là `js/config.js` phải là bản đã điền key ở Bước 2.
4. Vào tab **Settings → Pages** của repo. Mục "Build and deployment" → **Source** chọn **Deploy from a branch**, Branch chọn **main** / thư mục **/(root)**, bấm **Save**.
5. Đợi 1–2 phút, GitHub sẽ cấp link dạng: `https://<username>.github.io/thu-anh-nv-demo/`

## Bước 4 — Test thử (~10 phút, KHÔNG được bỏ qua)

Đợi GitHub Pages build xong (~1 phút), rồi mở lần lượt 5 link demo:

| Link | Dùng để demo |
|---|---|
| `.../?token=DEMO-A001` | Luồng nộp bình thường (Nguyễn Văn A) |
| `.../?token=DEMO-B002` | Một nhân viên demo khác (Trần Thị B) |
| `.../?token=DEMO-TOKUTEI` | Diện Tokutei Gino — hiện thêm 2 câu hỏi liên hệ quê nhà |
| `.../?token=DEMO-HETHAN` | Màn hình "đã hết hạn nộp" |
| `.../` (không có `?token=`) | Màn hình "link không hợp lệ" |

Test đủ 3 việc sau, trên **cả điện thoại lẫn máy tính**:

1. **Khung crop 3:4** kéo/phóng có mượt không (Cropper.js tải từ CDN).
2. **Gác cổng face-api.js** — thử 1 ảnh đúng 1 mặt (phải qua) và 1 ảnh không có mặt / 2 mặt (phải bị chặn). Lần đầu tải model có thể mất vài giây.
3. **Nộp thật 1 bộ hồ sơ** → vào Supabase **Table Editor → submissions** xem dữ liệu, và **Storage → submission-photos** xem ảnh đã lên chưa.

## Gửi link cho đồng nghiệp

Gửi các link ở Bước 4 để đồng nghiệp tự mở trên điện thoại và thử nộp — đó chính là bản demo để thuyết trình và lấy góp ý. Buổi họp chỉ bàn về **luồng thao tác/UX**, nội dung câu hỏi đã quy chuẩn rồi (mục 6c của SPEC).

## Lưu ý

- Đây là bản **demo**, token còn hard-code trong `js/config.js` — bản thật sau này token sẽ do app C# sinh ra theo từng đợt thu ảnh.
- Cropper.js và model face-api.js tải từ CDN công cộng — cần máy có Internet bình thường (không bị chặn CDN). Môi trường sandbox lúc code không gọi được ra các CDN này nên phần crop/gác cổng **chưa từng được chạy thử trên trình duyệt thật** — đây là rủi ro lớn nhất, phải test kỹ trước khi thuyết trình.
- Nếu quên chạy `schema.sql` ở Bước 1.5 (RLS/policy), ảnh/dữ liệu sẽ bị chặn không nộp được — lỗi cụ thể sẽ hiện ngay trên web.
- Nếu có lỗi: mở DevTools (F12) → tab Console, chụp màn hình lỗi gửi lại cho Claude để sửa.
