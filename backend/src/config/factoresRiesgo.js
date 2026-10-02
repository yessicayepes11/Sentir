// =========================================================
// CATÁLOGO DE FACTORES DE RIESGO PSICOSOCIAL (estudiantes)
//
// Lo usan:
//   - routes/Asistente/Asistente.js -> clasifica los mensajes del chat de IA
//   - routes/Ayuda/Ayuda.js         -> guarda la alerta y avisa a psicología
//
// Cada factor tiene:
//   codigo    -> identificador fijo (es lo que se guarda en la base de datos)
//   nombre    -> texto que ve la psicóloga
//   categoria -> grupo al que pertenece
//   nivel     -> gravedad base: bajo | medio | alto | critico
//   palabras  -> expresiones que lo delatan (en minúscula y SIN tildes)
//
// IMPORTANTE: esto NO es un diagnóstico. Es una alerta temprana para que
// el psicólogo/a valore el caso. La lista de palabras debe revisarla y
// ampliarla la psicóloga del colegio con las expresiones de los estudiantes.
// =========================================================

export const NIVELES = ['bajo', 'medio', 'alto', 'critico'];

export const NOMBRE_NIVEL = {
    bajo: 'Bajo',
    medio: 'Medio',
    alto: 'Alto',
    critico: 'Crítico'
};

