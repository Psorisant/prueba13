// Estado de la aplicación
let carrito = {};
let productos = [
    {
        id: 1,
        nombre: "Crema Hidratante PsoriSant",
        precio: 32100,
        categoria: "cremas",
        descripcion: "Crema hidratante especial para pieles sensibles",
        imagen: "https://via.placeholder.com/300x200?text=Crema+Hidratante"
    },
    {
        id: 2,
        nombre: "Jabón Natural PsoriSant",
        precio: 39100,
        categoria: "jabones",
        descripcion: "Jabón natural con propiedades calmantes",
        imagen: "https://via.placeholder.com/300x200?text=Jabón+Natural"
    }
];

// Elementos del DOM
const domElements = {
    productosGrid: document.getElementById('productos-grid'),
    searchInput: document.getElementById('searchInput'),
    priceRange: document.getElementById('priceRange'),
    priceValue: document.getElementById('priceValue'),
    cartBadge: document.getElementById('contador-carrito'),
    cartSidebar: document.getElementById('menuCarrito'),
    cartList: document.getElementById('lista-carrito'),
    cartTotal: document.getElementById('total-carrito'),
    emptyCartBtn: document.getElementById('btnVaciar'),
    toast: document.getElementById('notificationToast')
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    renderProducts();
    updateCartBadge();
    // Inicializar toast de Bootstrap
    const toast = new bootstrap.Toast(domElements.toast);
}

function setupEventListeners() {
    // Búsqueda con debounce
    let searchTimeout;
    domElements.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => filterProducts(), 300);
    });

    // Rango de precio con throttle
    let priceTimeout;
    domElements.priceRange.addEventListener('input', (e) => {
        domElements.priceValue.textContent = `$${parseInt(e.target.value).toLocaleString()}`;
        clearTimeout(priceTimeout);
        priceTimeout = setTimeout(() => filterProducts(), 100);
    });

    // Filtros de categoría
    document.querySelectorAll('.category-filter input').forEach(input => {
        input.addEventListener('change', filterProducts);
    });
}

// Funciones de filtrado y renderizado
function filterProducts() {
    const searchTerm = domElements.searchInput.value.toLowerCase();
    const maxPrice = parseInt(domElements.priceRange.value);
    const selectedCategories = Array.from(document.querySelectorAll('.category-filter input:checked'))
        .map(input => input.value);

    const filteredProducts = productos.filter(producto => {
        const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm) ||
                            producto.descripcion.toLowerCase().includes(searchTerm);
        const matchesPrice = producto.precio <= maxPrice;
        const matchesCategory = selectedCategories.length === 0 || 
                              selectedCategories.includes(producto.categoria);

        return matchesSearch && matchesPrice && matchesCategory;
    });

    renderProducts(filteredProducts);
}

function renderProducts(productsToRender = productos) {
    const productsHTML = productsToRender.map(producto => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="product-card shadow-hover">
                <img src="${producto.imagen}" 
                     class="product-image" 
                     alt="${producto.nombre}"
                     loading="lazy">
                <div class="product-details">
                    <h3 class="h5">${producto.nombre}</h3>
                    <p class="text-muted small">${producto.descripcion}</p>
                    <p class="product-price mb-3">$${producto.precio.toLocaleString()}</p>
                    <button class="btn btn-success w-100" 
                            onclick="agregarAlCarrito(${producto.id}, '${producto.nombre}', ${producto.precio})">
                        <i class="fas fa-cart-plus"></i> Agregar al carrito
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    domElements.productosGrid.innerHTML = productsHTML || '<p class="text-center">No se encontraron productos.</p>';
}

// Funciones del carrito
function toggleCarrito() {
    domElements.cartSidebar.classList.toggle('active');
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
    let total = 0;
    let cantidadTotal = 0;
    
    // Actualizar lista de items
    domElements.cartList.innerHTML = Object.entries(carrito)
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

    // Actualizar totales y badges
    domElements.cartTotal.textContent = `$${total.toLocaleString()}`;
    domElements.cartBadge.textContent = cantidadTotal;
    domElements.cartBadge.style.display = cantidadTotal > 0 ? 'block' : 'none';
    domElements.emptyCartBtn.style.display = cantidadTotal > 0 ? 'block' : 'none';
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
    const toastBody = document.querySelector('.toast-body');
    toastBody.textContent = mensaje;
    const toast = new bootstrap.Toast(domElements.toast);
    toast.show();
}

function comprarPorWhatsApp() {
    if (Object.keys(carrito).length === 0) {
        mostrarNotificacion('El carrito está vacío');
        return;
    }

    let mensaje = "¡Hola! Me gustaría realizar el siguiente pedido:\n\n";
    let total = 0;

    Object.values(carrito).forEach(item => {
        const subtotal = item.precio * item.cantidad;
        mensaje += `${item.nombre} x${item.cantidad} - $${subtotal.toLocaleString()}\n`;
        total += subtotal;
    });

    mensaje += `\nTotal: $${total.toLocaleString()}`;

    const numeroWhatsApp = "573001234567"; // Reemplazar con el número real
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, "_blank");
    vaciarCarrito();
}

// Actualizar badge del carrito al inicio
function updateCartBadge() {
    const total = Object.values(carrito).reduce((sum, item) => sum + item.cantidad, 0);
    domElements.cartBadge.textContent = total;
    domElements.cartBadge.style.display = total > 0 ? 'block' : 'none';
}