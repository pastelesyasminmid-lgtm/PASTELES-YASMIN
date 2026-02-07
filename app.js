// ====== Configura tu WhatsApp aquí ======
const WHATSAPP_NUMBER = "529991207724"; // Ej: 52 + tu número (sin +), CDMX: 5255XXXXXXXX
const SHIPPING_COST = 60; // cambia a 0 si no cobras envío

const products = [
  {
    id: "p1",
    name: "Pastel de Chocolate",
    category: "clasicos",
    price: 480,
    desc: "Pan de cacao, betún cremoso y lluvia de chocolate. (8-10 porciones)",
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "p2",
    name: "Red Velvet",
    category: "premium",
    price: 650,
    desc: "Suave red velvet con frosting de queso. (10-12 porciones)",
    img: "https://images.unsplash.com/photo-1614707267537-2f59cc4d9912?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "p3",
    name: "Tres Leches",
    category: "clasicos",
    price: 520,
    desc: "Esponjoso y jugoso, con crema y toque de canela. (10 porciones)",
    img: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9f?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "p4",
    name: "Cupcakes Vainilla (6)",
    category: "cupcakes",
    price: 210,
    desc: "6 cupcakes de vainilla con betún de colores.",
    img: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "p5",
    name: "Cheesecake Frutos Rojos",
    category: "premium",
    price: 720,
    desc: "Base crujiente, cheesecake cremoso y coulis de frutos rojos.",
    img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "p6",
    name: "Cupcakes Chocolate (6)",
    category: "cupcakes",
    price: 230,
    desc: "6 cupcakes de chocolate con betún y chispas.",
    img: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=1200&q=60",
  },
{
    id: "p7",
    name: "Pastel de Galleta (7)",
    category: "Clasicos",
    price: 230,
    desc: "Pastel de Gallleta estilo a Escoger: Tres Leches, Helado de chololate, confirmar en pedido.",
    img: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=1200&q=60",
  },
];

const $ = (sel) => document.querySelector(sel);

const productGrid = $("#productGrid");
const searchInput = $("#searchInput");
const categorySelect = $("#categorySelect");

const cartDrawer = $("#cartDrawer");
const openCartBtn = $("#openCart");
const closeCartBtn = $("#closeCart");
const closeCartOverlay = $("#closeCartOverlay");

const cartItemsEl = $("#cartItems");
const cartCountEl = $("#cartCount");
const cartSubtotalEl = $("#cartSubtotal");
const cartShippingEl = $("#cartShipping");
const cartTotalEl = $("#cartTotal");

const checkoutBtn = $("#checkoutBtn");
const clearCartBtn = $("#clearCartBtn");
const orderNotesEl = $("#orderNotes");

const yearEl = $("#year");
yearEl.textContent = new Date().getFullYear();

const whatsLink = $("#whatsLink");
whatsLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, me interesa un pastel 😊")}`;

let cart = loadCart(); // {id: qty}