export const FACTORES = [

    // ---------- 1. Riesgo para la vida ----------
    {
        codigo: 'ideacion_suicida', nombre: 'Ideación suicida', categoria: 'Riesgo para la vida', nivel: 'alto',
        palabras: ['suicid', 'no quiero vivir', 'quiero morir', 'me quiero morir', 'quiero morirme', 'quitarme la vida',
            'acabar con mi vida', 'mejor muerto', 'mejor muerta', 'desaparecer para siempre', 'no despertar',
            'seria mejor si no existiera', 'el mundo estaria mejor sin mi', 'matarme', 'me quiero matar']
    },
    {
        codigo: 'plan_intento_suicida', nombre: 'Plan o intento suicida', categoria: 'Riesgo para la vida', nivel: 'critico',
        palabras: ['tengo un plan', 'ya lo intente', 'lo voy a hacer', 'esta noche lo hago', 'me voy a tomar las pastillas',
            'tome pastillas', 'me voy a tirar', 'me voy a lanzar', 'me voy a colgar', 'despedirme de todos', 'carta de despedida',
            'intente matarme', 'intente suicid']
    },
    {
        codigo: 'autolesion', nombre: 'Autolesiones', categoria: 'Riesgo para la vida', nivel: 'alto',
        palabras: ['hacerme dano', 'me hago dano', 'lastimarme', 'me lastimo', 'cortarme', 'me corto', 'me cortes', 'autoles',
            'me quemo', 'me golpeo yo', 'me rasguno', 'castigarme']
    },
    {
        codigo: 'desesperanza', nombre: 'Desesperanza', categoria: 'Riesgo para la vida', nivel: 'alto',
        palabras: ['nada vale la pena', 'no tiene sentido vivir', 'no tengo futuro', 'nada va a cambiar', 'ya no aguanto',
            'no puedo mas', 'estoy cansado de vivir', 'estoy cansada de vivir', 'soy una carga']
    },

    // ---------- 2. Violencias ----------
    {
        codigo: 'abuso_sexual', nombre: 'Abuso o violencia sexual', categoria: 'Violencias', nivel: 'critico',
        palabras: ['abuso sexual', 'abusan de mi', 'abuso de mi', 'me toca sin', 'me tocan sin', 'me toco sin', 'me violaron',
            'violacion', 'me obliga a', 'tocamientos', 'me manosea', 'partes intimas']
    },
    {
        codigo: 'violencia_intrafamiliar', nombre: 'Violencia o maltrato en el hogar', categoria: 'Violencias', nivel: 'alto',
        palabras: ['me pegan', 'me golpea', 'me golpean', 'me maltrata', 'maltrato', 'me pega mi', 'violencia en mi casa',
            'mi papa le pega', 'mi mama le pega', 'tengo miedo de ir a mi casa', 'me encierran', 'me dejan sin comer']
    },
    {
        codigo: 'negligencia', nombre: 'Negligencia o abandono', categoria: 'Violencias', nivel: 'medio',
        palabras: ['nadie me cuida', 'me dejan solo', 'me dejan sola', 'no hay nadie en mi casa', 'me abandonaron',
            'no tengo quien me cuide', 'no me llevan al medico']
    },
    {
        codigo: 'acoso_escolar', nombre: 'Acoso escolar (bullying)', categoria: 'Violencias', nivel: 'medio',
        palabras: ['bullying', 'matoneo', 'me molestan en el colegio', 'se burlan de mi', 'me hacen bullying', 'me excluyen',
            'me empujan', 'me quitan mis cosas', 'me ponen apodos', 'me amenazan en el colegio']
    },
    {
        codigo: 'ciberacoso', nombre: 'Ciberacoso', categoria: 'Violencias', nivel: 'medio',
        palabras: ['ciberacoso', 'ciberbullying', 'me molestan por redes', 'publicaron fotos mias', 'me hackearon',
            'grupo de whatsapp contra mi', 'se burlan en redes', 'memes de mi']
    },
    {
        codigo: 'grooming_sextorsion', nombre: 'Grooming o sextorsión', categoria: 'Violencias', nivel: 'critico',
        palabras: ['me pide fotos', 'me pidio fotos', 'fotos intimas', 'fotos desnud', 'me chantajea', 'sextorsion',
            'un adulto me escribe', 'un señor me escribe', 'un senor me escribe', 'si no le mando', 'va a publicar mis fotos',
            'fotos sin ropa', 'que le mande fotos', 'me pide que le mande', 'mandar fotos', 'mande fotos', 'fotos en ropa interior',
            'me pide video', 'videollamada desnud']
    },
    {
        codigo: 'violencia_pareja', nombre: 'Violencia en el noviazgo', categoria: 'Violencias', nivel: 'alto',
        palabras: ['mi novio me pega', 'mi novia me pega', 'mi novio me controla', 'mi novia me controla', 'mi novio me obliga',
            'mi novia me obliga', 'mi novio me amenaza', 'mi novia me amenaza', 'celos de mi novio']
    },
    {
        codigo: 'reclutamiento_grupos', nombre: 'Riesgo por grupos armados, pandillas o combos', categoria: 'Violencias', nivel: 'alto',
        palabras: ['reclutar', 'me quieren meter al combo', 'pandilla', 'grupo armado', 'me ofrecen plata por llevar',
            'me ofrecieron trabajar para', 'me amenazaron de muerte', 'me van a matar']
    },

    // ---------- 3. Salud mental ----------
    {
        codigo: 'sintomas_depresivos', nombre: 'Tristeza persistente o síntomas depresivos', categoria: 'Salud mental', nivel: 'medio',
        palabras: ['siempre estoy triste', 'triste todo el tiempo', 'deprimid', 'depresion', 'lloro todos los dias',
            'no tengo ganas de nada', 'nada me hace feliz', 'me siento vacio', 'me siento vacia', 'no siento nada']
    },
    {
        codigo: 'ansiedad', nombre: 'Ansiedad o ataques de pánico', categoria: 'Salud mental', nivel: 'medio',
        palabras: ['ansiedad', 'ataque de panico', 'ataques de panico', 'no puedo respirar', 'el corazon me late muy rapido',
            'me da miedo todo', 'nervios todo el tiempo', 'me preocupo por todo']
    },
    {
        codigo: 'conducta_alimentaria', nombre: 'Conductas alimentarias de riesgo', categoria: 'Salud mental', nivel: 'alto',
        palabras: ['no como', 'dejo de comer', 'me provoco el vomito', 'vomitar despues de comer', 'me siento gorda',
            'me siento gordo', 'odio mi cuerpo', 'contar calorias', 'laxantes', 'anorexia', 'bulimia', 'atracones']
    },
    {
        codigo: 'consumo_sustancias', nombre: 'Consumo de alcohol o sustancias', categoria: 'Salud mental', nivel: 'medio',
        palabras: ['marihuana', 'cripy', 'perico', 'cocaina', 'drogas', 'me drogo', 'pepas', 'tusi', 'popper', 'borracho',
            'borracha', 'tomo alcohol', 'trago', 'vape', 'vapeo', 'pegante', 'sacol']
    },
    {
        codigo: 'sintomas_psicoticos', nombre: 'Alteraciones de la percepción (voces, visiones)', categoria: 'Salud mental', nivel: 'alto',
        palabras: ['escucho voces', 'oigo voces', 'las voces me dicen', 'veo cosas que nadie ve', 'me persiguen y nadie me cree']
    },
    {
        codigo: 'trauma', nombre: 'Evento traumático', categoria: 'Salud mental', nivel: 'medio',
        palabras: ['vi como mataron', 'presencie', 'me robaron con', 'tengo pesadillas de', 'no puedo olvidar lo que paso']
    },
    {
        codigo: 'duelo', nombre: 'Duelo o pérdida', categoria: 'Salud mental', nivel: 'bajo',
        palabras: ['se murio', 'murio mi', 'fallecio', 'perdi a mi', 'extrano a mi abuel', 'el funeral']
    },
    {
        codigo: 'problemas_sueno', nombre: 'Problemas de sueño', categoria: 'Salud mental', nivel: 'bajo',
        palabras: ['no puedo dormir', 'no duermo', 'insomnio', 'pesadillas', 'duermo todo el dia']
    },

    // ---------- 4. Familia y entorno ----------
    {
        codigo: 'conflicto_familiar', nombre: 'Conflicto familiar o separación', categoria: 'Familia y entorno', nivel: 'bajo',
        palabras: ['mis papas pelean', 'mis padres pelean', 'se separaron', 'se van a separar', 'divorcio', 'peleas en mi casa',
            'mi papa se fue', 'mi mama se fue']
    },
    {
        codigo: 'aislamiento_social', nombre: 'Aislamiento o soledad', categoria: 'Familia y entorno', nivel: 'medio',
        palabras: ['no tengo amigos', 'estoy solo', 'estoy sola', 'nadie me quiere', 'nadie me entiende', 'me siento solo',
            'me siento sola', 'no le importo a nadie', 'no hablo con nadie']
    },
    {
        codigo: 'embarazo_adolescente', nombre: 'Embarazo adolescente', categoria: 'Familia y entorno', nivel: 'medio',
        palabras: ['estoy embarazada', 'creo que estoy embarazada', 'embaraze a', 'mi novia esta embarazada', 'prueba de embarazo']
    },
    {
        codigo: 'trabajo_infantil', nombre: 'Trabajo infantil o situación de calle', categoria: 'Familia y entorno', nivel: 'alto',
        palabras: ['tengo que trabajar', 'me ponen a trabajar', 'trabajo en la calle', 'vendo en la calle', 'duermo en la calle',
            'no tengo donde vivir']
    },
    {
        codigo: 'necesidades_basicas', nombre: 'Necesidades básicas insatisfechas', categoria: 'Familia y entorno', nivel: 'medio',
        palabras: ['no hay comida', 'no tengo que comer', 'aguanto hambre', 'nos van a sacar de la casa', 'no tenemos plata para comer']
    },
    {
        codigo: 'discriminacion', nombre: 'Discriminación', categoria: 'Familia y entorno', nivel: 'medio',
        palabras: ['por ser gay', 'por ser lesbiana', 'por ser trans', 'por mi color', 'por ser negro', 'por ser negra',
            'por ser venezolan', 'por mi discapacidad', 'por ser indigena', 'me discriminan', 'racismo']
    },
    {
        codigo: 'desplazamiento_migracion', nombre: 'Desplazamiento o migración', categoria: 'Familia y entorno', nivel: 'medio',
        palabras: ['desplazados', 'nos desplazaron', 'nos tocó irnos', 'nos toco irnos', 'llegue de venezuela', 'deje a mi familia en']
    },

    // ---------- 5. Entorno escolar ----------
    {
        codigo: 'estres_academico', nombre: 'Estrés académico', categoria: 'Entorno escolar', nivel: 'bajo',
        palabras: ['voy a perder el año', 'perder el ano', 'muchas tareas', 'estres por los examenes', 'me fue mal en el examen',
            'no entiendo nada en clase']
    },
    {
        codigo: 'riesgo_desercion', nombre: 'Riesgo de deserción escolar', categoria: 'Entorno escolar', nivel: 'medio',
        palabras: ['me voy a salir del colegio', 'no quiero volver al colegio', 'quiero dejar de estudiar', 'me van a sacar del colegio',
            'ya no voy a estudiar']
    },
    {
        codigo: 'conductas_riesgo', nombre: 'Conductas de riesgo (peleas, armas, retos peligrosos)', categoria: 'Entorno escolar', nivel: 'medio',
        palabras: ['traje un cuchillo', 'porte de armas', 'navaja', 'me voy a agarrar a pelear', 'reto de tiktok', 'reto peligroso',
            'me voy a vengar']
    }
];

