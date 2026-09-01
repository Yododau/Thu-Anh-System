// ============================================================
// CẤU HÌNH — chỉnh 2 chỗ dưới đây sau khi tạo project Supabase
// (xem hướng dẫn trong file HUONG-DAN-SETUP.md)
// ============================================================
const SUPABASE_CONFIG = {
  url: "https://kkgvuimvanokhtagjcsx.supabase.co/rest/v1/", // dán Project URL từ Supabase
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZ3Z1aW12YW5va2h0YWdqY3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNjUyMjYsImV4cCI6MjEwMzg0MTIyNn0.jCvznOQyTDRxIr0zvy5Jfy4uVQ-UgeV4SDyxBpziPFs", // dán anon public key từ Supabase
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
    dotThu: "Tháng 9/2026",
    hanNop: "2026-09-30", // YYYY-MM-DD, 23:59 giờ Nhật
    loaiTuCach: "ky_nang",
  },
  "DEMO-B002": {
    hoTen: "Trần Thị B",
    congTy: "Công ty XYZ",
    nhomG: "G102",
    dotThu: "Tháng 9/2026",
    hanNop: "2026-09-30",
    loaiTuCach: "ky_nang",
  },
  "DEMO-TOKUTEI": {
    // token này để demo 2 câu hỏi thêm dành riêng cho diện Tokutei Gino
    hoTen: "Phạm Văn D (demo Tokutei Gino)",
    congTy: "Công ty ABC",
    nhomG: "G101",
    dotThu: "Tháng 9/2026",
    hanNop: "2026-09-30",
    loaiTuCach: "tokutei_gino",
  },
  "DEMO-HETHAN": {
    // token này để demo màn hình "đã hết hạn"
    hoTen: "Lê Văn C (demo hết hạn)",
    congTy: "Công ty DEF",
    nhomG: "G102",
    dotThu: "Tháng 8/2026",
    hanNop: "2026-08-31",
    loaiTuCach: "ky_nang",
  },
};

// Danh sách "mối quan hệ" chuẩn theo mẫu công ty (tham khảo tiếng Nhật gốc)
const RELATION_OPTIONS = [
  { value: "anh_trai", label: "Anh trai (兄)" },
  { value: "chi_gai", label: "Chị gái (姉)" },
  { value: "em_trai", label: "Em trai (弟)" },
  { value: "em_gai", label: "Em gái (妹)" },
  { value: "chong", label: "Chồng (夫)" },
  { value: "vo", label: "Vợ (妻)" },
  { value: "cha", label: "Cha (父)" },
  { value: "me", label: "Mẹ (母)" },
];

// Danh sách quốc tịch hiện có trong dữ liệu nhân viên
const NATIONALITY_OPTIONS = ["Indonesia", "Việt Nam", "Myanmar", "Philippines"];
