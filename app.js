

//CART
let cart = JSON.parse(localStorage.getItem("bestcoffee_cart")) || [];

function saveCart() {
  localStorage.setItem("bestcoffee_cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  const total = cart.reduce((s, i) => s + i.qty, 0);
  el.textContent = total;
}

function addToCart(name, price, qty = 1) {
  const existing = cart.find(i => i.name === name);
  if (existing) existing.qty += qty;
  else cart.push({ name, price, qty });
  saveCart();
  showToast(`${name} added to cart ☕`);
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  if (typeof renderCart === "function") renderCart();
}

//TOAST
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    t.innerHTML = `<i class="fa-solid fa-mug-hot"></i><span id="toast-msg"></span>`;
    document.body.appendChild(t);
  }
  document.getElementById("toast-msg").textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2800);
}

//NAVBAR
function toggleMenu() {
  document.getElementById("navbar")?.classList.toggle("open");
}

// Scroll-spy
(function scrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll("nav a");
  if (!sections.length) return;
  window.addEventListener("scroll", () => {
    const pos = window.scrollY + 100;
    sections.forEach(sec => {
      if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) {
        navLinks.forEach(a => {
          a.classList.toggle("active", a.getAttribute("href") === "#" + sec.id);
        });
      }
    });
  });
})();

//MENU SEARCH & FILTER
function initMenuControls() {
  const searchInput = document.getElementById("menuSearch");
  const filterTabs  = document.querySelectorAll(".filter-tab");
  const cards       = document.querySelectorAll(".menu-card");
  if (!searchInput && !filterTabs.length) return;

  let activeFilter = "all";

  function applyFilters() {
    const q = searchInput ? searchInput.value.toLowerCase().trim() : "";
    cards.forEach(card => {
      const cat   = card.dataset.category || "";
      const text  = card.innerText.toLowerCase();
      const catOk = activeFilter === "all" || cat === activeFilter;
      const srOk  = !q || text.includes(q);
      card.classList.toggle("hidden", !(catOk && srOk));
    });
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);

  filterTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      filterTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeFilter = tab.dataset.filter;
      applyFilters();
    });
  });
}

//ITEM DETAIL MODAL
let modalQty = 1;

function openModal(name, price, desc, imgSrc) {
  const overlay = document.getElementById("itemModal");
  if (!overlay) return;
  document.getElementById("modalImg").src    = imgSrc;
  document.getElementById("modalName").textContent  = name;
  document.getElementById("modalPrice").textContent = "₹" + price;
  document.getElementById("modalDesc").textContent  = desc;
  overlay.dataset.name  = name;
  overlay.dataset.price = price;
  modalQty = 1;
  document.getElementById("modalQtyVal").textContent = 1;
  overlay.classList.add("open");
}

function closeModal() {
  document.getElementById("itemModal")?.classList.remove("open");
}

function changeModalQty(delta) {
  modalQty = Math.max(1, modalQty + delta);
  document.getElementById("modalQtyVal").textContent = modalQty;
}

function confirmModalAdd() {
  const overlay = document.getElementById("itemModal");
  if (!overlay) return;
  addToCart(overlay.dataset.name, Number(overlay.dataset.price), modalQty);
  closeModal();
}

// Close on overlay click
document.addEventListener("click", e => {
  if (e.target.id === "itemModal") closeModal();
});

//WISHLIST
let wishlist = JSON.parse(localStorage.getItem("bestcoffee_wish")) || [];

function toggleWish(btn, name) {
  const idx = wishlist.indexOf(name);
  if (idx === -1) {
    wishlist.push(name);
    btn.classList.add("liked");
    btn.innerHTML = "♥";
    showToast(name + " added to wishlist!");
  } else {
    wishlist.splice(idx, 1);
    btn.classList.remove("liked");
    btn.innerHTML = "♡";
  }
  localStorage.setItem("bestcoffee_wish", JSON.stringify(wishlist));
}

