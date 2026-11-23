/* =========================================================
   CONFIGURACIÓN: cambia SOLO esta parte
   ========================================================= */
const CONFIG = {
  marca: "Patitas Frescas",
  producto: "Manta refrigerante para mascotas",

  // URL del backend gratis (Google Apps Script → Implementar → Aplicación web → URL que termina en /exec).
  // Paso a paso en backend/INSTRUCCIONES.md. Mientras esté vacío, la tienda funciona en "modo prueba".
  backend: "https://script.google.com/macros/s/AKfycbx8De4OVnemT7DxfBpkInpout2hh2ViNET1XyxWQ-71zrXfppES3vhHEdhqSYhhRAfU/exec",

  // Ponlo en true cuando ya hayas puesto tu Access Token de Mercado Pago en el backend.
  // (En modo prueba la opción de tarjeta se muestra igual, para que veas cómo queda.)
  mercadoPago: false,

  // WhatsApp solo para DUDAS (opcional, no se usa para comprar). Ej.: 56912345678
  whatsapp: "",

  // Proveedor: IMPORZA (Dropi Chile) · Producto ID 71503 "Verano Manta Refrescante Para Mascotas" · bodega Huechuraba
  // Costo proveedor: S 40×50 = $5.400 (variante 27087) · M 50×65 = $6.500 (27088) · L 90×50 = $8.500 (27089)
  // Envío Starken: con recaudo ~$7.900–8.400 · sin recaudo (pagado con tarjeta) ~$5.800.
  // Si cambias un precio aquí, cámbialo también en backend/Code.gs (TALLAS).
  opciones: [
    { id: "S", nombre: "Talla S", detalle: "Gatos y perros pequeños", medida: "40 × 50 cm", precio: 21990 },
    { id: "M", nombre: "Talla M", detalle: "Perros medianos", medida: "50 × 65 cm", precio: 24990, destacado: true },
    { id: "L", nombre: "Talla L", detalle: "Perros grandes", medida: "90 × 50 cm", precio: 29990 },
  ],

  // Días hábiles estimados desde el pedido hasta la entrega, por región. Ajústalos con lo que veas en Dropi.
  entrega: {
    "Metropolitana": [2, 4],
    "Valparaíso": [3, 5], "O'Higgins": [3, 5], "Maule": [3, 5],
    "Coquimbo": [3, 6], "Ñuble": [3, 6], "Biobío": [3, 6],
    "Atacama": [4, 7], "Antofagasta": [4, 7], "La Araucanía": [4, 7], "Los Ríos": [4, 7], "Los Lagos": [4, 7],
    "Tarapacá": [5, 8], "Arica y Parinacota": [5, 8],
    "Aysén": [6, 10], "Magallanes": [6, 10],
  },

  // Fotos del proveedor (en tienda/img/). Si falta una, se muestra un dibujo.
  imagenes: {
    hero: "img/hero.jpg",
    galeria: ["img/foto-1.jpg", "img/foto-2.jpg", "img/foto-3.jpg"],
  },
};

/* ========================================================= */

const REGIONES = [
  "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo",
  "Valparaíso", "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío",
  "La Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes",
];

