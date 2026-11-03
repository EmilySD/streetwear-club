const CLAVE_CARRITO = "sc_carrito";
const FORMATO_MONEDA = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
});

function obtenerCarrito() {
    try {
        const datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || "[]");
        if (!Array.isArray(datos)) return [];

        return datos.filter(producto =>
            producto &&
            typeof producto.id === "string" &&
            typeof producto.nombre === "string" &&
            Number.isFinite(Number(producto.precio)) &&
            Number(producto.precio) >= 0 &&
            Number.isInteger(Number(producto.cantidad)) &&
            Number(producto.cantidad) > 0
        ).map(producto => ({
            ...producto,
            precio: Number(producto.precio),
            cantidad: Number(producto.cantidad)
        }));
    } catch (error) {
        console.error("No se pudo leer el carrito:", error);
        return [];
    }
}

function guardarCarrito(carrito) {
    try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
        actualizarContador();
        return true;
    } catch (error) {
        console.error("No se pudo guardar el carrito:", error);
        alert("No se pudo guardar el carrito en este navegador.");
        return false;
    }
}

function formatoPrecio(precio) {
    return FORMATO_MONEDA.format(precio);
}

function actualizarContador() {
    const contador = document.getElementById("contadorCarrito");
    if (!contador) return;

    const cantidad = obtenerCarrito().reduce(
        (total, producto) => total + producto.cantidad,
        0
    );

    contador.textContent = cantidad;
    contador.setAttribute("aria-label", `${cantidad} productos en el carrito`);
}

function inicializarBotonesCatalogo() {
    const botones = document.querySelectorAll(".producto button.carrito");

    botones.forEach((boton, indice) => {
        if (boton.dataset.carritoPreparado === "true") return;

        boton.dataset.carritoPreparado = "true";
        boton.type = "button";
        boton.setAttribute("aria-label", "Agregar al carrito");

        boton.addEventListener("click", () => {
            const tarjeta = boton.closest(".producto");
            if (!tarjeta) return;

            const nombre = tarjeta.querySelector(".info-producto h3")?.textContent.trim() || "Producto SC";
            const categoria = tarjeta.querySelector(".categoria")?.textContent.trim() || "Ropa";
            const imagen = tarjeta.querySelector(".imagen-producto img");
            const textoPrecio = tarjeta.querySelector(".precio strong")?.textContent || "";
            const precio = Number(textoPrecio.replace(/[^\d.,]/g, "").replace(",", "."));

            if (!Number.isFinite(precio) || precio < 0) {
                alert("No se pudo identificar el precio del producto.");
                return;
            }

            const id = tarjeta.dataset.productoId || imagen?.getAttribute("src") || `${nombre}-${indice}`;
            const carrito = obtenerCarrito();
            const existente = carrito.find(producto => producto.id === id);

            if (existente) {
                existente.cantidad += 1;
            } else {
                carrito.push({
                    id,
                    nombre,
                    categoria,
                    precio,
                    imagen: imagen?.getAttribute("src") || "",
                    cantidad: 1
                });
            }

            if (guardarCarrito(carrito)) {
                const textoOriginal = boton.textContent;
                boton.textContent = "✓";
                boton.classList.add("agregado");

                setTimeout(() => {
                    boton.textContent = textoOriginal || "🛒";
                    boton.classList.remove("agregado");
                }, 1000);
            }
        });
    });
}

const listaCarrito = document.getElementById("listaCarrito");
const carritoVacio = document.getElementById("carritoVacio");
const subtotalElemento = document.getElementById("subtotal");
const descuentoElemento = document.getElementById("descuento");
const envioElemento = document.getElementById("costoEnvio");
const totalElemento = document.getElementById("total");
const cantidadResumen = document.getElementById("cantidadResumen");
const mensajeDescuento = document.getElementById("mensajeDescuento");
const botonVaciar = document.getElementById("vaciarCarrito");
const botonFinalizar = document.getElementById("finalizarCompra");

function calcularResumen(carrito) {
    const cantidad = carrito.reduce(
        (total, producto) => total + producto.cantidad,
        0
    );

    const subtotal = carrito.reduce(
        (total, producto) => total + producto.precio * producto.cantidad,
        0
    );

    let porcentajeDescuento = 0;

    if (cantidad >= 5) {
        porcentajeDescuento = 0.10;
    } else if (cantidad >= 3) {
        porcentajeDescuento = 0.05;
    }

    const descuento = subtotal * porcentajeDescuento;
    const importeConDescuento = subtotal - descuento;
    const envio = cantidad === 0 ? 0 : importeConDescuento >= 1000 ? 0 : 99;
    const total = importeConDescuento + envio;

    return { cantidad, subtotal, porcentajeDescuento, descuento, envio, total };
}

function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    if (clase) elemento.className = clase;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

