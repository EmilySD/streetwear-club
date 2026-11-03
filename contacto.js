document.addEventListener("DOMContentLoaded", () => {
    const botonModo = document.getElementById("modoOscuro");
    const modoGuardado = localStorage.getItem("sc_modo_oscuro");

    if (modoGuardado === "activado") {
        document.body.classList.add("modo-oscuro");
    }

    if (botonModo) {
        botonModo.addEventListener("click", () => {
            document.body.classList.toggle("modo-oscuro");

            const modoActivo = document.body.classList.contains("modo-oscuro");

            localStorage.setItem(
                "sc_modo_oscuro",
                modoActivo ? "activado" : "desactivado"
            );
        });
    }

    const formulario = document.getElementById("formularioContacto");
    const campoNombre = document.getElementById("nombre");
    const campoCorreo = document.getElementById("correo");
    const campoAsunto = document.getElementById("asunto");
    const campoMensaje = document.getElementById("mensaje");
    const campoAceptar = document.getElementById("aceptar");
    const mensajeEstado = document.getElementById("mensajeEstado");

    const correoDestino = "2femilyalejandra@gmail.com";

    function correoValido(correo) {
        const expresion = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return expresion.test(correo);
    }

    function mostrarEstado(texto, tipo) {
        mensajeEstado.textContent = texto;
        mensajeEstado.className = "mensaje-estado " + tipo;
    }

    if (formulario) {
        formulario.addEventListener("submit", (evento) => {
            evento.preventDefault();

            const nombre = campoNombre.value.trim();
            const correo = campoCorreo.value.trim();
            const asunto = campoAsunto.value;
            const mensaje = campoMensaje.value.trim();
            const aceptar = campoAceptar.checked;

            if (nombre.length < 3) {
                mostrarEstado("Escribe un nombre de al menos 3 caracteres.", "error");
                campoNombre.focus();
                return;
            }

            if (!correoValido(correo)) {
                mostrarEstado("Escribe un correo electrónico válido.", "error");
                campoCorreo.focus();
                return;
            }

            if (asunto === "") {
                mostrarEstado("Selecciona el asunto de tu mensaje.", "error");
                campoAsunto.focus();
                return;
            }

            if (mensaje.length < 10) {
                mostrarEstado("El mensaje debe contener al menos 10 caracteres.", "error");
                campoMensaje.focus();
                return;
            }

            if (!aceptar) {
                mostrarEstado("Debes confirmar tus datos antes de continuar.", "error");
                campoAceptar.focus();
                return;
            }

            if (correoDestino === "TU_CORREO@EJEMPLO.COM" || !correoValido(correoDestino)) {
                mostrarEstado("Primero configura el correo de destino en contacto.js.", "error");
                return;
            }

            const asuntoCorreo = encodeURIComponent("Contacto SC - " + asunto);

            const contenidoCorreo = encodeURIComponent(
                "MENSAJE DE CONTACTO - STREETWEAR CLUB\n\n" +
                "Nombre: " + nombre + "\n" +
                "Correo del cliente: " + correo + "\n" +
                "Asunto: " + asunto + "\n\n" +
                "Mensaje:\n" + mensaje
            );

            const enlaceCorreo = "mailto:" + correoDestino +
                "?subject=" + asuntoCorreo +
                "&body=" + contenidoCorreo;

            mostrarEstado("Abriendo tu aplicación de correo...", "exito");
            window.location.href = enlaceCorreo;
        });
    }

    const campos = [
        campoNombre,
        campoCorreo,
        campoAsunto,
        campoMensaje
    ];

    campos.forEach((campo) => {
        if (campo) {
            campo.addEventListener("input", () => {
                mensajeEstado.textContent = "";
                mensajeEstado.className = "mensaje-estado";
            });
        }
    });
});
