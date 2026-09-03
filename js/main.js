// ============================================================
// Zairyu Desk — logic chính (bản demo)
// Chữ hiển thị lấy từ js/i18n.js qua hàm t("khoá")
// ============================================================

// Model của lớp gác cổng — dùng chung nguồn jsDelivr với thư viện face-api.js
// (bản fork vladmandic) đang nạp trong index.html để cùng một API, cùng độ tin cậy.
const FACE_MODELS_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";

const els = {
  loading: document.getElementById("screen-loading"),
  invalid: document.getElementById("screen-invalid"),
  expired: document.getElementById("screen-expired"),
  identify: document.getElementById("screen-identify"),
  form: document.getElementById("screen-form"),
  success: document.getElementById("screen-success"),

  expiredBody: document.getElementById("expired-body"),

  // màn hình nhận diện
  identifyForm: document.getElementById("identify-form"),
  idCongTy: document.getElementById("id-congty"),
  idNhomG: document.getElementById("id-nhomg"),
  idDot: document.getElementById("id-dot"),
  idHan: document.getElementById("id-han"),
  idName: document.getElementById("id-name"),
  idDob: document.getElementById("id-dob"),
  idNat: document.getElementById("id-nat"),
  identifyError: document.getElementById("identify-error"),
  btnIdentify: document.getElementById("btn-identify"),

  // khối xác nhận ở đầu form
  infoHoTen: document.getElementById("info-hoten"),
  infoNgaySinh: document.getElementById("info-ngaysinh"),
  infoCongTy: document.getElementById("info-congty"),
  infoNhomG: document.getElementById("info-nhomg"),
  infoDot: document.getElementById("info-dot"),
  infoHan: document.getElementById("info-han"),
  btnNotMe: document.getElementById("btn-not-me"),

  mainForm: document.getElementById("main-form"),
  langSwitch: document.getElementById("lang-switch"),

  groupHonNhan: document.getElementById("group-hon-nhan"),
  groupNguoiThanNhat: document.getElementById("group-nguoi-than-nhat"),
  relativesBlock: document.getElementById("relatives-block"),
  familyList: document.getElementById("family-list"),
  btnAddFamily: document.getElementById("btn-add-family"),
  familyTemplate: document.getElementById("family-row-template"),

  cardTokutei: document.getElementById("card-tokutei"),
  queNhaSdt: document.getElementById("que-nha-sdt"),
  queNhaDiaChi: document.getElementById("que-nha-diachi"),

  photoInput: document.getElementById("photo-input"),
  photoPicker: document.getElementById("photo-picker"),
  photoResult: document.getElementById("photo-result"),
  photoPreview: document.getElementById("photo-preview"),
  photoStatus: document.getElementById("photo-status"),
  btnRetake: document.getElementById("btn-retake"),

  cropModal: document.getElementById("crop-modal"),
  cropImage: document.getElementById("crop-image"),
  cropFaceStatus: document.getElementById("crop-face-status"),
  btnCropCancel: document.getElementById("btn-crop-cancel"),
  btnCropClose: document.getElementById("btn-crop-close"),
  btnCropConfirm: document.getElementById("btn-crop-confirm"),

  submitError: document.getElementById("submit-error"),
  btnSubmit: document.getElementById("btn-submit"),
};

let cropper = null;
let approvedPhotoBlob = null; // ảnh đã crop + qua gác cổng, sẵn sàng nộp
let faceModelsReady = false;
let currentToken = null;
let tokenInfo = null; // { nhomG, congTy, dotThu, hanNop }
let currentEmployee = null; // bản ghi khớp được sau bước nhận diện
let identifiedNat = null; // quốc tịch do nhân viên tự chọn
let natMismatch = false; // quốc tịch chọn khác với dữ liệu Kintone -> cờ cho HR
let isExpired = false;
let isSubmitting = false;
// Chỉ bật báo lỗi SAU khi nhân viên bấm nộp lần đầu — không "mắng" người ta
// ngay từ lúc form còn trống. Sau lần đầu thì cập nhật danh sách theo thời gian
// thực để họ thấy mục nào đã điền xong.
let showErrors = false;