function crearTarjetaCarrito(producto) {
    const tarjeta = crearElemento("article", "item-carrito");
    const contenedorImagen = crearElemento("div", "imagen-carrito");
    const imagen = crearElemento("img");

    imagen.alt = producto.nombre;
    imagen.loading = "lazy";

    if (producto.imagen) {
        imagen.src = producto.imagen;
        imagen.addEventListener("error", () => {
            imagen.hidden = true;
            contenedorImagen.textContent = "Imagen no disponible";
            contenedorImagen.style.display = "grid";
            contenedorImagen.style.placeItems = "center";
            contenedorImagen.style.padding = "8px";
            contenedorImagen.style.fontSize = "12px";
            contenedorImagen.style.textAlign = "center";
        }, { once: true });
    } else {
        imagen.hidden = true;
        contenedorImagen.textContent = "Sin imagen";
    }

    contenedorImagen.appendChild(imagen);

    const datos = crearElemento("div", "datos-carrito");
    datos.appendChild(crearElemento("h3", "", producto.nombre));
    datos.appendChild(crearElemento("p", "categoria-carrito", producto.categoria || "Ropa"));
    datos.appendChild(crearElemento("p", "precio-carrito", formatoPrecio(producto.precio)));

    const controles = crearElemento("div", "controles-cantidad");
    const botonMenos = crearElemento("button", "", "−");
    const numeroCantidad = crearElemento("span", "", String(producto.cantidad));
    const botonMas = crearElemento("button", "", "+");

    botonMenos.type = "button";
    botonMas.type = "button";
    botonMenos.setAttribute("aria-label", `Reducir cantidad de ${producto.nombre}`);
    botonMas.setAttribute("aria-label", `Aumentar cantidad de ${producto.nombre}`);
    botonMenos.disabled = producto.cantidad <= 1;

    botonMenos.addEventListener("click", () => cambiarCantidad(producto.id, -1));
    botonMas.addEventListener("click", () => cambiarCantidad(producto.id, 1));

    controles.append(botonMenos, numeroCantidad, botonMas);

    const acciones = crearElemento("div", "acciones-producto");
    const quitar = crearElemento("button", "quitar-producto", "Eliminar");
    const totalProducto = crearElemento(
        "span",
        "total-producto",
        `Total: ${formatoPrecio(producto.precio * producto.cantidad)}`
    );

    quitar.type = "button";
    quitar.setAttribute("aria-label", `Eliminar ${producto.nombre}`);
    quitar.addEventListener("click", () => eliminarProducto(producto.id));

    acciones.append(quitar, totalProducto);
    datos.append(controles, acciones);
    tarjeta.append(contenedorImagen, datos);

    return tarjeta;
}

function renderizarCarrito() {
    if (!listaCarrito) {
        actualizarContador();
        return;
    }

    const carrito = obtenerCarrito();
    const resumen = calcularResumen(carrito);

    listaCarrito.replaceChildren();
    carrito.forEach(producto => listaCarrito.appendChild(crearTarjetaCarrito(producto)));

    const vacio = carrito.length === 0;

    if (carritoVacio) carritoVacio.hidden = !vacio;
    listaCarrito.hidden = vacio;
    if (botonVaciar) botonVaciar.disabled = vacio;
    if (botonFinalizar) botonFinalizar.disabled = vacio;

    if (cantidadResumen) {
        cantidadResumen.textContent = `${resumen.cantidad} ${resumen.cantidad === 1 ? "artículo" : "artículos"}`;
    }

    if (subtotalElemento) subtotalElemento.textContent = formatoPrecio(resumen.subtotal);
    if (descuentoElemento) descuentoElemento.textContent = `− ${formatoPrecio(resumen.descuento)}`;

    if (envioElemento) {
        envioElemento.textContent = vacio ? "Por calcular" : resumen.envio === 0 ? "Gratis" : formatoPrecio(resumen.envio);
    }

    if (totalElemento) totalElemento.textContent = formatoPrecio(resumen.total);

    if (mensajeDescuento) {
        if (resumen.cantidad >= 5) {
            mensajeDescuento.textContent = "¡Excelente! Tienes un 10% de descuento por cantidad.";
        } else if (resumen.cantidad >= 3) {
            mensajeDescuento.textContent = `¡Llevas un 5% de descuento! Agrega ${5 - resumen.cantidad} artículo(s) más para alcanzar el 10%.`;
        } else {
            mensajeDescuento.textContent = `Agrega ${3 - resumen.cantidad} artículo(s) más para obtener un 5% de descuento.`;
        }

        if (vacio) {
            mensajeDescuento.textContent = "Agrega productos para descubrir los descuentos por cantidad.";
        }
    }

    actualizarContador();
}

function cambiarCantidad(id, cambio) {
    const carrito = obtenerCarrito();
    const producto = carrito.find(item => item.id === id);
    if (!producto) return;

    const nuevaCantidad = producto.cantidad + cambio;
    if (nuevaCantidad < 1) return;

    producto.cantidad = nuevaCantidad;

    if (guardarCarrito(carrito)) renderizarCarrito();
}

function eliminarProducto(id) {
    const carrito = obtenerCarrito().filter(producto => producto.id !== id);
    if (guardarCarrito(carrito)) renderizarCarrito();
}

if (botonVaciar) {
    botonVaciar.addEventListener("click", () => {
        const carrito = obtenerCarrito();
        if (carrito.length === 0) return;

        const confirmar = confirm("¿Quieres eliminar todos los productos del carrito?");
        if (!confirmar) return;

        if (guardarCarrito([])) renderizarCarrito();
    });
}

if (botonFinalizar) {
    botonFinalizar.addEventListener("click", () => {
        const carrito = obtenerCarrito();

        if (carrito.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }

        const resumen = calcularResumen(carrito);
        const confirmar = confirm(
            "SIMULACIÓN DE COMPRA\n\n" +
            `Artículos: ${resumen.cantidad}\n` +
            `Subtotal: ${formatoPrecio(resumen.subtotal)}\n` +
            `Descuento: ${formatoPrecio(resumen.descuento)}\n` +
            `Envío: ${resumen.envio === 0 ? "Gratis" : formatoPrecio(resumen.envio)}\n` +
            `Total estimado: ${formatoPrecio(resumen.total)}\n\n` +
            "Esta demostración no procesa pagos reales. ¿Deseas simular la confirmación?"
        );

        if (!confirmar) return;

        alert(
            "¡Pedido de demostración confirmado!\n\n" +
            "Este es un proyecto escolar: no se realizó ningún cobro " +
            "ni se enviará ningún producto."
        );
    });
}

inicializarBotonesCatalogo();
actualizarContador();
renderizarCarrito();