const clp = (n) => "$" + n.toLocaleString("es-CL");
const $ = (sel) => document.querySelector(sel);
const escapar = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const hayWhatsapp = () => /^569\d{8}$/.test(CONFIG.whatsapp);
// Modo prueba = todavía no hay backend: se muestra todo (incluida la tarjeta) pero no se guarda ni se cobra nada.
const modoPrueba = () => !CONFIG.backend;
const hayMP = () => modoPrueba() || (CONFIG.mercadoPago === true && /^https:\/\//.test(CONFIG.backend));

function imgConRespaldo(img) {
  img.addEventListener("error", () => {
    img.src = "img/placeholder.svg";
  }, { once: true });
}

function pintarTextos() {
  document.querySelectorAll("[data-marca]").forEach((el) => (el.textContent = CONFIG.marca));
  const desde = Math.min(...CONFIG.opciones.map((o) => o.precio));
  document.querySelectorAll("[data-desde]").forEach((el) => (el.textContent = clp(desde)));
  const anio = $("#anio");
  if (anio) anio.textContent = new Date().getFullYear();
  document.querySelectorAll("[data-mp]").forEach((el) => (el.hidden = !hayMP()));
  document.querySelectorAll("[data-modo-prueba]").forEach((el) => (el.hidden = !modoPrueba()));
  document.querySelectorAll("[data-wsp]").forEach((el) => {
    el.hidden = !hayWhatsapp();
    const a = el.querySelector("a");
    if (a && hayWhatsapp()) a.href = `https://wa.me/${CONFIG.whatsapp}`;
  });
}

function pintarImagenes() {
  const hero = $("#hero-img");
  imgConRespaldo(hero);
  hero.src = CONFIG.imagenes.hero;

  const galeria = $("#galeria");
  CONFIG.imagenes.galeria.forEach((src, i) => {
    const img = document.createElement("img");
    // En la galería, si la foto aún no existe, simplemente no se muestra
    img.addEventListener("error", () => img.remove(), { once: true });
    img.src = src;
    img.alt = `${CONFIG.producto}, foto ${i + 1}`;
    img.loading = "lazy";
    galeria.appendChild(img);
  });
}

function pintarOfertas() {
  const cont = $("#ofertas");
  const select = $("#f-opcion");
  CONFIG.opciones.forEach((o) => {
    const card = document.createElement("article");
    card.className = "oferta" + (o.destacado ? " oferta--destacada" : "");
    card.innerHTML = `
      ${o.destacado ? '<span class="oferta__tag">Recomendada</span>' : ""}
      <h3>${o.nombre}</h3>
      <p class="oferta__detalle">${o.detalle}</p>
      <p class="oferta__medida">${o.medida}</p>
      <p class="oferta__precio">${clp(o.precio)}</p>
      <p class="oferta__envio">Envío incluido</p>
      <button class="btn btn--block" data-elegir="${o.id}">Comprar esta talla</button>`;
    cont.appendChild(card);

    const opt = document.createElement("option");
    opt.value = o.id;
    opt.textContent = `${o.nombre} (${o.medida}) — ${clp(o.precio)}`;
    if (o.destacado) opt.selected = true;
    select.appendChild(opt);
  });

  cont.addEventListener("click", (e) => {
    const id = e.target.dataset.elegir;
    if (!id) return;
    select.value = id;
    actualizarTotal();
    $("#pedido").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => $("#f-nombre").focus({ preventScroll: true }), 500);
  });
}

function pintarRegiones() {
  const sel = $("#f-region");
  REGIONES.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r;
    sel.appendChild(opt);
  });
}

function opcionActual() {
  return CONFIG.opciones.find((o) => o.id === $("#f-opcion").value) || CONFIG.opciones[0];
}

function cantidadActual() {
  return Math.min(10, Math.max(1, parseInt($("#f-cantidad").value, 10) || 1));
}

function actualizarTotal() {
  $("#total").textContent = clp(opcionActual().precio * cantidadActual());
}

const pagoElegido = () => (document.querySelector('input[name="pago"]:checked') || {}).value || "recibir";

function actualizarBoton() {
  $("#total-txt").textContent = pagoElegido() === "mp" ? "Total a pagar con tarjeta" : "Total a pagar al recibir";
}

function telefonoValido(tel) {
  const d = tel.replace(/\D/g, "");
  // Celular chileno: 9 dígitos que empiezan en 9, con o sin 56 adelante
  return /^(56)?9\d{8}$/.test(d);
}

const correoValido = (c) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.trim());

/* ---------- Fecha estimada de entrega ---------- */

function sumarHabiles(fecha, dias) {
  const d = new Date(fecha);
  let n = 0;
  while (n < dias) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) n++;
  }
  return d;
}

function fechaLarga(d) {
  return new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "long" }).format(d).replace(",", "");
}

function textoEntrega(region, hoy = new Date()) {
  const [min, max] = CONFIG.entrega[region] || [4, 8];
  return `entre el ${fechaLarga(sumarHabiles(hoy, min))} y el ${fechaLarga(sumarHabiles(hoy, max))}`;
}

/* ---------- Compra en 2 pasos: datos → revisar y confirmar ---------- */

class ErrorTienda extends Error {}

async function registrarPedido(pedido) {
  if (modoPrueba()) {
    // Modo prueba: sin backend todavía, no se guarda nada.
    console.info("[modo prueba] pedido que se enviaría:", pedido);
    await new Promise((r) => setTimeout(r, 500));
    const res = { ok: true, pedido: "PRUEBA", total: opcionActual().precio * pedido.cantidad, prueba: true };
    // Simula la vuelta desde la página de pago con el pago aprobado.
    if (pedido.pago === "mp") res.url_pago = "gracias.html?status=approved&external_reference=PRUEBA";
    return res;
  }
  let res;
  try {
    // Sin cabeceras a propósito (text/plain): así Google Apps Script responde sin bloqueo CORS.
    const r = await fetch(CONFIG.backend, { method: "POST", body: JSON.stringify(pedido) });
    res = await r.json();
  } catch (_) {
    throw new ErrorTienda("No pudimos enviar tu pedido. Revisa tu conexión a internet e intenta de nuevo.");
  }
  if (!res || !res.ok) throw new ErrorTienda((res && res.error) || "No pudimos registrar tu pedido. Intenta de nuevo.");
  return res;
}

