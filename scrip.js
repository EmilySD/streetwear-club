const track = document.getElementById("carruselTrack");

const botonAnterior = document.getElementById("anterior");

const botonSiguiente = document.getElementById("siguiente");

let slides = Array.from(
    document.querySelectorAll(".slide")
);

let posicion = 0;

let anchoSlide = 0;

let intervalo;



function calcularSlide() {

    if (slides.length === 0) {
        return;
    }

    const slide = slides[0];

    const estilo = window.getComputedStyle(track);

    const gap = parseFloat(estilo.gap) || 0;

    anchoSlide = slide.offsetWidth + gap;
}



function moverCarrusel() {

    track.style.transform =
        `translateX(-${posicion * anchoSlide}px)`;

}



function siguienteSlide() {

    posicion++;


    if (posicion >= slides.length) {

        posicion = 0;

        track.style.transition = "none";

        moverCarrusel();

        setTimeout(() => {

            track.style.transition =
                "transform 0.6s ease";

        }, 50);

        return;
    }

    track.style.transition =
        "transform 0.6s ease";

    moverCarrusel();
}



function anteriorSlide() {

    posicion--;

    if (posicion < 0) {

        posicion = slides.length - 1;

        track.style.transition = "none";

        moverCarrusel();

        setTimeout(() => {

            track.style.transition =
                "transform 0.6s ease";

        }, 50);

        return;
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