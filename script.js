import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// =====================================================
// Firebase Configuration
// =====================================================
const firebaseConfig = {
  apiKey: "AIzaSyA8rh7mm5hkS_BwkgArbnhGgLidTtp1Pnc",
  authDomain: "yusefono-bf716.firebaseapp.com",
  projectId: "yusefono-bf716",
  storageBucket: "yusefono-bf716.firebasestorage.app",
  messagingSenderId: "388217819851",
  appId: "1:388217819851:web:1e0b6c312e26eadf67014e",
  measurementId: "G-4WVVF32L2C"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

let isAdminLoggedIn = false;
const ADMIN_EMAIL = "admin@yusefono.com";

// =====================================================
// بيانات المحافظات والإدارات المصرية (مع كفر الشيخ)
// =====================================================
const egyptData = {
  "القاهرة": ["العباسية", "الزمالك", "مصر الجديدة", "مدينة نصر", "المعادي", "حلوان", "15 مايو", "السلام", "الوايلي", "الأزبكية"],
  "الإسكندرية": ["المنتزة", "شرق", "وسط", "غرب", "الجمرك", "العجمي", "برج العرب", "الدخيلة"],
  "الجيزة": ["العجوزة", "الدقي", "المهندسين", "الهرم", "فيصل", "البدرشين", "الصف", "أطفيح", "أوسيم", "كرداسة"],
  "الشرقية": ["الزقازيق", "بلبيس", "منيا القمح", "أبو كبير", "ههيا", "فاقوس", "العاشر من رمضان", "كفر صقر", "الإبراهيمية"],
  "الدقهلية": ["المنصورة", "طلخا", "السنبلاوين", "دكرنس", "أجا", "ميت غمر", "نبروه", "تمي الأمديد", "شربين", "بني عبيد"],
  "البحيرة": ["دمنهور", "كفر الدوار", "رشيد", "إيتاي البارود", "أبو حمص", "الدلنجات", "المحمودية", "شبراخيت", "حوش عيسى"],
  "المنوفية": ["شبين الكوم", "السادات", "منوف", "بركة السبع", "الباجور", "أشمون", "قويسنا", "تلا"],
  "الغربية": ["طنطا", "المحلة الكبرى", "كفر الزيات", "زفتى", "السنطة", "قطور", "بسيون", "سمنود"],
  "القليوبية": ["بنها", "الخانكة", "قليوب", "شبرا الخيمة", "طوخ", "القناطر الخيرية", "كفر شكر"],
  "المنيا": ["المنيا", "ملوي", "بني مزار", "مطاي", "سمالوط", "أبوقرقاص", "دير مواس", "العدوة"],
  "الفيوم": ["الفيوم", "طامية", "سنورس", "إطسا", "أبشواي", "يوسف الصديق"],
  "بني سويف": ["بني سويف", "الواسطى", "ناصر", "الفشن", "سمسطا", "إهناسيا", "ببا"],
  "أسوان": ["أسوان", "إدفو", "كوم أمبو", "نصر النوبة", "دراو", "كلابشة"],
  "الأقصر": ["الأقصر", "القرنة", "إسنا", "أرمنت", "البياضية", "الطود"],
  "قنا": ["قنا", "نجع حمادي", "قوص", "فرشوط", "نقادة", "أبو تشت", "الوقف"],
  "سوهاج": ["سوهاج", "أخميم", "المنشأة", "البلينا", "جرجا", "طهطا", "المراغة", "ساقلته"],
  "أسيوط": ["أسيوط", "أبنوب", "القوصية", "منفلوط", "البداري", "ساحل سليم", "الغنايم", "الفتح"],
  "الإسماعيلية": ["الإسماعيلية", "فايد", "التل الكبير", "القنطرة شرق", "القنطرة غرب"],
  "بورسعيد": ["بورسعيد", "الزهور", "العرايشية", "المعمورة", "المناخ"],
  "السويس": ["السويس", "الجناين", "عتاقة", "الأربعين", "فيصل"],
  "دمياط": ["دمياط", "فارسكور", "كفر سعد", "الزرقا", "رأس البر", "ميت أبو غالب"],
  "كفر الشيخ": ["كفر الشيخ", "دسوق", "فوه", "مطوبس", "بيلا", "الحامول", "الرياض", "سيدي سالم", "قلين"],
  "شمال سيناء": ["العريش", "الشيخ زويد", "رفح", "بئر العبد", "الحسنة", "نخل"],
  "جنوب سيناء": ["الطور", "دهب", "نويبع", "أبو رديس", "سانت كاترين", "طابا", "رأس سدر"],
  "مطروح": ["مرسى مطروح", "السلوم", "الحمام", "النجيلة", "سيوة", "الضبعة"],
  "الوادي الجديد": ["الخارجة", "الداخلة", "الفرافرة", "باريس", "بلاط"],
  "البحر الأحمر": ["الغردقة", "رأس غارب", "القصير", "مرسى علم", "الشلاتين", "حلايب"]
};

// =====================================================
// الصور - دالة موحدة لبناء URL صورة موثوقة
// =====================================================
function buildImageUrl(rawUrl, itemName) {
  if (!rawUrl || rawUrl.trim() === '') {
    return makeFallbackImg(itemName);
  }
  if (rawUrl.includes('placehold') || rawUrl.includes('placeholder')) {
    return rawUrl;
  }
  if (rawUrl.startsWith('data:')) {
    return rawUrl;
  }
  return rawUrl;
}

function makeFallbackImg(name) {
  const encoded = encodeURIComponent(name || 'طبق');
  return `https://placehold.co/400x260/f5e1c0/8b2c1d?text=${encoded}`;
}

// =====================================================
// الصور الافتراضية
// =====================================================
const MENU_IMAGE_DEFAULTS = {
  1:  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=260&fit=crop&q=80',
  4:  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=260&fit=crop&q=80',
  5:  'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=400&h=260&fit=crop&q=80',
  6:  'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=260&fit=crop&q=80',
  7:  'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=260&fit=crop&q=80',
  8:  'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=400&h=260&fit=crop&q=80',
  9:  'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=400&h=260&fit=crop&q=80',
  10: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=260&fit=crop&q=80',
  11: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=260&fit=crop&q=80',
  12: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=260&fit=crop&q=80',
  13: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=260&fit=crop&q=80',
  16: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=260&fit=crop&q=80',
  19: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=260&fit=crop&q=80',
};

// =====================================================
// البيانات الافتراضية
// =====================================================
let restaurantConfig = {
  name: "يوسيفونو",
  phone: "201225899225",
  deliveryNote: "أكتب عنوانك بالكامل",
  primaryColor: "#c0392b",
  secondaryColor: "#ffc107",
  address: "القاهرة - مدينة نصر",
  workingHours: "مفتوح يومياً ١٢ ظهراً - ١٢ ليلاً"
};

let menuItems = [
  { id: 1,  name: "بيتزا جبنة", price: 150, category: "pizza", image: MENU_IMAGE_DEFAULTS[1], offerPrice: null, ratings: [], avgRating: 0, totalRatings: 0, description: "بيتزا الجبنة الكلاسيكية مزيج من أربعة أنواع من الأجبان الإيطالية الفاخرة مع صوص الطماطم الطازج. تقدم ساخنة مع رشة من الريحان الطازج.", gallery: [] },
  { id: 4,  name: "باستا ريد صوص", price: 200, category: "pasta", image: MENU_IMAGE_DEFAULTS[4], offerPrice: null, ratings: [], avgRating: 0, totalRatings: 0, description: "باستا طازجة مع صوص الطماطم الإيطالي المحضر بخلطة سرية من الأعشاب والتوابل. تقدم مع جبنة البارميزان المبشورة.", gallery: [] },
  { id: 5,  name: "باستا وايت صوص", price: 300, category: "pasta", image: MENU_IMAGE_DEFAULTS[5], offerPrice: null, ratings: [], avgRating: 0, totalRatings: 0, description: "باستا كريمية بصوص الألفريدو الغني بالكريمة والثوم وجبنة البارميزان. تقدم مع قطع الدجاج المشوي والفطر الطازج.", gallery: [] },
  { id: 6,  name: "بيتزا خضار مشكل", price: 180, category: "pizza", image: MENU_IMAGE_DEFAULTS[6], offerPrice: null, ratings: [], avgRating: 0, totalRatings: 0, description: "بيتزا نباتية غنية بالفلفل الملون، الزيتون الأسود، الفطر، والذرة الحلوة. خيار مثالي لمحبي الخضروات.", gallery: [] },
  { id: 7,  name: "بيتزا إيطاليانا", price: 300, category: "pizza", image: MENU_IMAGE_DEFAULTS[7], offerPrice: null, ratings: [], avgRating: 0, totalRatings: 0, description: "البيتزا الإيطالية الأصيلة بصوص الطماطم الطازج، السلامي الإيطالي، الفلفل الحار، والزيتون. مستوحاة من مطابخ نابولي.", gallery: [] },
  { id: 8,  name: "بيتزا مارينارا", price: 200, category: "pizza", image: MENU_IMAGE_DEFAULTS[8], offerPrice: null, ratings: [], avgRating: 0, totalRatings: 0, description: "بيتزا كلاسيكية بسيطة ولكنها لذيذة، مكونة من صوص الطماطم، الثوم، الأوريجانو، وزيت الزيتون البكر.", gallery: [] },
  { id: 9,  name: "باستا ألفريدو بالدجاج", price: 280, category: "pasta", image: MENU_IMAGE_DEFAULTS[9], offerPrice: null, ratings: [], avgRating: 0, totalRatings: 0, description: "سباغيتي كريمية بصوص ألفريدو مع قطع الدجاج المشوي والفطر الطازج. تقدم مع خبز الثوم الجانبي.", gallery: [] },
  { id: 10, name: "باستا بيري بيري حارة", price: 260, category: "pasta", image: MENU_IMAGE_DEFAULTS[10], offerPrice: null, ratings: [], avgRating: 0, totalRatings: 0, description: "باستا حارة بصوص بيري بيري الأفريقي مع لمسة إيطالية. تناسب محبي الطعام الحار والمغامرات.", gallery: [] },
  { id: 11, name: "لازانيا بولو بالجبنة", price: 350, category: "pasta", image: MENU_IMAGE_DEFAULTS[11], offerPrice: null, ratings: [], avgRating: 0, totalRatings: 0, description: "لازانيا إيطالية تقليدية بطبقات من المعكرونة، الدجاج المشوي، صلصة البشاميل الغنية، وجبنة الموتزاريلا الذائبة.", gallery: [] },
  { id: 12, name: "بيتزا فطر", price: 220, category: "pizza", image: MENU_IMAGE_DEFAULTS[12], offerPrice: null, ratings: [], avgRating: 0, totalRatings: 0, description: "لعشاق الفطر! بيتزا غنية بأنواع متعددة من الفطر الطازج مع جبنة الموتزاريلا والصوص الإيطالي.", gallery: [] },
  { id: 13, name: "بيتزا لحوم مشكل", price: 320, category: "pizza", image: MENU_IMAGE_DEFAULTS[13], offerPrice: null, ratings: [], avgRating: 0, totalRatings: 0, description: "بيتزا المحترفين! مزيج من السلامي، الببروني، اللحم المفروم، والسجق الإيطالي مع جبنة الموتزاريلا.", gallery: [] },
  { id: 16, name: "سباغيتي كربونارا", price: 240, category: "pasta", image: MENU_IMAGE_DEFAULTS[16], offerPrice: null, ratings: [], avgRating: 0, totalRatings: 0, description: "سباغيتي كربونارا الأصلية من روما! بصوص البيض، الجبنة، اللحم المقدد، والفلفل الأسود الطازج.", gallery: [] },
  { id: 19, name: "بيتزا سجق إيطالي", price: 280, category: "pizza", image: MENU_IMAGE_DEFAULTS[19], offerPrice: null, ratings: [], avgRating: 0, totalRatings: 0, description: "بيتزا حارة بالسجق الإيطالي المدخن، الفلفل الحار، البصل، وجبنة الموتزاريلا الذائبة.", gallery: [] },
];

let offersData = [
  { id: "off2", type: "bundle", title: "باستا وايت صوص", highlight: "خصم 15%", desc: "300 → 255 ج.م", itemId: 5, quantity: 1, originalTotal: 300, offerTotal: 255 },
  { id: "off4", type: "bundle", title: "عرض البيتزا الكبير (2+1)", highlight: "Buy 2 Get 1", desc: "اطلب 2 بيتزا واحصل على الثالثة مجاناً", itemId: 7, quantity: 3, originalTotal: 900, offerTotal: 600 },
];

let cart = [];
let completedOrders = [];
let favorites = [];
let nextId = 21;
let currentOrderNumber = 1;
let lastOrderDate = null;
let currentCategory = 'pizza';
let menuSearchQuery = '';

const MAX_QUANTITY_PER_ITEM = 10;

// متغيرات معرض الصور المكبرة
let fullscreenImages = [];
let fullscreenCurrentIndex = 0;

// =====================================================
// دوال المحافظات والإدارات
// =====================================================
function populateGovernorates() {
  const governorateSelect = document.getElementById('governorate');
  if (!governorateSelect) return;
  
  governorateSelect.innerHTML = '<option value="">-- اختر المحافظة --</option>';
  
  const governorates = Object.keys(egyptData).sort();
  governorates.forEach(gov => {
    const option = document.createElement('option');
    option.value = gov;
    option.textContent = gov;
    governorateSelect.appendChild(option);
  });
}

function populateCities(governorate) {
  const citySelect = document.getElementById('city');
  if (!citySelect) return;
  
  citySelect.innerHTML = '<option value="">-- اختر الإدارة --</option>';
  
  if (!governorate || !egyptData[governorate]) {
    citySelect.disabled = true;
    return;
  }
  
  citySelect.disabled = false;
  const cities = egyptData[governorate].sort();
  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    citySelect.appendChild(option);
  });
}

