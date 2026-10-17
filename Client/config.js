// URL del backend. En local usa localhost; en producción usa Render.
// Si tu servicio en Render tiene otro nombre, cambia PRODUCCION.
(function () {
    var LOCAL = 'http://localhost:3001';
    var PRODUCCION = 'https://sentir-backend-8ovd.onrender.com';
    var host = window.location.hostname;
    var esLocal = host === 'localhost' || host === '127.0.0.1' || host === '';
    var base = window.SENTIR_API_BASE || (esLocal ? LOCAL : PRODUCCION);
    window.SENTIR_API_BASE = base;
    if (base === LOCAL) return;

    var fetchOriginal = window.fetch;
    window.fetch = function (input, init) {
        if (typeof input === 'string' && input.indexOf(LOCAL) === 0) {
            input = base + input.slice(LOCAL.length);
        } else if (input && input.url && input.url.indexOf(LOCAL) === 0) {
            input = new Request(base + input.url.slice(LOCAL.length), input);
        }
        return fetchOriginal.call(this, input, init);
    };
})();
