// ============================================================
// إعدادات المنتجات - عدّل الأسماء والأسعار من هنا
// ============================================================

const products = {
  cafe: [
    { id: "Matte", name: "متة", price: 50 },
    { id: "Colla", name: "كولا", price: 80 },
    { id: "HotChocolate", name: "هوت شوكليت", price: 60 },
    { id: "Arkela", name: "خدمة اركيلة", price: 50 },
    { id: "Indomi", name: "اندومي", price: 70 },
    { id: "Nescafe3*1", name: "نسكافيه 3*1", price: 80 },
    { id: "Water", name: "مياه", price: 30 },
    { id: "Mokarmeshat", name: "مقرمشات", price: 100 },
    { id: "Coffee", name: "قهوة حلوة", price: 100 },
    { id: "Juice", name: "عصير طبيعي", price: 75 },
    { id: "Service", name: "خدمة طاولة", price: 50 },
    { id: "Tea", name: "شاي", price: 50 },
    { id: "New", name: "تجديد ابريق", price: 20 },
    { id: "Energy", name: "طاقة", price: 150 },
    { id: "Fastcoffee", name: "كامبو سريعة", price: 50 },
    { id: "Icecoffee", name: "آيس كوفي", price: 120 },
    { id: "kammonwlimon", name: "كمون وليمون", price: 50 },
    { id: "Rani", name: "راني", price: 100 }
  ],
  pastry: [
    { id: "cheese50", name: "فطيرة", price: 50 },
    { id: "cheese80", name: "فطيرة", price: 80 },
    { id: "cheese100", name: "فطيرة", price: 100 },
    { id: "cheese130", name: "فطيرة", price: 130 },
    { id: "cheese150", name: "فطيرة", price: 150 },
    { id: "cheese160", name: "فطيرة", price: 160 },
    { id: "cheese180", name: "فطيرة", price: 180 },
    { id: "cheese200", name: "فطيرة", price: 200 },
    { id: "cheese250", name: "فطيرة", price: 250 },
    { id: "cheese300", name: "فطيرة", price: 300 },
    { id: "cheese380", name: "فطيرة", price: 380 },
    { id: "cheese600", name: "فطيرة", price: 600 },
    { id: "Sandwich25", name: "سندويش", price: 25 },
    { id: "Sandwich100", name: "سندويش", price: 100 },
    { id: "cheese150", name: "سندويش", price: 150 }
  ]
};

const TABLE_COUNT = 20;
const STORAGE_KEY = "cafeOrderSystem_v1";
const SALES_KEY = "cafeSales_v1";

// ============================================================
// حالة التطبيق
// ============================================================

let state = loadState();
let sales = loadSales();
let selectedTableId = null;

// ============================================================
// عناصر الصفحة
// ============================================================

const tablesSection = document.getElementById("tablesSection");
const orderSection = document.getElementById("orderSection");
const tablesGrid = document.getElementById("tablesGrid");
const openTablesCount = document.getElementById("openTablesCount");

const selectedTableTitle = document.getElementById("selectedTableTitle");
const lastOrderTime = document.getElementById("lastOrderTime");
const customerName = document.getElementById("customerName");

const cafeProduct = document.getElementById("cafeProduct");
const pastryProduct = document.getElementById("pastryProduct");

const cafeOtherBox = document.getElementById("cafeOtherBox");
const pastryOtherBox = document.getElementById("pastryOtherBox");

const cafeOtherName = document.getElementById("cafeOtherName");
const cafeOtherPrice = document.getElementById("cafeOtherPrice");
const pastryOtherName = document.getElementById("pastryOtherName");
const pastryOtherPrice = document.getElementById("pastryOtherPrice");

const cartItems = document.getElementById("cartItems");
const grandTotal = document.getElementById("grandTotal");
const itemCount = document.getElementById("itemCount");

const salesDialog = document.getElementById("salesDialog");
const salesList = document.getElementById("salesList");
const invoiceCount = document.getElementById("invoiceCount");
const salesTotal = document.getElementById("salesTotal");

const toast = document.getElementById("toast");