// ---------------------------------------------------------------
// 0. Ngôn ngữ
// ---------------------------------------------------------------
function fillSelect(select, values, keyPrefix) {
  const keep = select.value;
  select.innerHTML = "";
  select.appendChild(new Option(t("select"), ""));
  values.forEach((v) => select.appendChild(new Option(t(keyPrefix + v), v)));
  select.value = keep; // giữ nguyên lựa chọn cũ khi đổi ngôn ngữ
}

/** Đánh số lại các dòng người thân: "Người thân 1", "Người thân 2"… */
function renumberFamilyRows() {
  els.familyList.querySelectorAll(".family-row").forEach((row, i) => {
    const title = row.querySelector(".family-row-title");
    if (title) title.textContent = t("fam.no", { n: i + 1 });
  });
}

/** Vẽ lại toàn bộ chữ động (không nằm trong data-i18n) theo ngôn ngữ hiện tại */
function renderDynamicText() {
  if (isExpired && tokenInfo) {
    els.expiredBody.textContent = t("expired.body", {
      dot: tokenInfo.dotThu,
      han: formatDate(tokenInfo.hanNop),
    });
  }
  if (tokenInfo && !isExpired) {
    els.idHan.textContent = formatDate(tokenInfo.hanNop);
    els.infoHan.textContent = formatDate(tokenInfo.hanNop);
  }
  if (currentEmployee) {
    els.infoNgaySinh.textContent = formatDate(currentEmployee.ngaySinh);
  }

  fillSelect(els.idNat, NATIONALITY_SELF_VALUES, "nat.");

  // các select trong từng dòng người thân
  els.familyList.querySelectorAll(".family-row").forEach((row) => {
    fillSelect(row.querySelector(".f-relation"), RELATION_VALUES, "rel.");
    fillSelect(row.querySelector(".f-nationality"), NATIONALITY_VALUES, "nat.");
  });
  renumberFamilyRows();

  if (approvedPhotoBlob) {
    els.photoStatus.textContent = t("q4.ok");
    els.photoStatus.className = "status ok";
  }

  if (isSubmitting) els.btnSubmit.textContent = t("submitting");

  // danh sách lỗi cũng phải đổi ngôn ngữ theo
  if (showErrors) refreshErrors();
  if (!els.identifyError.classList.contains("hidden")) renderIdentifyProblems(collectIdentifyProblems());
}

function setLang(lang) {
  if (!LANG_LIST.includes(lang)) lang = LANG_DEFAULT;
  currentLang = lang;
  saveLang(lang);

  document.documentElement.lang = t("html.lang");
  applyI18nTo(document);
  renderDynamicText();

  els.langSwitch.querySelectorAll("button").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === lang);
  });
}

els.langSwitch.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-lang]");
  if (btn) setLang(btn.dataset.lang);
});

// ---------------------------------------------------------------
// 1. Khởi tạo: đọc token (= 1 công ty + 1 đợt), kiểm tra hợp lệ / hết hạn
// ---------------------------------------------------------------
function showScreen(id) {
  for (const s of [els.loading, els.invalid, els.expired, els.identify, els.form, els.success]) {
    s.classList.add("hidden");
  }
  id.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "auto" });
}

function init() {
  setLang(readSavedLang());

  const params = new URLSearchParams(window.location.search);
  currentToken = params.get("token");

  // Cho phép ép ngôn ngữ qua link: ...?token=XXX&lang=vi
  const langParam = params.get("lang");
  if (langParam && LANG_LIST.includes(langParam)) setLang(langParam);

  if (!currentToken || !DEMO_TOKENS[currentToken]) {
    showScreen(els.invalid);
    return;
  }

  tokenInfo = DEMO_TOKENS[currentToken];

  const today = new Date();
  const deadline = new Date(tokenInfo.hanNop + "T23:59:59+09:00");
  if (today > deadline) {
    isExpired = true;
    renderDynamicText();
    showScreen(els.expired);
    return;
  }

  // màn hình nhận diện chỉ biết công ty + đợt, chưa biết là ai
  els.idCongTy.textContent = tokenInfo.congTy;
  els.idNhomG.textContent = "(G" + tokenInfo.nhomG + ")";
  els.idDot.textContent = tokenInfo.dotThu;
  els.idHan.textContent = formatDate(tokenInfo.hanNop);

  fillSelect(els.idNat, NATIONALITY_SELF_VALUES, "nat.");

  showScreen(els.identify);
  loadFaceModels();
}

