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
// DANH SÁCH TOKEN DEMO — dùng để test/thuyết trình, KHÔNG nối Kintone thật.
// Khi lên bản thật, danh sách này sẽ do app C# sinh ra (mỗi NV 1 token,
// theo đúng đợt thu ảnh + hạn nộp), không hard-code trong file này nữa.
// ============================================================
// "loaiTuCach": tư cách lưu trú của nhân viên — do app C# đọc từ Kintone và gán
// sẵn khi sinh token (nhân viên không tự chọn). Giá trị "tokutei_gino" sẽ làm
// web hiện thêm 2 câu hỏi "liên hệ quê nhà". Các loại khác (vd "ky_nang",
// "ky_su"...) thì không hiện. Bỏ trống/khác "tokutei_gino" đều coi là không hiện.
const DEMO_TOKENS = {
  "DEMO-A001": {
    hoTen: "Nguyễn Văn A",
    congTy: "Công ty ABC",
    nhomG: "G101",
    dotThu: "2026/09",
    hanNop: "2026-09-30", // YYYY-MM-DD, 23:59 giờ Nhật
    loaiTuCach: "ky_nang",
  },
  "DEMO-B002": {
    hoTen: "Trần Thị B",
    congTy: "Công ty XYZ",
    nhomG: "G102",
    dotThu: "2026/09",
    hanNop: "2026-09-30",
    loaiTuCach: "ky_nang",
  },
  "DEMO-TOKUTEI": {
    // token này để demo 2 câu hỏi thêm dành riêng cho diện Tokutei Gino
    hoTen: "Phạm Văn D (demo Tokutei Gino)",
    congTy: "Công ty ABC",
    nhomG: "G101",
    dotThu: "2026/09",
    hanNop: "2026-09-30",
    loaiTuCach: "tokutei_gino",
  },
  "DEMO-HETHAN": {
    // token này để demo màn hình "đã hết hạn"
    hoTen: "Lê Văn C (demo hết hạn)",
    congTy: "Công ty DEF",
    nhomG: "G102",
    dotThu: "2026/08",
    hanNop: "2026-08-31",
    loaiTuCach: "ky_nang",
  },
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

const NATIONALITY_VALUES = ["indonesia", "vietnam", "myanmar", "philippines"];
