document.addEventListener("DOMContentLoaded", () => {
    const establecimientos = {
        insane: {
            nombre: "Insane Co.",
            direccion: "Gral. Francisco Villa 402, colonia Gremial, Aguascalientes",
            coordenadas: [21.8890, -102.2960],
            zoom: 17
        },
        looseblues: {
            nombre: "Loose Blues",
            direccion: "Calle Dinamarca 44, colonia Juárez, Ciudad de México",
            coordenadas: [19.4278, -99.1585],
            zoom: 17
        }
    };

    const mapaElemento = document.getElementById("mapaSucursales");

    if (!mapaElemento) return;

    if (typeof L === "undefined") {
        mapaElemento.innerHTML = "No se pudo cargar el mapa. Comprueba tu conexión a internet.";
        console.error("Leaflet no está disponible.");
        return;
    }

    const mapa = L.map("mapaSucursales", {
        scrollWheelZoom: true,
        zoomControl: true
    }).setView([21.5, -101.5], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);

    Object.keys(establecimientos).forEach(clave => {
        const establecimiento = establecimientos[clave];

        const marcador = L.marker(establecimiento.coordenadas).addTo(mapa);

        marcador.bindPopup(`
            <div class="popup-sucursal">
                <strong>${establecimiento.nombre}</strong>
                <p>${establecimiento.direccion}</p>
                <small>Establecimiento independiente</small>
            </div>
        `);

        establecimiento.marcador = marcador;
    });

    const botones = document.querySelectorAll(".boton-mapa");

    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            const clave = boton.dataset.sucursal;
            const establecimiento = establecimientos[clave];

            if (!establecimiento) return;

            mapa.flyTo(establecimiento.coordenadas, establecimiento.zoom, {
                animate: true,
                duration: 1.5
            });

            establecimiento.marcador.openPopup();
        });
    });

    setTimeout(() => {
        mapa.invalidateSize();
    }, 300);

    window.addEventListener("resize", () => {
        mapa.invalidateSize();
    });
});