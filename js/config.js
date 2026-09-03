// ============================================================
// CẤU HÌNH — chỉnh 2 chỗ dưới đây sau khi tạo project Supabase
// (xem hướng dẫn trong file HUONG-DAN-SETUP.md)
// ============================================================
const SUPABASE_CONFIG = {
  url: "https://kkgvuimvanokhtagjcsx.supabase.co", // Project URL — KHÔNG kèm /rest/v1/ ở cuối
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZ3Z1aW12YW5va2h0YWdqY3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNjUyMjYsImV4cCI6MjEwMzg0MTIyNn0.jCvznOQyTDRxIr0zvy5Jfy4uVQ-UgeV4SDyxBpziPFs", // anon public key từ Supabase
  bucket: "submission-photos", // tên bucket Storage đã tạo theo schema.sql
};

// ============================================================
// TOKEN DEMO — 1 TOKEN = 1 CÔNG TY + 1 ĐỢT (phương án B″, mục 11b của SPEC)
// Không còn 1 token/nhân viên như bản trước. HR gửi 1 link duy nhất vào group
// Messenger của công ty; nhân viên tự nhận diện ở màn hình đầu tiên.
//
// Khi lên bản thật, danh sách này do app C# sinh từ Kintone, không hard-code.
// ============================================================
const DEMO_TOKENS = {
  "DEMO-YUTECH": {
    nhomG: "180", // 入国G — là số thuần trên Kintone, không phải dạng "G101"
    congTy: "株式会社ユーテック",
    dotThu: "2026/09",
    hanNop: "2026-10-31", // đọc từ cột 回収期限(写真・納税証明書) của Kintone
  },
  "DEMO-SANSEI": {
    nhomG: "186",
    congTy: "株式会社サンセイテック",
    dotThu: "2026/09",
    hanNop: "2026-10-31",
  },
  "DEMO-HETHAN": {
    // token này để demo màn hình "đã hết hạn"
    nhomG: "2610",
    congTy: "昭和精工株式会社",
    dotThu: "2026/08",
    hanNop: "2026-08-31",
  },
};

// ============================================================
// ROSTER DEMO — danh sách nhân viên của từng token
//
// ⚠️ CẢNH BÁO QUAN TRỌNG — CHỈ DÙNG ĐỂ DEMO:
// Ở bản thật, danh sách này TUYỆT ĐỐI KHÔNG được nằm trong file JS của trang
// web. Repo GitHub là Public, và kể cả không public thì trình duyệt của bất kỳ
// ai có link cũng tải được nguyên file này về đọc — lộ toàn bộ họ tên + ngày
// sinh của cả công ty. Đây đúng là lỗi mà SPEC mục 11b đã cảnh báo.
//
// Bản thật phải:
//   1. App C# đẩy roster lên bảng `roster` trên Supabase khi tạo đợt.
//   2. Web gọi hàm RPC verify_employee(token, ten_chuan, ngay_sinh) —
//      hàm security definer, SO KHỚP BÊN TRONG SERVER, chỉ trả về mã nhân
//      viên khớp hoặc "không tìm thấy". Không bao giờ trả danh sách về trình duyệt.
//   3. Xoá roster khi đóng đợt.
//
// Tên dưới đây là TÊN BỊA, cố ý không dùng tên thật của nhân viên nào, vì repo
// này là Public.
// ============================================================
const DEMO_ROSTER = {
  "DEMO-YUTECH": [
    {
      maNv: "DEMO-0001",
      ten: "NGUYEN VAN A", // đúng như trường 名前 của Kintone = dòng romaji trên thẻ ngoại kiều
      ngaySinh: "1998-04-12",
      quocTich: "vietnam",
      loaiTuCach: "ky_nang",
    },
    {
      maNv: "DEMO-0002",
      ten: "TRAN THI B",
      ngaySinh: "1996-11-03",
      quocTich: "vietnam",
      loaiTuCach: "tokutei_gino", // token này sẽ hiện thêm 2 câu hỏi quê nhà
    },
    {
      maNv: "DEMO-0003",
      ten: "DELA CRUZ JUAN",
      ngaySinh: "1995-07-21",
      quocTich: "philippines",
      loaiTuCach: "ky_nang",
    },
    {
      // cùng ngày sinh với DEMO-0003 — để thử quy tắc "trùng ngày sinh thì tắt
      // phần tha lỗi gõ sai" (SPEC mục 11b)
      maNv: "DEMO-0004",
      ten: "AUNG MYAT THU",
      ngaySinh: "1995-07-21",
      quocTich: "myanmar",
      loaiTuCach: "ky_nang",
    },
  ],
  "DEMO-SANSEI": [
    {
      maNv: "DEMO-0101",
      ten: "BUDI SANTOSO",
      ngaySinh: "1999-01-30",
      quocTich: "indonesia",
      loaiTuCach: "tokutei_gino",
    },
    {
      maNv: "DEMO-0102",
      ten: "LE VAN C",
      ngaySinh: "1997-09-08",
      quocTich: "vietnam",
      loaiTuCach: "ky_nang",
    },
  ],
  "DEMO-HETHAN": [],
};

// ============================================================
// DANH SÁCH LỰA CHỌN
// Chỉ khai báo MÃ (value) ở đây — chữ hiển thị nằm trong js/i18n.js
// theo từng ngôn ngữ (khoá "rel.<mã>" và "nat.<mã>").
// Mã này chính là giá trị lưu xuống Supabase, nên KHÔNG đổi mã khi đã có
// dữ liệu thật; đổi ngôn ngữ hiển thị không làm đổi dữ liệu đã lưu.
// ============================================================
const RELATION_VALUES = [
  "anh_trai", // 兄
  "chi_gai", // 姉
  "em_trai", // 弟
  "em_gai", // 妹
  "chong", // 夫
  "vo", // 妻
  "cha", // 父
  "me", // 母
];

// Quốc tịch của NGƯỜI THÂN (mục 6c của SPEC — đã chốt 4 nước)
const NATIONALITY_VALUES = ["indonesia", "vietnam", "myanmar", "philippines"];

// Quốc tịch của CHÍNH NHÂN VIÊN ở màn hình nhận diện — có thêm "khac" để sau
// này tuyển nhân viên nước khác thì không phải sửa code.
const NATIONALITY_SELF_VALUES = ["vietnam", "philippines", "indonesia", "myanmar", "khac"];