// ---------------------------------------------------------------
// 2. Chuẩn hoá họ tên (SPEC mục 12) — app C# PHẢI cài y hệt 6 bước này
//    khi chuẩn hoá trường 名前 của Kintone, lệch 1 bước là không bao giờ khớp.
// ---------------------------------------------------------------
function normalizeName(input) {
  if (!input) return "";
  let s = String(input);
  s = s.normalize("NFKC"); // 1. full-width -> half-width (ＮＧＵＹＥＮ -> NGUYEN)
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // 2. bỏ dấu tiếng Việt
  s = s.replace(/Đ/g, "D").replace(/đ/g, "d"); // 3. Đ/đ không tách được bằng NFD
  s = s.replace(/[.,\-_'’`"“”()\/\\]/g, " "); // 4. dấu câu -> dấu cách
  s = s.replace(/[\s\u3000]+/g, " ").trim(); // 5. gộp khoảng trắng (kể cả U+3000)
  return s.toUpperCase(); // 6. in hoa
}

/** Khoảng cách Levenshtein — dùng để tha lỗi gõ sai tối đa 2 ký tự */
function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array(n + 1);
  let cur = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[n];
}

/** Cùng bộ từ, khác thứ tự — vd "KHOA PHAM DANG" vs "PHAM DANG KHOA" */
function sameTokenSet(a, b) {
  const ta = a.split(" ").filter(Boolean).sort().join(" ");
  const tb = b.split(" ").filter(Boolean).sort().join(" ");
  return ta.length > 0 && ta === tb;
}

// ---------------------------------------------------------------
// 3. So khớp nhân viên
//
// ⚠️ BẢN DEMO: hàm dưới đây chạy TRONG TRÌNH DUYỆT và đọc DEMO_ROSTER trong
// js/config.js. Điều này CHỈ chấp nhận được để demo luồng. Ở bản thật nó vi
// phạm đúng nguyên tắc đã chốt ở SPEC mục 11b: roster nằm trong file JS nghĩa
// là ai có link cũng tải về đọc được toàn bộ họ tên + ngày sinh của cả công ty.
//
// Bản thật thay nguyên khối này bằng 1 lời gọi RPC:
//   const { data } = await supabase.rpc("verify_employee", {
//     p_token: currentToken, p_ten_chuan: tenChuan, p_ngay_sinh: dob });
// Hàm RPC (security definer) tự so khớp bên trong Postgres và chỉ trả về mã
// nhân viên khớp, hoặc rỗng. Không bao giờ trả danh sách ứng viên về trình duyệt.
// ---------------------------------------------------------------
function verifyEmployee(token, tenChuan, ngaySinh) {
  const roster = DEMO_ROSTER[token] || [];

  // Bước 1: lọc theo ngày sinh (khoá chính, chọn bằng date picker nên không sai)
  const candidates = roster.filter((r) => r.ngaySinh === ngaySinh);
  if (candidates.length === 0) return null;

  const strict = candidates.length > 1; // trùng ngày sinh -> TẮT phần tha lỗi gõ sai
  const matched = [];

  for (const r of candidates) {
    const rosterName = normalizeName(r.ten);
    let ok = rosterName === tenChuan || sameTokenSet(rosterName, tenChuan);
    if (!ok && !strict) ok = levenshtein(rosterName, tenChuan) <= 2;
    if (ok) matched.push(r);
  }

  // khớp đúng 1 người mới nhận; khớp nhiều -> coi như không tìm thấy
  return matched.length === 1 ? matched[0] : null;
}

// ---------------------------------------------------------------
// 4. Màn hình nhận diện
// ---------------------------------------------------------------

// Tự chuyển sang IN HOA ngay khi gõ, để nhân viên thấy được mình đang nhập
// đúng dạng. Giữ nguyên vị trí con trỏ vì độ dài chuỗi không đổi.
els.idName.addEventListener("input", (e) => {
  const pos = e.target.selectionStart;
  const upper = e.target.value.toUpperCase();
  if (upper !== e.target.value) {
    e.target.value = upper;
    try {
      e.target.setSelectionRange(pos, pos);
    } catch (err) {
      /* một số trình duyệt không cho set trên input type khác text — bỏ qua */
    }
  }
  clearIdentifyErrorsIfShown();
});
els.idDob.addEventListener("change", clearIdentifyErrorsIfShown);
els.idNat.addEventListener("change", clearIdentifyErrorsIfShown);

function collectIdentifyProblems() {
  const problems = [];
  if (!els.idName.value.trim()) {
    problems.push({ target: els.idName, mark: els.idName.closest(".field"), label: t("id.err.name") });
  }
  if (!els.idDob.value) {
    problems.push({ target: els.idDob, mark: els.idDob.closest(".field"), label: t("id.err.dob") });
  }
  if (!els.idNat.value) {
    problems.push({ target: els.idNat, mark: els.idNat.closest(".field"), label: t("id.err.nat") });
  }
  return problems;
}

function renderIdentifyProblems(problems) {
  document
    .querySelectorAll("#screen-identify .is-invalid")
    .forEach((el) => el.classList.remove("is-invalid"));

  if (problems.length === 0) {
    els.identifyError.classList.add("hidden");
    els.identifyError.innerHTML = "";
    return;
  }
  problems.forEach((p) => p.mark && p.mark.classList.add("is-invalid"));

  els.identifyError.innerHTML = "";
  const title = document.createElement("strong");
  title.textContent = t("id.err.title");
  els.identifyError.appendChild(title);
  const ul = document.createElement("ul");
  problems.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = p.label;
    ul.appendChild(li);
  });
  els.identifyError.appendChild(ul);
  els.identifyError.classList.remove("hidden");
}

