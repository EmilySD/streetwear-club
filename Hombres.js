document.addEventListener("DOMContentLoaded", function () {
    const botonBuscar = document.getElementById("botonBuscarCatalogo");
    const menuBuscar = document.getElementById("menuBuscar");
    const productos = document.querySelectorAll(".producto");
    const catalogo = document.querySelector(".catalogo-total");
    const header = document.querySelector("header");

    const barraBusqueda = document.createElement("div");
    barraBusqueda.className = "barra-busqueda";
    barraBusqueda.innerHTML = `
        <input type="text" id="buscador" placeholder="Buscar productos..." autocomplete="off">
        <button id="cerrarBusqueda" type="button">✕</button>
    `;

    header.after(barraBusqueda);

    const buscador = document.getElementById("buscador");
    const cerrarBusqueda = document.getElementById("cerrarBusqueda");

    const mensajeNoEncontrado = document.createElement("p");
    mensajeNoEncontrado.className = "mensaje-no-encontrado";
    mensajeNoEncontrado.textContent = "Producto no encontrado :(";

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

        if (texto !== "" && encontrados === 0) {
            mensajeNoEncontrado.classList.add("visible");
        } else {
            mensajeNoEncontrado.classList.remove("visible");
        }
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

    const botonesFavorito = document.querySelectorAll(".favorito");

    botonesFavorito.forEach(function (boton) {
        boton.addEventListener("click", function () {
            if (this.textContent.trim() === "♡") {
                this.textContent = "♥";
                this.classList.add("activo");
            } else {
                this.textContent = "♡";
                this.classList.remove("activo");
            }
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

    const descripciones = {
        "Camisa polo casual de manga corta":
            "Camisa polo de estilo casual, ideal para combinar con diferentes conjuntos urbanos.",

        "Playera urbana de manga corta":
            "Playera urbana de manga corta, perfecta para crear outfits de estilo streetwear.",

        "Sudadera urbana":
            "Sudadera de estilo urbano, diseñada para complementar conjuntos casuales.",

        "Pantalón urbano de corte recto":
            "Pantalón de corte recto que combina comodidad y estilo urbano.",

        "Pantalón cargo estilo urbano":
            "Pantalón cargo de inspiración streetwear, ideal para un look casual.",

        "Chamarra urbana ligera":
            "Chamarra ligera de estilo urbano para complementar diferentes outfits.",

        "Short urbano casual para hombre":
            "Short casual de estilo urbano, ideal para combinar con playeras y sudaderas.",

        "Playera urbana estampado gráfico":
            "Playera con estilo gráfico urbano, ideal para conjuntos streetwear.",

        "Playera streetwear de manga corta":
            "Playera de manga corta con inspiración streetwear para un look casual.",

        "Pantalón streetwear de corte amplio":
            "Pantalón de corte amplio, pensado para outfits de estilo urbano.",

        "Short deportivo de estilo urbano":
            "Short deportivo con estilo urbano para conjuntos casuales.",

        "Sudadera streetwear oversize":
            "Sudadera oversize de estilo streetwear, ideal para outfits relajados.",

        "Sudadera con capucha estilo urbano":
            "Sudadera con capucha de estilo urbano para complementar tu vestimenta.",

        "Short streetwear de corte relajado":
            "Short de corte relajado con inspiración streetwear.",

        "Chamarra streetwear casual":
            "Chamarra casual de estilo streetwear para complementar tu outfit."
    };

    function cargarTallas() {
        const tallas = ["XS", "S", "M", "L", "XL", "XXL"];

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
            "Verde",
            "Azul"
        ];

        color.innerHTML = '<option value="">Seleccionar color</option>';

        colores.forEach(function (valor) {
            const opcion = document.createElement("option");
            opcion.value = valor;
            opcion.textContent = valor;
            color.appendChild(opcion);
        });
    }

    productos.forEach(function (producto) {
        producto.addEventListener("click", function (evento) {
            if (evento.target.closest(".favorito, .carrito")) {
                return;
            }

            const foto = producto.querySelector(".imagen-producto img");
            const titulo = producto.querySelector("h3");
            const tipo = producto.querySelector(".categoria");
            const precioTexto = producto.querySelector(".precio strong");
            const oferta = producto.querySelector(".descuento");

            if (!foto || !titulo || !tipo || !precioTexto) {
                return;
            }

            const nombreProducto = titulo.textContent.trim();
            const categoriaProducto = tipo.textContent.trim();

            productoActual = {
                nombre: nombreProducto,
                categoria: categoriaProducto,
                precio: precioTexto.textContent.trim(),
                imagen: foto.src,
                descuento: oferta ? oferta.textContent.trim() : "Sin descuento",
                descripcion: descripciones[nombreProducto] || "Prenda de estilo urbano de Streetwear Club.",
                genero: categoriaProducto.split("·")[1]
                    ? categoriaProducto.split("·")[1].trim()
                    : "No especificado",
                edad: "Adultos",
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

            cargarTallas();
            cargarColores();

            cantidad.value = 1;
            cantidad.min = 1;
            cantidad.max = 10;

            mensaje.textContent = "";

            modal.classList.add("activo");
            document.body.style.overflow = "hidden";
        });
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

        mensaje.textContent = "¡Producto agregado al carrito!";
    });

    botonFavorito.addEventListener("click", function () {
        if (!productoActual) return;

        let favoritos = JSON.parse(localStorage.getItem("sc_favoritos") || "[]");

        const existe = favoritos.some(function (producto) {
            return producto.nombre === productoActual.nombre;
        });

        if (existe) {
            mensaje.textContent = "Este producto ya está en favoritos.";
            return;
        }

        favoritos.push(productoActual);

        localStorage.setItem("sc_favoritos", JSON.stringify(favoritos));

        mensaje.textContent = "¡Producto agregado a favoritos!";
    });
});