// ============================================================
// تشغيل أولي
// ============================================================

init();

function init() {
  renderProductSelects();
  renderTables();

  document.getElementById("salesBtn").addEventListener("click", openSalesDialog);
  document.getElementById("closeDialogBtn").addEventListener("click", () => salesDialog.close());

  document.getElementById("backBtn").addEventListener("click", showTables);
  document.getElementById("closeTableBtn").addEventListener("click", closeTable);

  cafeProduct.addEventListener("change", () => handleProductSelection(cafeProduct, "cafe"));
  pastryProduct.addEventListener("change", () => handleProductSelection(pastryProduct, "pastry"));

  document.getElementById("addCafeOtherBtn").addEventListener("click", () => {
    addCustomProduct("cafe");
  });

  document.getElementById("addPastryOtherBtn").addEventListener("click", () => {
    addCustomProduct("pastry");
  });

  customerName.addEventListener("input", updateCustomerName);
  document.getElementById("exportBtn").addEventListener("click", exportCSV);
  document.getElementById("clearSalesBtn").addEventListener("click", clearSales);
}

function renderProductSelects() {
  fillSelect(cafeProduct, products.cafe, "منتجات الكافيه");
  fillSelect(pastryProduct, products.pastry, "منتجات الفطائر");
}

function fillSelect(select, items, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;

  items.forEach(product => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = `${product.name} — ${formatMoney(product.price)}`;
    select.appendChild(option);
  });

  const other = document.createElement("option");
  other.value = "other";
  other.textContent = "أخرى...";
  select.appendChild(other);
}

// ============================================================
// الطاولات
// ============================================================

function renderTables() {
  tablesGrid.innerHTML = "";

  let openCount = 0;

  for (let i = 1; i <= TABLE_COUNT; i++) {
    const table = getTable(i);
    const isOpen = table.items.length > 0 || table.customerName;

    if (isOpen) openCount++;

    const card = document.createElement("div");
    card.className = `table-card ${isOpen ? "open" : ""}`;

    const total = calculateTotal(table.items);

    card.innerHTML = `
      <div class="table-number">طاولة ${i}</div>
      <div class="table-status">
        ${isOpen ? escapeHTML(table.customerName || "مفتوحة") : "فارغة"}
      </div>
      ${isOpen ? `<div class="table-total">${formatMoney(total)}</div>` : ""}
    `;

    card.addEventListener("click", () => openTable(i));
    tablesGrid.appendChild(card);
  }

  openTablesCount.textContent = `${openCount} مفتوحة`;
}

function getTable(tableId) {
  if (!state.tables[tableId]) {
    state.tables[tableId] = {
      customerName: "",
      items: [],
      lastOrderTime: null
    };
  }

  return state.tables[tableId];
}