function showIdentifyMessage(text) {
  document
    .querySelectorAll("#screen-identify .is-invalid")
    .forEach((el) => el.classList.remove("is-invalid"));
  els.identifyError.innerHTML = "";
  const p = document.createElement("div");
  p.textContent = text;
  els.identifyError.appendChild(p);
  els.identifyError.classList.remove("hidden");
}

function clearIdentifyErrorsIfShown() {
  if (els.identifyError.classList.contains("hidden")) return;
  const problems = collectIdentifyProblems();
  if (problems.length === 0) {
    els.identifyError.classList.add("hidden");
    els.identifyError.innerHTML = "";
    document
      .querySelectorAll("#screen-identify .is-invalid")
      .forEach((el) => el.classList.remove("is-invalid"));
  } else {
    renderIdentifyProblems(problems);
  }
}

els.identifyForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const problems = collectIdentifyProblems();
  if (problems.length > 0) {
    renderIdentifyProblems(problems);
    return;
  }

  const tenChuan = normalizeName(els.idName.value);
  const ngaySinh = els.idDob.value;
  const quocTich = els.idNat.value;

  const found = verifyEmployee(currentToken, tenChuan, ngaySinh);

  if (!found) {
    // Câu báo lỗi phải CHUNG CHUNG: không được tiết lộ "ngày sinh đúng nhưng
    // tên sai", vì câu đó tự nó xác nhận có người sinh ngày đó (SPEC 11d).
    showIdentifyMessage(t("id.notfound"));
    return;
  }

  currentEmployee = found;
  identifiedNat = quocTich;
  // Quốc tịch không dùng làm khoá so khớp (chưa chắc Kintone có trường này).
  // Nếu lệch thì vẫn cho qua, chỉ gắn cờ để HR kiểm lại khi duyệt.
  natMismatch = Boolean(found.quocTich) && found.quocTich !== quocTich;

  enterMainForm();
});