// Expresiones que vuelven CRÍTICO cualquier caso (inmediatez o medios)
const PALABRAS_INMINENCIA = ['esta noche', 'hoy mismo', 'ahora mismo', 'ya tengo las pastillas', 'ya tengo con que',
    'me voy a despedir', 'es la ultima vez', 'nadie me va a volver a ver'];

// Cómo lo escribe un DOCENTE (tercera persona) en las alertas de "Mis estudiantes".
// Las de arriba están en primera persona, como escribe el estudiante en el chat.
const TERCERA_PERSONA = {
    ideacion_suicida: ['quiere morir', 'quiere morirse', 'se quiere morir', 'no quiere vivir', 'quitarse la vida',
        'acabar con su vida', 'matarse', 'se quiere matar', 'se va a matar', 'piensa en morir', 'habla de morir',
        'habla de la muerte', 'ideas de muerte', 'pensamientos de muerte'],
    plan_intento_suicida: ['intento matarse', 'intento quitarse la vida', 'tiene un plan', 'se tomo unas pastillas',
        'se tomo pastillas', 'se va a tirar', 'se va a lanzar', 'se va a colgar', 'carta de despedida', 'se esta despidiendo'],
    autolesion: ['se corta', 'se cortaba', 'cortes en', 'cortadas en', 'se hace dano', 'se lastima', 'se autolesiona',
        'se quema', 'se golpea a si mism', 'heridas en los brazos', 'marcas en los brazos'],
    desesperanza: ['ya no aguanta', 'no puede mas', 'dice que nada vale la pena', 'no le ve sentido', 'cansado de vivir',
        'cansada de vivir', 'dice que es una carga'],
    abuso_sexual: ['abusan de el', 'abusan de ella', 'abusaron de', 'lo tocan', 'la tocan', 'lo manosean', 'la manosean',
        'lo violaron', 'la violaron'],
    violencia_intrafamiliar: ['le pegan', 'lo golpean', 'la golpean', 'lo maltratan', 'la maltratan', 'moretones',
        'golpes en', 'miedo de ir a su casa', 'violencia en su casa', 'lo dejan sin comer', 'la dejan sin comer'],
    grooming_sextorsion: ['le piden fotos', 'le pide fotos', 'lo chantajean', 'la chantajean', 'un adulto le escribe'],
    reclutamiento_grupos: ['lo quieren reclutar', 'la quieren reclutar', 'lo amenazaron de muerte', 'la amenazaron de muerte'],
    conducta_alimentaria: ['no come', 'dejo de comer', 'se provoca el vomito', 'vomita despues de comer'],
    necesidades_basicas: ['llega sin comer', 'aguanta hambre', 'pasa hambre', 'no tiene que comer']
};

