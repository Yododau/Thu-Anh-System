// ============================================================
// Zairyu Desk — logic chính (bản demo)
// Chữ hiển thị lấy từ js/i18n.js qua hàm t("khoá")
// ============================================================

const FACE_MODELS_URL =
  "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";

const els = {
  loading: document.getElementById("screen-loading"),
  invalid: document.getElementById("screen-invalid"),
  expired: document.getElementById("screen-expired"),
  form: document.getElementById("screen-form"),
  success: document.getElementById("screen-success"),

  expiredBody: document.getElementById("expired-body"),

  infoHoTen: document.getElementById("info-hoten"),
  infoCongTy: document.getElementById("info-congty"),
  infoNhomG: document.getElementById("info-nhomg"),
  infoDot: document.getElementById("info-dot"),
  infoHan: document.getElementById("info-han"),

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
  btnCropConfirm: document.getElementById("btn-crop-confirm"),

  submitError: document.getElementById("submit-error"),
  btnSubmit: document.getElementById("btn-submit"),
};

let cropper = null;
let approvedPhotoBlob = null; // ảnh đã crop + qua gác cổng, sẵn sàng nộp
let faceModelsReady = false;
let currentToken = null;
let tokenInfo = null;
let isExpired = false;
let isSubmitting = false;

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

/** Vẽ lại toàn bộ chữ động (không nằm trong data-i18n) theo ngôn ngữ hiện tại */
function renderDynamicText() {
  if (isExpired && tokenInfo) {
    els.expiredBody.textContent = t("expired.body", {
      dot: tokenInfo.dotThu,
      han: formatDate(tokenInfo.hanNop),
    });
  }
  if (tokenInfo && !isExpired) {
    els.infoHan.textContent = formatDate(tokenInfo.hanNop);
  }

  // các select trong từng dòng người thân
  els.familyList.querySelectorAll(".family-row").forEach((row) => {
    fillSelect(row.querySelector(".f-relation"), RELATION_VALUES, "rel.");
    fillSelect(row.querySelector(".f-nationality"), NATIONALITY_VALUES, "nat.");
  });

  if (approvedPhotoBlob) {
    els.photoStatus.textContent = t("q4.ok");
    els.photoStatus.className = "status ok";
  }

  if (isSubmitting) els.btnSubmit.textContent = t("submitting");
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
// 1. Khởi tạo: đọc token, kiểm tra hợp lệ / hết hạn
// ---------------------------------------------------------------
function showScreen(id) {
  for (const s of [els.loading, els.invalid, els.expired, els.form, els.success]) {
    s.classList.add("hidden");
  }
  id.classList.remove("hidden");
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

  els.infoHoTen.textContent = tokenInfo.hoTen;
  els.infoCongTy.textContent = tokenInfo.congTy;
  els.infoNhomG.textContent = tokenInfo.nhomG;
  els.infoDot.textContent = tokenInfo.dotThu;
  els.infoHan.textContent = formatDate(tokenInfo.hanNop);

  // Câu hỏi "liên hệ quê nhà" chỉ hiện với diện Tokutei Gino — do app C#
  // gán sẵn theo dữ liệu Kintone, nhân viên không tự chọn diện của mình.
  if (tokenInfo.loaiTuCach === "tokutei_gino") {
    els.cardTokutei.classList.remove("hidden");
  }

  showScreen(els.form);
  loadFaceModels();
}

// ---------------------------------------------------------------
// 2. Câu hỏi tình trạng hôn nhân + người thân tại Nhật (thêm/xoá động)
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
    validateForm();
  });
  row.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("input", validateForm);
    el.addEventListener("change", validateForm);
  });

  els.familyList.appendChild(row);
}

els.btnAddFamily.addEventListener("click", addFamilyRow);

// Toggle: "Có người thân đang sống tại Nhật không?"
els.groupNguoiThanNhat.addEventListener("change", (e) => {
  if (e.target.name !== "nguoi-than-nhat") return;
  if (e.target.value === "co") {
    els.relativesBlock.classList.remove("hidden");
    if (els.familyList.children.length === 0) addFamilyRow();
  } else {
    els.relativesBlock.classList.add("hidden");
    els.familyList.innerHTML = ""; // trả lời "Không" -> không cần khai người thân
  }
  validateForm();
});

els.groupHonNhan.addEventListener("change", validateForm);

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

function familyRowsValid() {
  const rows = els.familyList.querySelectorAll(".family-row");
  for (const row of rows) {
    const rel = row.querySelector(".f-relation").value;
    const name = row.querySelector(".f-name").value.trim();
    const dob = row.querySelector(".f-dob").value;
    const nat = row.querySelector(".f-nationality").value;
    const songCung = row.querySelector(".f-song-cung:checked");
    const zairyu = row.querySelector(".f-zairyu").value.trim();
    if (!rel || !name || !dob || !nat || !songCung || !zairyu) return false;
  }
  return true;
}

function getRadioValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : null;
}

// ---------------------------------------------------------------
// 3. Chọn ảnh -> mở modal crop (Cropper.js, tỉ lệ 3:4)
// ---------------------------------------------------------------
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
  els.btnCropConfirm.disabled = false;

  if (cropper) cropper.destroy();
  cropper = new Cropper(els.cropImage, {
    aspectRatio: 3 / 4, // rộng:cao = 3:4 theo quy cách ISA (cao 4cm x rộng 3cm)
    viewMode: 1,
    dragMode: "move",
    autoCropArea: 0.9,
    background: false,
  });
}

els.btnCropCancel.addEventListener("click", closeCropModal);

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
        validateForm();
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
  validateForm();
});

// ---------------------------------------------------------------
// 4. Gác cổng: đếm khuôn mặt bằng face-api.js (tiny face detector)
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
// 5. Validate tổng thể form
// ---------------------------------------------------------------
function validateForm() {
  let ok = approvedPhotoBlob !== null;

  const honNhan = getRadioValue("hon-nhan");
  ok = ok && honNhan !== null;

  const nguoiThanNhat = getRadioValue("nguoi-than-nhat");
  ok = ok && nguoiThanNhat !== null;

  if (nguoiThanNhat === "co") {
    ok = ok && els.familyList.children.length > 0 && familyRowsValid();
  }

  if (!els.cardTokutei.classList.contains("hidden")) {
    ok = ok && els.queNhaSdt.value.trim() !== "" && els.queNhaDiaChi.value.trim() !== "";
  }

  els.btnSubmit.disabled = !ok;
  return ok;
}

els.mainForm.addEventListener("input", validateForm);

// ---------------------------------------------------------------
// 6. Nộp lên Supabase
// ---------------------------------------------------------------
els.mainForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  els.submitError.classList.add("hidden");
  els.btnSubmit.disabled = true;
  isSubmitting = true;
  els.btnSubmit.textContent = t("submitting");

  try {
    const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

    const fileName = `${currentToken}/${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_CONFIG.bucket)
      .upload(fileName, approvedPhotoBlob, { contentType: "image/jpeg" });
    if (uploadError) throw uploadError;

    const nguoiThanNhat = getRadioValue("nguoi-than-nhat");
    const tokuteiVisible = !els.cardTokutei.classList.contains("hidden");

    const { error: insertError } = await supabase.from("submissions").insert({
      token: currentToken,
      ho_ten_nv: tokenInfo.hoTen,
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
