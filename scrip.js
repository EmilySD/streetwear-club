
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =========================================
       FUNCIONES AUXILIARES
    ========================================= */

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

    /* =========================================
       MODO OSCURO
    ========================================= */

    const botonModoOscuro = seleccionar("#modoOscuro");

    if (botonModoOscuro) {
        botonModoOscuro.addEventListener("click", () => {
            document.body.classList.toggle("modo-oscuro");

            const activado =
                document.body.classList.contains("modo-oscuro");

            botonModoOscuro.setAttribute(
                "aria-pressed",
                String(activado)
            );
        });
    }

    /* =========================================
       CARRUSEL
    ========================================= */

    const track = seleccionar("#carruselTrack");
    const botonAnterior = seleccionar("#anterior");
    const botonSiguiente = seleccionar("#siguiente");
    const carrusel = seleccionar(".carrusel");

    let slides = track
        ? seleccionarTodos(".slide", track)
        : [];

    let posicion = 0;
    let anchoSlide = 0;
    let maxPosicion = 0;
    let intervalo = null;

    const puntos = seleccionarTodos(".punto");

    function calcularSlide() {
        if (!track || !carrusel || slides.length === 0) {
            return;
        }

        const estilo = window.getComputedStyle(track);
        const gap = parseFloat(estilo.gap) || 0;

        anchoSlide = slides[0].getBoundingClientRect().width + gap;

        if (anchoSlide <= 0) return;

        const maxDesplazamiento = Math.max(
            0,
            track.scrollWidth - carrusel.clientWidth
        );

        maxPosicion = Math.max(
            0,
            Math.ceil(maxDesplazamiento / anchoSlide)
        );

        posicion = Math.min(posicion, maxPosicion);
    }

    function moverCarrusel() {
        if (!track || !carrusel || anchoSlide <= 0) return;

        const maxDesplazamiento = Math.max(
            0,
            track.scrollWidth - carrusel.clientWidth
        );

        const desplazamiento = Math.min(
            posicion * anchoSlide,
            maxDesplazamiento
        );

        track.style.transform =
            `translateX(-${desplazamiento}px)`;

        puntos.forEach((punto, indice) => {
            const activo = indice === posicion;

            punto.classList.toggle("activo", activo);
            punto.setAttribute("aria-current", String(activo));
        });
    }

    function siguienteSlide() {
        if (maxPosicion <= 0) return;

        posicion = posicion >= maxPosicion
            ? 0
            : posicion + 1;

        moverCarrusel();
    }

    function anteriorSlide() {
        if (maxPosicion <= 0) return;

        posicion = posicion <= 0
            ? maxPosicion
            : posicion - 1;

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

    function reiniciarAutomatico() {
        iniciarAutomatico();
    }

    if (track && carrusel) {
        calcularSlide();

        moverCarrusel();
        iniciarAutomatico();

        botonSiguiente?.addEventListener("click", () => {
            siguienteSlide();
            reiniciarAutomatico();
        });

        botonAnterior?.addEventListener("click", () => {
            anteriorSlide();
            reiniciarAutomatico();
        });

        puntos.forEach((punto) => {
            punto.addEventListener("click", () => {
                const nuevaPosicion = Number(punto.dataset.slide);

                if (Number.isFinite(nuevaPosicion)) {
                    posicion = Math.max(
                        0,
                        Math.min(nuevaPosicion, maxPosicion)
                    );

                    moverCarrusel();
                    reiniciarAutomatico();
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

    
/* =========================================
   CATÁLOGO, BUSCADOR Y FILTROS
========================================= */

const catalogo =
    seleccionar("#catalogoGrid") ||
    seleccionar(".catalogo-ropa");

if (catalogo) {
    const productos = Array.from(
        seleccionarTodos(".producto", catalogo)
    );

    // Guardar el orden original de los productos.
    productos.forEach((producto, indice) => {
        producto.dataset.ordenOriginal = String(indice);
    });

    // Recuperar los controles existentes del HTML.
    const buscador = seleccionar("#buscadorProductos");
    const botonBuscar = seleccionar("#botonBuscar");
    const filtroCategoria = seleccionar("#filtroCategoria");
    const filtroPrecio = seleccionar("#filtroPrecio");
    const ordenPrecio = seleccionar("#ordenarProductos");
    const botonLimpiar = seleccionar("#limpiarFiltros");

    // Mensaje cuando no hay resultados.
    let sinResultados = seleccionar("#sinResultados");

    if (!sinResultados) {
        sinResultados = document.createElement("p");
        sinResultados.id = "sinResultados";
        sinResultados.hidden = true;
        sinResultados.textContent =
            "No encontramos productos. Prueba otra búsqueda o cambia los filtros.";

        catalogo.after(sinResultados);
    }

    // Agregar una opción sin duplicarla.
    function agregarOpcion(select, valor, texto) {
        if (!select) return;

        const existe = Array.from(select.options).some(
            opcion => opcion.value === valor
        );

        if (!existe) {
            select.add(new Option(texto, valor));
        }
    }

    // Crear categorías completas: tipo de prenda y género.
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

        Array.from(categorias.entries())
            .sort((a, b) => a[1].localeCompare(b[1], "es"))
            .forEach(([clave, nombre]) => {
                agregarOpcion(filtroCategoria, clave, nombre);
            });
    }

    // Opciones de precio máximo.
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

    // Opciones de ordenamiento.
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

    // Obtener el precio numérico.
    function obtenerPrecio(producto) {
        if (producto.dataset.precio) {
            const precio = Number(producto.dataset.precio);

            if (Number.isFinite(precio)) {
                return precio;
            }
        }

        const texto =
            seleccionar(".precio strong", producto)?.textContent || "";

        const numero = Number(
            texto.replace(/[^\d.,]/g, "").replace(",", ".")
        );

        return Number.isFinite(numero) ? numero : 0;
    }

    // Obtener la categoría completa, incluido el género.
    function obtenerCategoria(producto) {
        const texto =
            producto.dataset.categoria ||
            seleccionar(".categoria", producto)?.textContent ||
            "";

        return normalizarTexto(texto.trim());
    }

    // Aplicar búsqueda, categoría, precio y orden.
    function aplicarFiltros() {
        const busqueda = normalizarTexto(
            buscador?.value || ""
        );

        const categoriaElegida = normalizarTexto(
            filtroCategoria?.value || ""
        );

        const precioElegido = filtroPrecio?.value || "";
        const orden = ordenPrecio?.value || "original";

        let cantidadVisibles = 0;

        productos.forEach(producto => {
            const contenido = normalizarTexto(
                producto.textContent
            );

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

            if (mostrar) {
                cantidadVisibles++;
            }
        });

        // Ordenar los productos que cumplen los filtros.
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

        // Colocar primero los productos visibles.
        visiblesOrdenados.forEach(producto => {
            catalogo.appendChild(producto);
        });

        // Colocar al final los productos ocultos.
        productos
            .filter(producto => producto.hidden)
            .sort((a, b) =>
                Number(a.dataset.ordenOriginal) -
                Number(b.dataset.ordenOriginal)
            )
            .forEach(producto => {
                catalogo.appendChild(producto);
            });

        // Mostrar el mensaje si no hay coincidencias.
        sinResultados.hidden = cantidadVisibles > 0;
    }

    // Eventos de búsqueda y filtros.
    buscador?.addEventListener("input", aplicarFiltros);
    filtroCategoria?.addEventListener("change", aplicarFiltros);
    filtroPrecio?.addEventListener("change", aplicarFiltros);
    ordenPrecio?.addEventListener("change", aplicarFiltros);

    // Botón Buscar, si existe en el HTML.
    botonBuscar?.addEventListener("click", () => {
        aplicarFiltros();

        catalogo.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    // Buscar al presionar Enter.
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

    // Limpiar todos los filtros.
    botonLimpiar?.addEventListener("click", () => {
        if (buscador) buscador.value = "";
        if (filtroCategoria) filtroCategoria.value = "";
        if (filtroPrecio) filtroPrecio.value = "";
        if (ordenPrecio) ordenPrecio.value = "original";

        aplicarFiltros();
    });

    // Mostrar todos los productos al iniciar.
    aplicarFiltros();
}


    /* =========================================
       BUSCADOR DESPLEGABLE DEL ENCABEZADO
    ========================================= */

    const botonBuscarEncabezado = seleccionar(
        '.iconos button[title="Buscar"]'
    );

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
        <button type="button" id="cerrarBusqueda" aria-label="Cerrar búsqueda">
            ✕
        </button>
    `;

    if (botonBuscarEncabezado && document.querySelector("header")) {
        document.querySelector("header").after(barraBusqueda);

        const campoEncabezado = seleccionar("#buscadorEncabezado");

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

        seleccionar("#cerrarBusqueda").addEventListener("click", () => {
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

    /* =========================================
       BOTÓN DE FILTROS DEL ENCABEZADO
    ========================================= */

    const botonFiltros = seleccionar(
        '.iconos button[title="Filtros"]'
    );

    botonFiltros?.addEventListener("click", () => {
        const filtros = seleccionar(".catalogo-filtros");

        if (filtros) {
            filtros.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            filtros.classList.add("filtros-resaltados");

            setTimeout(() => {
                filtros.classList.remove("filtros-resaltados");
            }, 1200);
        }
    });

    /* =========================================
       FAVORITOS
    ========================================= */

    seleccionarTodos(".favorito").forEach((boton) => {
        boton.setAttribute(
            "aria-pressed",
            String(boton.classList.contains("activo"))
        );

        boton.addEventListener("click", () => {
            const activo = boton.classList.toggle("activo");

            boton.textContent = activo ? "♥" : "♡";
            boton.setAttribute("aria-pressed", String(activo));
            boton.setAttribute(
                "aria-label",
                activo ? "Quitar de favoritos" : "Agregar a favoritos"
            );
        });
    });
});

/* =========================================
   LUPA DEL ENCABEZADO: IR AL BUSCADOR
========================================= */

const botonBuscarCatalogo = document.getElementById("botonBuscarCatalogo");
const buscadorProductos = document.getElementById("buscadorProductos");

if (botonBuscarCatalogo && buscadorProductos) {
    botonBuscarCatalogo.addEventListener("click", function () {
        buscadorProductos.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        buscadorProductos.focus();
    });
}


/* =====================================
   FAVORITOS DE STREETWEAR CLUB
===================================== */

(() => {
    const CLAVE_FAVORITOS = "sc_favoritos";

    function leerFavoritos() {
        try {
            const datos = JSON.parse(localStorage.getItem(CLAVE_FAVORITOS));
            return Array.isArray(datos) ? datos : [];
        } catch {
            return [];
        }
    }

    function guardarFavoritos(datos) {
        localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(datos));
    }

    
function obtenerProducto(boton) {
    const tarjeta = boton.closest(".producto");
    if (!tarjeta) return null;

    const imagen = tarjeta.querySelector(".imagen-producto img");
    const nombre = tarjeta.querySelector(".info-producto h3");
    const categoria = tarjeta.querySelector(".categoria");
    const precio = tarjeta.querySelector(".precio strong");

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
        const favoritos = leerFavoritos();
        const ids = new Set(favoritos.map(producto => producto.id));

        document.querySelectorAll(".producto .favorito").forEach(boton => {
            const producto = obtenerProducto(boton);
            const activo = producto && ids.has(producto.id);

            boton.classList.toggle("activo", Boolean(activo));
            boton.textContent = activo ? "♥" : "♡";
            boton.setAttribute("aria-pressed", String(Boolean(activo)));
            boton.setAttribute(
                "aria-label",
                activo ? "Quitar de favoritos" : "Agregar a favoritos"
            );
            boton.title = activo ? "Quitar de favoritos" : "Agregar a favoritos";
        });
    }

    document.addEventListener("click", evento => {
        const boton = evento.target.closest(".producto .favorito");
        if (!boton) return;

        const producto = obtenerProducto(boton);
        if (!producto) return;

        const favoritos = leerFavoritos();
        const indice = favoritos.findIndex(item => item.id === producto.id);

        if (indice >= 0) {
            favoritos.splice(indice, 1);
        } else {
            favoritos.push(producto);
        }

        guardarFavoritos(favoritos);
        actualizarCorazones();
    });

    window.addEventListener("storage", evento => {
        if (evento.key === CLAVE_FAVORITOS) actualizarCorazones();
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", actualizarCorazones);
    } else {
        actualizarCorazones();
    }
})();
