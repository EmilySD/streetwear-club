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

document.querySelector(".catalogo-total").prepend(mensajeNoEncontrado);

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
            document.querySelector(".catalogo-total").scrollIntoView({
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