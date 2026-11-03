document.addEventListener("DOMContentLoaded", function () {
    const botonBuscar = document.getElementById("botonBuscarCatalogo");
    const menuBuscar = document.getElementById("menuBuscar");
    const header = document.querySelector("header");
    const catalogo = document.querySelector(".catalogo-total");

    if (header && catalogo) {
        const barraBusqueda = document.createElement("div");
        barraBusqueda.className = "barra-busqueda";
        barraBusqueda.innerHTML = `
            <input type="text" id="buscador" placeholder="Buscar accesorios..." autocomplete="off">
            <button id="cerrarBusqueda" type="button">✕</button>
        `;

        header.after(barraBusqueda);

        const buscador = document.getElementById("buscador");
        const cerrarBusqueda = document.getElementById("cerrarBusqueda");
        const productos = document.querySelectorAll(".producto");

        const mensajeNoEncontrado = document.createElement("p");
        mensajeNoEncontrado.className = "mensaje-no-encontrado";
        mensajeNoEncontrado.textContent = "Accesorio no encontrado :(";
        catalogo.prepend(mensajeNoEncontrado);

        function abrirBusqueda() {
            barraBusqueda.classList.add("activa");
            buscador.focus();
        }

        if (botonBuscar) {
            botonBuscar.addEventListener("click", abrirBusqueda);
        }

        if (menuBuscar) {
            menuBuscar.addEventListener("click", function () {
                abrirBusqueda();

                const contenidoMenu = document.getElementById("contenidoMenuScroll");

                if (contenidoMenu) {
                    contenidoMenu.classList.remove("activo");
                }
            });
        }

        buscador.addEventListener("input", function () {
            const texto = this.value.toLowerCase().trim();
            let encontrados = 0;

            productos.forEach(function (producto) {
                const contenido = producto.textContent.toLowerCase();

                if (contenido.includes(texto)) {
                    producto.style.display = "";
                    encontrados++;
                } else {
                    producto.style.display = "none";
                }
            });

            mensajeNoEncontrado.classList.toggle(
                "visible",
                texto !== "" && encontrados === 0
            );
        });

        buscador.addEventListener("keydown", function (evento) {
            if (evento.key === "Enter") {
                evento.preventDefault();
                catalogo.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            if (evento.key === "Escape") {
                cerrarBusqueda.click();
            }
        });

        cerrarBusqueda.addEventListener("click", function () {
            barraBusqueda.classList.remove("activa");
            buscador.value = "";

            productos.forEach(function (producto) {
                producto.style.display = "";
            });

            mensajeNoEncontrado.classList.remove("visible");
        });
    }

    const botonesFavorito = document.querySelectorAll(".favorito");

    botonesFavorito.forEach(function (boton) {
        boton.addEventListener("click", function (evento) {
            evento.stopPropagation();

            const producto = boton.closest(".producto");
            if (!producto) return;

            const imagen = producto.querySelector(".imagen-producto img");
            const nombre = producto.querySelector("h3");
            const categoria = producto.querySelector(".categoria");
            const precio = producto.querySelector(".precio strong");

            if (!imagen || !nombre || !categoria || !precio) return;

            let favoritos = JSON.parse(localStorage.getItem("sc_favoritos") || "[]");

            const existe = favoritos.some(function (item) {
                return item.nombre === nombre.textContent.trim();
            });

            if (existe) {
                favoritos = favoritos.filter(function (item) {
                    return item.nombre !== nombre.textContent.trim();
                });

                boton.textContent = "♡";
                boton.classList.remove("activo");
            } else {
                favoritos.push({
                    nombre: nombre.textContent.trim(),
                    categoria: categoria.textContent.trim(),
                    precio: precio.textContent.trim(),
                    imagen: imagen.src,
                    descuento: producto.querySelector(".descuento")?.textContent.trim() || "Sin descuento"
                });

                boton.textContent = "♥";
                boton.classList.add("activo");
            }

            localStorage.setItem("sc_favoritos", JSON.stringify(favoritos));
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("modalProducto");
    const cerrar = document.getElementById("cerrarModal");

    const imagen = document.getElementById("detalleImagen");
    const nombre = document.getElementById("detalleNombre");
    const categoria = document.getElementById("detalleCategoria");
    const precio = document.getElementById("detallePrecio");
    const descuento = document.getElementById("detalleDescuento");
    const descripcion = document.getElementById("detalleDescripcion");
    const genero = document.getElementById("detalleGenero");
    const calificacion = document.getElementById("detalleCalificacion");
    const stock = document.getElementById("detalleStock");

    const talla = document.getElementById("detalleTalla");
    const color = document.getElementById("detalleColor");
    const cantidad = document.getElementById("detalleCantidad");

    const mensaje = document.getElementById("mensajeDetalle");

    const botonCarrito = document.getElementById("agregarCarritoDetalle");
    const botonFavorito = document.getElementById("agregarFavoritoDetalle");

    const productos = document.querySelectorAll(".catalogo-total > .producto");

    let productoActual = null;

    if (
        !modal || !cerrar || !imagen || !nombre ||
        !categoria || !precio || !descuento ||
        !descripcion || !genero || !calificacion ||
        !stock || !talla || !color || !cantidad ||
        !mensaje || !botonCarrito || !botonFavorito
    ) {
        console.error("Streetwear Club: faltan elementos del modal.");
        return;
    }

    function obtenerDescripcion(tipo) {
        const categoria = tipo.toLowerCase();

        if (categoria.includes("gorra")) {
            return "Gorra de estilo urbano, ideal para complementar tus outfits streetwear.";
        }

        if (categoria.includes("gorros")) {
            return "Gorro casual de estilo urbano, perfecto para completar tu conjunto.";
        }

        if (categoria.includes("cadena")) {
            return "Cadena de diseño urbano que aporta un detalle distintivo a tu estilo.";
        }

        if (categoria.includes("anillo")) {
            return "Anillo de estilo streetwear, ideal para complementar tus accesorios.";
        }

        if (categoria.includes("calceta")) {
            return "Calcetas cómodas con estilo urbano, ideales para el uso diario.";
        }

        if (categoria.includes("cintur")) {
            return "Cinturón de estilo urbano que combina funcionalidad y diseño.";
        }

        if (categoria.includes("pulsera")) {
            return "Pulsera de estilo urbano para complementar tus accesorios.";
        }

        return "Accesorio de Streetwear Club diseñado para complementar tu estilo.";
    }

    function cargarTallas(tipo) {
        const categoria = tipo.toLowerCase();
        let tallas = ["Unitalla", "Ajustable"];

        if (categoria.includes("anillo")) {
            tallas = ["6", "7", "8", "9", "10", "11", "12"];
        }

        if (categoria.includes("calceta")) {
            tallas = ["Unitalla", "Chica", "Mediana", "Grande"];
        }

        if (categoria.includes("cintur")) {
            tallas = ["S", "M", "L", "XL"];
        }

        talla.innerHTML = '<option value="">Seleccionar talla</option>';

        tallas.forEach(function (valor) {
            const opcion = document.createElement("option");
            opcion.value = valor;
            opcion.textContent = valor;
            talla.appendChild(opcion);
        });
    }

    function cargarColores() {
        const colores = [
            "Negro",
            "Blanco",
            "Gris",
            "Beige",
            "Café",
            "Rojo",
            "Verde",
            "Azul",
            "Plateado",
            "Dorado"
        ];

        color.innerHTML = '<option value="">Seleccionar color</option>';

        colores.forEach(function (valor) {
            const opcion = document.createElement("option");
            opcion.value = valor;
            opcion.textContent = valor;
            color.appendChild(opcion);
        });
    }

    function abrirModal(producto) {
        const foto = producto.querySelector(".imagen-producto img");
        const titulo = producto.querySelector("h3");
        const tipo = producto.querySelector(".categoria");
        const precioTexto = producto.querySelector(".precio strong");
        const oferta = producto.querySelector(".descuento");

        if (!foto || !titulo || !tipo || !precioTexto) return;

        const nombreProducto = titulo.textContent.trim();
        const categoriaProducto = tipo.textContent.trim();

        productoActual = {
            nombre: nombreProducto,
            categoria: categoriaProducto,
            precio: precioTexto.textContent.trim(),
            imagen: foto.src,
            descuento: oferta ? oferta.textContent.trim() : "Sin descuento",
            descripcion: obtenerDescripcion(categoriaProducto),
            genero: "Accesorios",
            edad: "Uso diario",
            talla: "",
            color: "",
            cantidad: 1
        };

        imagen.src = productoActual.imagen;
        imagen.alt = productoActual.nombre;

        nombre.textContent = productoActual.nombre;
        categoria.textContent = productoActual.categoria;
        precio.textContent = productoActual.precio;
        descuento.textContent = productoActual.descuento;
        descripcion.textContent = productoActual.descripcion;
        genero.textContent = productoActual.genero + " · " + productoActual.edad;

        calificacion.textContent = "Sin calificaciones";
        stock.textContent = "Consultar disponibilidad";

        cargarTallas(categoriaProducto);
        cargarColores();

        cantidad.value = 1;
        cantidad.min = 1;
        cantidad.max = 10;

        mensaje.textContent = "";

        modal.classList.add("activo");
        document.body.style.overflow = "hidden";
    }

    productos.forEach(function (producto) {
        producto.addEventListener("click", function (evento) {
            if (evento.target.closest(".favorito, .carrito")) {
                return;
            }

            abrirModal(producto);
        });

        const botonCarritoProducto = producto.querySelector(".carrito");

        if (botonCarritoProducto) {
            botonCarritoProducto.addEventListener("click", function (evento) {
                evento.stopPropagation();
                abrirModal(producto);
            });
        }
    });

    function cerrarModal() {
        modal.classList.remove("activo");
        document.body.style.overflow = "";
        productoActual = null;
    }

    cerrar.addEventListener("click", cerrarModal);

    modal.addEventListener("click", function (evento) {
        if (evento.target === modal) {
            cerrarModal();
        }
    });

    document.addEventListener("keydown", function (evento) {
        if (
            evento.key === "Escape" &&
            modal.classList.contains("activo")
        ) {
            cerrarModal();
        }
    });

    botonCarrito.addEventListener("click", function () {
        if (!productoActual) return;

        if (!talla.value || !color.value) {
            mensaje.textContent = "Selecciona una talla y un color.";
            return;
        }

        const cantidadSeleccionada = Number(cantidad.value);

        if (
            !Number.isInteger(cantidadSeleccionada) ||
            cantidadSeleccionada < 1 ||
            cantidadSeleccionada > 10
        ) {
            mensaje.textContent = "Selecciona una cantidad entre 1 y 10.";
            return;
        }

        const nuevoProducto = {
            ...productoActual,
            talla: talla.value,
            color: color.value,
            cantidad: cantidadSeleccionada
        };

        let carrito = JSON.parse(localStorage.getItem("sc_carrito") || "[]");

        carrito.push(nuevoProducto);

        localStorage.setItem("sc_carrito", JSON.stringify(carrito));

        mensaje.textContent = "¡Accesorio agregado al carrito!";
    });

    botonFavorito.addEventListener("click", function () {
        if (!productoActual) return;

        let favoritos = JSON.parse(localStorage.getItem("sc_favoritos") || "[]");

        const existe = favoritos.some(function (producto) {
            return producto.nombre === productoActual.nombre;
        });

        if (existe) {
            mensaje.textContent = "Este accesorio ya está en favoritos.";
            return;
        }

        favoritos.push(productoActual);

        localStorage.setItem("sc_favoritos", JSON.stringify(favoritos));

        mensaje.textContent = "¡Accesorio agregado a favoritos!";
    });
});
