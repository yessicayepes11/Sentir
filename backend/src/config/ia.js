// =========================================================
// PROVEEDOR DE IA (compartido por el asistente, las insignias y los recursos)
//
// Se usa el primero que tenga clave en el .env:
//   1) Groq (plan gratuito):  GROQ_API_KEY=gsk_...   GROQ_MODEL=openai/gpt-oss-120b
//   2) OpenAI (de pago):      OPENAI_API_KEY=sk-...  OPENAI_MODEL=gpt-4o-mini
// Los dos usan el mismo formato de API ("chat completions").
// =========================================================

const PROVEEDORES = [
    {
        nombre: 'Groq',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        clave: () => process.env.GROQ_API_KEY,
        modelo: () => process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
    },
    {
        nombre: 'OpenAI',
        url: 'https://api.openai.com/v1/chat/completions',
        clave: () => process.env.OPENAI_API_KEY,
        modelo: () => process.env.OPENAI_MODEL || 'gpt-4o-mini'
    }
];

// El primer proveedor que tenga clave configurada
export function proveedorActivo() {
    const proveedor = PROVEEDORES.find((p) => String(p.clave() || '').trim());
    if (!proveedor) return null;
    return {
        nombre: proveedor.nombre,
        url: proveedor.url,
        clave: String(proveedor.clave()).trim(),
        modelo: String(proveedor.modelo()).trim()
    };
}

// Pide a la IA una respuesta en JSON y la devuelve ya convertida en objeto.
// Lanza un error si no hay proveedor, si la IA falla o si no responde JSON válido.
export async function pedirJSON(instrucciones, pedido, { temperatura = 0.9, maxTokens = 2500, esperaMs = 45000 } = {}) {
    const ia = proveedorActivo();
    if (!ia) throw new Error('no hay proveedor de IA configurado');

    const razona = /gpt-oss/i.test(ia.modelo);

    const llamar = async (conFormatoJSON) => {
        const controlador = new AbortController();
        const temporizador = setTimeout(() => controlador.abort(), esperaMs);

        try {
            const respuesta = await fetch(ia.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ia.clave}` },
                body: JSON.stringify({
                    model: ia.modelo,
                    messages: [
                        { role: 'system', content: instrucciones },
                        { role: 'user', content: pedido }
                    ],
                    temperature: temperatura,
                    max_tokens: razona ? maxTokens + 2000 : maxTokens,
                    ...(razona ? { reasoning_effort: 'low' } : {}),
                    ...(conFormatoJSON ? { response_format: { type: 'json_object' } } : {})
                }),
                signal: controlador.signal
            });

            const datos = await respuesta.json().catch(() => ({}));
            return { ok: respuesta.ok, status: respuesta.status, datos };
        } finally {
            clearTimeout(temporizador);
        }
    };

    let resultado = await llamar(true);

    // Algunos modelos fallan al forzar JSON: se reintenta pidiéndolo solo con las instrucciones
    if (!resultado.ok && resultado.status === 400) {
        resultado = await llamar(false);
    }

    if (!resultado.ok) {
        throw new Error(`${ia.nombre} respondió ${resultado.status}: ${resultado.datos?.error?.message || ''}`);
    }

    const contenido = String(resultado.datos?.choices?.[0]?.message?.content || '');
    const inicio = contenido.indexOf('{');
    const fin = contenido.lastIndexOf('}');

    if (inicio < 0 || fin <= inicio) throw new Error('la IA no respondió JSON');

    return {
        json: JSON.parse(contenido.slice(inicio, fin + 1)),
        generadoPor: `${ia.nombre} ${ia.modelo}`.slice(0, 40)
    };
}

// Conversación normal (texto libre, sin JSON). mensajes: [{ role: 'user'|'assistant', content }]
export async function pedirTexto(instrucciones, mensajes, { temperatura = 0.6, maxTokens = 700, esperaMs = 45000 } = {}) {
    const ia = proveedorActivo();
    if (!ia) throw new Error('no hay proveedor de IA configurado');

    const razona = /gpt-oss/i.test(ia.modelo);
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), esperaMs);

    try {
        const respuesta = await fetch(ia.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ia.clave}` },
            body: JSON.stringify({
                model: ia.modelo,
                messages: [{ role: 'system', content: instrucciones }, ...mensajes],
                temperature: temperatura,
                max_tokens: razona ? maxTokens + 1500 : maxTokens,
                ...(razona ? { reasoning_effort: 'low' } : {})
            }),
            signal: controlador.signal
        });

        const datos = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok) throw new Error(`${ia.nombre} respondió ${respuesta.status}: ${datos?.error?.message || ''}`);

        const texto = String(datos?.choices?.[0]?.message?.content || '').trim();
        if (!texto) throw new Error('la IA respondió vacío');
        return texto;
    } finally {
        clearTimeout(temporizador);
    }
}