function setupAddressFields() {
  const governorateSelect = document.getElementById('governorate');
  const citySelect = document.getElementById('city');
  
  if (!governorateSelect || !citySelect) return;
  
  governorateSelect.addEventListener('change', (e) => {
    const selectedGov = e.target.value;
    if (selectedGov) {
      populateCities(selectedGov);
    } else {
      citySelect.innerHTML = '<option value="">-- اختر الإدارة أولاً --</option>';
      citySelect.disabled = true;
    }
  });
}

// =====================================================
// التأكد من أن رقم الهاتف أرقام فقط
// =====================================================
function setupPhoneValidation() {
  const phoneInput = document.getElementById('customerPhone');
  if (!phoneInput) return;
  
  phoneInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });
  
  phoneInput.addEventListener('keypress', (e) => {
    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
      e.preventDefault();
    }
  });
}

// =====================================================
// مودال التأكيد المخصص
// =====================================================
function showCustomConfirm(message, onYes, onNo) {
  const adminOverlay = document.querySelector('.admin-panel-overlay');
  if (adminOverlay) {
    showAdminConfirm(adminOverlay, message, onYes, onNo);
    return;
  }

  const modal = document.getElementById('customConfirmModal');
  const msgEl = document.getElementById('confirmMessage');
  const yesBtn = document.getElementById('confirmYesBtn');
  const noBtn = document.getElementById('confirmNoBtn');
  if (!modal) return;

  msgEl.textContent = message;
  modal.classList.add('show');

  const newYes = yesBtn.cloneNode(true);
  const newNo = noBtn.cloneNode(true);
  yesBtn.parentNode.replaceChild(newYes, yesBtn);
  noBtn.parentNode.replaceChild(newNo, noBtn);

  newYes.onclick = () => { modal.classList.remove('show'); if (onYes) onYes(); };
  newNo.onclick  = () => { modal.classList.remove('show'); if (onNo) onNo(); };
}