function enterMainForm() {
  els.identifyError.classList.add("hidden");

  els.infoHoTen.textContent = currentEmployee.ten; // luôn lấy tên chuẩn từ Kintone
  els.infoNgaySinh.textContent = formatDate(currentEmployee.ngaySinh);
  els.infoCongTy.textContent = tokenInfo.congTy;
  els.infoNhomG.textContent = "(G" + tokenInfo.nhomG + ")";
  els.infoDot.textContent = tokenInfo.dotThu;
  els.infoHan.textContent = formatDate(tokenInfo.hanNop);

  // Câu hỏi "liên hệ quê nhà" chỉ hiện với diện Tokutei Gino — do app C#
  // gán sẵn theo dữ liệu Kintone, nhân viên không tự chọn diện của mình.
  els.cardTokutei.classList.toggle("hidden", currentEmployee.loaiTuCach !== "tokutei_gino");

  showScreen(els.form);
}

// "Không phải tôi" — quay lại màn nhận diện, xoá sạch thứ đã nhập
els.btnNotMe.addEventListener("click", () => {
  currentEmployee = null;
  identifiedNat = null;
  natMismatch = false;
  approvedPhotoBlob = null;
  showErrors = false;

  els.mainForm.reset();
  els.familyList.innerHTML = "";
  els.relativesBlock.classList.add("hidden");
  els.photoResult.classList.add("hidden");
  els.photoPicker.classList.remove("hidden");
  els.photoStatus.textContent = "";
  els.submitError.classList.add("hidden");
  document.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));

  els.idName.value = "";
  els.idDob.value = "";
  els.idNat.value = "";
  els.identifyError.classList.add("hidden");

  showScreen(els.identify);
});

// ---------------------------------------------------------------
// 5. Câu hỏi người thân tại Nhật (thêm/xoá động)
// ---------------------------------------------------------------
let familyRowCounter = 0;

function addFamilyRow() {
  const node = els.familyTemplate.content.cloneNode(true);
  const row = node.querySelector(".family-row");
  familyRowCounter += 1;
  const rowId = familyRowCounter;

  applyI18nTo(row); // dịch nhãn trong dòng vừa tạo
  fillSelect(row.querySelector(".f-relation"), RELATION_VALUES, "rel.");
  fillSelect(row.querySelector(".f-nationality"), NATIONALITY_VALUES, "nat.");

  // đặt name riêng cho mỗi dòng để 2 radio "sống cùng" của các dòng khác nhau
  // không bị tính chung 1 nhóm
  row.querySelectorAll(".f-song-cung").forEach((radio) => {
    radio.name = `song-cung-${rowId}`;
  });

  row.querySelector(".btn-remove-family").addEventListener("click", () => {
    row.remove();
    renumberFamilyRows();
    refreshErrors();
  });

  els.familyList.appendChild(row);
  renumberFamilyRows();
}

els.btnAddFamily.addEventListener("click", () => {
  addFamilyRow();
  refreshErrors();
});

els.groupNguoiThanNhat.addEventListener("change", (e) => {
  if (e.target.name !== "nguoi-than-nhat") return;
  if (e.target.value === "co") {
    els.relativesBlock.classList.remove("hidden");
    if (els.familyList.children.length === 0) addFamilyRow();
  } else {
    els.relativesBlock.classList.add("hidden");
    els.familyList.innerHTML = ""; // trả lời "Không" -> không cần khai người thân
  }
  refreshErrors();
});

function collectFamilyData() {
  const rows = els.familyList.querySelectorAll(".family-row");
  const data = [];
  for (const row of rows) {
    const songCungEl = row.querySelector(".f-song-cung:checked");
    data.push({
      quanHe: row.querySelector(".f-relation").value,
      hoTen: row.querySelector(".f-name").value.trim(),
      ngaySinh: row.querySelector(".f-dob").value,
      quocTich: row.querySelector(".f-nationality").value,
      dangSongCung: songCungEl ? songCungEl.value : null,
      congTyTruong: row.querySelector(".f-workplace").value.trim(),
      maTheNgoaiKieu: row.querySelector(".f-zairyu").value.trim(),
    });
  }
  return data;
}

function getRadioValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : null;
}