function leerFormulario(form) {
  const d = new FormData(form);
  return {
    talla: opcionActual().id,
    cantidad: cantidadActual(),
    pago: hayMP() && pagoElegido() === "mp" ? "mp" : "recibir",
    nombre: d.get("nombre").trim(),
    telefono: d.get("telefono").trim(),
    correo: d.get("correo").trim(),
    region: d.get("region"),
    comuna: d.get("comuna").trim(),
    direccion: d.get("direccion").trim(),
    referencia: d.get("referencia").trim(),
    entrega: textoEntrega(d.get("region")),
    web: d.get("web") || "", // campo trampa para robots
  };
}

// Paso 1 → 2
function continuar(e) {
  e.preventDefault();
  const form = e.target;
  const tel = $("#f-telefono");
  const correo = $("#f-correo");
  tel.setCustomValidity(telefonoValido(tel.value) ? "" : "Ingresa un celular chileno válido, ej. 9 1234 5678");
  correo.setCustomValidity(correoValido(correo.value) ? "" : "Ingresa un correo válido, ej. camila@gmail.com");
  if (!form.reportValidity()) return;
  mostrarRevision(leerFormulario(form));
}

function mostrarRevision(p) {
  const o = CONFIG.opciones.find((x) => x.id === p.talla);
  const total = clp(o.precio * p.cantidad);
  const tarjeta = p.pago === "mp";
  const panel = $("#revisar");
  panel.innerHTML = `
    <h3>Revisa tu pedido</h3>
    <p class="nota" style="margin-top:0">Confirma que todo esté bien antes de enviarlo.</p>
    <div class="revisar__bloque">
      <p class="revisar__titulo">Producto</p>
      <p>${escapar(CONFIG.producto)}, ${escapar(o.nombre)} (${escapar(o.medida)}) × ${p.cantidad}</p>
      <p><strong>${total}</strong> · envío incluido</p>
    </div>
    <div class="revisar__bloque">
      <p class="revisar__titulo">Lo enviamos a</p>
      <p><strong>${escapar(p.nombre)}</strong><br>${escapar(p.direccion)}, ${escapar(p.comuna)}, región ${escapar(p.region)}${p.referencia ? `<br>Referencia: ${escapar(p.referencia)}` : ""}</p>
      <p>${escapar(p.telefono)} · ${escapar(p.correo)}</p>
    </div>
    <div class="revisar__bloque">
      <p class="revisar__titulo">Entrega estimada</p>
      <p class="revisar__entrega">Llega <strong>${escapar(p.entrega)}</strong>.</p>
    </div>
    <div class="revisar__bloque">
      <p class="revisar__titulo">Pago</p>
      <p>${tarjeta ? `Pagas <strong>${total}</strong> ahora con tarjeta de crédito o débito.` : `Pagas <strong>${total}</strong> al recibir, sin adelantar dinero.`}</p>
    </div>
    <p id="revisar-error" class="form__error" role="alert" hidden></p>
    <div class="revisar__acciones">
      <button type="button" class="btn btn--grande btn--block" data-confirmar>${tarjeta ? "Confirmar e ir a pagar" : "Confirmar pedido"}</button>
      <button type="button" class="btn btn--texto" data-corregir>Corregir datos</button>
    </div>`;

  panel.querySelector("[data-corregir]").addEventListener("click", () => {
    panel.hidden = true;
    $("#form-pedido").hidden = false;
    $("#form-pedido").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  panel.querySelector("[data-confirmar]").addEventListener("click", (ev) => confirmarPedido(p, ev.currentTarget));

  $("#form-pedido").hidden = true;
  panel.hidden = false;
  $("#pedido").scrollIntoView({ behavior: "smooth", block: "start" });
}

// Paso 2 → enviar
async function confirmarPedido(p, btn) {
  const error = $("#revisar-error");
  const texto = btn.textContent;
  error.hidden = true;
  btn.disabled = true;
  btn.textContent = p.pago === "mp" ? "Abriendo el pago…" : "Enviando tu pedido…";
  try {
    const res = await registrarPedido(p);
    if (res.url_pago) {
      window.location.href = res.url_pago;
      return;
    }
    mostrarConfirmacion(res, p);
  } catch (err) {
    error.textContent = err instanceof ErrorTienda ? err.message : "Ocurrió un error. Intenta de nuevo.";
    error.hidden = false;
    btn.disabled = false;
    btn.textContent = texto;
  }
}

function mostrarConfirmacion(res, p) {
  const o = CONFIG.opciones.find((x) => x.id === p.talla);
  const panel = $("#confirmacion");
  panel.innerHTML = `
    <img src="img/mark.svg?v=2" alt="" width="150" height="150">
    <h3>¡Pedido recibido, ${escapar(p.nombre.split(" ")[0])}!</h3>
    <p class="confirmacion__num">Pedido N° <strong>${escapar(res.pedido)}</strong></p>
    <div class="confirmacion__correo">
      <p><strong>Último paso:</strong> te enviamos un correo a <strong>${escapar(p.correo)}</strong>. Ábrelo y presiona <strong>Confirmar mi pedido</strong> para que lo despachemos.</p>
      <p style="margin:0">Si no lo ves, revisa la carpeta de spam o promociones.</p>
    </div>
    <p style="margin-top:16px">${escapar(o.nombre)} × ${p.cantidad} · pagas <strong>${clp(o.precio * p.cantidad)}</strong> al recibir<br>Llega ${escapar(p.entrega)}.</p>
    ${res.prueba ? '<p class="confirmacion__prueba">Modo prueba: falta conectar el backend (CONFIG.backend), así que este pedido no se guardó ni se envió ningún correo.</p>' : ""}
    <a href="./" class="confirmacion__otro">Volver a la tienda</a>`;
  $("#revisar").hidden = true;
  panel.hidden = false;
  $("#pedido").scrollIntoView({ behavior: "smooth", block: "start" });
}

function botonFlotante() {
  const barra = $("#barra-cta");
  const pedido = $("#pedido");
  const hero = $(".hero");
  const ofertas = $("#ofertas-sec");
  const visibles = new Set();
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((x) => (x.isIntersecting ? visibles.add(x.target) : visibles.delete(x.target)));
    barra.classList.toggle("oculta", visibles.size > 0);
  }, { threshold: 0.15 });
  [pedido, hero, ofertas].forEach((el) => obs.observe(el));
}