function showAdminConfirm(container, message, onYes, onNo) {
  container.querySelectorAll('.admin-inline-confirm').forEach(el => el.remove());

  const box = document.createElement('div');
  box.className = 'admin-inline-confirm';
  box.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 6000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
  `;
  box.innerHTML = `
    <div style="
      background: white;
      border-radius: 24px;
      padding: 28px 32px;
      text-align: center;
      max-width: 340px;
      width: 88%;
      box-shadow: 0 20px 50px rgba(0,0,0,0.3);
      color: #2c1a12;
      direction: rtl;
    ">
      <i class="fas fa-question-circle" style="font-size:3rem; color:#c0392b; margin-bottom:14px; display:block;"></i>
      <p style="font-size:1rem; margin-bottom:22px; line-height:1.6;">${escapeHtml(message)}</p>
      <div style="display:flex; gap:12px; justify-content:center;">
        <button id="adminConfirmYes" style="
          background:#27ae60; color:white; border:none;
          padding:10px 26px; border-radius:50px;
          font-weight:bold; cursor:pointer; font-size:0.95rem;
          font-family:'Cairo',sans-serif;
        "><i class="fas fa-check"></i> نعم</button>
        <button id="adminConfirmNo" style="
          background:#e74c3c; color:white; border:none;
          padding:10px 26px; border-radius:50px;
          font-weight:bold; cursor:pointer; font-size:0.95rem;
          font-family:'Cairo',sans-serif;
        "><i class="fas fa-times"></i> لا</button>
      </div>
    </div>
  `;

  document.body.appendChild(box);

  box.querySelector('#adminConfirmYes').onclick = () => { box.remove(); if (onYes) onYes(); };
  box.querySelector('#adminConfirmNo').onclick  = () => { box.remove(); if (onNo) onNo(); };
}

// =====================================================
// Firebase - Load & Save
// =====================================================
async function loadAllData() {
  try {
    const docRef = doc(db, "restaurantData", "mainDoc");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.restaurantConfig) restaurantConfig = { ...restaurantConfig, ...data.restaurantConfig };
      if (data.menuItems && Array.isArray(data.menuItems) && data.menuItems.length > 0) {
        menuItems = data.menuItems.map(item => ({
          ...item,
          image: item.image || MENU_IMAGE_DEFAULTS[item.id] || makeFallbackImg(item.name),
          ratings: item.ratings || [],
          avgRating: item.avgRating || 0,
          totalRatings: item.totalRatings || 0,
          description: item.description || "",
          gallery: item.gallery || []
        }));
      }
      if (data.offersData && Array.isArray(data.offersData)) offersData = data.offersData;
      if (data.nextId) nextId = data.nextId;
      if (data.currentOrderNumber) currentOrderNumber = data.currentOrderNumber;
      if (data.lastOrderDate) lastOrderDate = data.lastOrderDate;
    }
    checkAndResetOrderNumber();
  } catch (e) {
    console.error("خطأ في التحميل من Firebase:", e);
  }
}

function checkAndResetOrderNumber() {
  const today = new Date().toDateString();
  if (lastOrderDate !== today) {
    currentOrderNumber = 1;
    lastOrderDate = today;
    saveAllData();
  }
}

async function saveAllData() {
  try {
    const docRef = doc(db, "restaurantData", "mainDoc");
    await setDoc(docRef, {
      restaurantConfig,
      menuItems,
      offersData,
      nextId,
      currentOrderNumber,
      lastOrderDate,
    });
  } catch (e) {
    console.error("خطأ في الحفظ على Firebase:", e);
  }
}

function getNextOrderNumber() {
  const today = new Date().toDateString();
  if (lastOrderDate !== today) {
    currentOrderNumber = 1;
    lastOrderDate = today;
  }
  const num = currentOrderNumber;
  currentOrderNumber++;
  saveAllData();
  return num;
}

// =====================================================
// التقييمات
// =====================================================
function updateItemRating(itemId, userName, rating, comment) {
  const item = menuItems.find(i => i.id === itemId);
  if (!item) return;
  if (!item.ratings) item.ratings = [];
  item.ratings.push({ userName, rating, comment, date: new Date().toISOString() });
  item.avgRating = item.ratings.reduce((s, r) => s + r.rating, 0) / item.ratings.length;
  item.totalRatings = item.ratings.length;
  saveAllData();
  renderItems(currentCategory);
  if (document.getElementById('favoritesPage').classList.contains('active-page')) renderFavorites();
}

function showRatingsModal(itemId) {
  const item = menuItems.find(i => i.id === itemId);
  if (!item) return;

  document.querySelectorAll('.ratings-modal-overlay').forEach(m => m.remove());

  const overlay = document.createElement('div');
  overlay.className = 'modal show ratings-modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content ratings-modal">
      <div class="modal-header">
        <h3>📊 تقييمات ${escapeHtml(item.name)}</h3>
        <span class="modal-close">&times;</span>
      </div>
      <div class="modal-body">
        <div style="text-align:center; margin-bottom:20px;">
          <div style="font-size:2rem; color:var(--star-active);">${'★'.repeat(Math.round(item.avgRating || 0))}${'☆'.repeat(5 - Math.round(item.avgRating || 0))}</div>
          <div>متوسط التقييم: ${(item.avgRating || 0).toFixed(1)} / 5</div>
          <div>عدد التقييمات: ${item.totalRatings || 0}</div>
        </div>
        <div id="reviewsList">
          ${(item.ratings && item.ratings.length > 0) ? item.ratings.map(r => `
            <div class="review-item">
              <div class="review-user">
                <i class="fas fa-user-circle"></i> ${escapeHtml(r.userName)}
                <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
              </div>
              ${r.comment ? `<div class="review-comment">${escapeHtml(r.comment)}</div>` : ''}
              <div style="font-size:0.7rem; opacity:0.5;">${new Date(r.date).toLocaleDateString('ar-EG')}</div>
            </div>
          `).join('') : '<div class="empty-state">لا توجد تقييمات بعد</div>'}
        </div>
        <div class="rating-form">
          <h4>قيم هذا المنتج</h4>
          <div class="stars" id="ratingStarsPicker">
            ${[1,2,3,4,5].map(s => `<i class="fas fa-star star" data-rating="${s}" style="color:var(--star-inactive); cursor:pointer; font-size:1.4rem;"></i>`).join('')}
          </div>
          <textarea id="ratingComment" placeholder="اكتب رأيك (اختياري)..." rows="3" style="width:100%; padding:10px; margin-top:10px; border-radius:12px; border:2px solid var(--border-color); background:var(--bg-body); color:var(--text-color);"></textarea>
          <input type="text" id="ratingUserName" placeholder="اسمك" class="modal-input" style="margin-top:10px;">
          <button id="submitRatingBtn" class="submit-rating-btn" style="margin-top:12px;">إرسال التقييم</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  let selectedRating = 0;
  overlay.querySelectorAll('#ratingStarsPicker .star').forEach(star => {
    star.onclick = () => {
      selectedRating = parseInt(star.dataset.rating);
      overlay.querySelectorAll('#ratingStarsPicker .star').forEach(s => {
        s.style.color = parseInt(s.dataset.rating) <= selectedRating ? 'var(--star-active)' : 'var(--star-inactive)';
      });
    };
  });

  overlay.querySelector('.modal-close').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.querySelector('#submitRatingBtn').onclick = () => {
    const userName = overlay.querySelector('#ratingUserName').value.trim();
    const comment = overlay.querySelector('#ratingComment').value.trim();
    if (!userName) { showToast('الرجاء إدخال اسمك'); return; }
    if (selectedRating === 0) { showToast('الرجاء اختيار تقييم'); return; }
    updateItemRating(itemId, userName, selectedRating, comment);
    overlay.remove();
    showToast('شكراً لتقييمك! ⭐');
    playSound();
  };
}

// =====================================================
// المفضلة
// =====================================================
function toggleFavorite(itemId) {
  const index = favorites.indexOf(itemId);
  if (index === -1) favorites.push(itemId);
  else favorites.splice(index, 1);
  localStorage.setItem('yusef_favorites', JSON.stringify(favorites));
  renderItems(currentCategory);
  if (document.getElementById('favoritesPage').classList.contains('active-page')) renderFavorites();
}

function renderFavorites() {
  const container = document.getElementById('favoritesContainer');
  if (!container) return;
  const favItems = menuItems.filter(i => favorites.includes(i.id));
  if (favItems.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="far fa-heart"></i><br>لا توجد أصناف في المفضلة</div>';
    return;
  }
  container.innerHTML = '';
  favItems.forEach(item => renderItemCard(item, container));
}

// =====================================================
// السلة
// =====================================================
function addToCart(item, quantity = 1) {
  const existingIndex = cart.findIndex(i => i.type !== 'bundle' && i.id === item.id);
  
  if (existingIndex !== -1) {
    const newQty = cart[existingIndex].quantity + quantity;
    if (newQty > MAX_QUANTITY_PER_ITEM) {
      showToast(`⚠️ لا يمكنك طلب أكثر من ${MAX_QUANTITY_PER_ITEM} قطع من ${item.name} في الطلب الواحد`);
      return false;
    }
    cart[existingIndex].quantity = newQty;
  } else {
    if (quantity > MAX_QUANTITY_PER_ITEM) {
      showToast(`⚠️ لا يمكنك طلب أكثر من ${MAX_QUANTITY_PER_ITEM} قطع من ${item.name} في الطلب الواحد`);
      return false;
    }
    cart.push({
      type: 'item',
      id: item.id,
      name: item.name,
      price: item.price,
      offerPrice: item.offerPrice || null,
      quantity,
    });
  }

  updateCartState();
  showToast(`✅ تم إضافة ${item.name} إلى السلة`);
  playSound();
  return true;
}

function addBundleToCart(offer) {
  const existingIndex = cart.findIndex(i => i.type === 'bundle' && i.offerId === offer.id);
  
  if (existingIndex !== -1) {
    const newQty = cart[existingIndex].quantity + 1;
    if (newQty > MAX_QUANTITY_PER_ITEM) {
      showToast(`⚠️ لا يمكنك إضافة العرض "${offer.title}" أكثر من ${MAX_QUANTITY_PER_ITEM} مرات في الطلب الواحد`);
      return;
    }
    cart[existingIndex].quantity = newQty;
  } else {
    if (1 > MAX_QUANTITY_PER_ITEM) return;
    cart.push({
      type: 'bundle',
      offerId: offer.id,
      name: offer.title,
      itemId: offer.itemId,
      totalQuantity: offer.quantity,
      quantity: 1,
      offerTotal: offer.offerTotal,
    });
  }

  updateCartState();
  showToast(`🎁 تم إضافة العرض "${offer.title}"`);
  playSound();
}

function updateCartState() {
  localStorage.setItem('yusef_cart', JSON.stringify(cart));
  renderCart();
}

function calcCartTotal() {
  return cart.reduce((total, item) => {
    if (item.type === 'bundle') return total + item.offerTotal * item.quantity;
    return total + (item.offerPrice ?? item.price) * item.quantity;
  }, 0);
}

function renderCart() {
  const cartDiv = document.getElementById('cartItemsList');
  const totalSpan = document.getElementById('cartTotal');
  const countSpan = document.getElementById('cartCount');
  if (!cartDiv) return;

  if (cart.length === 0) {
    cartDiv.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-basket"></i><br>سلة فارغة</div>';
    if (totalSpan) totalSpan.innerText = 'الإجمالي: 0 ج.م';
    if (countSpan) countSpan.innerText = '0';
    return;
  }

  let totalPieces = 0;
  cartDiv.innerHTML = cart.map((item, idx) => {
    const itemTotal = item.type === 'bundle'
      ? item.offerTotal * item.quantity
      : (item.offerPrice ?? item.price) * item.quantity;
    totalPieces += item.quantity;

    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.type === 'bundle' ? '🎁 ' : ''}${escapeHtml(item.name)}</div>
          <div class="cart-item-details">${item.type === 'bundle' ? `عرض × ${item.quantity}` : `${(item.offerPrice ?? item.price)} ج.م × ${item.quantity}`}</div>
        </div>
        <div class="cart-item-price">${itemTotal} ج.م</div>
        <div class="cart-item-actions">
          <button class="cart-dec" data-idx="${idx}">-</button>
          <span>${item.quantity}</span>
          <button class="cart-inc" data-idx="${idx}">+</button>
          <button class="cart-rem" data-idx="${idx}"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
  }).join('');

  const total = calcCartTotal();
  if (totalSpan) totalSpan.innerText = `الإجمالي: ${total} ج.م`;
  if (countSpan) countSpan.innerText = totalPieces;
}

function setupCartEvents() {
  const cartDiv = document.getElementById('cartItemsList');
  if (!cartDiv) return;

  cartDiv.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const idx = parseInt(btn.dataset.idx);
    if (isNaN(idx)) return;

    const item = cart[idx];
    if (!item) return;

    if (btn.classList.contains('cart-inc')) {
      let newQty = item.quantity + 1;
      if (newQty > MAX_QUANTITY_PER_ITEM) {
        showToast(`⚠️ لا يمكنك طلب أكثر من ${MAX_QUANTITY_PER_ITEM} قطع من هذا المنتج/العرض في الطلب الواحد`);
        return;
      }
      item.quantity = newQty;
      updateCartState();
    } else if (btn.classList.contains('cart-dec')) {
      if (item.quantity > 1) item.quantity--;
      else cart.splice(idx, 1);
      updateCartState();
    } else if (btn.classList.contains('cart-rem')) {
      cart.splice(idx, 1);
      updateCartState();
    }
  });
}

// =====================================================
// الطلبات
// =====================================================
function archiveOrder(customerName, customerPhone, governorate, city, addressDetails, paymentMethod) {
  const fullAddress = `${governorate} - ${city} - ${addressDetails}`;
  const items = JSON.parse(JSON.stringify(cart));
  const total = calcCartTotal();
  const orderNumber = getNextOrderNumber();
  const orderId = `#${String(orderNumber).padStart(3, '0')}`;
  const summary = items.map(i => `${i.type === 'bundle' ? '🎁' : ''}${i.name} ×${i.quantity}`).join(' · ');

  completedOrders.unshift({
    id: orderId, orderNumber,
    date: new Date().toISOString(),
    items, summary, total,
    customerName, customerPhone, governorate, city, addressDetails, fullAddress, paymentMethod,
  });

  if (completedOrders.length > 50) completedOrders = completedOrders.slice(0, 50);
  saveCompletedOrders();
  return orderId;
}

function saveCompletedOrders() {
  localStorage.setItem('yusef_completed_orders', JSON.stringify(completedOrders));
}

function loadCompletedOrders() {
  try {
    const raw = localStorage.getItem('yusef_completed_orders');
    completedOrders = raw ? JSON.parse(raw) : [];
  } catch (e) { completedOrders = []; }
}