function initWishButtons() {
  document.querySelectorAll(".fav-btn").forEach(btn => {
    const name = btn.dataset.item;
    if (wishlist.includes(name)) {
      btn.classList.add("liked");
      btn.innerHTML = "♥";
    }
    btn.addEventListener("click", () => toggleWish(btn, name));
  });
}

//SLIDER (testimonials)
function initSlider() {
  const track = document.getElementById("sliderTrack");
  const dotsC = document.getElementById("dots");
  if (!track || !dotsC) return;

  const slides = track.querySelectorAll(".review-card");
  let cur = 0;

  slides.forEach((_, i) => {
    const d = document.createElement("button");
    d.className = i === 0 ? "dot active" : "dot";
    d.addEventListener("click", () => goTo(i));
    dotsC.appendChild(d);
  });

  function goTo(i) {
    cur = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${cur * 100}%)`;
    dotsC.querySelectorAll(".dot").forEach((d, j) => d.classList.toggle("active", j === cur));
  }

  window.changeSlide = dir => goTo(cur + dir);
  setInterval(() => goTo(cur + 1), 4000);
}

//CONTACT FORM
function submitForm(event) {
  event.preventDefault();
  showToast("Message sent successfully ☕");
  event.target.reset();
}

//CHECKOUT PAGE
function renderCart() {
  const container = document.getElementById("cartItems");
  const totalEl   = document.getElementById("totalPrice");
  if (!container) return;

  container.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = `<p class="empty-cart">Your cart is empty ☕</p>`;
    totalEl.textContent = "0";
    return;
  }

  cart.forEach((item, i) => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-info">
        <h3>${item.name}</h3>
        <p>₹${item.price} × ${item.qty}</p>
      </div>
      <div class="cart-actions">
        <span class="cart-total">₹${item.price * item.qty}</span>
        <button class="remove-btn" onclick="removeItem(${i})">Remove</button>
      </div>`;
    container.appendChild(div);
  });

  totalEl.textContent = total;
}

function initCheckout() {
  renderCart();

  const paymentOptions = document.querySelectorAll('input[name="payment"]');
  const upiSection     = document.getElementById("upiSection");
  const cardSection    = document.getElementById("cardSection");

  paymentOptions.forEach(opt => {
    opt.addEventListener("change", () => {
      upiSection.style.display  = opt.value === "UPI"  ? "block" : "none";
      cardSection.style.display = opt.value === "Card" ? "block" : "none";
    });
  });

  document.getElementById("paymentForm")?.addEventListener("submit", e => {
    e.preventDefault();
    showToast("Payment successful! Redirecting…");
    localStorage.removeItem("bestcoffee_cart");
    setTimeout(() => { window.location.href = "track.html"; }, 2000);
  });
}

//BOOKING PAGE
function initBooking() {
  document.getElementById("bookingForm")?.addEventListener("submit", e => {
    e.preventDefault();
    showToast("Table reserved! See you soon ☕");
    e.target.reset();
  });
}

//LOGIN / SIGNUP PAGE
function initAuth() {
  const loginForm  = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const toSignup   = document.getElementById("toSignup");
  const toLogin    = document.getElementById("toLogin");

  toSignup?.addEventListener("click", e => {
    e.preventDefault();
    loginForm.style.display  = "none";
    signupForm.style.display = "flex";
  });
  toLogin?.addEventListener("click", e => {
    e.preventDefault();
    signupForm.style.display = "none";
    loginForm.style.display  = "flex";
  });

  loginForm?.addEventListener("submit", e => {
    e.preventDefault();
    showToast("Logged in! Welcome back ☕");
    setTimeout(() => { window.location.href = "index.html"; }, 1800);
  });
  signupForm?.addEventListener("submit", e => {
    e.preventDefault();
    showToast("Account created! Welcome ☕");
    setTimeout(() => { window.location.href = "index.html"; }, 1800);
  });
}

//BOOT
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  initMenuControls();
  initWishButtons();
  initSlider();
  initCheckout();
  initBooking();
  initAuth();
});