FACTORES.forEach((factor) => {
    if (TERCERA_PERSONA[factor.codigo]) factor.palabras.push(...TERCERA_PERSONA[factor.codigo]);
});

// Las expresiones se comparan sin tildes ni ñ: se normalizan una sola vez al cargar
FACTORES.forEach((factor) => { factor.palabras = factor.palabras.map((palabra) => normalizarTexto(palabra)); });
PALABRAS_INMINENCIA.forEach((palabra, i) => { PALABRAS_INMINENCIA[i] = normalizarTexto(palabra); });

const POR_CODIGO = new Map(FACTORES.map((factor) => [factor.codigo, factor]));

export function normalizarTexto(texto) {
    return String(texto || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function nivelMayor(a, b) {
    return NIVELES.indexOf(a) >= NIVELES.indexOf(b) ? a : b;
}

// Deja solo códigos que existan en el catálogo (nunca se confía en texto libre)
export function codigosValidos(lista) {
    return [...new Set((Array.isArray(lista) ? lista : []).map(String).filter((codigo) => POR_CODIGO.has(codigo)))];
}

export function nivelValido(nivel) {
    return NIVELES.includes(nivel) ? nivel : '';
}

export function nombresDe(codigos) {
    return codigosValidos(codigos).map((codigo) => POR_CODIGO.get(codigo).nombre);
}

// Nivel mínimo que corresponde a un conjunto de factores (el más grave de ellos)
export function nivelDeFactores(codigos) {
    return codigosValidos(codigos).reduce((nivel, codigo) => nivelMayor(POR_CODIGO.get(codigo).nivel, nivel), 'bajo');
}

// Clasificación por palabras clave (respaldo de la IA)
export function clasificarTexto(texto) {
    const limpio = normalizarTexto(texto);
    const factores = FACTORES
        .filter((factor) => factor.palabras.some((palabra) => limpio.includes(palabra)))
        .map((factor) => factor.codigo);

    let nivel = factores.length ? nivelDeFactores(factores) : '';

    // Señales de inmediatez junto a cualquier factor de riesgo para la vida -> crítico
    const riesgoVital = factores.some((codigo) => POR_CODIGO.get(codigo).categoria === 'Riesgo para la vida');
    if (riesgoVital && PALABRAS_INMINENCIA.some((palabra) => limpio.includes(palabra))) {
        nivel = 'critico';
    }

    return { factores, nivel };
}

// Texto del catálogo para las instrucciones de la IA
export function catalogoParaIA() {
    return FACTORES.map((factor) => `- ${factor.codigo}: ${factor.nombre} (${factor.categoria}, nivel base ${factor.nivel})`).join('\n');
}

// A partir de qué nivel el chat le OFRECE al estudiante avisar a psicología
export const NIVEL_PARA_OFRECER_AYUDA = 'medio';

export function debeOfrecerAyuda(nivel) {
    return Boolean(nivel) && NIVELES.indexOf(nivel) >= NIVELES.indexOf(NIVEL_PARA_OFRECER_AYUDA);
}
