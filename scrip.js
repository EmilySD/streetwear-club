const track = document.getElementById("carruselTrack");

const botonAnterior = document.getElementById("anterior");

const botonSiguiente = document.getElementById("siguiente");

let slides = Array.from(
    document.querySelectorAll(".slide")
);

let posicion = 0;

let anchoSlide = 0;

let maxPosicion = 0;

let intervalo;

const puntos = document.querySelectorAll(".punto");



function calcularSlide() {

    if (slides.length === 0) {
        return;
    }

    const slide = slides[0];

    const estilo =
        window.getComputedStyle(track);

    const gap =
        parseFloat(estilo.gap) || 0;

    anchoSlide =
        slide.offsetWidth + gap;


    const carrusel =
        document.querySelector(".carrusel");



    const maxDesplazamiento =
        track.scrollWidth - carrusel.clientWidth;



    maxPosicion =
        Math.max(
            0,
            Math.ceil(
                maxDesplazamiento / anchoSlide
            )
        );



    if (posicion > maxPosicion) {

        posicion = maxPosicion;

    }

}



function moverCarrusel() {

    const carrusel = document.querySelector(".carrusel");

    const maxDesplazamiento =
        track.scrollWidth - carrusel.clientWidth;


    let desplazamiento =
        posicion * anchoSlide;


    desplazamiento =
        Math.min(desplazamiento, maxDesplazamiento);


    track.style.transform =
        `translateX(-${desplazamiento}px)`;




    puntos.forEach((punto, indice) => {

        punto.classList.remove("activo");

        if (indice === posicion) {

            punto.classList.add("activo");

        }

    });

}

puntos.forEach((punto) => {

    punto.addEventListener("click", () => {

        posicion = Number(punto.dataset.slide);

        track.style.transition =
            "transform 0.6s ease";

        moverCarrusel();

        reiniciarAutomatico();

    });

});


function siguienteSlide() {

    posicion++;

    if (posicion > maxPosicion) {

        posicion = 0;

    }


    track.style.transition =
        "transform 0.6s ease";

    moverCarrusel();

}



function anteriorSlide() {

    posicion--;

    if (posicion < 0) {

        posicion = maxPosicion;

    }


    track.style.transition =
        "transform 0.6s ease";

    moverCarrusel();

}



botonSiguiente.addEventListener(
    "click",
    () => {

        siguienteSlide();

        reiniciarAutomatico();

    }
);


botonAnterior.addEventListener(
    "click",
    () => {

        anteriorSlide();

        reiniciarAutomatico();

    }
);



function iniciarAutomatico() {

    intervalo = setInterval(() => {

        siguienteSlide();

    }, 3000);

}


function detenerAutomatico() {

    clearInterval(intervalo);

}


function reiniciarAutomatico() {

    detenerAutomatico();

    iniciarAutomatico();

}



const carrusel =
    document.querySelector(".carrusel");

carrusel.addEventListener(
    "mouseenter",
    detenerAutomatico
);

carrusel.addEventListener(
    "mouseleave",
    iniciarAutomatico
);



window.addEventListener(
    "resize",
    () => {

        calcularSlide();

        moverCarrusel();

    }
);


/* =========================================
   MODO OSCURO
========================================= */

const modoOscuro =
    document.getElementById("modoOscuro");

modoOscuro.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "modo-oscuro"
        );

    }
);



calcularSlide();

moverCarrusel();

iniciarAutomatico();




const botonBuscar = document.querySelector('.iconos button[title="Buscar"]');
const productos = document.querySelectorAll(".producto");

const barraBusqueda = document.createElement("div");

barraBusqueda.className = "barra-busqueda";

barraBusqueda.innerHTML = `
    <input 
        type="text" 
        id="buscador" 
        placeholder="Buscar productos..."
        autocomplete="off"
    >
    <button id="cerrarBusqueda" type="button">✕</button>
`;

document.querySelector("header").after(barraBusqueda);

const mensajeNoEncontrado = document.createElement("p");

mensajeNoEncontrado.className = "mensaje-no-encontrado";
mensajeNoEncontrado.textContent = "Producto no encontrado :(";
mensajeNoEncontrado.style.display = "none";

document.querySelector(".catalogo-ropa").prepend(mensajeNoEncontrado);

botonBuscar.addEventListener("click", function () {
    barraBusqueda.classList.add("activa");
    document.getElementById("buscador").focus();
});

document.getElementById("buscador").addEventListener("input", function () {

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

document.getElementById("buscador").addEventListener("keydown", function (evento) {

    if (evento.key === "Enter") {

        evento.preventDefault();

        const texto = this.value.toLowerCase().trim();

        if (texto !== "") {
            document.getElementById("catalogo").scrollIntoView({
                behavior: "smooth"
            });
        }

    }

});

document.getElementById("cerrarBusqueda").addEventListener("click", function () {

    barraBusqueda.classList.remove("activa");

    document.getElementById("buscador").value = "";

    productos.forEach(function (producto) {
        producto.style.display = "";
    });

    mensajeNoEncontrado.style.display = "none";

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