// ---------------------------------------------------------------
// 6. Kiểm tra thông tin còn thiếu + liệt kê cho nhân viên
//    Mọi câu hỏi đều BẮT BUỘC. Riêng phần chi tiết người thân chỉ bắt buộc
//    khi nhân viên trả lời "Có" ở câu 2.
// ---------------------------------------------------------------
function collectProblems() {
  const problems = [];
  const add = (target, mark, label) => problems.push({ target, mark, label });

  if (!getRadioValue("hon-nhan")) {
    add(els.groupHonNhan, els.groupHonNhan, t("q1.title"));
  }

  const nguoiThanNhat = getRadioValue("nguoi-than-nhat");
  if (!nguoiThanNhat) {
    add(els.groupNguoiThanNhat, els.groupNguoiThanNhat, t("q2.title"));
  } else if (nguoiThanNhat === "co") {
    const rows = els.familyList.querySelectorAll(".family-row");
    if (rows.length === 0) {
      add(els.btnAddFamily, els.btnAddFamily, t("err.fam.none"));
    }
    rows.forEach((row, i) => {
      const who = t("fam.no", { n: i + 1 });

      const checkText = (sel, labelKey) => {
        const input = row.querySelector(sel);
        const field = input.closest(".field");
        if (!input.value || !input.value.trim()) {
          add(input, field, `${who} — ${t(labelKey)}`);
        }
      };

      checkText(".f-relation", "fam.relation");
      checkText(".f-name", "fam.name");
      checkText(".f-dob", "fam.dob");
      checkText(".f-nationality", "fam.nationality");

      const songCung = row.querySelector(".f-song-cung:checked");
      if (!songCung) {
        const group = row.querySelector(".f-song-cung-group");
        add(group, group, `${who} — ${t("fam.living")}`);
      }

      checkText(".f-workplace", "fam.workplace");
      checkText(".f-zairyu", "fam.zairyu");
    });
  }

  if (!els.cardTokutei.classList.contains("hidden")) {
    if (!els.queNhaSdt.value.trim()) {
      add(els.queNhaSdt, els.queNhaSdt.closest(".field"), t("q3.phone"));
    }
    if (!els.queNhaDiaChi.value.trim()) {
      add(els.queNhaDiaChi, els.queNhaDiaChi.closest(".field"), t("q3.address"));
    }
  }

  if (!approvedPhotoBlob) {
    add(els.photoPicker, els.photoPicker, t("err.photo"));
  }

  return problems;
}

function renderProblems(problems) {
  document
    .querySelectorAll("#screen-form .is-invalid")
    .forEach((el) => el.classList.remove("is-invalid"));

  if (problems.length === 0) {
    els.submitError.classList.add("hidden");
    els.submitError.innerHTML = "";
    return;
  }

  problems.forEach((p) => p.mark && p.mark.classList.add("is-invalid"));

  els.submitError.innerHTML = "";
  const title = document.createElement("strong");
  title.textContent = t("err.title");
  els.submitError.appendChild(title);

  const ul = document.createElement("ul");
  problems.forEach((p) => {
    const li = document.createElement("li");
    const link = document.createElement("button");
    link.type = "button";
    link.className = "err-link";
    link.textContent = p.label;
    // Bấm vào 1 dòng trong danh sách -> nhảy thẳng tới ô còn thiếu
    link.addEventListener("click", () => {
      p.target.scrollIntoView({ behavior: "smooth", block: "center" });
      if (typeof p.target.focus === "function") {
        setTimeout(() => p.target.focus({ preventScroll: true }), 300);
      }
    });
    li.appendChild(link);
    ul.appendChild(li);
  });
  els.submitError.appendChild(ul);
  els.submitError.classList.remove("hidden");
}

/** Cập nhật lại danh sách lỗi — chỉ chạy sau khi nhân viên đã bấm nộp 1 lần */
function refreshErrors() {
  if (!showErrors) return;
  renderProblems(collectProblems());
}

els.mainForm.addEventListener("input", refreshErrors);
els.mainForm.addEventListener("change", refreshErrors);