function renderCompletedOrders() {
  const container = document.getElementById('completedOrdersList');
  if (!container) return;

  if (completedOrders.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-receipt"></i><br>لا توجد طلبات مكتملة بعد</div>';
    return;
  }

  container.innerHTML = completedOrders.map((order, idx) => {
    const dateStr = new Date(order.date).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
    return `
      <div class="order-card">
        <div class="order-card-head">
          <span class="order-id"><i class="fas fa-hashtag"></i>${escapeHtml(order.id)}</span>
          <span class="order-date"><i class="far fa-calendar-alt"></i> ${escapeHtml(dateStr)}</span>
        </div>
        <div class="order-card-meta">
          <i class="fas fa-user"></i> ${escapeHtml(order.customerName)} | 
          <i class="fas fa-phone"></i> ${escapeHtml(order.customerPhone)}<br>
          <i class="fas fa-map-marker-alt"></i> ${escapeHtml(order.fullAddress)}
        </div>
        <div class="order-card-items">${escapeHtml(order.summary)}</div>
        <div class="order-total">
          <i class="fas fa-money-bill-wave"></i> ${order.total} ج.م | 
          <i class="fas fa-credit-card"></i> ${escapeHtml(order.paymentMethod)}
        </div>
        <button class="reorder-btn" data-idx="${idx}"><i class="fas fa-redo-alt"></i> إعادة الطلب</button>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.reorder-btn').forEach(btn => {
    btn.onclick = () => reorderOrder(parseInt(btn.dataset.idx));
  });
}

function reorderOrder(orderIdx) {
  const order = completedOrders[orderIdx];
  if (!order?.items) return;
  
  let itemsAdded = 0;
  
  for (const item of order.items) {
    if (item.type === 'bundle') {
      const offer = offersData.find(o => o.id === item.offerId);
      if (offer) {
        addBundleToCart(offer);
        itemsAdded++;
      }
    } else {
      const menuItem = menuItems.find(m => m.id === item.id);
      if (menuItem) {
        addToCart(menuItem, item.quantity);
        itemsAdded++;
      }
    }
  }
  
  if (itemsAdded > 0) {
    showToast(`✅ تم إعادة ${itemsAdded} عنصر إلى السلة`);
    openCart();
    renderCart();
  } else {
    showToast('⚠️ لا يمكن إعادة الطلب - بعض المنتجات غير متوفرة');
  }
}

function clearAllOrders() {
  showCustomConfirm('هل أنت متأكد من حذف سجل الطلبات بالكامل؟', () => {
    completedOrders = [];
    saveCompletedOrders();
    renderCompletedOrders();
    showToast('✅ تم حذف سجل الطلبات');
    playSound();
  });
}

// =====================================================
// عرض الأصناف مع زر تفاصيل
// =====================================================
function renderItems(category) {
  currentCategory = category;
  const container = document.getElementById('itemsContainer');
  if (!container) return;

  const q = normalizeSearchText(menuSearchQuery);
  let items = menuItems.filter(i => itemMatchesSearch(i, q));
  if (!q) items = items.filter(i => i.category === category);

  if (items.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><br>لا توجد نتائج</div>';
    return;
  }

  container.innerHTML = '';
  items.forEach(item => renderItemCard(item, container));
}

function renderItemCard(item, container) {
  const isFavorite = favorites.includes(item.id);
  const price = item.offerPrice ?? item.price;
  const imgUrl = buildImageUrl(item.image, item.name);
  const fallbackUrl = makeFallbackImg(item.name);
  const avgRating = Math.round(item.avgRating || 0);

  const card = document.createElement('div');
  card.className = 'food-card';
  card.style.cursor = 'default';

  card.innerHTML = `
    <img 
      class="food-img" 
      src="${escapeHtml(imgUrl)}" 
      alt="${escapeHtml(item.name)}" 
      loading="lazy"
      onerror="this.onerror=null; this.src='${escapeHtml(fallbackUrl)}';"
    >
    <div class="food-info">
      <div class="food-header">
        <div class="food-title">${item.category === 'pizza' ? '🍕' : '🍝'} ${escapeHtml(item.name)}</div>
        <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${item.id}" title="إضافة للمفضلة">
          <i class="fas fa-heart"></i>
        </button>
      </div>
      <div class="rating-section">
        <div class="stars">
          ${[1,2,3,4,5].map(s => `<i class="fas fa-star star ${s <= avgRating ? 'active' : ''}"></i>`).join('')}
        </div>
        <span class="rating-text" data-id="${item.id}" style="cursor:pointer;">(${item.totalRatings || 0} تقييم)</span>
      </div>
      <div class="food-price">💰 ${price} ج.م${item.offerPrice ? ` <small style="text-decoration:line-through; opacity:0.5; font-size:0.8rem;">${item.price}</small>` : ''}</div>
      <div style="display: flex; gap: 8px; margin-top: 5px;">
        <button class="add-btn" data-id="${item.id}" style="flex: 2;">
          <i class="fas fa-cart-plus"></i> أضف
        </button>
        <button class="details-btn" data-id="${item.id}" style="flex: 1;">
          <i class="fas fa-info-circle"></i> تفاصيل
        </button>
      </div>
    </div>
  `;

  container.appendChild(card);

  card.querySelector('.favorite-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(item.id);
  });

  card.querySelector('.rating-text').addEventListener('click', (e) => {
    e.stopPropagation();
    showRatingsModal(item.id);
  });

  card.querySelector('.add-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    addToCart(item);
  });
  
  card.querySelector('.details-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    showProductDetails(item.id);
  });
}

function renderOffers() {
  const container = document.getElementById('offersContainer');
  if (!container) return;
  container.innerHTML = '';

  if (offersData.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-gift"></i><br>لا توجد عروض حالياً</div>';
    return;
  }

  offersData.forEach(offer => {
    const card = document.createElement('div');
    card.className = 'offer-card';
    card.innerHTML = `
      <div class="offer-title">🎁 ${escapeHtml(offer.title)}</div>
      <div class="offer-desc">${escapeHtml(offer.desc)}</div>
      <span class="highlight">${escapeHtml(offer.highlight)}</span>
      <br><br>
      <button class="add-btn" style="max-width:200px;"><i class="fas fa-cart-plus"></i> أضف العرض للسلة</button>
    `;
    card.querySelector('.add-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      addBundleToCart(offer);
    });
    container.appendChild(card);
  });
}

// =====================================================
// صفحة تفاصيل المنتج
// =====================================================
function showProductDetails(productId) {
  const product = menuItems.find(item => item.id === parseInt(productId));
  if (!product) return;
  
  const container = document.getElementById('productDetailsContent');
  if (!container) return;
  
  const price = product.offerPrice ?? product.price;
  const avgRating = Math.round(product.avgRating || 0);
  const totalRatings = product.totalRatings || 0;
  
  let galleryHtml = '';
  if (product.gallery && product.gallery.length > 0) {
    galleryHtml = `
      <div class="product-details-gallery">
        <h3><i class="fas fa-images"></i> معرض الصور</h3>
        <div class="gallery-grid">
          ${product.gallery.map((img, idx) => `
            <img src="${escapeHtml(buildImageUrl(img, product.name))}" 
                 class="gallery-img" 
                 alt="${escapeHtml(product.name)}"
                 onclick="openFullscreenGallery(${product.id}, ${idx})">
          `).join('')}
        </div>
      </div>
    `;
  }
  
  let reviewsHtml = '';
  if (product.ratings && product.ratings.length > 0) {
    reviewsHtml = product.ratings.map(r => `
      <div class="review-item">
        <div class="review-header">
          <div class="review-user">
            <i class="fas fa-user-circle"></i>
            <span>${escapeHtml(r.userName)}</span>
          </div>
          <div class="review-stars">
            ${[1,2,3,4,5].map(s => `<i class="fas fa-star ${s <= r.rating ? 'active' : ''}"></i>`).join('')}
          </div>
          <div class="review-date">${new Date(r.date).toLocaleDateString('ar-EG')}</div>
        </div>
        ${r.comment ? `<div class="review-comment">${escapeHtml(r.comment)}</div>` : ''}
      </div>
    `).join('');
  } else {
    reviewsHtml = '<div class="no-reviews"><i class="fas fa-star-of-life"></i><br>لا توجد تقييمات بعد</div>';
  }
  
  container.innerHTML = `
    <div class="product-details-container">
      <img src="${escapeHtml(buildImageUrl(product.image, product.name))}" 
           class="product-details-image" 
           alt="${escapeHtml(product.name)}"
           onerror="this.src='${escapeHtml(makeFallbackImg(product.name))}'">
      <div class="product-details-info">
        <h1 class="product-details-title">${product.category === 'pizza' ? '🍕' : '🍝'} ${escapeHtml(product.name)}</h1>
        
        <div class="rating-section-details">
          <div>التقييمات</div>
          <div class="stars">
            ${[1,2,3,4,5].map(s => `<i class="fas fa-star star ${s <= avgRating ? 'active' : ''}" style="font-size:1.3rem;"></i>`).join('')}
          </div>
          <div>${totalRatings} تقييمات</div>
        </div>
        
        <div class="product-details-price">
          💰 ${price} ج.م
          ${product.offerPrice ? `<small><del>${product.price} ج.م</del> (خصم)</small>` : ''}
        </div>
        
        <div class="product-details-description">
          <i class="fas fa-info-circle" style="margin-left: 8px;"></i>
          ${escapeHtml(product.description || 'لا يوجد وصف متاح لهذا المنتج حالياً. يرجى المحاولة لاحقاً.')}
        </div>
        
        ${galleryHtml}
        
        <div class="product-reviews-section">
          <h3><i class="fas fa-star"></i> تقييمات العملاء</h3>
          <div class="reviews-list" id="reviewsListDetails">
            ${reviewsHtml}
          </div>
          
          <div class="add-review-form">
            <h4><i class="fas fa-edit"></i> أضف تقييمك</h4>
            <div class="rating-input-stars" id="ratingInputStarsDetails">
              ${[1,2,3,4,5].map(s => `<i class="fas fa-star rating-star-input" data-rating="${s}"></i>`).join('')}
            </div>
            <input type="text" id="reviewUserNameDetails" class="review-name-input" placeholder="اسمك">
            <textarea id="reviewCommentDetails" class="review-comment-input" rows="2" placeholder="اكتب رأيك (اختياري)"></textarea>
            <button id="submitReviewDetailsBtn" class="submit-review-btn"><i class="fas fa-paper-plane"></i> إرسال التقييم</button>
          </div>
        </div>
        
        <div class="product-details-add">
          <button class="add-btn" id="detailsAddToCartBtn">
            <i class="fas fa-cart-plus"></i> أضف للسلة
          </button>
        </div>
      </div>
    </div>
  `;
  
  const addBtn = document.getElementById('detailsAddToCartBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      addToCart(product);
    });
  }
  
  let selectedRatingDetails = 0;
  const starsDetails = document.querySelectorAll('#ratingInputStarsDetails .rating-star-input');
  starsDetails.forEach(star => {
    star.onclick = () => {
      selectedRatingDetails = parseInt(star.dataset.rating);
      starsDetails.forEach(s => {
        if (parseInt(s.dataset.rating) <= selectedRatingDetails) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    };
  });
  
  const submitBtn = document.getElementById('submitReviewDetailsBtn');
  if (submitBtn) {
    submitBtn.onclick = () => {
      const userName = document.getElementById('reviewUserNameDetails')?.value.trim();
      const comment = document.getElementById('reviewCommentDetails')?.value.trim();
      if (!userName) { showToast('الرجاء إدخال اسمك'); return; }
      if (selectedRatingDetails === 0) { showToast('الرجاء اختيار تقييم'); return; }
      updateItemRating(product.id, userName, selectedRatingDetails, comment);
      showProductDetails(product.id);
      showToast('شكراً لتقييمك! ⭐');
      playSound();
    };
  }
  
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
  document.getElementById('productDetailsPage').classList.add('active-page');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  // التمرير لأعلى الصفحة (عشان التلفون)
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// =====================================================
// معرض الصور المكبرة (للصور الإضافية فقط)
// =====================================================
window.openFullscreenGallery = function(productId, startIndex) {
  const product = menuItems.find(item => item.id === productId);
  if (!product) return;
  
  fullscreenImages = (product.gallery || []).filter(img => img && img.trim() !== '');
  
  if (fullscreenImages.length === 0) {
    showToast("⚠️ لا توجد صور إضافية لهذا المنتج");
    return;
  }
  
  fullscreenCurrentIndex = startIndex >= 0 ? startIndex : 0;
  showFullscreenImage();
};

function showFullscreenImage() {
  const existingModal = document.querySelector('.image-modal');
  if (existingModal) existingModal.remove();
  
  const modal = document.createElement('div');
  modal.className = 'image-modal show';
  
  const imgUrl = buildImageUrl(fullscreenImages[fullscreenCurrentIndex], '');
  
  modal.innerHTML = `
    <div class="modal-image-container">
      <button class="modal-nav-btn modal-nav-prev" id="fullscreenPrev"><i class="fas fa-chevron-left"></i></button>
      <img src="${escapeHtml(imgUrl)}" alt="صورة مكبرة">
      <button class="modal-nav-btn modal-nav-next" id="fullscreenNext"><i class="fas fa-chevron-right"></i></button>
      <button class="modal-close-btn" id="fullscreenClose"><i class="fas fa-times"></i></button>
      <div class="modal-counter">${fullscreenCurrentIndex + 1} / ${fullscreenImages.length}</div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  function updateImage() {
    const img = modal.querySelector('img');
    const counter = modal.querySelector('.modal-counter');
    const newImgUrl = buildImageUrl(fullscreenImages[fullscreenCurrentIndex], '');
    img.src = newImgUrl;
    counter.textContent = `${fullscreenCurrentIndex + 1} / ${fullscreenImages.length}`;
  }
  
  const prevBtn = modal.querySelector('#fullscreenPrev');
  const nextBtn = modal.querySelector('#fullscreenNext');
  const closeBtn = modal.querySelector('#fullscreenClose');
  
  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.stopPropagation();
      fullscreenCurrentIndex = (fullscreenCurrentIndex - 1 + fullscreenImages.length) % fullscreenImages.length;
      updateImage();
    };
  }
  
  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.stopPropagation();
      fullscreenCurrentIndex = (fullscreenCurrentIndex + 1) % fullscreenImages.length;
      updateImage();
    };
  }
  
  if (closeBtn) {
    closeBtn.onclick = () => modal.remove();
  }
  
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  
  const keyHandler = (e) => {
    if (!modal.parentNode) {
      document.removeEventListener('keydown', keyHandler);
      return;
    }
    if (e.key === 'ArrowLeft') {
      fullscreenCurrentIndex = (fullscreenCurrentIndex - 1 + fullscreenImages.length) % fullscreenImages.length;
      updateImage();
    } else if (e.key === 'ArrowRight') {
      fullscreenCurrentIndex = (fullscreenCurrentIndex + 1) % fullscreenImages.length;
      updateImage();
    } else if (e.key === 'Escape') {
      modal.remove();
    }
  };
  
  document.addEventListener('keydown', keyHandler);
  
  modal.addEventListener('remove', () => {
    document.removeEventListener('keydown', keyHandler);
  });
}

