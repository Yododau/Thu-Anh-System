// ============================================================
// ĐA NGÔN NGỮ (i18n) — Nhật / Việt / Anh
// Thêm ngôn ngữ mới: thêm 1 khối vào I18N + 1 nút vào #lang-switch (index.html)
// ============================================================

const APP_NAME = "Zairyu Desk";
const LANG_DEFAULT = "ja"; // ngôn ngữ mở lần đầu
const LANG_LIST = ["ja", "vi", "en"];
// true  = nhớ ngôn ngữ nhân viên đã chọn, lần sau mở link giữ nguyên
// false = mọi lần mở link đều bắt đầu lại bằng LANG_DEFAULT
const LANG_REMEMBER = true;
const LANG_STORAGE_KEY = "zairyu-desk-lang";

const I18N = {
  // ------------------------------------------------------------
  ja: {
    "html.lang": "ja",
    "app.tagline": "在留資格申請用　写真・情報の提出",
    "loading": "読み込み中…",

    "invalid.title": "⚠️ 無効なリンクです",
    "invalid.body": "このリンクは正しくないか、無効になっています。人事担当者にお問い合わせください。",

    "expired.title": "⏰ 提出期限が過ぎました",
    "expired.body": "「{dot}」の提出期限（{han}）は終了しました。",
    "expired.body2": "期限後に提出が必要な場合は、人事担当者に新しいリンクの発行をご依頼ください。",

    "info.round": "提出回",
    "info.deadline": "提出期限",

    // ---- màn hình nhận diện ----
    "id.title": "ご本人の確認",
    "id.sub": "ご本人の確認をお願いします。",
    "id.name": "氏名（ローマ字・大文字）",
    "id.name.hint": "在留カードに印字されているローマ字を、そのまま大文字で入力してください。",
    "id.dob": "生年月日",
    "id.nat": "国籍",
    "id.continue": "確認して次へ",
    "id.checking": "確認中…",
    "id.notfound": "該当する方が見つかりませんでした。氏名と生年月日をご確認いただくか、担当者にお問い合わせください。",
    "id.err.title": "未入力の項目があります：",
    "id.err.name": "氏名",
    "id.err.dob": "生年月日",
    "id.err.nat": "国籍",

    // ---- khối xác nhận ở đầu form ----
    "who.name": "氏名",
    "who.dob": "生年月日",
    "who.company": "企業名",
    "who.notme": "別の人として入力し直す",

    "required.note": "すべての項目が必須です（在日親族の詳細は「はい」を選んだ場合のみ）。",

    "q1.title": "1. 婚姻状況",
    "q1.sub": "現在、結婚されていますか？",
    "q1.yes": "はい（既婚）",
    "q1.no": "いいえ（未婚）",

    "q2.title": "2. 在日親族",
    "q2.sub": "日本に住んでいるご家族・ご親族はいますか？",
    "q2.add": "＋ 親族を追加",

    "q3.title": "3. 母国の連絡先",
    "q3.sub": "特定技能の方のみご記入ください。該当する場合は下のチェックボックスを選択してください。",
    "q3.check": "特定技能の対象です",
    "q3.phone": "母国の電話番号（ご家族の番号でも可。連絡が取れる番号）",
    "q3.address": "母国の住所",

    "q4.title": "4. 顔写真",
    "q4.c1": "背景は明るく、影が写っていないこと",
    "q4.c2": "帽子をかぶっていないこと",
    "q4.c3": "メガネなし、またはレンズに光の反射がないこと",
    "q4.c4": "正面を向いた、6か月以内に撮影した写真",
    "q4.c5": "加工アプリ・美顔加工をした写真は不可",
    "q4.choose": "📷 写真を選ぶ / 撮影する",
    "q4.retake": "別の写真を選び直す",
    "q4.ok": "✓ 写真は問題ありません。提出できます",

    "crop.title": "写真の位置を合わせる",
    "crop.hint": "点線の輪郭に頭と肩が重なるよう、写真をドラッグ・拡大してください。",
    "crop.checking": "写真を確認しています…",
    "crop.cancel": "キャンセル",
    "crop.confirm": "この写真を使う",
    "crop.noface": "✗ 顔を検出できませんでした。顔が枠内にはっきり写るよう撮り直してください。",
    "crop.manyfaces": "✗ 顔が2つ以上検出されました。写真には本人のみが写るようにしてください。",

    "submit": "写真・情報を提出する",
    "submitting": "送信中…",
    "submit.error": "送信中にエラーが発生しました（通信状況、または js/config.js の Supabase 設定をご確認ください）。詳細：",

    "err.title": "未入力の項目があります。以下をご確認ください：",
    "err.photo": "4. 顔写真（写真が選ばれていません）",
    "err.fam.none": "2. 在日親族（「はい」を選んだ場合、親族を1名以上追加してください）",

    "success.title": "✅ 提出が完了しました",
    "success.body": "ありがとうございました。写真・情報に修正が必要な場合は、担当者からご連絡します。",

    "yes": "はい",
    "no": "いいえ",
    "select": "-- 選択 --",

    "fam.no": "親族 {n}人目",
    "fam.remove": "削除",
    "fam.relation": "1. あなたとの続柄",
    "fam.name": "2. 氏名（フルネーム）",
    "fam.dob": "生年月日",
    "fam.nationality": "国籍",
    "fam.living": "3. その方と同居していますか？",
    "fam.workplace": "4. その方の勤務先（会社名）または学校名",
    "fam.zairyu": "5. その方の在留カード番号",

    "rel.anh_trai": "兄",
    "rel.chi_gai": "姉",
    "rel.em_trai": "弟",
    "rel.em_gai": "妹",
    "rel.chong": "夫",
    "rel.vo": "妻",
    "rel.cha": "父",
    "rel.me": "母",

    "nat.indonesia": "インドネシア",
    "nat.vietnam": "ベトナム",
    "nat.myanmar": "ミャンマー",
    "nat.philippines": "フィリピン",
    "nat.khac": "その他",
  },

  // ------------------------------------------------------------
  vi: {
    "html.lang": "vi",
    "app.tagline": "Nộp ảnh & thông tin hồ sơ tư cách lưu trú",
    "loading": "Đang tải…",

    "invalid.title": "⚠️ Link không hợp lệ",
    "invalid.body": "Link này không đúng hoặc đã bị huỷ. Vui lòng liên hệ người phụ trách.",

    "expired.title": "⏰ Đã hết hạn nộp",
    "expired.body": "Đợt “{dot}” đã hết hạn nộp ({han}).",
    "expired.body2": "Vui lòng liên hệ người phụ trách.",

    "info.round": "Đợt",
    "info.deadline": "Hạn nộp",

    // ---- màn hình nhận diện ----
    "id.title": "Xác nhận danh tính",
    "id.sub": "Vui lòng xác nhận danh tính của bạn.",
    "id.name": "Họ và tên (IN HOA, không dấu)",
    "id.name.hint": "Xin vui lòng nhập chữ in hoa, không dấu theo đúng tên trên thẻ ngoại kiều của bạn.",
    "id.dob": "Ngày tháng năm sinh",
    "id.nat": "Quốc tịch",
    "id.continue": "Xác nhận và tiếp tục",
    "id.checking": "Đang kiểm tra…",
    "id.notfound": "Không tìm thấy. Vui lòng kiểm tra lại họ tên và ngày sinh, hoặc liên hệ bộ phận nhân sự.",
    "id.err.title": "Còn thiếu thông tin ở các mục sau:",
    "id.err.name": "Họ và tên",
    "id.err.dob": "Ngày tháng năm sinh",
    "id.err.nat": "Quốc tịch",

    // ---- khối xác nhận ở đầu form ----
    "who.name": "Họ tên",
    "who.dob": "Ngày sinh",
    "who.company": "Công ty",
    "who.notme": "Không phải tôi — nhập lại",

    "required.note": "Tất cả các mục đều bắt buộc (phần chi tiết người thân chỉ cần khai nếu chọn “Có”).",

    "q1.title": "1. Tình trạng hôn nhân",
    "q1.sub": "Bạn đã kết hôn chưa?",
    "q1.yes": "Có (đã kết hôn)",
    "q1.no": "Không (chưa kết hôn)",

    "q2.title": "2. Người thân đang sinh sống tại Nhật Bản",
    "q2.sub": "Bạn có người thân nào đang sinh sống tại Nhật Bản không?",
    "q2.add": "+ Thêm người thân",

    "q3.title": "3. Thông tin liên hệ tại quê nhà",
    "q3.sub": "Chỉ dành cho diện Kỹ năng đặc định (Tokutei Gino). Nếu bạn thuộc diện này, hãy đánh dấu vào ô bên dưới.",
    "q3.check": "Tôi thuộc diện Kỹ năng đặc định (Tokutei Gino)",
    "q3.phone": "Số điện thoại tại quê nhà (có thể dùng số của người thân, miễn nghe gọi được)",
    "q3.address": "Địa chỉ tại quê nhà",

    "q4.title": "4. Ảnh chân dung",
    "q4.c1": "Nền sáng, không có bóng đổ phía sau",
    "q4.c2": "Không đội mũ / nón",
    "q4.c3": "Không đeo kính, hoặc kính không phản chiếu ánh sáng",
    "q4.c4": "Nhìn thẳng vào máy ảnh, ảnh chụp trong vòng 6 tháng gần đây",
    "q4.c5": "Không dùng ảnh đã chỉnh sửa qua phần mềm làm đẹp",
    "q4.choose": "📷 Chọn / chụp ảnh",
    "q4.retake": "Chọn lại ảnh khác",
    "q4.ok": "✓ Ảnh hợp lệ, đã sẵn sàng để nộp",

    "crop.title": "Căn chỉnh ảnh",
    "crop.hint": "Kéo và phóng ảnh sao cho đầu và vai trùng với viền nét đứt.",
    "crop.checking": "Đang kiểm tra ảnh…",
    "crop.cancel": "Huỷ",
    "crop.confirm": "Dùng ảnh này",
    "crop.noface": "✗ Không nhận diện được khuôn mặt nào. Vui lòng chụp lại, để mặt rõ trong khung.",
    "crop.manyfaces": "✗ Phát hiện nhiều hơn 1 khuôn mặt trong ảnh. Ảnh chỉ được có 1 người.",

    "submit": "Nộp ảnh & thông tin",
    "submitting": "Đang nộp…",
    "submit.error": "Có lỗi khi nộp (kiểm tra lại kết nối mạng, hoặc cấu hình Supabase trong js/config.js). Chi tiết: ",

    "err.title": "Còn thiếu thông tin ở các mục sau:",
    "err.photo": "4. Ảnh chân dung (chưa chọn ảnh)",
    "err.fam.none": "2. Người thân tại Nhật (đã chọn “Có” nhưng chưa khai người nào)",

    "success.title": "✅ Đã nộp thành công",
    "success.body": "Cảm ơn bạn. Người phụ trách sẽ kiểm tra và liên hệ lại nếu ảnh/thông tin cần chỉnh sửa.",

    "yes": "Có",
    "no": "Không",
    "select": "-- Chọn --",

    "fam.no": "Người thân {n}",
    "fam.remove": "Xoá",
    "fam.relation": "1. Mối quan hệ với bạn",
    "fam.name": "2. Họ tên đầy đủ",
    "fam.dob": "Ngày tháng năm sinh",
    "fam.nationality": "Quốc tịch",
    "fam.living": "3. Bạn có đang sống cùng người này không?",
    "fam.workplace": "4. Tên công ty (nếu đi làm) hoặc tên trường (nếu đi học) của người thân",
    "fam.zairyu": "5. Mã số thẻ ngoại kiều của người thân",

    "rel.anh_trai": "Anh trai ruột (兄)",
    "rel.chi_gai": "Chị gái ruột (姉)",
    "rel.em_trai": "Em trai ruột (弟)",
    "rel.em_gai": "Em gái ruột (妹)",
    "rel.chong": "Chồng (夫)",
    "rel.vo": "Vợ (妻)",
    "rel.cha": "Cha (父)",
    "rel.me": "Mẹ (母)",

    "nat.indonesia": "Indonesia",
    "nat.vietnam": "Việt Nam",
    "nat.myanmar": "Myanmar",
    "nat.philippines": "Philippines",
    "nat.khac": "Khác",
  },

  // ------------------------------------------------------------
  en: {
    "html.lang": "en",
    "app.tagline": "Photo & information submission for residence status applications",
    "loading": "Loading…",

    "invalid.title": "⚠️ Invalid link",
    "invalid.body": "This link is incorrect or has been cancelled. Please contact your HR representative.",

    "expired.title": "⏰ Submission closed",
    "expired.body": "The submission period “{dot}” closed on {han}.",
    "expired.body2": "If you still need to submit, please ask HR to issue a new link.",

    "info.round": "Round",
    "info.deadline": "Deadline",

    // ---- màn hình nhận diện ----
    "id.title": "Confirm who you are",
    "id.sub": "This link is shared across your whole company. Please confirm your details first.",
    "id.name": "Full name (CAPITAL LETTERS)",
    "id.name.hint": "Copy exactly the romaji line printed on your residence card, in capital letters.",
    "id.dob": "Date of birth",
    "id.nat": "Nationality",
    "id.continue": "Confirm and continue",
    "id.checking": "Checking…",
    "id.notfound": "No match found. Please check your name and date of birth, or contact HR.",
    "id.err.title": "Some answers are still missing:",
    "id.err.name": "Full name",
    "id.err.dob": "Date of birth",
    "id.err.nat": "Nationality",

    // ---- khối xác nhận ở đầu form ----
    "who.name": "Name",
    "who.dob": "Date of birth",
    "who.company": "Company",
    "who.notme": "Not me — start over",

    "required.note": "Every question is required (relative details only if you answer “Yes”).",

    "q1.title": "1. Marital status",
    "q1.sub": "Are you currently married?",
    "q1.yes": "Yes (married)",
    "q1.no": "No (single)",

    "q2.title": "2. Relatives living in Japan",
    "q2.sub": "Do you have any family members or relatives currently living in Japan?",
    "q2.add": "+ Add a relative",

    "q3.title": "3. Contact details in your home country",
    "q3.sub": "For Specified Skilled Worker (Tokutei Gino) status only. If this applies to you, check the box below.",
    "q3.check": "I am on Specified Skilled Worker (Tokutei Gino) status",
    "q3.phone": "Phone number in your home country (a relative's number is fine, as long as it can be reached)",
    "q3.address": "Address in your home country",

    "q4.title": "4. Portrait photo",
    "q4.c1": "Bright background with no shadow behind you",
    "q4.c2": "No hat or head covering",
    "q4.c3": "No glasses, or glasses with no light reflection",
    "q4.c4": "Facing the camera, taken within the last 6 months",
    "q4.c5": "No photos edited with beauty or filter apps",
    "q4.choose": "📷 Choose / take a photo",
    "q4.retake": "Choose a different photo",
    "q4.ok": "✓ Photo accepted and ready to submit",

    "crop.title": "Position your photo",
    "crop.hint": "Drag and zoom the photo so your head and shoulders line up with the dotted outline. The frame is fixed at 3:4, matching the 4cm × 3cm visa photo standard.",
    "crop.checking": "Checking the photo…",
    "crop.cancel": "Cancel",
    "crop.confirm": "Use this photo",
    "crop.noface": "✗ No face detected. Please retake the photo with your face clearly inside the frame.",
    "crop.manyfaces": "✗ More than one face detected. The photo must show only you.",

    "submit": "Submit photo & information",
    "submitting": "Submitting…",
    "submit.error": "Submission failed (check your internet connection, or the Supabase settings in js/config.js). Details: ",

    "err.title": "Some answers are still missing:",
    "err.photo": "4. Portrait photo (no photo selected)",
    "err.fam.none": "2. Relatives in Japan (you answered “Yes” but added no one)",

    "success.title": "✅ Submitted successfully",
    "success.body": "Thank you. HR will review your submission and contact you if anything needs to be corrected.",

    "yes": "Yes",
    "no": "No",
    "select": "-- Select --",

    "fam.no": "Relative {n}",
    "fam.remove": "Remove",
    "fam.relation": "1. Relationship to you",
    "fam.name": "2. Full name",
    "fam.dob": "Date of birth",
    "fam.nationality": "Nationality",
    "fam.living": "3. Do you currently live with this person?",
    "fam.workplace": "4. Their company name (if working) or school name (if studying)",
    "fam.zairyu": "5. Their residence card number",

    "rel.anh_trai": "Older brother (兄)",
    "rel.chi_gai": "Older sister (姉)",
    "rel.em_trai": "Younger brother (弟)",
    "rel.em_gai": "Younger sister (妹)",
    "rel.chong": "Husband (夫)",
    "rel.vo": "Wife (妻)",
    "rel.cha": "Father (父)",
    "rel.me": "Mother (母)",

    "nat.indonesia": "Indonesia",
    "nat.vietnam": "Vietnam",
    "nat.myanmar": "Myanmar",
    "nat.philippines": "Philippines",
    "nat.khac": "Other",
  },
};