// ---------------------------------------------------------------
// 7. Chọn ảnh -> mở modal crop (Cropper.js, tỉ lệ 3:4)
// ---------------------------------------------------------------

// Viền gợi ý đầu + vai, vẽ đè lên khung crop. Chỉ để nhân viên tự canh bằng mắt
// (giống khung ảnh đăng ký thi JLPT) — KHÔNG đo đạc, KHÔNG chặn nộp ảnh.
// viewBox 300x400 = đúng tỉ lệ 3:4 của khung (rộng 3cm × cao 4cm).
const CROP_GUIDE_SVG = `
<svg class="crop-guide" viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="rgba(0,0,0,0.4)" stroke-width="5" stroke-linecap="round">
    <ellipse cx="150" cy="170" rx="92" ry="120" />
    <path d="M6 400 C 30 344, 96 318, 150 318 C 204 318, 270 344, 294 400" />
  </g>
  <g fill="none" stroke="rgba(255,255,255,0.95)" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="8 7">
    <ellipse cx="150" cy="170" rx="92" ry="120" />
    <path d="M6 400 C 30 344, 96 318, 150 318 C 204 318, 270 344, 294 400" />
  </g>
</svg>`;

/** Chèn viền gợi ý vào bên trong khung crop của Cropper.js.
 *  Đặt trong .cropper-crop-box nên viền tự bám đúng vị trí/kích thước khung,
 *  kể cả khi xoay màn hình. pointer-events:none để không chặn thao tác kéo ảnh. */
function attachCropGuide() {
  const root =
    (cropper && cropper.cropper) || document.querySelector(".crop-area .cropper-container");
  if (!root) return;
  const box = root.querySelector(".cropper-crop-box");
  if (!box || box.querySelector(".crop-guide-layer")) return;
  const layer = document.createElement("div");
  layer.className = "crop-guide-layer";
  layer.innerHTML = CROP_GUIDE_SVG;
  box.appendChild(layer);
}

els.photoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => openCropModal(reader.result);
  reader.readAsDataURL(file);
  e.target.value = ""; // cho phép chọn lại cùng 1 file
});

function openCropModal(dataUrl) {
  els.cropImage.src = dataUrl;
  els.cropModal.classList.remove("hidden");
  els.cropFaceStatus.textContent = "";
  els.cropFaceStatus.className = "status";
  els.btnCropConfirm.disabled = false;

  if (cropper) cropper.destroy();
  cropper = new Cropper(els.cropImage, {
    aspectRatio: 3 / 4, // rộng:cao = 3:4 theo quy cách ISA (cao 4cm x rộng 3cm)
    viewMode: 1,
    dragMode: "move",
    autoCropArea: 0.9,
    background: false,
    // Khung crop phải CỐ ĐỊNH (đúng chuẩn ISA) — nhân viên chỉ được kéo/phóng
    // TẤM ẢNH vào bên trong khung, không được kéo dãn/thu nhỏ chính cái khung.
    cropBoxResizable: false,
    cropBoxMovable: false,
    toggleDragModeOnDblclick: false,
    ready: attachCropGuide,
  });

  // Gọi lại 1 nhịp sau cho chắc (nếu vì lý do nào đó sự kiện ready không chạy)
  setTimeout(attachCropGuide, 300);
}

els.btnCropCancel.addEventListener("click", closeCropModal);
els.btnCropClose.addEventListener("click", closeCropModal);