// =====================================================
// عرض الصفحات
// =====================================================
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
  const target = document.getElementById(`${pageId}Page`);
  if (target) target.classList.add('active-page');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.nav-btn[data-page="${pageId}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  if (pageId === 'home')      renderItems(currentCategory);
  if (pageId === 'offers')    renderOffers();
  if (pageId === 'favorites') renderFavorites();
  if (pageId === 'orders')    renderCompletedOrders();
}

// =====================================================
// مودال الطلب
// =====================================================
function openOrderModal() {
  if (cart.length === 0) { showToast('أضف أطباقاً أولاً'); return; }
  const modal = document.getElementById('orderModal');
  if (modal) modal.classList.add('show');
}

function closeOrderModal() {
  const modal = document.getElementById('orderModal');
  if (modal) modal.classList.remove('show');
}

function sendOrderViaWhatsApp() {
  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const governorate = document.getElementById('governorate').value;
  const city = document.getElementById('city').value;
  const addressDetails = document.getElementById('customerAddress').value.trim();
  const paymentMethod = document.getElementById('paymentMethod').value;

  if (!name || !phone || !governorate || !city || !addressDetails) {
    showToast('⚠️ الرجاء ملء جميع البيانات');
    return;
  }

  const fullAddress = `${governorate} - ${city} - ${addressDetails}`;

  let itemsText = '';
  let total = 0;

  for (const item of cart) {
    if (item.type === 'bundle') {
      const itemTotal = item.offerTotal * item.quantity;
      total += itemTotal;
      itemsText += `🎁 *${item.name}* × ${item.quantity} = ${itemTotal} ج.م\n`;
    } else {
      const itemTotal = (item.offerPrice ?? item.price) * item.quantity;
      total += itemTotal;
      itemsText += `• ${item.name} × ${item.quantity} = ${itemTotal} ج.م\n`;
    }
  }

  const orderId = archiveOrder(name, phone, governorate, city, addressDetails, paymentMethod);
  const message =
    `🍕 *طلب جديد من ${restaurantConfig.name}*\n` +
    `🧾 *رقم الطلب:* ${orderId}\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `${itemsText}` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *الإجمالي:* ${total} ج.م\n` +
    `👤 *الاسم:* ${name}\n` +
    `📞 *الهاتف:* ${phone}\n` +
    `📍 *المحافظة:* ${governorate}\n` +
    `🏙️ *الإدارة:* ${city}\n` +
    `🏠 *التفاصيل:* ${addressDetails}\n` +
    `💳 *طريقة الدفع:* ${paymentMethod}\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `✅ تم تأكيد الطلب بنجاح`;

  cart = [];
  updateCartState();
  closeOrderModal();
  renderCompletedOrders();
  showToast(`✅ تم تأكيد الطلب ${orderId} بنجاح!`);
  playSound();
  window.open(`https://wa.me/${restaurantConfig.phone}?text=${encodeURIComponent(message)}`, '_blank');
}

// =====================================================
// أدوات مساعدة
// =====================================================
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(msg) {
  document.querySelectorAll('.toast-msg').forEach(t => t.remove());
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

function playSound() {
  const audio = document.getElementById('successSound');
  if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
}

function openCart() {
  document.getElementById('cartSidebar')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('show');
}

function closeCart() {
  document.getElementById('cartSidebar')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('show');
}

function normalizeSearchText(str) {
  return String(str).toLowerCase().replace(/\s+/g, ' ').trim();
}

function itemMatchesSearch(item, q) {
  if (!q) return true;
  return normalizeSearchText(item.name).includes(q);
}

function applyRestaurantConfig() {
  const nameEl = document.getElementById('restaurantName');
  if (nameEl) nameEl.innerHTML = escapeHtml(restaurantConfig.name) + '<span class="brand-tag">Italianissimo 🍝</span>';

  const welcomeEl = document.getElementById('welcomeMsg');
  if (welcomeEl) welcomeEl.innerHTML = `🇮🇹 ${escapeHtml(restaurantConfig.name)} - نكهات إيطاليا الأصيلة`;

  const addressEl = document.getElementById('restaurantAddress');
  if (addressEl) addressEl.innerHTML = `📍 ${escapeHtml(restaurantConfig.address)}`;

  const hoursEl = document.getElementById('workingHours');
  if (hoursEl) hoursEl.innerHTML = `🕰 ${escapeHtml(restaurantConfig.workingHours)}`;

  const phoneEl = document.getElementById('footerPhone');
  if (phoneEl) phoneEl.textContent = restaurantConfig.phone;

  const footerEl = document.getElementById('footerText');
  if (footerEl) footerEl.innerHTML = `© 2025 ${escapeHtml(restaurantConfig.name)} | ${escapeHtml(restaurantConfig.phone)}`;

  document.documentElement.style.setProperty('--btn-primary', restaurantConfig.primaryColor || '#c0392b');
  document.documentElement.style.setProperty('--navbar-bg', restaurantConfig.primaryColor || '#c0392b');
}

// =====================================================
// نظام تسجيل دخول الأدمن - Firebase Authentication
// =====================================================
function setupAdminLogin() {
  const loginBtn = document.getElementById('adminLoginBtn');
  if (!loginBtn) return;
  
  loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    showAdminLoginModal();
  });
}