// ------------------------------------------------------------
// Bộ máy dịch
// ------------------------------------------------------------
let currentLang = LANG_DEFAULT;

function readSavedLang() {
  if (!LANG_REMEMBER) return LANG_DEFAULT;
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && LANG_LIST.includes(saved)) return saved;
  } catch (e) {
    /* trình duyệt chặn localStorage — bỏ qua, dùng mặc định */
  }
  return LANG_DEFAULT;
}

function saveLang(lang) {
  if (!LANG_REMEMBER) return;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (e) {
    /* bỏ qua */
  }
}

/** Lấy chuỗi đã dịch. vars: { dot: "...", han: "..." } thay cho {dot}, {han} */
function t(key, vars) {
  const dict = I18N[currentLang] || I18N[LANG_DEFAULT];
  let s = dict[key];
  if (s === undefined) s = (I18N[LANG_DEFAULT] || {})[key];
  if (s === undefined) return key;
  if (vars) {
    for (const k of Object.keys(vars)) {
      s = s.split("{" + k + "}").join(vars[k]);
    }
  }
  return s;
}

/** Định dạng ngày theo ngôn ngữ đang chọn */
function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (currentLang === "ja") return `${Number(y)}年${Number(m)}月${Number(d)}日`;
  if (currentLang === "en") {
    const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${Number(d)} ${MON[Number(m) - 1]} ${y}`;
  }
  return `${d}/${m}/${y}`;
}

/** Dịch toàn bộ phần tử tĩnh có gắn data-i18n / data-i18n-ph trong 1 gốc DOM */
function applyI18nTo(root) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  root.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });
}