// ------- Render catálogo -------
function renderProducts(list) {
  productGrid.innerHTML = "";
  list.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card__img" style="background-image:url('${p.img}')"></div>
      <div class="card__body">
        <div class="card__title">
          <div>
            <strong>${p.name}</strong>
            <div class="tiny muted">${tag(p.category)}</div>
          </div>
          <div class="price">${money(p.price)}</div>
        </div>
        <div class="muted">${p.desc}</div>
        <div class="card__actions">
          <button class="btn btn--primary" data-add="${p.id}">Agregar</button>
          <button class="btn btn--ghost" data-details="${p.id}">Detalles</button>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

function tag(cat){
  const map = { clasicos:"Clásicos", premium:"Premium", cupcakes:"Cupcakes" };
  return map[cat] || cat;
}

function money(n){
  return n.toLocaleString("es-MX", { style:"currency", currency:"MXN" });
}

// ------- Filtros -------
function applyFilters(){
  const q = (searchInput.value || "").trim().toLowerCase();
  const cat = categorySelect.value;

  const filtered = products.filter(p => {
    const matchesQ = !q || (p.name + " " + p.desc).toLowerCase().includes(q);
    const matchesCat = (cat === "all") || (p.category === cat);
    return matchesQ && matchesCat;
  });

  renderProducts(filtered);
}
searchInput.addEventListener("input", applyFilters);
categorySelect.addEventListener("change", applyFilters);

// ------- Clicks catálogo -------
productGrid.addEventListener("click", (e) => {
  const addId = e.target?.dataset?.add;
  const detailsId = e.target?.dataset?.details;

  if (addId) addToCart(addId);
  if (detailsId) showDetails(detailsId);
});

function showDetails(id){
  const p = products.find(x => x.id === id);
  if(!p) return;
  alert(`${p.name}\n\n${p.desc}\n\nPrecio: ${money(p.price)}`);
}

// ------- Carrito -------
function addToCart(id){
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  openCart();
}

function removeFromCart(id){
  delete cart[id];
  saveCart();
  renderCart();
}

function changeQty(id, delta){
  const next = (cart[id] || 0) + delta;
  if(next <= 0) delete cart[id];
  else cart[id] = next;
  saveCart();
  renderCart();
}

function clearCart(){
  cart = {};
  saveCart();
  renderCart();
}

function cartLines(){
  return Object.entries(cart).map(([id, qty]) => {
    const p = products.find(x => x.id === id);
    return { ...p, qty, lineTotal: (p?.price || 0) * qty };
  }).filter(x => x.id);
}

function totals(){
  const lines = cartLines();
  const subtotal = lines.reduce((acc, x) => acc + x.lineTotal, 0);
  const shipping = subtotal > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;
  const count = lines.reduce((acc, x) => acc + x.qty, 0);
  return { subtotal, shipping, total, count };
}

function renderCart(){
  const lines = cartLines();
  cartItemsEl.innerHTML = "";

  if(lines.length === 0){
    cartItemsEl.innerHTML = `<p class="muted">Tu carrito está vacío. Agrega un pastel 🍰</p>`;
  } else {
    lines.forEach(x => {
      const item = document.createElement("div");
      item.className = "cart-item";
      item.innerHTML = `
        <div class="cart-item__img" style="background-image:url('${x.img}')"></div>
        <div>
          <strong>${x.name}</strong>
          <div class="tiny muted">${money(x.price)} c/u</div>
          <div class="qty" style="margin-top:8px">
            <button data-dec="${x.id}" aria-label="Disminuir">−</button>
            <strong>${x.qty}</strong>
            <button data-inc="${x.id}" aria-label="Aumentar">+</button>
            <button class="icon-btn" data-del="${x.id}" aria-label="Eliminar">🗑️</button>
          </div>
        </div>
        <div style="text-align:right">
          <strong>${money(x.lineTotal)}</strong>
        </div>
      `;
      cartItemsEl.appendChild(item);
    });
  }

  const t = totals();
  cartCountEl.textContent = t.count;
  cartSubtotalEl.textContent = money(t.subtotal);
  cartShippingEl.textContent = money(t.shipping);
  cartTotalEl.textContent = money(t.total);
}

cartItemsEl.addEventListener("click", (e) => {
  const inc = e.target?.dataset?.inc;
  const dec = e.target?.dataset?.dec;
  const del = e.target?.dataset?.del;
  if(inc) changeQty(inc, +1);
  if(dec) changeQty(dec, -1);
  if(del) removeFromCart(del);
});

// ------- Drawer open/close -------
function openCart(){
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}
function closeCart(){
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

openCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
closeCartOverlay.addEventListener("click", closeCart);

// ------- Checkout WhatsApp -------
checkoutBtn.addEventListener("click", () => {
  const lines = cartLines();
  if(lines.length === 0){
    alert("Tu carrito está vacío.");
    return;
  }
  const t = totals();
  const notes = (orderNotesEl.value || "").trim();

  const msg =
`Hola 😊 Quiero hacer este pedido:

${lines.map(x => `• ${x.qty} x ${x.name} — ${money(x.lineTotal)}`).join("\n")}

Subtotal: ${money(t.subtotal)}
Envío: ${money(t.shipping)}
Total: ${money(t.total)}

${notes ? `Notas: ${notes}\n` : ""}Gracias!`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank", "noopener");
});

clearCartBtn.addEventListener("click", clearCart);

// ------- Formulario a WhatsApp -------
$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = fd.get("name");
  const phone = fd.get("phone");
  const message = fd.get("message");

  const msg = `Hola, soy ${name}. Mi teléfono es ${phone}. ${message}`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank", "noopener");
  e.target.reset();
});

// ------- LocalStorage -------
function saveCart(){
  localStorage.setItem("cake_cart_v1", JSON.stringify(cart));
}
function loadCart(){
  try{
    return JSON.parse(localStorage.getItem("cake_cart_v1")) || {};
  } catch {
    return {};
  }
}

// Init
applyFilters();

renderCart();

