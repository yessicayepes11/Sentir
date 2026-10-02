/* =========================================================
   "OJITO" PARA VER LA CONTRASEÑA

   Agrega a cada campo de contraseña de la página un botón con
   forma de ojo: al tocarlo se muestra la contraseña y al tocarlo
   otra vez se oculta.

   Uso: <script src="/Shared/PasswordToggle/PasswordToggle.js"></script>
   Para que un campo NO tenga ojito: data-password-toggle="off"
   (por ejemplo, si la página ya tiene su propio botón).
========================================================= */

(function () {

    const OJO_ABIERTO =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';

    const OJO_CERRADO =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.7 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-2.2 3.1"/><path d="M6.6 6.6C3.7 8.5 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="m2 2 20 20"/></svg>';

    const ESTILOS = `
        .pw-wrap {
            position: relative;
            display: flex;
            align-items: center;
            flex: 1 1 auto;
            width: 100%;
            min-width: 0;
        }
        .pw-wrap > input {
            flex: 1 1 auto;
            width: 100%;
            min-width: 0;
            padding-right: 44px !important;
        }
        .pw-toggle {
            position: absolute;
            top: 50%;
            right: 6px;
            width: 34px;
            height: 34px;
            display: grid;
            place-items: center;
            padding: 0;
            border: 0;
            border-radius: 50%;
            color: #7a7590;
            background: transparent;
            cursor: pointer;
            transform: translateY(-50%);
            transition: color 0.2s ease, background 0.2s ease;
        }
        .pw-toggle:hover,
        .pw-toggle:focus-visible {
            color: #6c4df6;
            background: rgba(108, 77, 246, 0.1);
            outline: none;
        }
        .pw-toggle svg {
            width: 19px;
            height: 19px;
            fill: none;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
        }`;

    function agregarEstilos() {
        if (document.getElementById("pwToggleStyles")) return;
        const estilo = document.createElement("style");
        estilo.id = "pwToggleStyles";
        estilo.textContent = ESTILOS;
        document.head.appendChild(estilo);
    }

    function pintarBoton(boton, visible) {
        boton.innerHTML = visible ? OJO_CERRADO : OJO_ABIERTO;
        boton.setAttribute("aria-label", visible ? "Ocultar contraseña" : "Mostrar contraseña");
        boton.setAttribute("aria-pressed", String(visible));
        boton.title = visible ? "Ocultar contraseña" : "Mostrar contraseña";
    }

    function agregarOjito(input) {
        if (input.dataset.passwordToggle === "off" || input.dataset.pwToggleListo) return;
        input.dataset.pwToggleListo = "1";

        const envoltura = document.createElement("span");
        envoltura.className = "pw-wrap";
        input.parentNode.insertBefore(envoltura, input);
        envoltura.appendChild(input);

        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "pw-toggle";
        pintarBoton(boton, false);
        envoltura.appendChild(boton);

        boton.addEventListener("click", function (event) {
            event.preventDefault();
            const visible = input.type === "password";
            input.type = visible ? "text" : "password";
            pintarBoton(boton, visible);

            // El cursor vuelve al final de lo escrito
            input.focus();
            const largo = input.value.length;
            try { input.setSelectionRange(largo, largo); } catch (error) { /* algunos tipos no lo permiten */ }
        });

        // Si el formulario se envía o se limpia, la contraseña vuelve a ocultarse
        const formulario = input.form;
        if (formulario && !formulario.dataset.pwToggleReset) {
            formulario.dataset.pwToggleReset = "1";
            const ocultarTodo = function () {
                formulario.querySelectorAll(".pw-wrap > input").forEach(function (campo) {
                    campo.type = "password";
                    const suBoton = campo.parentNode.querySelector(".pw-toggle");
                    if (suBoton) pintarBoton(suBoton, false);
                });
            };
            formulario.addEventListener("submit", ocultarTodo);
            formulario.addEventListener("reset", ocultarTodo);
        }
    }

    function revisar(raiz) {
        (raiz || document).querySelectorAll('input[type="password"]').forEach(agregarOjito);
    }

    function iniciar() {
        agregarEstilos();
        revisar(document);

        // Campos de contraseña que aparecen después (ventanas que se crean con JavaScript)
        new MutationObserver(function (cambios) {
            cambios.forEach(function (cambio) {
                cambio.addedNodes.forEach(function (nodo) {
                    if (nodo.nodeType !== 1) return;
                    if (nodo.matches && nodo.matches('input[type="password"]')) agregarOjito(nodo);
                    else if (nodo.querySelectorAll) revisar(nodo);
                });
            });
        }).observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }

})();