/* ---------- Página de gracias: vuelta del pago o confirmación por correo ---------- */

function mostrarCaso(caso) {
  document.querySelectorAll("[data-caso]").forEach((el) => (el.hidden = el.dataset.caso !== caso));
}

function ponerPedido(pedido) {
  document.querySelectorAll("[data-pedido]").forEach((el) => {
    el.textContent = pedido && /^[\w-]{3,30}$/.test(pedido) ? pedido : "—";
  });
}

async function iniciarGracias() {
  const q = new URLSearchParams(location.search);

  // Confirmación desde el correo (pago al recibir)
  if (q.get("confirmar")) {
    const pedido = q.get("confirmar");
    ponerPedido(pedido);
    if (modoPrueba()) { mostrarCaso("confirmado"); return; }
    try {
      const url = `${CONFIG.backend}?accion=confirmar&pedido=${encodeURIComponent(pedido)}&t=${encodeURIComponent(q.get("t") || "")}`;
      const r = await (await fetch(url)).json();
      if (r.ok) {
        document.querySelectorAll("[data-entrega]").forEach((el) => (el.textContent = r.entrega || "en los próximos días"));
        mostrarCaso("confirmado");
      } else {
        mostrarCaso("confirmar-error");
      }
    } catch (_) {
      mostrarCaso("confirmar-error");
    }
    return;
  }

  // Vuelta desde la página de pago (tarjeta)
  const id = q.get("payment_id") || q.get("collection_id");
  const pedido = q.get("external_reference");
  let estado = q.get("status") || q.get("collection_status") || "";
  ponerPedido(pedido);

  if (id && /^\d+$/.test(id) && !modoPrueba()) {
    try {
      const r = await (await fetch(`${CONFIG.backend}?accion=verificar&payment_id=${encodeURIComponent(id)}`)).json();
      if (r.ok) {
        estado = { "PAGADO": "approved", "PAGO PENDIENTE": "pending", "PAGO RECHAZADO": "rejected" }[r.estado] || estado;
      }
    } catch (_) { /* si falla la verificación, se usa lo que viene en la URL */ }
  }

  mostrarCaso(estado === "approved" ? "ok" : (estado === "pending" || estado === "in_process") ? "pendiente" : "error");
}

/* ---------- Inicio ---------- */

document.addEventListener("DOMContentLoaded", () => {
  pintarTextos();
  if (document.body.dataset.pagina === "gracias") {
    iniciarGracias();
    return;
  }
  if (!$("#form-pedido")) return;
  pintarImagenes();
  pintarOfertas();
  pintarRegiones();
  actualizarTotal();
  if (!hayMP()) document.querySelector('input[name="pago"][value="recibir"]').checked = true;
  actualizarBoton();
  document.querySelectorAll('input[name="pago"]').forEach((r) => r.addEventListener("change", actualizarBoton));
  $("#f-opcion").addEventListener("change", actualizarTotal);
  $("#f-cantidad").addEventListener("input", actualizarTotal);
  $("#form-pedido").addEventListener("submit", continuar);
  $("#f-telefono").addEventListener("input", (e) => e.target.setCustomValidity(""));
  $("#f-correo").addEventListener("input", (e) => e.target.setCustomValidity(""));
  botonFlotante();
});