function showAdminLoginModal() {
  const existingModal = document.getElementById('adminLoginModal');
  if (existingModal) existingModal.remove();
  
  const modal = document.createElement('div');
  modal.id = 'adminLoginModal';
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <div class="modal-header">
        <h3><i class="fas fa-shield-alt"></i> تسجيل دخول الأدمن</h3>
        <span class="modal-close" id="closeAdminLoginModal">&times;</span>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label><i class="fas fa-envelope"></i> البريد الإلكتروني</label>
          <input type="email" id="adminEmail" class="modal-input" placeholder="admin@yusefono.com">
        </div>
        <div class="form-group">
          <label><i class="fas fa-lock"></i> كلمة السر</label>
          <input type="password" id="adminPassword" class="modal-input" placeholder="كلمة السر">
        </div>
        <div id="adminLoginError" style="color:red; font-size:0.85rem; margin-top:8px; display:none;"></div>
      </div>
      <div class="modal-footer">
        <button id="submitAdminLogin" class="admin-btn" style="width:100%;"><i class="fas fa-sign-in-alt"></i> دخول</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const closeBtn = modal.querySelector('#closeAdminLoginModal');
  closeBtn.onclick = () => modal.remove();
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  
  const submitBtn = modal.querySelector('#submitAdminLogin');
  const emailInput = modal.querySelector('#adminEmail');
  const passwordInput = modal.querySelector('#adminPassword');
  const errorDiv = modal.querySelector('#adminLoginError');
  
  submitBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
      errorDiv.textContent = '⚠️ الرجاء إدخال البريد الإلكتروني وكلمة السر';
      errorDiv.style.display = 'block';
      return;
    }
    
    errorDiv.style.display = 'none';
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الدخول...';
    submitBtn.disabled = true;
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user.email === ADMIN_EMAIL) {
        modal.remove();
        showAdminDashboard();
        showToast('✅ تم تسجيل الدخول بنجاح');
      } else {
        errorDiv.textContent = '⚠️ غير مصرح بهذا الحساب';
        errorDiv.style.display = 'block';
        await signOut(auth);
      }
    } catch (error) {
      let errorMessage = '❌ خطأ في تسجيل الدخول';
      if (error.code === 'auth/user-not-found') {
        errorMessage = '⚠️ الحساب غير موجود';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = '⚠️ كلمة السر خطأ';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '⚠️ البريد الإلكتروني غير صالح';
      }
      errorDiv.textContent = errorMessage;
      errorDiv.style.display = 'block';
    } finally {
      submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> دخول';
      submitBtn.disabled = false;
    }
  };
  
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitBtn.click();
  });
}