function closeCropModal() {
  els.cropModal.classList.add("hidden");
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

els.btnCropConfirm.addEventListener("click", async () => {
  if (!cropper) return;
  els.btnCropConfirm.disabled = true;
  els.cropFaceStatus.textContent = t("crop.checking");
  els.cropFaceStatus.className = "status";

  const canvas = cropper.getCroppedCanvas({ width: 600, height: 800 }); // 3:4

  const faceResult = await checkFaceCount(canvas);

  if (faceResult.ok) {
    canvas.toBlob(
      (blob) => {
        approvedPhotoBlob = blob;
        els.photoPreview.src = URL.createObjectURL(blob);
        els.photoResult.classList.remove("hidden");
        els.photoPicker.classList.add("hidden");
        els.photoStatus.textContent = t("q4.ok");
        els.photoStatus.className = "status ok";
        closeCropModal();
        refreshErrors();
      },
      "image/jpeg",
      0.92
    );
  } else {
    els.cropFaceStatus.textContent = t(faceResult.messageKey);
    els.cropFaceStatus.className = "status bad";
    els.btnCropConfirm.disabled = false;
  }
});

els.btnRetake.addEventListener("click", () => {
  approvedPhotoBlob = null;
  els.photoResult.classList.add("hidden");
  els.photoPicker.classList.remove("hidden");
  els.photoStatus.textContent = "";
  els.photoStatus.className = "status";
  refreshErrors();
});

// ---------------------------------------------------------------
// 8. Gác cổng: đếm khuôn mặt bằng face-api.js (tiny face detector)
// ---------------------------------------------------------------
async function loadFaceModels() {
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODELS_URL);
    faceModelsReady = true;
  } catch (err) {
    console.error("Không tải được model gác cổng:", err);
    faceModelsReady = false;
  }
}

async function checkFaceCount(canvas) {
  if (!faceModelsReady) {
    // Không chặn nộp ảnh nếu model lỗi tải (demo/offline) — HR duyệt tay.
    return { ok: true };
  }
  try {
    const detections = await faceapi.detectAllFaces(
      canvas,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
    );
    if (detections.length === 0) return { ok: false, messageKey: "crop.noface" };
    if (detections.length > 1) return { ok: false, messageKey: "crop.manyfaces" };
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: true }; // lỗi kỹ thuật -> không chặn, HR duyệt tay
  }
}

// ---------------------------------------------------------------
// 9. Nộp lên Supabase
// ---------------------------------------------------------------
els.mainForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (isSubmitting || !currentEmployee) return;

  showErrors = true;
  const problems = collectProblems();
  if (problems.length > 0) {
    renderProblems(problems);
    els.submitError.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  renderProblems([]);

  els.btnSubmit.disabled = true;
  isSubmitting = true;
  els.btnSubmit.textContent = t("submitting");

  try {
    const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

    const fileName = `${currentToken}/${currentEmployee.maNv}-${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_CONFIG.bucket)
      .upload(fileName, approvedPhotoBlob, { contentType: "image/jpeg" });
    if (uploadError) throw uploadError;

    const nguoiThanNhat = getRadioValue("nguoi-than-nhat");
    const tokuteiVisible = !els.cardTokutei.classList.contains("hidden");

    const { error: insertError } = await supabase.from("submissions").insert({
      token: currentToken,
      ma_nv: currentEmployee.maNv, // khoá nối ngược về bản ghi Kintone
      ho_ten_nv: currentEmployee.ten, // LUÔN là tên chuẩn Kintone, không phải chữ nhân viên gõ
      ngay_sinh: currentEmployee.ngaySinh,
      quoc_tich: identifiedNat, // do nhân viên tự chọn
      quoc_tich_lech: natMismatch, // cờ để HR kiểm lại nếu lệch với Kintone
      cong_ty: tokenInfo.congTy,
      nhom_g: tokenInfo.nhomG,
      dot_thu: tokenInfo.dotThu,
      tinh_trang_hon_nhan: getRadioValue("hon-nhan"), // "co" | "khong"
      co_nguoi_than_o_nhat: nguoiThanNhat, // "co" | "khong"
      nguoi_than_o_nhat: nguoiThanNhat === "co" ? collectFamilyData() : [],
      lien_he_que_nha: tokuteiVisible
        ? { soDienThoai: els.queNhaSdt.value.trim(), diaChi: els.queNhaDiaChi.value.trim() }
        : null,
      photo_path: fileName,
    });
    if (insertError) throw insertError;

    showScreen(els.success);
  } catch (err) {
    console.error(err);
    isSubmitting = false;
    els.submitError.textContent = t("submit.error") + (err.message || err);
    els.submitError.classList.remove("hidden");
    els.btnSubmit.disabled = false;
    els.btnSubmit.textContent = t("submit");
  }
});

init();