function openTable(tableId) {
  selectedTableId = tableId;
  const table = getTable(tableId);

  tablesSection.classList.add("hidden");
  orderSection.classList.remove("hidden");

  selectedTableTitle.textContent = `طاولة ${tableId}`;
  customerName.value = table.customerName || "";

  updateLastOrderTime(table.lastOrderTime);
  renderCart();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showTables() {
  selectedTableId = null;
  orderSection.classList.add("hidden");
  tablesSection.classList.remove("hidden");
  renderTables();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateCustomerName() {
  if (!selectedTableId) return;

  const table = getTable(selectedTableId);
  table.customerName = customerName.value.trim();
  saveState();
  renderTables();
}

function updateLastOrderTime(time) {
  lastOrderTime.textContent = time
    ? `آخر طلب: ${formatDateTime(time)}`
    : "آخر طلب: لا يوجد";
}

// ============================================================
// إضافة المنتجات
// ============================================================

function handleProductSelection(select, category) {
  const value = select.value;

  if (!value) return;

  if (value === "other") {
    if (category === "cafe") {
      cafeOtherBox.classList.remove("hidden");
      cafeOtherName.focus();
    } else {
      pastryOtherBox.classList.remove("hidden");
      pastryOtherName.focus();
    }
    return;
  }

  const list = products[category];
  const product = list.find(item => item.id === value);

  if (product) {
    addItem(product);
  }

  select.value = "";
}

function addCustomProduct(category) {
  const nameInput = category === "cafe" ? cafeOtherName : pastryOtherName;
  const priceInput = category === "cafe" ? cafeOtherPrice : pastryOtherPrice;
  const box = category === "cafe" ? cafeOtherBox : pastryOtherBox;

  const name = nameInput.value.trim();
  const price = Number(priceInput.value);

  if (!name || !Number.isFinite(price) || price < 0) {
    showToast("أدخل اسم المنتج والسعر بشكل صحيح");
    return;
  }

  addItem({
    id: `custom-${Date.now()}`,
    name,
    price
  });

  nameInput.value = "";
  priceInput.value = "";
  box.classList.add("hidden");

  if (category === "cafe") cafeProduct.value = "";
  else pastryProduct.value = "";
}

function addItem(product) {
  if (!selectedTableId) return;

  const table = getTable(selectedTableId);
  const existing = table.items.find(item =>
    item.id === product.id &&
    item.name === product.name &&
    item.price === product.price
  );

  if (existing) {
    existing.qty += 1;
  } else {
    table.items.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      qty: 1
    });
  }

  table.lastOrderTime = new Date().toISOString();

  saveState();
  updateLastOrderTime(table.lastOrderTime);
  renderCart();
  renderTables();

  showToast(`تمت إضافة ${product.name}`);
}

// ============================================================
// السلة
// ============================================================

function renderCart() {
  if (!selectedTableId) return;

  const table = getTable(selectedTableId);

  cartItems.innerHTML = "";

  if (table.items.length === 0) {
    cartItems.innerHTML = `<div class="empty">لا توجد طلبات لهذه الطاولة</div>`;
  } else {
    table.items.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "cart-item";

      const total = item.price * item.qty;

      row.innerHTML = `
        <div>
          <div class="item-name">${escapeHTML(item.name)}</div>
          <div class="item-price">السعر الفردي: ${formatMoney(item.price)}</div>
          <div class="quantity-controls">
            <button class="qty-btn decrease">−</button>
            <strong>${item.qty}</strong>
            <button class="qty-btn increase">+</button>
            <button class="remove-btn">حذف</button>
          </div>
        </div>
        <div class="item-total">${formatMoney(total)}</div>
      `;

      row.querySelector(".decrease").addEventListener("click", () => changeQty(index, -1));
      row.querySelector(".increase").addEventListener("click", () => changeQty(index, 1));
      row.querySelector(".remove-btn").addEventListener("click", () => removeItem(index));

      cartItems.appendChild(row);
    });
  }

  const total = calculateTotal(table.items);
  const count = table.items.reduce((sum, item) => sum + item.qty, 0);

  grandTotal.textContent = formatMoney(total);
  itemCount.textContent = `${count} قطعة`;
}

function changeQty(index, amount) {
  const table = getTable(selectedTableId);
  if (!table.items[index]) return;

  table.items[index].qty += amount;

  if (table.items[index].qty <= 0) {
    table.items.splice(index, 1);
  }

  table.lastOrderTime = new Date().toISOString();

  saveState();
  updateLastOrderTime(table.lastOrderTime);
  renderCart();
  renderTables();
}

function removeItem(index) {
  const table = getTable(selectedTableId);
  table.items.splice(index, 1);
  table.lastOrderTime = new Date().toISOString();

  saveState();
  updateLastOrderTime(table.lastOrderTime);
  renderCart();
  renderTables();
}

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ============================================================
// إغلاق الطاولة وتسجيل الفاتورة
// ============================================================