// =====================================================
// لوحة الأدمن الكاملة
// =====================================================
function showAdminDashboard() {
  document.querySelectorAll('.admin-panel-overlay').forEach(el => el.remove());

  const overlay = document.createElement('div');
  overlay.className = 'admin-panel-overlay';
  overlay.innerHTML = `
    <div class="admin-dashboard">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
        <h2 style="margin:0;"><i class="fas fa-cog"></i> لوحة التحكم</h2>
        <button id="closeAdminDashBtn" style="background:#c0392b; border:none; padding:8px 18px; border-radius:30px; color:white; cursor:pointer; font-weight:600;">
          <i class="fas fa-times"></i> إغلاق
        </button>
      </div>
      
      <div class="admin-tabs">
        <button class="admin-tab-btn active" data-tab="general"><i class="fas fa-store"></i> المعلومات</button>
        <button class="admin-tab-btn" data-tab="menu"><i class="fas fa-pizza-slice"></i> المنيو</button>
        <button class="admin-tab-btn" data-tab="offers"><i class="fas fa-gift"></i> العروض</button>
      </div>

      <div id="tabGeneral" class="admin-tab-content active-tab">
        <div class="admin-section">
          <h3>إعدادات المطعم</h3>
          <label>اسم المطعم</label>
          <input type="text" id="editName" class="admin-input" value="${escapeHtml(restaurantConfig.name)}">
          <label>رقم الواتساب (مع كود الدولة)</label>
          <input type="text" id="editPhone" class="admin-input" value="${escapeHtml(restaurantConfig.phone)}" placeholder="201XXXXXXXXX">
          <label>اللون الأساسي</label>
          <input type="color" id="editColor" class="admin-input" value="${restaurantConfig.primaryColor}" style="height:44px;">
          <label>العنوان</label>
          <input type="text" id="editAddress" class="admin-input" value="${escapeHtml(restaurantConfig.address)}">
          <label>ساعات العمل</label>
          <input type="text" id="editHours" class="admin-input" value="${escapeHtml(restaurantConfig.workingHours)}">
          <label>ملاحظة التوصيل</label>
          <input type="text" id="editDeliveryNote" class="admin-input" value="${escapeHtml(restaurantConfig.deliveryNote)}">
          <button id="saveGeneralBtn" class="admin-btn" style="margin-top:15px;"><i class="fas fa-save"></i> حفظ الإعدادات</button>
        </div>
      </div>

      <div id="tabMenu" class="admin-tab-content">
        <div class="admin-section">
          <h3>➕ إضافة صنف جديد</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label>الاسم *</label>
              <input type="text" id="newItemName" class="admin-input" placeholder="اسم الصنف">
            </div>
            <div>
              <label>السعر (ج.م) *</label>
              <input type="number" id="newItemPrice" class="admin-input" placeholder="150">
            </div>
            <div>
              <label>سعر العرض (اختياري)</label>
              <input type="number" id="newItemOffer" class="admin-input" placeholder="اتركه فارغ">
            </div>
            <div>
              <label>الفئة</label>
              <select id="newItemCat" class="admin-input">
                <option value="pizza">🍕 بيتزا</option>
                <option value="pasta">🍝 باستا</option>
              </select>
            </div>
            <div></div>
          </div>
          <label>رابط الصورة</label>
          <input type="text" id="newItemImg" class="admin-input" placeholder="https://... (اتركه فارغ للصورة الافتراضية)">
          <div id="newImgPreview" style="margin-top:8px; height:80px; display:none;">
            <img id="newImgPreviewImg" style="height:80px; border-radius:10px; object-fit:cover;" alt="معاينة">
          </div>
          <button id="addItemBtn" class="admin-btn" style="margin-top:12px; width:100%;"><i class="fas fa-plus"></i> إضافة الصنف</button>
        </div>
        <div class="admin-section">
          <h3>📋 الأصناف الحالية (${menuItems.length} صنف)</h3>
          <div id="itemsListAdmin"></div>
        </div>
      </div>

      <div id="tabOffers" class="admin-tab-content">
        <div class="admin-section">
          <h3>➕ إضافة عرض جديد</h3>
          <label>اسم العرض *</label>
          <input type="text" id="offerTitle" class="admin-input" placeholder="مثال: عرض البيتزا الكبير">
          <label>الجملة المميزة *</label>
          <input type="text" id="offerHighlight" class="admin-input" placeholder="مثال: خصم 20%">
          <label>اختر الصنف *</label>
          <select id="offerItemId" class="admin-input"></select>
          <label>الكمية في العرض *</label>
          <input type="number" id="offerQuantity" class="admin-input" value="1" min="1">
          <label>نوع الخصم</label>
          <select id="discountType" class="admin-input">
            <option value="percent">نسبة مئوية (%)</option>
            <option value="fixed">سعر نهائي جديد (ج.م)</option>
          </select>
          <label>قيمة الخصم *</label>
          <input type="number" id="discountValue" class="admin-input" placeholder="مثال: 20">
          <div id="offerPreviewCalc" style="margin-top:8px; padding:10px; background:#f0f0f0; border-radius:12px; font-size:0.85rem; display:none;"></div>
          <button id="addOfferBtn" class="admin-btn" style="margin-top:12px; width:100%;"><i class="fas fa-plus"></i> إضافة العرض</button>
        </div>
        <div class="admin-section">
          <h3>📋 العروض الحالية</h3>
          <div id="offersListAdmin"></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  function refreshItemCount() {
    const h3 = overlay.querySelector('#tabMenu .admin-section:last-child h3');
    if (h3) h3.textContent = `📋 الأصناف الحالية (${menuItems.length} صنف)`;
  }

  function populateOfferItemSelect() {
    const select = overlay.querySelector('#offerItemId');
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = menuItems.map(item =>
      `<option value="${item.id}" ${String(item.id) === String(currentVal) ? 'selected' : ''}>
        ${escapeHtml(item.name)} - ${item.price} ج.م
      </option>`
    ).join('');
  }

  function updateOfferPreview() {
    const itemId = parseInt(overlay.querySelector('#offerItemId')?.value);
    const qty = parseInt(overlay.querySelector('#offerQuantity')?.value) || 1;
    const type = overlay.querySelector('#discountType')?.value;
    const val = parseFloat(overlay.querySelector('#discountValue')?.value);
    const previewEl = overlay.querySelector('#offerPreviewCalc');
    if (!previewEl) return;

    const item = menuItems.find(m => m.id === itemId);
    if (!item || isNaN(val) || val <= 0) { previewEl.style.display = 'none'; return; }

    const original = item.price * qty;
    const final = type === 'percent' ? Math.round(original * (1 - val / 100)) : val;
    const saving = original - final;

    previewEl.style.display = 'block';
    previewEl.innerHTML = `
      💡 <strong>${item.name}</strong> × ${qty}<br>
      السعر الأصلي: <s>${original} ج.م</s> → السعر الجديد: <strong style="color:green;">${final} ج.م</strong><br>
      التوفير: <strong style="color:red;">${saving} ج.م</strong>
    `;
  }

  const newImgInput = overlay.querySelector('#newItemImg');
  const newImgPreview = overlay.querySelector('#newImgPreview');
  const newImgPreviewImg = overlay.querySelector('#newImgPreviewImg');

  newImgInput.addEventListener('input', () => {
    const url = newImgInput.value.trim();
    if (url) {
      newImgPreviewImg.src = url;
      newImgPreviewImg.onerror = () => { newImgPreview.style.display = 'none'; };
      newImgPreviewImg.onload = () => { newImgPreview.style.display = 'block'; };
    } else {
      newImgPreview.style.display = 'none';
    }
  });

  ['offerItemId', 'offerQuantity', 'discountType', 'discountValue'].forEach(id => {
    overlay.querySelector(`#${id}`)?.addEventListener('input', updateOfferPreview);
    overlay.querySelector(`#${id}`)?.addEventListener('change', updateOfferPreview);
  });

  function renderItemsAdmin() {
    const cont = overlay.querySelector('#itemsListAdmin');
    if (!cont) return;

    if (menuItems.length === 0) {
      cont.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.6;">لا توجد أصناف</div>';
      return;
    }

    cont.innerHTML = menuItems.map((item, idx) => `
      <div class="admin-item-row" data-id="${item.id}" style="
        border:1px solid #e2c7a3; border-radius:16px; padding:14px;
        margin-bottom:12px; background:#fdfaf5; position:relative;
      ">
        <div style="display:flex; gap:12px; align-items:flex-start; flex-wrap:wrap;">
          <div style="flex-shrink:0;">
            <img 
              src="${escapeHtml(buildImageUrl(item.image, item.name))}" 
              onerror="this.src='${escapeHtml(makeFallbackImg(item.name))}'"
              style="width:70px; height:55px; object-fit:cover; border-radius:10px; border:2px solid #e2c7a3;"
              alt="${escapeHtml(item.name)}"
            >
          </div>
          <div style="flex:1; min-width:200px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
              <div>
                <label style="font-size:0.75rem; opacity:0.7; display:block;">الاسم</label>
                <input type="text" class="admin-input admin-edit-name" value="${escapeHtml(item.name)}" 
                  style="padding:6px 10px; font-size:0.9rem; width:100%;" data-id="${item.id}">
              </div>
              <div>
                <label style="font-size:0.75rem; opacity:0.7; display:block;">السعر</label>
                <input type="number" class="admin-input admin-edit-price" value="${item.price}" 
                  style="padding:6px 10px; font-size:0.9rem; width:100%;" data-id="${item.id}" min="0">
              </div>
              <div>
                <label style="font-size:0.75rem; opacity:0.7; display:block;">سعر العرض</label>
                <input type="number" class="admin-input admin-edit-offer" value="${item.offerPrice || ''}" 
                  placeholder="فارغ = لا عرض"
                  style="padding:6px 10px; font-size:0.9rem; width:100%;" data-id="${item.id}" min="0">
              </div>
              <div></div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
              <div>
                <label style="font-size:0.75rem; opacity:0.7; display:block;">الوصف</label>
                <textarea class="admin-input admin-edit-desc" data-id="${item.id}" 
                  style="padding:6px 10px; font-size:0.85rem; width:100%; min-height:60px;" 
                  placeholder="وصف المنتج">${escapeHtml(item.description || '')}</textarea>
              </div>
              <div>
                <label style="font-size:0.75rem; opacity:0.7; display:block;">صور إضافية (روابط مفصولة بفاصلة أو سطر جديد)</label>
                <textarea class="admin-input admin-edit-gallery" data-id="${item.id}" 
                  style="padding:6px 10px; font-size:0.85rem; width:100%; min-height:100px; resize: vertical; line-height: 1.6; white-space: pre-wrap; font-family: monospace;" 
                  placeholder="رابط الصورة الأولى,&#10;رابط الصورة الثانية,&#10;رابط الصورة الثالثة">${escapeHtml((item.gallery || []).join(',\n'))}</textarea>
              </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr auto; gap:8px; margin-bottom:8px;">
              <div>
                <label style="font-size:0.75rem; opacity:0.7; display:block;">رابط الصورة</label>
                <input type="text" class="admin-input admin-edit-image" value="${escapeHtml(item.image || '')}" 
                  placeholder="https://..."
                  style="padding:6px 10px; font-size:0.85rem; width:100%;" data-id="${item.id}">
              </div>
              <div>
                <label style="font-size:0.75rem; opacity:0.7; display:block;">الفئة</label>
                <select class="admin-input admin-edit-cat" data-id="${item.id}" style="padding:6px 10px; font-size:0.85rem;">
                  <option value="pizza" ${item.category === 'pizza' ? 'selected' : ''}>🍕 بيتزا</option>
                  <option value="pasta" ${item.category === 'pasta' ? 'selected' : ''}>🍝 باستا</option>
                </select>
              </div>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="admin-btn admin-save-item" data-id="${item.id}" style="font-size:0.8rem; padding:6px 16px;">
                <i class="fas fa-save"></i> حفظ
              </button>
              <button class="admin-btn admin-delete-item" data-id="${item.id}" style="background:#c0392b; font-size:0.8rem; padding:6px 16px;">
                <i class="fas fa-trash"></i> حذف
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    cont.querySelectorAll('.admin-save-item').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.id);
        const row = cont.querySelector(`.admin-item-row[data-id="${id}"]`);
        if (!row) return;

        const item = menuItems.find(i => i.id === id);
        if (!item) return;

        const newName   = row.querySelector('.admin-edit-name').value.trim();
        const newPrice  = parseInt(row.querySelector('.admin-edit-price').value);
        const newOffer  = row.querySelector('.admin-edit-offer').value.trim();
        const newImage  = row.querySelector('.admin-edit-image').value.trim();
        const newCat    = row.querySelector('.admin-edit-cat').value;
        const newDesc   = row.querySelector('.admin-edit-desc')?.value.trim() || '';
        const newGalleryRaw = row.querySelector('.admin-edit-gallery')?.value.trim() || '';
        const newGallery = newGalleryRaw.split(/[,\n]+/).map(url => url.trim()).filter(url => url);

        if (!newName || isNaN(newPrice) || newPrice < 0) {
          showToast('⚠️ الاسم والسعر مطلوبان وصحيحان');
          return;
        }

        item.name       = newName;
        item.price      = newPrice;
        item.offerPrice = newOffer !== '' ? parseInt(newOffer) : null;
        item.image      = newImage || MENU_IMAGE_DEFAULTS[item.id] || makeFallbackImg(newName);
        item.category   = newCat;
        item.description = newDesc;
        item.gallery    = newGallery;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
        btn.disabled = true;

        await saveAllData();

        btn.innerHTML = '<i class="fas fa-check"></i> تم الحفظ';
        setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-save"></i> حفظ';
          btn.disabled = false;
        }, 1500);

        const thumb = row.querySelector('img');
        if (thumb) {
          thumb.src = buildImageUrl(item.image, item.name);
          thumb.onerror = () => { thumb.src = makeFallbackImg(item.name); };
        }

        showToast(`✅ تم حفظ "${newName}" بنجاح`);
        renderItems(currentCategory);
        refreshItemCount();
        populateOfferItemSelect();
      });
    });

    cont.querySelectorAll('.admin-delete-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const item = menuItems.find(i => i.id === id);
        if (!item) return;

        showCustomConfirm(`هل تريد حذف "${item.name}" نهائياً؟`, async () => {
          menuItems = menuItems.filter(i => i.id !== id);
          await saveAllData();
          renderItemsAdmin();
          renderItems(currentCategory);
          renderOffersAdmin();
          populateOfferItemSelect();
          refreshItemCount();
          showToast(`✅ تم حذف "${item.name}"`);
        });
      });
    });
  }

  function renderOffersAdmin() {
    const cont = overlay.querySelector('#offersListAdmin');
    if (!cont) return;

    if (offersData.length === 0) {
      cont.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.6;">لا توجد عروض</div>';
      return;
    }

    cont.innerHTML = offersData.map((offer, idx) => {
      const menuItem = menuItems.find(m => m.id === offer.itemId);
      return `
        <div class="admin-offer-row" data-idx="${idx}" style="
          border:1px solid #e2c7a3; border-radius:16px; padding:14px;
          margin-bottom:12px; background:#fff9f0;
        ">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
            <div>
              <strong style="font-size:1.1rem; color:#c0392b;">${escapeHtml(offer.title)}</strong>
              <span style="background:#ffdd99; padding:3px 12px; border-radius:20px; font-size:0.8rem; margin-right:8px;">${escapeHtml(offer.highlight)}</span>
            </div>
            <div style="font-size:0.85rem; opacity:0.7;">
              ${menuItem ? escapeHtml(menuItem.name) : '(صنف محذوف)'} × ${offer.quantity} = 
              <strong>${offer.offerTotal} ج.م</strong> 
              <s style="opacity:0.5;">(${offer.originalTotal} ج.م)</s>
            </div>
          </div>
          
          <details style="margin-top:8px;">
            <summary style="cursor:pointer; color:#8b2c1d; font-weight:600; list-style:none; padding:6px 0;">
              ✏️ تعديل هذا العرض
            </summary>
            <div style="margin-top:12px; padding:12px; background:#f9f3e8; border-radius:12px; display:grid; gap:8px;">
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div>
                  <label style="font-size:0.75rem; opacity:0.7; display:block;">اسم العرض</label>
                  <input type="text" class="admin-input oe-title" value="${escapeHtml(offer.title)}" data-idx="${idx}">
                </div>
                <div>
                  <label style="font-size:0.75rem; opacity:0.7; display:block;">الجملة المميزة</label>
                  <input type="text" class="admin-input oe-highlight" value="${escapeHtml(offer.highlight)}" data-idx="${idx}">
                </div>
                <div>
                  <label style="font-size:0.75rem; opacity:0.7; display:block;">الصنف</label>
                  <select class="admin-input oe-itemid" data-idx="${idx}">
                    ${menuItems.map(m => `<option value="${m.id}" ${m.id === offer.itemId ? 'selected' : ''}>${escapeHtml(m.name)}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label style="font-size:0.75rem; opacity:0.7; display:block;">الكمية</label>
                  <input type="number" class="admin-input oe-qty" value="${offer.quantity}" min="1" data-idx="${idx}">
                </div>
                <div>
                  <label style="font-size:0.75rem; opacity:0.7; display:block;">السعر النهائي للعرض (ج.م)</label>
                  <input type="number" class="admin-input oe-total" value="${offer.offerTotal}" min="0" data-idx="${idx}">
                </div>
              </div>
              <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
                <button class="admin-btn oe-save" data-idx="${idx}" style="font-size:0.85rem; padding:8px 20px;">
                  <i class="fas fa-save"></i> حفظ التعديل
                </button>
                <button class="admin-btn oe-delete" data-idx="${idx}" style="background:#c0392b; font-size:0.85rem; padding:8px 20px;">
                  <i class="fas fa-trash"></i> حذف العرض
                </button>
              </div>
            </div>
          </details>
        </div>
      `;
    }).join('');

    cont.querySelectorAll('.oe-save').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.idx);
        const row = cont.querySelector(`.admin-offer-row[data-idx="${idx}"]`);
        if (!row) return;

        const newTitle   = row.querySelector('.oe-title').value.trim();
        const newHL      = row.querySelector('.oe-highlight').value.trim();
        const newItemId  = parseInt(row.querySelector('.oe-itemid').value);
        const newQty     = parseInt(row.querySelector('.oe-qty').value);
        const newTotal   = parseInt(row.querySelector('.oe-total').value);

        if (!newTitle || !newHL || isNaN(newItemId) || isNaN(newQty) || isNaN(newTotal)) {
          showToast('⚠️ الرجاء ملء جميع الحقول بقيم صحيحة');
          return;
        }

        const selectedItem = menuItems.find(m => m.id === newItemId);
        if (!selectedItem) { showToast('⚠️ الصنف المحدد غير موجود'); return; }

        const original = selectedItem.price * newQty;
        offersData[idx] = {
          ...offersData[idx],
          title: newTitle,
          highlight: newHL,
          itemId: newItemId,
          quantity: newQty,
          originalTotal: original,
          offerTotal: newTotal,
          desc: `${selectedItem.name} × ${newQty} = ${newTotal} ج.م (كان ${original} ج.م)`,
        };

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
        btn.disabled = true;

        await saveAllData();
        renderOffers();
        renderOffersAdmin();
        showToast('✅ تم تعديل العرض بنجاح');
      });
    });

    cont.querySelectorAll('.oe-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        showCustomConfirm(`هل تريد حذف عرض "${offersData[idx]?.title}" نهائياً؟`, async () => {
          offersData.splice(idx, 1);
          await saveAllData();
          renderOffers();
          renderOffersAdmin();
          showToast('✅ تم حذف العرض');
        });
      });
    });
  }

  overlay.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      overlay.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active-tab'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      const tabEl = overlay.querySelector(`#tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
      if (tabEl) tabEl.classList.add('active-tab');

      if (tab === 'menu')   renderItemsAdmin();
      if (tab === 'offers') { renderOffersAdmin(); populateOfferItemSelect(); }
    });
  });

  overlay.querySelector('#saveGeneralBtn').addEventListener('click', async () => {
    restaurantConfig.name         = overlay.querySelector('#editName').value.trim() || restaurantConfig.name;
    restaurantConfig.phone        = overlay.querySelector('#editPhone').value.trim() || restaurantConfig.phone;
    restaurantConfig.primaryColor = overlay.querySelector('#editColor').value;
    restaurantConfig.address      = overlay.querySelector('#editAddress').value.trim();
    restaurantConfig.workingHours = overlay.querySelector('#editHours').value.trim();
    restaurantConfig.deliveryNote = overlay.querySelector('#editDeliveryNote').value.trim();

    const btn = overlay.querySelector('#saveGeneralBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    btn.disabled = true;

    await saveAllData();
    applyRestaurantConfig();

    btn.innerHTML = '<i class="fas fa-check"></i> تم الحفظ!';
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-save"></i> حفظ الإعدادات';
      btn.disabled = false;
    }, 1500);

    showToast('✅ تم حفظ الإعدادات بنجاح');
  });

  overlay.querySelector('#addItemBtn').addEventListener('click', async () => {
    const name  = overlay.querySelector('#newItemName').value.trim();
    const price = parseInt(overlay.querySelector('#newItemPrice').value);
    const offer = overlay.querySelector('#newItemOffer').value.trim();
    const cat   = overlay.querySelector('#newItemCat').value;
    const img   = overlay.querySelector('#newItemImg').value.trim();

    if (!name || isNaN(price) || price < 0) {
      showToast('⚠️ الاسم والسعر مطلوبان');
      return;
    }

    const finalImg = img || makeFallbackImg(name);

    const newItem = {
      id: nextId++,
      name,
      price,
      category: cat,
      image: finalImg,
      offerPrice: offer ? parseInt(offer) : null,
      ratings: [],
      avgRating: 0,
      totalRatings: 0,
      description: "",
      gallery: []
    };

    menuItems.push(newItem);

    const btn = overlay.querySelector('#addItemBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإضافة...';
    btn.disabled = true;

    await saveAllData();

    btn.innerHTML = '<i class="fas fa-plus"></i> إضافة الصنف';
    btn.disabled = false;

    overlay.querySelector('#newItemName').value = '';
    overlay.querySelector('#newItemPrice').value = '';
    overlay.querySelector('#newItemOffer').value = '';
    overlay.querySelector('#newItemImg').value = '';
    overlay.querySelector('#newImgPreview').style.display = 'none';

    renderItems(currentCategory);
    renderItemsAdmin();
    populateOfferItemSelect();
    refreshItemCount();
    showToast(`✅ تمت إضافة "${name}" بنجاح`);
    playSound();
  });

  overlay.querySelector('#addOfferBtn').addEventListener('click', async () => {
    const title    = overlay.querySelector('#offerTitle').value.trim();
    const highlight = overlay.querySelector('#offerHighlight').value.trim();
    const itemId   = parseInt(overlay.querySelector('#offerItemId').value);
    const quantity = parseInt(overlay.querySelector('#offerQuantity').value);
    const discType = overlay.querySelector('#discountType').value;
    const discVal  = parseFloat(overlay.querySelector('#discountValue').value);

    if (!title || !highlight || isNaN(itemId) || isNaN(quantity) || quantity < 1 || isNaN(discVal) || discVal <= 0) {
      showToast('⚠️ الرجاء ملء جميع الحقول بقيم صحيحة');
      return;
    }

    const selectedItem = menuItems.find(m => m.id === itemId);
    if (!selectedItem) { showToast('⚠️ اختر صنفاً صحيحاً'); return; }

    const originalTotal = selectedItem.price * quantity;
    const offerTotal = discType === 'percent'
      ? Math.round(originalTotal * (1 - discVal / 100))
      : Math.round(discVal);

    if (offerTotal >= originalTotal) {
      showToast('⚠️ سعر العرض يجب أن يكون أقل من السعر الأصلي');
      return;
    }

    offersData.push({
      id: `offer_${Date.now()}`,
      type: "bundle",
      title,
      highlight,
      desc: `${selectedItem.name} × ${quantity} = ${offerTotal} ج.م`,
      itemId,
      quantity,
      originalTotal,
      offerTotal,
    });

    const btn = overlay.querySelector('#addOfferBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإضافة...';
    btn.disabled = true;

    await saveAllData();

    btn.innerHTML = '<i class="fas fa-plus"></i> إضافة العرض';
    btn.disabled = false;

    overlay.querySelector('#offerTitle').value = '';
    overlay.querySelector('#offerHighlight').value = '';
    overlay.querySelector('#discountValue').value = '';
    overlay.querySelector('#offerPreviewCalc').style.display = 'none';

    renderOffers();
    renderOffersAdmin();
    showToast(`✅ تمت إضافة عرض "${title}" بنجاح`);
    playSound();
  });

  overlay.querySelector('#closeAdminDashBtn').addEventListener('click', () => overlay.remove());

  renderItemsAdmin();
  populateOfferItemSelect();
}

// =====================================================
// بدء التشغيل الرئيسي
// =====================================================
async function init() {
  loadCompletedOrders();

  const savedCart = localStorage.getItem('yusef_cart');
  if (savedCart) try { cart = JSON.parse(savedCart); } catch (e) { cart = []; }

  const savedFavorites = localStorage.getItem('yusef_favorites');
  if (savedFavorites) try { favorites = JSON.parse(savedFavorites); } catch (e) { favorites = []; }

  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) toggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  await loadAllData();

  applyRestaurantConfig();
  renderCart();
  renderItems('pizza');
  renderOffers();
  renderCompletedOrders();

  populateGovernorates();
  setupAddressFields();
  setupPhoneValidation();

  document.querySelectorAll('.nav-btn').forEach(b => {
    b.addEventListener('click', () => showPage(b.dataset.page));
  });

  const searchInput = document.getElementById('menuSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      menuSearchQuery = e.target.value;
      renderItems(currentCategory);
    });
  }

  document.querySelectorAll('.cat-card').forEach(c => {
    c.addEventListener('click', () => {
      currentCategory = c.dataset.cat;
      menuSearchQuery = '';
      if (searchInput) searchInput.value = '';
      document.querySelectorAll('.cat-card').forEach(x =>
        x.classList.toggle('active-cat', x.dataset.cat === currentCategory)
      );
      renderItems(currentCategory);
    });
  });

  document.getElementById('cartIcon')?.addEventListener('click', openCart);
  document.getElementById('closeCartBtn')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);

  setupCartEvents();

  document.getElementById('clearCartBtn')?.addEventListener('click', () => {
    if (cart.length === 0) { showToast('السلة فارغة'); return; }
    showCustomConfirm('هل تريد تفريغ السلة بالكامل؟', () => {
      cart = [];
      updateCartState();
      showToast('✅ تم تفريغ السلة');
    });
  });

  document.getElementById('confirmOrderBtn')?.addEventListener('click', openOrderModal);
  document.getElementById('sendWhatsAppBtn')?.addEventListener('click', sendOrderViaWhatsApp);
  document.getElementById('closeOrderModalBtn')?.addEventListener('click', closeOrderModal);

  document.getElementById('orderModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('orderModal')) closeOrderModal();
  });

  document.getElementById('clearAllOrdersBtn')?.addEventListener('click', clearAllOrders);

  const backBtn = document.getElementById('backToHomeBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      showPage('home');
      renderItems(currentCategory);
    });
  }

  const navbarEl = document.getElementById('mainNavbar');
  let navbarVisible = true;
  const toggleFab = document.getElementById('toggleNavbarFab');

  if (toggleFab) {
    toggleFab.addEventListener('click', () => {
      if (navbarEl) navbarEl.classList.toggle('navbar-hidden');
      navbarVisible = !navbarVisible;
      toggleFab.innerHTML = navbarVisible
        ? '<i class="fas fa-chevron-up"></i>'
        : '<i class="fas fa-chevron-down"></i>';
    });
  }

  const darkToggle = document.getElementById('darkModeToggle');
  if (darkToggle) {
    darkToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('darkMode', isDark);
      darkToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
  }

  setupAdminLogin();
}

init();