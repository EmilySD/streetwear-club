document.addEventListener("DOMContentLoaded", () => {
    const listaFavoritos = document.getElementById("listaFavoritos");
    const cantidadFavoritos = document.getElementById("cantidadFavoritos");
    const favoritosVacios = document.getElementById("favoritosVacios");

    const CLAVE_FAVORITOS = "sc_favoritos";
    const CLAVE_CARRITO = "sc_carrito";

    function leer(clave) {
        try {
            const datos = JSON.parse(localStorage.getItem(clave) || "[]");
            return Array.isArray(datos) ? datos : [];
        } catch {
            return [];
        }
    }

    function guardar(clave, datos) {
        localStorage.setItem(clave, JSON.stringify(datos));
    }

    function obtenerId(producto) {
        return String(
            producto.id ||
            producto.nombre ||
            producto.name ||
            producto.imagen ||
            producto.image ||
            ""
        );
    }

    function obtenerNombre(producto) {
        return producto.nombre || producto.name || "Producto SC";
    }

    function obtenerImagen(producto) {
        return producto.imagen || producto.image || "Imagenes/logoSC.jpeg";
    }

    function obtenerPrecio(producto) {
        const precio = Number(
            String(producto.precio ?? producto.price ?? 0).replace(/[$,\s]/g, "")
        );

        return Number.isFinite(precio) && precio >= 0 ? precio : 0;
    }

    function escapar(texto) {
        return String(texto).replace(/[&<>"']/g, caracter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[caracter]);
    }

    function formatoPrecio(precio) {
        return precio.toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN"
        });
    }

    function mostrarFavoritos() {
        const favoritos = leer(CLAVE_FAVORITOS);

        cantidadFavoritos.textContent =
            `${favoritos.length} ${favoritos.length === 1 ? "producto" : "productos"}`;

        favoritosVacios.hidden = favoritos.length !== 0;
        listaFavoritos.innerHTML = "";

        favoritos.forEach(producto => {
            const nombre = obtenerNombre(producto);
            const imagen = obtenerImagen(producto);
            const precio = obtenerPrecio(producto);

            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-favorito";

            tarjeta.innerHTML = `
                <div class="imagen-favorito">
                    <img src="${escapar(imagen)}" alt="${escapar(nombre)}" loading="lazy">
                </div>
                <div class="info-favorito">
                    <h3>${escapar(nombre)}</h3>
                    <p class="precio-favorito">${formatoPrecio(precio)}</p>
                    <div class="acciones-favorito">
                        <button type="button" class="agregar-carrito">🛒 Añadir al carrito</button>
                        <button type="button" class="quitar-favorito">♥ Quitar</button>
                    </div>
                </div>
            `;

            tarjeta.querySelector("img").addEventListener("error", evento => {
                evento.currentTarget.src = "Imagenes/logoSC.jpeg";
            }, { once: true });

            tarjeta.querySelector(".agregar-carrito").addEventListener("click", () => {
                agregarAlCarrito(producto);
            });

            tarjeta.querySelector(".quitar-favorito").addEventListener("click", () => {
                const actualizados = leer(CLAVE_FAVORITOS).filter(
                    elemento => obtenerId(elemento) !== obtenerId(producto)
                );

                guardar(CLAVE_FAVORITOS, actualizados);
                mostrarFavoritos();
            });

            listaFavoritos.appendChild(tarjeta);
        });
    }

    function agregarAlCarrito(producto) {
        const carrito = leer(CLAVE_CARRITO);
        const id = obtenerId(producto);

        const existente = carrito.find(
            elemento => obtenerId(elemento) === id
        );

        if (existente) {
            existente.cantidad = Math.max(
                1,
                Number(existente.cantidad) || 1
            ) + 1;
        } else {
            carrito.push({
                ...producto,
                id: id,
                nombre: obtenerNombre(producto),
                imagen: obtenerImagen(producto),
                precio: obtenerPrecio(producto),
                cantidad: 1
            });
        }

        guardar(CLAVE_CARRITO, carrito);
        alert(`${obtenerNombre(producto)} se agregó al carrito.`);
    }

    mostrarFavoritos();
});