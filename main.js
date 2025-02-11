// Estado simple del carrito
let carrito = {};

// Elementos del DOM
const domElements = {
    cartBtn: document.querySelector('.cart-btn'),
    cartBadge: document.getElementById('contador-carrito'),
    cartSidebar: document.getElementById('menuCarrito'),
    cartList: document.getElementById('lista-carrito'),
    cartTotal: document.getElementById('total-carrito'),
    emptyCartBtn: document.getElementById('btnVaciar')
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    actualizarCarrito();
});

// Funciones del carrito
function toggleCarrito() {
    const menuCarrito = document.getElementById('menuCarrito');
    if (menuCarrito) {
        menuCarrito.classList.toggle('active');
        document.body.style.overflow = menuCarrito.classList.contains('active') ? 'hidden' : '';
    }
}

function agregarAlCarrito(id, nombre, precio) {
    if (carrito[id]) {
        carrito[id].cantidad++;
    } else {
        carrito[id] = {
            nombre,
            cantidad: 1,
            precio
        };
    }
    actualizarCarrito();
    mostrarNotificacion('Producto agregado al carrito');
}

function actualizarCarrito() {
    const listaCarrito = document.getElementById('lista-carrito');
    const totalCarrito = document.getElementById('total-carrito');
    const contadorCarrito = document.getElementById('contador-carrito');
    const btnVaciar = document.getElementById('btnVaciar');
    let total = 0;
    let cantidadTotal = 0;

    if (listaCarrito) {
        listaCarrito.innerHTML = Object.entries(carrito)
            .map(([id, item]) => {
                const subtotal = item.precio * item.cantidad;
                total += subtotal;
                cantidadTotal += item.cantidad;

                return `
                    <div class="cart-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-0">${item.nombre}</h6>
                                <p class="text-muted mb-0">$${item.precio.toLocaleString()} x ${item.cantidad}</p>
                            </div>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-secondary" onclick="modificarCantidad(${id}, -1)">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <button class="btn btn-outline-secondary" onclick="modificarCantidad(${id}, 1)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
    }

    if (totalCarrito) totalCarrito.textContent = `$${total.toLocaleString()}`;
    if (contadorCarrito) {
        contadorCarrito.textContent = cantidadTotal;
        contadorCarrito.style.display = cantidadTotal > 0 ? 'block' : 'none';
    }
    if (btnVaciar) btnVaciar.style.display = cantidadTotal > 0 ? 'block' : 'none';
}

function modificarCantidad(id, cambio) {
    if (!carrito[id]) return;

    carrito[id].cantidad += cambio;
    if (carrito[id].cantidad <= 0) {
        delete carrito[id];
    }

    actualizarCarrito();
}

function vaciarCarrito() {
    if (!confirm('¿Estás seguro de que deseas vaciar el carrito?')) return;

    carrito = {};
    actualizarCarrito();
    mostrarNotificacion('Carrito vaciado');
}

function mostrarNotificacion(mensaje) {
    alert(mensaje);
}

function comprarPorWhatsApp() {
    if (Object.keys(carrito).length === 0) {
        mostrarNotificacion('El carrito está vacío');
        return;
    }

    let mensaje = "¡Hola! Me gustaría realizar el siguiente pedido:\n\n";
    let total = 0;

    Object.entries(carrito).forEach(([_, item]) => {
        const subtotal = item.precio * item.cantidad;
        mensaje += `${item.nombre} x${item.cantidad} - $${subtotal.toLocaleString()}\n`;
        total += subtotal;
    });

    mensaje += `\nTotal: $${total.toLocaleString()}`;

    const numeroWhatsApp = "573001234567";
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

    // Vaciar el carrito antes de redirigir
    carrito = {};
    localStorage.setItem('carrito', JSON.stringify(carrito)); // Guarda el carrito vacío
    actualizarCarrito(); // Actualiza la interfaz

    // Redirigir a WhatsApp
    window.open(url, "_blank");
}