function closeTable() {
  if (!selectedTableId) return;

  const table = getTable(selectedTableId);

  if (table.items.length === 0) {
    showToast("لا يمكن إغلاق طاولة بدون طلبات");
    return;
  }

  const confirmed = confirm(
    `إغلاق الطاولة ${selectedTableId} وتسجيل الفاتورة بقيمة ${formatMoney(calculateTotal(table.items))}؟`
  );

  if (!confirmed) return;

  const invoice = {
    id: `INV-${Date.now()}`,
    table: selectedTableId,
    customerName: table.customerName || "غير محدد",
    date: new Date().toISOString(),
    items: table.items.map(item => ({ ...item })),
    total: calculateTotal(table.items)
  };

  sales.unshift(invoice);
  saveSales();

  // تصفير الطاولة فقط بعد تسجيل الفاتورة بنجاح.
  state.tables[selectedTableId] = {
    customerName: "",
    items: [],
    lastOrderTime: null
  };

  saveState();

  showToast("تم تسجيل الفاتورة وإغلاق الطاولة");
  showTables();
}

// ============================================================
// سجل المبيعات
// ============================================================

function openSalesDialog() {
  renderSales();
  salesDialog.showModal();
}

function renderSales() {
  invoiceCount.textContent = sales.length;
  salesTotal.textContent = formatMoney(
    sales.reduce((sum, sale) => sum + sale.total, 0)
  );

  salesList.innerHTML = "";

  if (sales.length === 0) {
    salesList.innerHTML = `<div class="empty">لا يوجد سجل مبيعات حتى الآن</div>`;
    return;
  }

  sales.forEach(sale => {
    const card = document.createElement("div");
    card.className = "sale-card";

    const itemsText = sale.items
      .map(item => `${escapeHTML(item.name)} × ${item.qty} = ${formatMoney(item.price * item.qty)}`)
      .join("<br>");

    card.innerHTML = `
      <div class="sale-top">
        <span>طاولة ${sale.table}</span>
        <span>${formatDateTime(sale.date)}</span>
      </div>
      <div class="item-price">الزبون: ${escapeHTML(sale.customerName)}</div>
      <div class="sale-items">${itemsText}</div>
      <div class="sale-total">${formatMoney(sale.total)}</div>
    `;

    salesList.appendChild(card);
  });
}

function exportCSV() {
  if (sales.length === 0) {
    showToast("لا يوجد سجل لتصديره");
    return;
  }

  const rows = [
    ["رقم الفاتورة", "التاريخ", "الطاولة", "اسم الشخص", "المنتج", "الكمية", "السعر الفردي", "إجمالي المادة", "إجمالي الفاتورة"]
  ];

  sales.forEach(sale => {
    sale.items.forEach(item => {
      rows.push([
        sale.id,
        formatDateTime(sale.date),
        sale.table,
        sale.customerName,
        item.name,
        item.qty,
        item.price,
        item.price * item.qty,
        sale.total
      ]);
    });
  });

  // BOM ليساعد Excel على التعرف على UTF-8 عند فتح الملف مباشرة.
  const csv = "\uFEFF" + rows.map(row =>
    row.map(value => csvEscape(value)).join(",")
  ).join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `cafe-sales-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  showToast("تم تصدير سجل المبيعات");
}

function clearSales() {
  if (sales.length === 0) {
    showToast("السجل فارغ أصلًا");
    return;
  }

  const confirmed = confirm(
    "تحذير: سيتم حذف سجل المبيعات المحفوظ على هذا الجهاز نهائيًا. هل أنت متأكد؟"
  );

  if (!confirmed) return;

  sales = [];
  saveSales();
  renderSales();

  showToast("تم حذف سجل المبيعات");
}

// ============================================================
// التخزين الدائم
// ============================================================

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("تعذر قراءة بيانات الطاولات:", error);
  }

  return { tables: {} };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadSales() {
  try {
    const saved = localStorage.getItem(SALES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("تعذر قراءة سجل المبيعات:", error);
    return [];
  }
}

function saveSales() {
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
}

// ============================================================
// أدوات مساعدة
// ============================================================

function formatMoney(value) {
  return `${Number(value).toLocaleString("ar-SY")} ل.س`;
}

function formatDateTime(iso) {
  const date = new Date(iso);

  return date.toLocaleString("ar-SY", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

// حفظ إضافي عند إخفاء الصفحة/إغلاقها.
window.addEventListener("beforeunload", () => {
  saveState();
  saveSales();
});
