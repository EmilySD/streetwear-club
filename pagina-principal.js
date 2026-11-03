document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const seleccionar = (selector, padre = document) =>
        padre.querySelector(selector);

    const seleccionarTodos = (selector, padre = document) =>
        [...padre.querySelectorAll(selector)];

    const normalizarTexto = (texto = "") =>
        texto
            .toLocaleLowerCase("es")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();

    const leerLocalStorage = (clave) => {
        try {
            const datos = JSON.parse(localStorage.getItem(clave) || "[]");
            return Array.isArray(datos) ? datos : [];
        } catch {
            return [];
        }
    };

    const guardarLocalStorage = (clave, datos) => {
        localStorage.setItem(clave, JSON.stringify(datos));
    };

    const CLAVE_FAVORITOS = "sc_favoritos";
    const CLAVE_CARRITO = "sc_carrito";

    // MODO OSCURO

    const botonModoOscuro = seleccionar("#modoOscuro");

    botonModoOscuro?.addEventListener("click", () => {
        document.body.classList.toggle("modo-oscuro");

        const activado = document.body.classList.contains("modo-oscuro");

        botonModoOscuro.setAttribute("aria-pressed", String(activado));
    });

    // CARRUSEL

    const track = seleccionar("#carruselTrack");
    const botonAnterior = seleccionar("#anterior");
    const botonSiguiente = seleccionar("#siguiente");
    const carrusel = seleccionar(".carrusel");
    const puntos = seleccionarTodos(".punto");

    let slides = track ? seleccionarTodos(".slide", track) : [];
    let posicion = 0;
    let anchoSlide = 0;
    let maxPosicion = 0;
    let intervalo = null;

    function calcularSlide() {
        if (!track || !carrusel || slides.length === 0) return;

        const estilo = window.getComputedStyle(track);
        const gap = parseFloat(estilo.gap) || 0;

        anchoSlide = slides[0].getBoundingClientRect().width + gap;

        if (anchoSlide <= 0) return;

        const desplazamientoMaximo = Math.max(
            0,
            track.scrollWidth - carrusel.clientWidth
        );

        maxPosicion = Math.max(
            0,
            Math.ceil(desplazamientoMaximo / anchoSlide)
        );

        posicion = Math.min(posicion, maxPosicion);
    }

    function moverCarrusel() {
        if (!track || !carrusel || anchoSlide <= 0) return;

        const desplazamientoMaximo = Math.max(
            0,
            track.scrollWidth - carrusel.clientWidth
        );

        const desplazamiento = Math.min(
            posicion * anchoSlide,
            desplazamientoMaximo
        );

        track.style.transform = `translateX(-${desplazamiento}px)`;

        puntos.forEach((punto, indice) => {
            const activo = indice === posicion;

            punto.classList.toggle("activo", activo);
            punto.setAttribute("aria-current", String(activo));
        });
    }

    function siguienteSlide() {
        if (maxPosicion <= 0) return;

        posicion = posicion >= maxPosicion ? 0 : posicion + 1;
        moverCarrusel();
    }

    function anteriorSlide() {
        if (maxPosicion <= 0) return;

        posicion = posicion <= 0 ? maxPosicion : posicion - 1;
        moverCarrusel();
    }

    function detenerAutomatico() {
        if (intervalo !== null) {
            clearInterval(intervalo);
            intervalo = null;
        }
    }

    function iniciarAutomatico() {
        detenerAutomatico();

        if (document.hidden || maxPosicion <= 0) return;

        intervalo = setInterval(siguienteSlide, 3500);
    }

    if (track && carrusel) {
        calcularSlide();
        moverCarrusel();
        iniciarAutomatico();

        botonSiguiente?.addEventListener("click", () => {
            siguienteSlide();
            iniciarAutomatico();
        });

        botonAnterior?.addEventListener("click", () => {
            anteriorSlide();
            iniciarAutomatico();
        });

        puntos.forEach(punto => {
            punto.addEventListener("click", () => {
                const nuevaPosicion = Number(punto.dataset.slide);

                if (Number.isFinite(nuevaPosicion)) {
                    posicion = Math.max(
                        0,
                        Math.min(nuevaPosicion, maxPosicion)
                    );

                    moverCarrusel();
                    iniciarAutomatico();
                }
            });
        });

        carrusel.addEventListener("mouseenter", detenerAutomatico);
        carrusel.addEventListener("mouseleave", iniciarAutomatico);
        carrusel.addEventListener("focusin", detenerAutomatico);
        carrusel.addEventListener("focusout", iniciarAutomatico);

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                detenerAutomatico();
            } else {
                iniciarAutomatico();
            }
        });

        window.addEventListener("resize", () => {
            calcularSlide();
            moverCarrusel();
            iniciarAutomatico();
        });
    }

    // CATÁLOGO Y FILTROS

    const catalogo =
        seleccionar("#catalogoGrid") ||
        seleccionar(".catalogo-ropa");

    if (catalogo) {
        const productos = seleccionarTodos(".producto", catalogo);

        productos.forEach((producto, indice) => {
            producto.dataset.ordenOriginal = String(indice);
        });

        const buscador = seleccionar("#buscadorProductos");
        const botonBuscar = seleccionar("#botonBuscar");
        const filtroCategoria = seleccionar("#filtroCategoria");
        const filtroPrecio = seleccionar("#filtroPrecio");
        const ordenPrecio = seleccionar("#ordenarProductos");
        const botonLimpiar = seleccionar("#limpiarFiltros");

        let sinResultados = seleccionar("#sinResultados");

        if (!sinResultados) {
            sinResultados = document.createElement("p");
            sinResultados.id = "sinResultados";
            sinResultados.hidden = true;
            sinResultados.textContent =
                "No encontramos productos. Prueba otra búsqueda o cambia los filtros.";

            catalogo.after(sinResultados);
        }

        function agregarOpcion(select, valor, texto) {
            if (!select) return;

            const existe = [...select.options].some(
                opcion => opcion.value === valor
            );

            if (!existe) {
                select.add(new Option(texto, valor));
            }
        }

        if (filtroCategoria) {
            const categorias = new Map();

            productos.forEach(producto => {
                const texto =
                    producto.dataset.categoria ||
                    seleccionar(".categoria", producto)?.textContent ||
                    "";

                const nombre = texto.trim();

                if (nombre) {
                    const clave = normalizarTexto(nombre);

                    if (!categorias.has(clave)) {
                        categorias.set(clave, nombre);
                    }
                }
            });

            filtroCategoria.innerHTML = "";
            filtroCategoria.add(
                new Option("Todas las categorías", "")
            );

            [...categorias.entries()]
                .sort((a, b) => a[1].localeCompare(b[1], "es"))
                .forEach(([clave, nombre]) => {
                    agregarOpcion(filtroCategoria, clave, nombre);
                });
        }

        if (filtroPrecio) {
            filtroPrecio.innerHTML = "";
            filtroPrecio.add(new Option("Cualquier precio", ""));

            [
                ["250", "Hasta $250"],
                ["300", "Hasta $300"],
                ["500", "Hasta $500"],
                ["1000", "Hasta $1,000"],
                ["2000", "Hasta $2,000"],
                ["5000", "Hasta $5,000"]
            ].forEach(([valor, texto]) => {
                agregarOpcion(filtroPrecio, valor, texto);
            });
        }

        if (ordenPrecio) {
            ordenPrecio.innerHTML = "";

            [
                ["original", "Orden original"],
                ["menor", "Precio: menor a mayor"],
                ["mayor", "Precio: mayor a menor"],
                ["nombre", "Nombre: A-Z"]
            ].forEach(([valor, texto]) => {
                agregarOpcion(ordenPrecio, valor, texto);
            });
        }

        function obtenerPrecio(producto) {
            if (producto.dataset.precio) {
                const precio = Number(producto.dataset.precio);

                if (Number.isFinite(precio)) return precio;
            }

            const texto =
                seleccionar(".precio strong", producto)?.textContent || "";

            const numero = Number(
                texto.replace(/[^\d.,]/g, "").replace(",", ".")
            );

            return Number.isFinite(numero) ? numero : 0;
        }

        function obtenerCategoria(producto) {
            const texto =
                producto.dataset.categoria ||
                seleccionar(".categoria", producto)?.textContent ||
                "";

            return normalizarTexto(texto);
        }

        function aplicarFiltros() {
            const busqueda = normalizarTexto(buscador?.value || "");
            const categoriaElegida = normalizarTexto(
                filtroCategoria?.value || ""
            );

            const precioElegido = filtroPrecio?.value || "";
            const orden = ordenPrecio?.value || "original";

            let cantidadVisibles = 0;

            productos.forEach(producto => {
                const contenido = normalizarTexto(producto.textContent);
                const categoria = obtenerCategoria(producto);
                const precio = obtenerPrecio(producto);

                const coincideTexto =
                    !busqueda || contenido.includes(busqueda);

                const coincideCategoria =
                    !categoriaElegida ||
                    categoria === categoriaElegida;

                const coincidePrecio =
                    !precioElegido ||
                    precio <= Number(precioElegido);

                const mostrar =
                    coincideTexto &&
                    coincideCategoria &&
                    coincidePrecio;

                producto.hidden = !mostrar;

                if (mostrar) cantidadVisibles++;
            });

            const visiblesOrdenados = productos
                .filter(producto => !producto.hidden)
                .sort((a, b) => {
                    if (orden === "menor") {
                        return obtenerPrecio(a) - obtenerPrecio(b);
                    }

                    if (orden === "mayor") {
                        return obtenerPrecio(b) - obtenerPrecio(a);
                    }

                    if (orden === "nombre") {
                        const nombreA =
                            seleccionar("h3", a)?.textContent || "";

                        const nombreB =
                            seleccionar("h3", b)?.textContent || "";

                        return nombreA.localeCompare(nombreB, "es");
                    }

                    return (
                        Number(a.dataset.ordenOriginal) -
                        Number(b.dataset.ordenOriginal)
                    );
                });

            visiblesOrdenados.forEach(producto => {
                catalogo.appendChild(producto);
            });

            productos
                .filter(producto => producto.hidden)
                .sort((a, b) =>
                    Number(a.dataset.ordenOriginal) -
                    Number(b.dataset.ordenOriginal)
                )
                .forEach(producto => {
                    catalogo.appendChild(producto);
                });

            sinResultados.hidden = cantidadVisibles > 0;
        }

        buscador?.addEventListener("input", aplicarFiltros);
        filtroCategoria?.addEventListener("change", aplicarFiltros);
        filtroPrecio?.addEventListener("change", aplicarFiltros);
        ordenPrecio?.addEventListener("change", aplicarFiltros);

        botonBuscar?.addEventListener("click", () => {
            aplicarFiltros();

            catalogo.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });

        buscador?.addEventListener("keydown", evento => {
            if (evento.key === "Enter") {
                evento.preventDefault();
                aplicarFiltros();

                catalogo.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });

        botonLimpiar?.addEventListener("click", () => {
            if (buscador) buscador.value = "";
            if (filtroCategoria) filtroCategoria.value = "";
            if (filtroPrecio) filtroPrecio.value = "";
            if (ordenPrecio) ordenPrecio.value = "original";

            aplicarFiltros();
        });

        aplicarFiltros();
    }

    // BUSCADOR DEL ENCABEZADO

    const botonBuscarEncabezado = seleccionar(
        '.iconos button[title="Buscar"]'
    );

    if (botonBuscarEncabezado && seleccionar("header")) {
        const barraBusqueda = document.createElement("div");

        barraBusqueda.className = "barra-busqueda";

        barraBusqueda.innerHTML = `
            <input
                type="search"
                id="buscadorEncabezado"
                placeholder="Buscar en el catálogo..."
                autocomplete="off"
                aria-label="Buscar en el catálogo"
            >
            <button
                type="button"
                id="cerrarBusqueda"
                aria-label="Cerrar búsqueda"
            >
                ✕
            </button>
        `;

        seleccionar("header").after(barraBusqueda);

        const campoEncabezado = seleccionar("#buscadorEncabezado");
        const botonCerrar = seleccionar("#cerrarBusqueda");

        botonBuscarEncabezado.addEventListener("click", () => {
            barraBusqueda.classList.toggle("activa");

            if (barraBusqueda.classList.contains("activa")) {
                campoEncabezado.focus();
            }
        });

        campoEncabezado.addEventListener("input", () => {
            const campoCatalogo = seleccionar("#buscadorProductos");

            if (campoCatalogo) {
                campoCatalogo.value = campoEncabezado.value;
                campoCatalogo.dispatchEvent(
                    new Event("input", { bubbles: true })
                );
            }
        });

        botonCerrar.addEventListener("click", () => {
            barraBusqueda.classList.remove("activa");
            campoEncabezado.value = "";

            const campoCatalogo = seleccionar("#buscadorProductos");

            if (campoCatalogo) {
                campoCatalogo.value = "";
                campoCatalogo.dispatchEvent(
                    new Event("input", { bubbles: true })
                );
            }
        });
    }

    // BOTÓN DE FILTROS DEL ENCABEZADO

    const botonFiltros = seleccionar(
        '.iconos button[title="Filtros"]'
    );

    botonFiltros?.addEventListener("click", () => {
        const filtros = seleccionar(".catalogo-filtros");

        if (!filtros) return;

        filtros.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        filtros.classList.add("filtros-resaltados");

        setTimeout(() => {
            filtros.classList.remove("filtros-resaltados");
        }, 1200);
    });

    // FAVORITOS

    function obtenerProducto(boton) {
        const tarjeta = boton.closest(".producto");

        if (!tarjeta) return null;

        const imagen = seleccionar(".imagen-producto img", tarjeta);
        const nombre = seleccionar(".info-producto h3", tarjeta);
        const categoria = seleccionar(".categoria", tarjeta);
        const precio = seleccionar(".precio strong", tarjeta);

        if (!imagen || !nombre || !precio) return null;

        const rutaImagen = imagen.getAttribute("src");
        const nombreProducto = nombre.textContent.trim();

        return {
            id: new URL(rutaImagen, document.baseURI).pathname +
                "|" + nombreProducto,
            nombre: nombreProducto,
            imagen: rutaImagen,
            categoria: categoria
                ? categoria.textContent.trim()
                : "Streetwear",
            precio: Number(
                precio.textContent
                    .replace(/[^\d.,]/g, "")
                    .replace(/,/g, "")
            )
        };
    }

    function actualizarCorazones() {
        const favoritos = leerLocalStorage(CLAVE_FAVORITOS);
        const ids = new Set(favoritos.map(producto => producto.id));

        seleccionarTodos(".producto .favorito").forEach(boton => {
            const producto = obtenerProducto(boton);
            const activo = producto && ids.has(producto.id);

            boton.classList.toggle("activo", Boolean(activo));
            boton.textContent = activo ? "♥" : "♡";
            boton.setAttribute("aria-pressed", String(Boolean(activo)));
            boton.setAttribute(
                "aria-label",
                activo ? "Quitar de favoritos" : "Agregar a favoritos"
            );
            boton.title = activo
                ? "Quitar de favoritos"
                : "Agregar a favoritos";
        });
    }

    document.addEventListener("click", evento => {
        const boton = evento.target.closest(".producto .favorito");

        if (!boton) return;

        const producto = obtenerProducto(boton);

        if (!producto) return;

        const favoritos = leerLocalStorage(CLAVE_FAVORITOS);
        const indice = favoritos.findIndex(
            item => item.id === producto.id
        );

        if (indice >= 0) {
            favoritos.splice(indice, 1);
        } else {
            favoritos.push(producto);
        }

        guardarLocalStorage(CLAVE_FAVORITOS, favoritos);
        actualizarCorazones();
    });

    window.addEventListener("storage", evento => {
        if (evento.key === CLAVE_FAVORITOS) {
            actualizarCorazones();
        }
    });

    actualizarCorazones();

    // BOTÓN DE BUSCAR PRODUCTOS

    const botonBuscarCatalogo = seleccionar("#botonBuscarCatalogo");
    const buscadorProductos = seleccionar("#buscadorProductos");

    botonBuscarCatalogo?.addEventListener("click", () => {
        if (!buscadorProductos) return;

        buscadorProductos.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        buscadorProductos.focus();
    });

    // MENÚ DESPLEGABLE AL BAJAR

    const nav = seleccionar("#headerPrincipal .nav");
    const menuScroll = seleccionar("#menuScroll");
    const botonMenu = seleccionar("#botonMenuScroll");
    const contenidoMenu = seleccionar("#contenidoMenuScroll");

    const botonBuscarMenu = seleccionar("#menuBuscar");
    const botonTema = seleccionar("#menuModoOscuro");

    if (nav && menuScroll && botonMenu && contenidoMenu) {
        function cerrarMenu() {
            menuScroll.classList.remove("menu-abierto");
            botonMenu.setAttribute("aria-expanded", "false");
        }

        function comprobarDesplazamiento() {
            if (window.scrollY > 120) {
                nav.classList.add("header-scroll");
            } else {
                nav.classList.remove("header-scroll");
                cerrarMenu();
            }
        }

        window.addEventListener(
            "scroll",
            comprobarDesplazamiento,
            { passive: true }
        );

        comprobarDesplazamiento();

        botonMenu.addEventListener("click", evento => {
            evento.stopPropagation();

            const abierto = menuScroll.classList.toggle("menu-abierto");

            botonMenu.setAttribute("aria-expanded", String(abierto));
        });

        contenidoMenu.addEventListener("click", evento => {
            evento.stopPropagation();
        });

        document.addEventListener("click", cerrarMenu);

        contenidoMenu.querySelectorAll("a").forEach(enlace => {
            enlace.addEventListener("click", cerrarMenu);
        });

        botonBuscarMenu?.addEventListener("click", () => {
            botonBuscarCatalogo?.click();
            cerrarMenu();
        });

        botonTema?.addEventListener("click", () => {
            botonModoOscuro?.click();
            cerrarMenu();
        });

        document.addEventListener("keydown", evento => {
            if (evento.key === "Escape") {
                cerrarMenu();
            }
        });
    }

    // MODAL DE PRODUCTOS

    const modal = seleccionar("#modalProducto");

    if (modal) {
        const cerrar = seleccionar("#cerrarModal", modal);

        const imagen = seleccionar("#detalleImagen");
        const nombre = seleccionar("#detalleNombre");
        const categoria = seleccionar("#detalleCategoria");
        const precio = seleccionar("#detallePrecio");
        const descuento = seleccionar("#detalleDescuento");
        const descripcion = seleccionar("#detalleDescripcion");
        const genero = seleccionar("#detalleGenero");
        const calificacion = seleccionar("#detalleCalificacion");
        const stock = seleccionar("#detalleStock");

        const talla = seleccionar("#detalleTalla");
        const color = seleccionar("#detalleColor");
        const cantidad = seleccionar("#detalleCantidad");

        const mensaje = seleccionar("#mensajeDetalle");

        const botonAgregarCarrito = seleccionar("#agregarCarritoDetalle");
        const botonAgregarFavorito = seleccionar("#agregarFavoritoDetalle");

        const productos = seleccionarTodos(
            ".catalogo-ropa .producto"
        );

        let productoActual = null;

        function obtenerDescripcion(tipo) {
            const descripciones = {
                Camisas: "Camisa de estilo urbano, ideal para complementar diferentes conjuntos casuales.",
                Playeras: "Playera de estilo streetwear, diseñada para combinar con diferentes prendas y estilos.",
                Shorts: "Short de estilo casual y urbano, ideal para crear conjuntos cómodos.",
                Sudaderas: "Sudadera de estilo urbano, ideal para complementar tu outfit en días frescos.",
                Pantalones: "Pantalón de estilo streetwear, pensado para combinar con diferentes prendas.",
                Chamarras: "Chamarra de estilo urbano, ideal para complementar diferentes outfits."
            };

            return descripciones[tipo] ||
                "Prenda de estilo urbano de Streetwear Club.";
        }

        function obtenerTipo(textoCategoria) {
            return textoCategoria.split("·")[0].trim();
        }

        function cargarTallas(esNino) {
            if (!talla) return;

            talla.innerHTML =
                '<option value="">Seleccionar talla</option>';

            const tallas = esNino
                ? ["4", "6", "8", "10", "12", "14", "16"]
                : ["XS", "S", "M", "L", "XL", "XXL"];

            tallas.forEach(t => {
                const opcion = document.createElement("option");
                opcion.value = t;
                opcion.textContent = t;
                talla.appendChild(opcion);
            });
        }

        function cargarColores() {
            if (!color) return;

            const colores = [
                "Negro",
                "Blanco",
                "Gris",
                "Beige",
                "Café",
                "Verde",
                "Azul"
            ];

            color.innerHTML =
                '<option value="">Seleccionar color</option>';

            colores.forEach(c => {
                const opcion = document.createElement("option");
                opcion.value = c;
                opcion.textContent = c;
                color.appendChild(opcion);
            });
        }

        productos.forEach(producto => {
            producto.addEventListener("click", evento => {
                if (evento.target.closest(".favorito, .carrito")) {
                    return;
                }

                const foto = seleccionar(".imagen-producto img", producto);
                const titulo = seleccionar("h3", producto);
                const tipo = seleccionar(".categoria", producto);
                const precioTexto = seleccionar(
                    ".precio strong",
                    producto
                );
                const oferta = seleccionar(".descuento", producto);

                if (!foto || !titulo || !tipo || !precioTexto) return;

                const textoCategoria = tipo.textContent.trim();
                const tipoPrenda = obtenerTipo(textoCategoria);
                const esNino = normalizarTexto(
                    textoCategoria
                ).includes("ninos");

                productoActual = {
                    nombre: titulo.textContent.trim(),
                    categoria: textoCategoria,
                    tipo: tipoPrenda,
                    precio: precioTexto.textContent.trim(),
                    imagen: foto.getAttribute("src"),
                    descuento: oferta
                        ? oferta.textContent.trim()
                        : "Sin descuento",
                    descripcion: obtenerDescripcion(tipoPrenda),
                    genero: textoCategoria.split("·")[1]?.trim() || "Unisex",
                    edad: esNino ? "Niños" : "Adultos",
                    talla: "",
                    color: "",
                    cantidad: 1
                };

                if (imagen) imagen.src = productoActual.imagen;
                if (nombre) nombre.textContent = productoActual.nombre;
                if (categoria) categoria.textContent = productoActual.categoria;
                if (precio) precio.textContent = productoActual.precio;
                if (descripcion) {
                    descripcion.textContent = productoActual.descripcion;
                }

                if (genero) {
                    genero.textContent =
                        productoActual.genero + " · " + productoActual.edad;
                }

                if (descuento) {
                    descuento.textContent = productoActual.descuento;
                }

                if (calificacion) {
                    calificacion.textContent = "Sin calificaciones";
                }

                if (stock) {
                    stock.textContent = "Consultar disponibilidad";
                }

                cargarTallas(esNino);
                cargarColores();

                if (cantidad) {
                    cantidad.value = 1;
                    cantidad.max = 10;
                    cantidad.min = 1;
                }

                if (mensaje) mensaje.textContent = "";

                modal.classList.add("activo");
                document.body.style.overflow = "hidden";
            });
        });

        function cerrarModal() {
            modal.classList.remove("activo");
            document.body.style.overflow = "";
            productoActual = null;
        }

        cerrar?.addEventListener("click", cerrarModal);

        modal.addEventListener("click", evento => {
            if (evento.target === modal) {
                cerrarModal();
            }
        });

        document.addEventListener("keydown", evento => {
            if (
                evento.key === "Escape" &&
                modal.classList.contains("activo")
            ) {
                cerrarModal();
            }
        });

        // AGREGAR AL CARRITO

        botonAgregarCarrito?.addEventListener("click", () => {
            if (!productoActual) return;

            if (!talla?.value || !color?.value) {
                if (mensaje) {
                    mensaje.textContent =
                        "Selecciona una talla y un color.";
                }
                return;
            }

            const cantidadSeleccionada = Number(cantidad?.value);

            if (
                !Number.isInteger(cantidadSeleccionada) ||
                cantidadSeleccionada < 1 ||
                cantidadSeleccionada > 10
            ) {
                if (mensaje) {
                    mensaje.textContent =
                        "Selecciona una cantidad entre 1 y 10.";
                }
                return;
            }

            const nuevoProducto = {
                ...productoActual,
                talla: talla.value,
                color: color.value,
                cantidad: cantidadSeleccionada
            };

            const carrito = leerLocalStorage(CLAVE_CARRITO);

            carrito.push(nuevoProducto);
            guardarLocalStorage(CLAVE_CARRITO, carrito);

            if (mensaje) {
                mensaje.textContent =
                    "¡Producto agregado al carrito!";
            }
        });

        // AGREGAR A FAVORITOS DESDE EL MODAL

        botonAgregarFavorito?.addEventListener("click", () => {
            if (!productoActual) return;

            const favoritos = leerLocalStorage(CLAVE_FAVORITOS);

            const rutaImagen = productoActual.imagen;
            const id = new URL(
                rutaImagen,
                document.baseURI
            ).pathname + "|" + productoActual.nombre;

            const existe = favoritos.some(producto =>
                producto.id === id ||
                producto.nombre === productoActual.nombre
            );

            if (existe) {
                if (mensaje) {
                    mensaje.textContent =
                        "Este producto ya está en favoritos.";
                }
                return;
            }

            favoritos.push({
                ...productoActual,
                id
            });

            guardarLocalStorage(CLAVE_FAVORITOS, favoritos);
            actualizarCorazones();

            if (mensaje) {
                mensaje.textContent =
                    "¡Producto agregado a favoritos!";
            }
        });
    }
});
