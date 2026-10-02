import { Router } from 'express';
import { connection } from '../../config/mysql/dbmysql.js';
import { leerTokenEstudiante } from '../../config/studentToken.js';
import { pedirJSON } from '../../config/ia.js';

// =========================================================
// INSIGNIAS Y RECURSOS (Mi espacio personal)
//
// Cada insignia pertenece a un tipo de recurso:
//   respiracion -> ejercicios de respiración (Recursos > Respiraciones)
//   meditacion  -> meditaciones guiadas      (Recursos > Meditaciones)
//   autocuidado -> retos de autocuidado      (Recursos > Autocuidado)
//   video       -> videos de bienestar       (Recursos > Videos)
//   diario      -> entradas de Mi diario
//
// Las insignias se guardan en la tabla `insignia` (titulo, descripcion,
// progreso, estado, imagen, id_estudiante + categoría, nivel y meta).
// La IA escribe el nombre y la descripción de cada insignia y crea
// respiraciones y meditaciones nuevas (tabla `recurso_ia`) ligadas a la
// insignia que ayudan a conseguir: respiraciones, meditaciones y retos
// de autocuidado. Si la IA no está disponible, se usa
// un catálogo de respaldo para que la página siempre funcione.
//
// El progreso sale de lo que el estudiante hace de verdad:
// tabla `actividad_recurso` (respiraciones, meditaciones, videos)
// y tabla `diario_emocinal` (entradas del diario).
// =========================================================

const router = Router();

const ESTADO = { bloqueada: 'bloqueada', progreso: 'en progreso', desbloqueada: 'desbloqueada' };

const CATEGORIAS = {
    respiracion: {
        nombre: 'Respiración',
        metas: [1, 3, 6, 10, 15, 21, 28],
        objetivo: (n) => `Completa ${n} ${n === 1 ? 'ejercicio' : 'ejercicios'} de respiración`,
        iconos: ['fa-wind', 'fa-feather', 'fa-water', 'fa-cloud', 'fa-leaf', 'fa-dove', 'fa-wave-square', 'fa-spa'],
        respaldo: ['Primer respiro', 'Aire en calma', 'Pulmones tranquilos', 'Viento sereno', 'Maestro del aliento', 'Respira y brilla', 'Calma profunda']
    },
    meditacion: {
        nombre: 'Meditación',
        metas: [1, 3, 6, 10, 15, 21, 28],
        objetivo: (n) => `Completa ${n} ${n === 1 ? 'meditación' : 'meditaciones'}`,
        iconos: ['fa-spa', 'fa-moon', 'fa-sun', 'fa-mountain-sun', 'fa-seedling', 'fa-tree', 'fa-brain', 'fa-hand'],
        respaldo: ['Mente en pausa', 'Pequeña calma', 'Raíces tranquilas', 'Mente serena', 'Guardián de la calma', 'Luz interior', 'Paz profunda']
    },
    autocuidado: {
        nombre: 'Autocuidado',
        metas: [1, 3, 6, 10, 15, 21, 28],
        objetivo: (n) => `Cumple ${n} ${n === 1 ? 'reto' : 'retos'} de autocuidado`,
        iconos: ['fa-hand-holding-heart', 'fa-mug-hot', 'fa-person-walking', 'fa-bed', 'fa-apple-whole', 'fa-user-group', 'fa-sun', 'fa-seedling'],
        respaldo: ['Me cuido', 'Pequeños gestos', 'Cuerpo y mente', 'Hábitos que abrazan', 'Guardián de mi bienestar', 'Corazón cuidado', 'Maestro del autocuidado']
    },
    video: {
        nombre: 'Videos',
        metas: [1, 2, 3, 5, 8, 12],
        objetivo: (n) => `Mira ${n} ${n === 1 ? 'video' : 'videos'} de bienestar`,
        iconos: ['fa-film', 'fa-play', 'fa-clapperboard', 'fa-tv', 'fa-lightbulb', 'fa-eye'],
        respaldo: ['Primera función', 'Mirada curiosa', 'Aprendiz atento', 'Cinéfilo del bienestar', 'Mente abierta', 'Gran explorador']
    },
    diario: {
        nombre: 'Diario',
        metas: [1, 3, 7, 14, 21, 30, 45],
        objetivo: (n) => `Escribe ${n} ${n === 1 ? 'entrada' : 'entradas'} en tu diario`,
        iconos: ['fa-book-open', 'fa-pen', 'fa-feather-pointed', 'fa-heart', 'fa-calendar-check', 'fa-pen-to-square'],
        respaldo: ['Primera página', 'Voz propia', 'Semana sincera', 'Diario fiel', 'Corazón escrito', 'Autor de mi historia', 'Gran narrador']
    }
};

const ICONOS_GENERALES = ['fa-star', 'fa-medal', 'fa-trophy', 'fa-gem', 'fa-crown'];

// Meta de cada nivel: la de la lista y, si se acaba, sigue subiendo de 10 en 10
function metaDe(categoria, nivel) {
    const metas = CATEGORIAS[categoria].metas;
    return nivel <= metas.length ? metas[nivel - 1] : metas[metas.length - 1] + 10 * (nivel - metas.length);
}

// Cuántos niveles ha alcanzado con esa cantidad de actividades
function nivelesAlcanzados(categoria, cantidad) {
    let nivel = 0;
    while (metaDe(categoria, nivel + 1) <= cantidad && nivel < 50) nivel += 1;
    return nivel;
}

const texto = (valor, max) => String(valor ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

// Recorta en una palabra completa para que quepa en la columna
function recortar(valor, max) {
    const limpio = texto(valor, 400);
    if (limpio.length <= max) return limpio;
    const corte = limpio.slice(0, max + 1).lastIndexOf(' ');
    return (corte > 8 ? limpio.slice(0, corte) : limpio.slice(0, max)).trim();
}

function enteroEntre(valor, min, max, porDefecto) {
    const numero = Math.round(Number(valor));
    if (!Number.isFinite(numero)) return porDefecto;
    return Math.min(max, Math.max(min, numero));
}

async function estudianteDeLaSesion(req) {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const idUsuario = leerTokenEstudiante(token);
    if (!idUsuario) return { error: 401 };

    const [filas] = await connection.promise().query(
        'SELECT id_estudiante FROM estudiante WHERE id_usuario = ? LIMIT 1',
        [idUsuario]
    );
    if (!filas.length) return { error: 409 };

    return { idEstudiante: filas[0].id_estudiante };
}

function responderErrorSesion(res, error) {
    if (error === 401) {
        return res.status(401).json({ message: 'Tu sesión venció. Vuelve a ingresar a tu espacio personal.' });
    }
    return res.status(409).json({
        message: 'Tu usuario todavía no tiene ficha de estudiante. Pide a la secretaría del colegio que la registre.'
    });
}

// =========================================================
// GENERACIÓN DE INSIGNIAS (IA + respaldo)
// =========================================================

const INSTRUCCIONES_INSIGNIAS = `Diseñas las insignias (logros) de "Sentir", la app de bienestar emocional de un colegio en Colombia para estudiantes de 11 a 17 años.
Cada insignia premia usar un tipo de recurso: respiracion (ejercicios de respiración), meditacion (meditaciones guiadas), autocuidado (retos prácticos de autocuidado: descanso, hidratación, movimiento, conexión con otros, desconexión de pantallas, gratitud), video (videos de bienestar) o diario (escribir en el diario emocional).
Reglas:
- Español de Colombia, cálido, juvenil y respetuoso. Sin groserías, sin presión, sin comparar con otros.
- "titulo": nombre creativo y corto, MÁXIMO 26 caracteres, sin comillas ni emojis.
- "descripcion": UNA frase motivadora (máximo 110 caracteres) que conecte con el beneficio del recurso. No repitas la meta numérica.
- "icono": uno de los íconos permitidos para esa categoría.
- Los niveles más altos deben sonar más especiales.
- No repitas títulos que ya existen.
Responde SOLO con JSON: {"insignias":[{"categoria":"...","nivel":1,"titulo":"...","descripcion":"...","icono":"fa-..."}]} en el mismo orden pedido.`;

function insigniaDeRespaldo(categoria, nivel) {
    const datos = CATEGORIAS[categoria];
    const base = datos.respaldo[(nivel - 1) % datos.respaldo.length];
    const vuelta = Math.floor((nivel - 1) / datos.respaldo.length);
    return {
        titulo: vuelta ? `${base} ${vuelta + 1}` : base,
        descripcion: `${datos.objetivo(metaDe(categoria, nivel))} y celebra cada paso que das por tu bienestar.`,
        icono: datos.iconos[(nivel - 1) % datos.iconos.length]
    };
}

async function crearInsignias(db, idEstudiante, faltantes, titulosUsados) {
    let deIA = [];
    let generadoPor = 'respaldo';

    try {
        const pedido = faltantes.map(({ categoria, nivel }) => ({
            categoria,
            nivel,
            meta: CATEGORIAS[categoria].objetivo(metaDe(categoria, nivel)),
            iconosPermitidos: [...CATEGORIAS[categoria].iconos, ...ICONOS_GENERALES]
        }));

        const respuesta = await pedirJSON(
            INSTRUCCIONES_INSIGNIAS,
            `Crea estas insignias: ${JSON.stringify(pedido)}\nTítulos que ya existen (no los repitas): ${JSON.stringify(titulosUsados)}`,
            { temperatura: 0.95, maxTokens: 1800 }
        );

        deIA = Array.isArray(respuesta.json.insignias) ? respuesta.json.insignias : [];
        generadoPor = respuesta.generadoPor;
    } catch (error) {
        console.error('Insignias: la IA no respondió, se usa el respaldo:', error.message);
    }

    const usados = new Set(titulosUsados.map((t) => t.toLowerCase()));
    const creadas = [];

    for (const [indice, { categoria, nivel }] of faltantes.entries()) {
        const datos = CATEGORIAS[categoria];
        const propuesta = deIA.find((item) => item?.categoria === categoria && Number(item?.nivel) === nivel) || deIA[indice] || {};
        const respaldo = insigniaDeRespaldo(categoria, nivel);

        let titulo = recortar(propuesta.titulo, 30).replace(/["“”«»]/g, '');
        const usarIA = titulo.length >= 3 && !usados.has(titulo.toLowerCase());
        if (!usarIA) titulo = respaldo.titulo;

        const descripcion = usarIA && texto(propuesta.descripcion, 160).length >= 10
            ? texto(propuesta.descripcion, 160)
            : respaldo.descripcion;

        const icono = [...datos.iconos, ...ICONOS_GENERALES].includes(propuesta.icono) ? propuesta.icono : respaldo.icono;

        usados.add(titulo.toLowerCase());

        const [resultado] = await db.query(
            `INSERT IGNORE INTO insignia
                (titulo, descripcion, progreso, estado, imagen, categoria, nivel, meta, generada_por, id_estudiante)
             VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?, ?)`,
            [titulo, descripcion, ESTADO.bloqueada, `fa-solid ${icono}`, categoria, nivel,
                metaDe(categoria, nivel), usarIA ? generadoPor : 'respaldo', idEstudiante]
        );

        if (resultado.insertId) creadas.push({ id: resultado.insertId, categoria, nivel, titulo });
    }

    return creadas;
}

// =========================================================
// GENERACIÓN DE RECURSOS: respiraciones y meditaciones (IA + respaldo)
// =========================================================

const TIPOS_RECURSO = ['respiracion', 'meditacion', 'autocuidado'];

const COLORES = {
    respiracion: ['#6c4df6', '#3b9ce8', '#e978d1', '#f0a530', '#2f9e6d', '#8a5cf6'],
    meditacion: ['#7954e1', '#6088cb', '#d059ac', '#3f9fc6', '#4f9a7a', '#c0742f'],
    autocuidado: ['#e0794c', '#e05f8a', '#2f9e6d', '#d9902a', '#5b8def', '#b0569e']
};

const INSTRUCCIONES_RECURSOS = `Creas ejercicios de bienestar para "Sentir", la app de un colegio en Colombia para estudiantes de 11 a 17 años.
Tipos:
- "respiracion": un ejercicio de respiración guiado. Campos: titulo (máx 40 caracteres), descripcion (cómo se hace, máx 160), beneficio (para qué sirve, máx 160), icono, ciclos (entre 4 y 12), fases (de 2 a 4). Cada fase: {"texto": instrucción corta (máx 35 caracteres), "segundos": entre 1 y 10, "movimiento": "grow" (inhalar), "hold" (sostener) o "shrink" (exhalar)}. Debe tener al menos una fase "grow" y una "shrink". Duración total (ciclos x suma de segundos) máximo 3 minutos.
- "meditacion": una meditación guiada. Campos: titulo (máx 40), descripcion (máx 160), icono, pasos (de 5 a 8). Cada paso: {"texto": instrucción en segunda persona (máx 170 caracteres), "segundos": entre 10 y 40}. Duración total máximo 4 minutos. El último paso cierra la meditación con suavidad.
- "autocuidado": un reto práctico de autocuidado que se pueda hacer hoy en el colegio o en casa, sin dinero y sin riesgos (por ejemplo: hidratarse y hacer una pausa, caminar, estirarse, escribirle a alguien querido, ordenar un espacio, desconectarse de las pantallas, dormir mejor, escuchar música, agradecer). Campos: titulo (máx 40), descripcion (máx 160), beneficio (cómo ayuda a la salud mental, máx 160), icono, minutos (entre 2 y 20), pasos (de 3 a 5 acciones concretas, cada una máx 110 caracteres), pregunta (una pregunta corta para reflexionar al terminar, máx 120). Nada de dietas, ejercicio extremo ni retos que expongan al estudiante.
Reglas: técnicas seguras y reales (sin contener la respiración más de 7 segundos, nada que pueda marear). Lenguaje cálido, sencillo, sin tecnicismos ni temas religiosos. Cada ejercicio debe ser distinto de los que ya existen y estar inspirado en la insignia indicada, pero con un título propio (NUNCA el mismo nombre de la insignia).
Íconos permitidos: fa-wind, fa-feather, fa-water, fa-cloud, fa-leaf, fa-dove, fa-spa, fa-moon, fa-sun, fa-mountain-sun, fa-seedling, fa-tree, fa-heart, fa-hand, fa-star, fa-fire, fa-music, fa-person, fa-hand-holding-heart, fa-mug-hot, fa-person-walking, fa-bed, fa-apple-whole, fa-user-group, fa-mobile-screen, fa-broom, fa-book, fa-envelope, fa-glass-water.
Responde SOLO con JSON: {"recursos":[{"tipo":"...", ...}]} en el mismo orden pedido.`;

const ICONOS_RECURSO = ['fa-wind', 'fa-feather', 'fa-water', 'fa-cloud', 'fa-leaf', 'fa-dove', 'fa-spa', 'fa-moon', 'fa-sun',
    'fa-mountain-sun', 'fa-seedling', 'fa-tree', 'fa-heart', 'fa-hand', 'fa-star', 'fa-fire', 'fa-music', 'fa-person',
    'fa-hand-holding-heart', 'fa-mug-hot', 'fa-person-walking', 'fa-bed', 'fa-apple-whole', 'fa-user-group',
    'fa-mobile-screen', 'fa-broom', 'fa-book', 'fa-envelope', 'fa-glass-water'];

const ICONO_POR_DEFECTO = { respiracion: 'fa-wind', meditacion: 'fa-spa', autocuidado: 'fa-hand-holding-heart' };

const RESPALDO_RECURSOS = {
    autocuidado: [
        {
            titulo: 'Recarga de agua y pausa', icono: 'fa-glass-water', minutos: 5,
            descripcion: 'Una pausa corta para hidratarte y darle un respiro a tu cuerpo.',
            beneficio: 'Estar hidratado mejora la concentración y el ánimo.',
            pasos: ['Sírvete un vaso de agua.', 'Tómalo despacio, sin mirar el celular.', 'Estira los brazos hacia arriba durante 10 segundos.', 'Nota cómo se siente tu cuerpo ahora.'],
            pregunta: '¿Qué cambió en tu cuerpo después de esta pausa?'
        },
        {
            titulo: 'Caminata consciente', icono: 'fa-person-walking', minutos: 10,
            descripcion: 'Camina unos minutos prestando atención a lo que ves, oyes y sientes.',
            beneficio: 'Moverte libera tensión y ayuda a ordenar los pensamientos.',
            pasos: ['Busca un lugar seguro para caminar (el patio, un pasillo o tu casa).', 'Camina despacio durante 5 minutos.', 'Fíjate en 3 cosas que no habías notado antes.', 'Termina con tres respiraciones profundas.'],
            pregunta: '¿Qué fue lo que más te llamó la atención?'
        },
        {
            titulo: 'Mensaje que abraza', icono: 'fa-envelope', minutos: 5,
            descripcion: 'Escríbele a alguien que quieres para recordarle que es importante.',
            beneficio: 'Conectar con otros reduce la soledad y mejora el ánimo.',
            pasos: ['Piensa en alguien que te haga sentir bien.', 'Escríbele un mensaje corto y sincero.', 'Envíalo sin esperar nada a cambio.'],
            pregunta: '¿Cómo te sentiste al escribir ese mensaje?'
        },
        {
            titulo: 'Desconexión de pantallas', icono: 'fa-mobile-screen', minutos: 20,
            descripcion: 'Regálate 20 minutos sin celular ni redes sociales.',
            beneficio: 'Descansar de las pantallas baja la ansiedad y mejora el descanso.',
            pasos: ['Pon el celular en silencio y déjalo lejos.', 'Elige algo sin pantallas: leer, dibujar, conversar u ordenar.', 'Disfruta esa actividad 20 minutos.', 'Antes de volver al celular, piensa cómo te sentiste.'],
            pregunta: '¿Qué hiciste en lugar de usar el celular?'
        },
        {
            titulo: 'Tres gracias', icono: 'fa-heart', minutos: 5,
            descripcion: 'Encuentra tres cosas por las que hoy puedes dar gracias.',
            beneficio: 'Practicar la gratitud ayuda a ver lo bueno incluso en días difíciles.',
            pasos: ['Piensa en una persona por la que estás agradecido.', 'Piensa en algo pequeño que disfrutaste hoy.', 'Piensa en algo que hiciste bien.'],
            pregunta: '¿Cuál de las tres te sacó una sonrisa?'
        },
        {
            titulo: 'Mi rincón en orden', icono: 'fa-broom', minutos: 10,
            descripcion: 'Ordena un espacio pequeño: tu escritorio, tu maleta o tu mesa de noche.',
            beneficio: 'Un espacio ordenado ayuda a sentir más calma y control.',
            pasos: ['Elige un solo espacio pequeño.', 'Saca lo que no necesitas allí.', 'Acomoda lo que queda con calma.', 'Mira el resultado y reconoce tu esfuerzo.'],
            pregunta: '¿Cómo se siente ver ese espacio en orden?'
        }
    ],
    respiracion: [
        {
            titulo: 'Respiración 4-7-8', icono: 'fa-moon', ciclos: 4,
            descripcion: 'Inhala en 4, sostén en 7 y suelta el aire despacio en 8 segundos.',
            beneficio: 'Ayuda a relajar el cuerpo cuando estás nervioso o te cuesta dormir.',
            fases: [['Inhala por la nariz', 4, 'grow'], ['Sostén el aire', 7, 'hold'], ['Exhala despacio por la boca', 8, 'shrink']]
        },
        {
            titulo: 'Inflar el globo', icono: 'fa-cloud', ciclos: 8,
            descripcion: 'Imagina que tu barriga es un globo que se infla al inhalar y se desinfla al exhalar.',
            beneficio: 'Respirar con la barriga calma el corazón y baja la tensión.',
            fases: [['Infla el globo: inhala', 4, 'grow'], ['Desinfla el globo: exhala', 6, 'shrink']]
        },
        {
            titulo: 'Soplar la vela', icono: 'fa-fire', ciclos: 8,
            descripcion: 'Inhala oliendo una flor y exhala como si soplaras una vela sin apagarla.',
            beneficio: 'Hace más lenta la respiración y ayuda a soltar el enojo.',
            fases: [['Huele la flor', 4, 'grow'], ['Sopla la vela suave', 6, 'shrink']]
        },
        {
            titulo: 'Respiración 3-3-6', icono: 'fa-leaf', ciclos: 8,
            descripcion: 'Inhala en 3, haz una pequeña pausa y exhala el doble de lento.',
            beneficio: 'Exhalar largo le dice a tu cuerpo que está a salvo.',
            fases: [['Inhala en 3', 3, 'grow'], ['Pausa suave', 3, 'hold'], ['Exhala en 6', 6, 'shrink']]
        },
        {
            titulo: 'La montaña firme', icono: 'fa-mountain-sun', ciclos: 6,
            descripcion: 'Siéntate derecho como una montaña y respira lento y profundo.',
            beneficio: 'Te da seguridad y estabilidad cuando algo te preocupa.',
            fases: [['Crece como montaña: inhala', 5, 'grow'], ['Quédate firme', 2, 'hold'], ['Suelta el aire', 6, 'shrink']]
        },
        {
            titulo: 'Árbol al viento', icono: 'fa-tree', ciclos: 8,
            descripcion: 'Imagina que eres un árbol: tus raíces te sostienen mientras el viento entra y sale.',
            beneficio: 'Ayuda a sentirte con los pies en la tierra.',
            fases: [['El viento entra: inhala', 4, 'grow'], ['El viento sale: exhala', 5, 'shrink']]
        }
    ],
    meditacion: [
        {
            titulo: 'Tres cosas buenas', icono: 'fa-heart',
            descripcion: 'Una pausa para encontrar tres cosas buenas de tu día, por pequeñas que sean.',
            pasos: [
                ['Siéntate cómodo y respira profundo tres veces.', 15],
                ['Piensa en algo bueno que pasó hoy, aunque sea pequeño: una risa, una comida, un mensaje.', 30],
                ['Piensa en una segunda cosa buena. Nota cómo se siente tu cuerpo al recordarla.', 30],
                ['Busca una tercera cosa buena, tal vez algo que tú hiciste bien.', 30],
                ['Agradécete por darte este momento. Lo bueno también es parte de tu día.', 20],
                ['Respira profundo y vuelve con calma a lo que estabas haciendo.', 15]
            ]
        },
        {
            titulo: 'Hojas en el río', icono: 'fa-leaf',
            descripcion: 'Pon tus pensamientos sobre hojas y míralos alejarse en el río.',
            pasos: [
                ['Cierra los ojos y respira despacio.', 15],
                ['Imagina que estás sentado a la orilla de un río tranquilo.', 25],
                ['Cada vez que llegue un pensamiento, ponlo sobre una hoja.', 30],
                ['Mira cómo la hoja se aleja con el agua, sin empujarla.', 30],
                ['Si te distraes, está bien: vuelve a mirar el río.', 30],
                ['Respira profundo y abre los ojos cuando quieras.', 15]
            ]
        },
        {
            titulo: 'Un abrazo para mí', icono: 'fa-hand',
            descripcion: 'Una meditación corta para tratarte con la misma amabilidad que a un amigo.',
            pasos: [
                ['Pon una mano sobre tu pecho y siente tu respiración.', 20],
                ['Piensa en algo que hoy te ha costado. Está bien sentir lo que sientes.', 30],
                ['Dite en tu mente: "Estoy haciendo lo mejor que puedo".', 25],
                ['Imagina que un amigo te da un abrazo cálido y tranquilo.', 30],
                ['Respira y deja que esa calma llegue a todo tu cuerpo.', 25],
                ['Agradece este momento y abre los ojos despacio.', 15]
            ]
        },
        {
            titulo: 'Escuchar el mundo', icono: 'fa-music',
            descripcion: 'Usa los sonidos que te rodean para volver al presente.',
            pasos: [
                ['Quédate quieto y respira con calma.', 15],
                ['Escucha el sonido más lejano que puedas notar.', 30],
                ['Ahora escucha un sonido más cercano, dentro del lugar donde estás.', 30],
                ['Escucha tu propia respiración, entrando y saliendo.', 30],
                ['No tienes que hacer nada con los sonidos, solo notarlos.', 25],
                ['Respira profundo y vuelve a tu día con calma.', 15]
            ]
        },
        {
            titulo: 'Luz tibia', icono: 'fa-sun',
            descripcion: 'Imagina una luz tibia que recorre tu cuerpo y lo relaja.',
            pasos: [
                ['Siéntate cómodo y cierra los ojos.', 15],
                ['Imagina una luz tibia sobre tu cabeza, como el sol de la mañana.', 25],
                ['La luz baja por tu cara y tus hombros, y todo se afloja.', 30],
                ['Llega a tu pecho y tu barriga. Tu respiración se vuelve lenta.', 30],
                ['Baja por tus piernas hasta los pies. Todo tu cuerpo está tranquilo.', 30],
                ['Mueve tus manos y abre los ojos cuando estés listo.', 15]
            ]
        }
    ]
};

function normalizarRespiracion(datos) {
    const fases = (Array.isArray(datos.fases) ? datos.fases : []).slice(0, 4).map((fase) => ({
        label: texto(fase?.texto, 40),
        seconds: enteroEntre(fase?.segundos, 1, 10, 4),
        motion: ['grow', 'hold', 'shrink'].includes(fase?.movimiento) ? fase.movimiento : 'hold'
    })).filter((fase) => fase.label.length >= 2);

    // Sostener nunca más de 7 segundos
    fases.forEach((fase) => { if (fase.motion === 'hold') fase.seconds = Math.min(fase.seconds, 7); });

    if (fases.length < 2 || !fases.some((f) => f.motion === 'grow') || !fases.some((f) => f.motion === 'shrink')) return null;

    const porCiclo = fases.reduce((suma, fase) => suma + fase.seconds, 0);
    let ciclos = enteroEntre(datos.ciclos, 4, 12, 6);
    while (ciclos > 3 && ciclos * porCiclo > 180) ciclos -= 1;

    return { contenido: { cycles: ciclos, phases: fases }, duracion: ciclos * porCiclo };
}

function normalizarMeditacion(datos) {
    const pasos = (Array.isArray(datos.pasos) ? datos.pasos : []).slice(0, 8).map((paso) => ({
        text: texto(paso?.texto, 200),
        seconds: enteroEntre(paso?.segundos, 10, 40, 25)
    })).filter((paso) => paso.text.length >= 8);

    if (pasos.length < 4) return null;

    return { contenido: { steps: pasos }, duracion: pasos.reduce((suma, paso) => suma + paso.seconds, 0) };
}

function normalizarReto(datos) {
    const pasos = (Array.isArray(datos.pasos) ? datos.pasos : []).slice(0, 5)
        .map((paso) => texto(typeof paso === 'string' ? paso : paso?.texto, 140))
        .filter((paso) => paso.length >= 4);

    if (pasos.length < 3) return null;

    const minutos = enteroEntre(datos.minutos, 2, 20, 5);

    return {
        contenido: { steps: pasos, question: texto(datos.pregunta, 150) },
        duracion: minutos * 60
    };
}

function validarRecurso(tipo, datos) {
    if (!datos || typeof datos !== 'object') return null;

    const titulo = recortar(datos.titulo, 60).replace(/["“”«»]/g, '');
    const descripcion = texto(datos.descripcion, 250);
    if (titulo.length < 3 || descripcion.length < 10) return null;

    const normalizado = tipo === 'respiracion'
        ? normalizarRespiracion(datos)
        : tipo === 'meditacion' ? normalizarMeditacion(datos) : normalizarReto(datos);
    if (!normalizado) return null;

    return {
        titulo,
        descripcion,
        beneficio: texto(datos.beneficio, 250),
        icono: ICONOS_RECURSO.includes(datos.icono) ? datos.icono : ICONO_POR_DEFECTO[tipo],
        ...normalizado
    };
}

function recursoDeRespaldo(tipo, titulosUsados) {
    const usados = new Set(titulosUsados.map((t) => t.toLowerCase()));
    const opciones = RESPALDO_RECURSOS[tipo];
    const elegido = opciones.find((o) => !usados.has(o.titulo.toLowerCase())) || opciones[Math.floor(Math.random() * opciones.length)];

    let datos = elegido;
    if (tipo === 'respiracion') {
        datos = { ...elegido, fases: elegido.fases.map(([t, s, m]) => ({ texto: t, segundos: s, movimiento: m })) };
    } else if (tipo === 'meditacion') {
        datos = { ...elegido, pasos: elegido.pasos.map(([t, s]) => ({ texto: t, segundos: s })) };
    }

    return validarRecurso(tipo, datos);
}

// pedidos: [{ tipo, insignia: { id, titulo, descripcion } }]
async function crearRecursos(db, idEstudiante, pedidos) {
    if (!pedidos.length) return [];

    const [existentes] = await db.query('SELECT titulo FROM recurso_ia WHERE id_estudiante = ?', [idEstudiante]);
    const titulosUsados = [
        ...existentes.map((fila) => fila.titulo),
        ...pedidos.map((p) => p.insignia.titulo),
        // los que ya están fijos en la página de Recursos
        'Respiración cuadrada', 'Olas del mar', 'Suspiro de alivio', 'Respiración de la abeja',
        'Escaneo corporal', 'Anclaje 5-4-3-2-1', 'Mi lugar seguro', 'Nubes pasajeras',
        'Recarga de agua y pausa', 'Caminata consciente', 'Mensaje que abraza', 'Desconexión de pantallas'
    ];

    let deIA = [];
    let generadoPor = 'respaldo';

    try {
        const respuesta = await pedirJSON(
            INSTRUCCIONES_RECURSOS,
            `Crea estos ejercicios: ${JSON.stringify(pedidos.map((p) => ({
                tipo: p.tipo,
                paraLaInsignia: p.insignia.titulo,
                ideaDeLaInsignia: p.insignia.descripcion
            })))}\nYa existen (no los repitas): ${JSON.stringify(titulosUsados)}`,
            { temperatura: 0.95, maxTokens: 900 * pedidos.length }
        );
        deIA = Array.isArray(respuesta.json.recursos) ? respuesta.json.recursos : [];
        generadoPor = respuesta.generadoPor;
    } catch (error) {
        console.error('Recursos: la IA no respondió, se usa el respaldo:', error.message);
    }

    const creados = [];
    const disponiblesIA = [...deIA];

    for (const pedido of pedidos) {
        const indice = disponiblesIA.findIndex((item) => item?.tipo === pedido.tipo);
        const propuesta = indice >= 0 ? disponiblesIA.splice(indice, 1)[0] : null;

        let recurso = validarRecurso(pedido.tipo, propuesta);
        if (recurso && titulosUsados.some((t) => t.toLowerCase() === recurso.titulo.toLowerCase())) recurso = null;

        const deRespaldo = !recurso;
        if (deRespaldo) recurso = recursoDeRespaldo(pedido.tipo, titulosUsados);
        if (!recurso) continue;

        titulosUsados.push(recurso.titulo);

        const [[{ total }]] = await db.query(
            'SELECT COUNT(*) AS total FROM recurso_ia WHERE id_estudiante = ? AND tipo = ?',
            [idEstudiante, pedido.tipo]
        );
        const colores = COLORES[pedido.tipo];

        const [resultado] = await db.query(
            `INSERT INTO recurso_ia
                (id_estudiante, id_insignia, tipo, titulo, descripcion, beneficio, icono, color, contenido, duracion_seg, generado_por)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [idEstudiante, pedido.insignia.id, pedido.tipo, recurso.titulo, recurso.descripcion, recurso.beneficio,
                recurso.icono, colores[total % colores.length], JSON.stringify(recurso.contenido), recurso.duracion,
                deRespaldo ? 'respaldo' : generadoPor]
        );

        creados.push(resultado.insertId);
    }

    return creados;
}

// =========================================================
// SINCRONIZAR: crea lo que falte y actualiza progreso y estado
// =========================================================

async function contarActividades(db, idEstudiante) {
    const conteo = { respiracion: 0, meditacion: 0, autocuidado: 0, video: 0, diario: 0 };

    const [filas] = await db.query(
        'SELECT tipo, COUNT(*) AS total FROM actividad_recurso WHERE id_estudiante = ? GROUP BY tipo',
        [idEstudiante]
    );
    filas.forEach((fila) => { if (fila.tipo in conteo) conteo[fila.tipo] = Number(fila.total); });

    const [[diario]] = await db.query('SELECT COUNT(*) AS total FROM diario_emocinal WHERE id_estudiante = ?', [idEstudiante]);
    conteo.diario = Number(diario.total);

    return conteo;
}

const enCurso = new Map(); // id_estudiante -> promesa (evita generar dos veces al tiempo)

function sincronizar(idEstudiante) {
    if (!enCurso.has(idEstudiante)) {
        enCurso.set(idEstudiante, sincronizarAhora(idEstudiante).finally(() => enCurso.delete(idEstudiante)));
    }
    return enCurso.get(idEstudiante);
}

async function sincronizarAhora(idEstudiante) {
    const db = connection.promise();
    const conteo = await contarActividades(db, idEstudiante);

    let [insignias] = await db.query('SELECT * FROM insignia WHERE id_estudiante = ? ORDER BY categoria, nivel', [idEstudiante]);

    // 1) Siempre hay dos niveles por delante del último alcanzado (máximo 6 nuevas por vez)
    const faltantes = [];
    for (const categoria of Object.keys(CATEGORIAS)) {
        const hasta = nivelesAlcanzados(categoria, conteo[categoria]) + 2;
        for (let nivel = 1; nivel <= hasta; nivel += 1) {
            if (!insignias.some((i) => i.categoria === categoria && i.nivel === nivel)) faltantes.push({ categoria, nivel });
        }
    }

    if (faltantes.length) {
        const nuevas = await crearInsignias(db, idEstudiante, faltantes.slice(0, 12), insignias.map((i) => i.titulo));

        // 2) Cada insignia nueva de respiración o meditación trae su propio recurso creado por la IA
        const pedidos = nuevas
            .filter((n) => TIPOS_RECURSO.includes(n.categoria))
            .map((n) => ({ tipo: n.categoria, insignia: n }));

        if (pedidos.length) {
            const [conDescripcion] = await db.query(
                'SELECT id_insignia, descripcion FROM insignia WHERE id_insignia IN (?)',
                [pedidos.map((p) => p.insignia.id)]
            );
            pedidos.forEach((p) => {
                p.insignia.descripcion = conDescripcion.find((f) => f.id_insignia === p.insignia.id)?.descripcion || '';
            });
            await crearRecursos(db, idEstudiante, pedidos);
        }

        [insignias] = await db.query('SELECT * FROM insignia WHERE id_estudiante = ? ORDER BY categoria, nivel', [idEstudiante]);
    }

    // 3) Progreso y estado según lo que el estudiante ha hecho
    const recienDesbloqueadas = [];

    for (const insignia of insignias) {
        const cantidad = conteo[insignia.categoria] ?? 0;
        const progreso = Math.min(cantidad, insignia.meta);
        const anterior = insignias.find((i) => i.categoria === insignia.categoria && i.nivel === insignia.nivel - 1);

        let estado;
        if (insignia.estado === ESTADO.desbloqueada || cantidad >= insignia.meta) {
            estado = ESTADO.desbloqueada;   // una insignia ganada no se pierde
        } else if (insignia.nivel === 1 || !anterior || anterior.estado === ESTADO.desbloqueada || conteo[insignia.categoria] >= anterior.meta) {
            estado = ESTADO.progreso;
        } else {
            estado = ESTADO.bloqueada;
        }

        const ganadaAhora = estado === ESTADO.desbloqueada && insignia.estado !== ESTADO.desbloqueada;

        if (ganadaAhora || progreso !== insignia.progreso || estado !== insignia.estado) {
            await db.query(
                `UPDATE insignia SET progreso = ?, estado = ?, fecha_obtenida = IF(?, NOW(), fecha_obtenida)
                 WHERE id_insignia = ?`,
                [estado === ESTADO.desbloqueada ? insignia.meta : progreso, estado, ganadaAhora, insignia.id_insignia]
            );
        }

        if (ganadaAhora) recienDesbloqueadas.push(insignia.id_insignia);

        insignia.progreso = estado === ESTADO.desbloqueada ? insignia.meta : progreso;
        insignia.estado = estado;
        if (ganadaAhora) insignia.fecha_obtenida = new Date();
    }

    return { insignias, conteo, recienDesbloqueadas };
}

function insigniaParaLaPagina(fila, recursos = []) {
    return {
        id: fila.id_insignia,
        titulo: fila.titulo,
        descripcion: fila.descripcion,
        categoria: fila.categoria,
        categoriaNombre: CATEGORIAS[fila.categoria]?.nombre || fila.categoria,
        nivel: fila.nivel,
        meta: fila.meta,
        objetivo: CATEGORIAS[fila.categoria]?.objetivo(fila.meta) || '',
        progreso: fila.progreso,
        estado: fila.estado,
        imagen: fila.imagen,
        fechaObtenida: fila.fecha_obtenida,
        hechaConIA: fila.generada_por !== 'respaldo',
        recursos
    };
}

function recursoParaLaPagina(fila, insignias) {
    let contenido = {};
    try { contenido = JSON.parse(fila.contenido); } catch { contenido = {}; }

    const insignia = insignias.find((i) => i.id_insignia === fila.id_insignia);

    return {
        id: `ia-${fila.id_recurso}`,
        tipo: fila.tipo,
        titulo: fila.titulo,
        descripcion: fila.descripcion,
        beneficio: fila.beneficio,
        icono: fila.icono,
        color: fila.color,
        duracionSeg: fila.duracion_seg,
        contenido,
        hechoConIA: fila.generado_por !== 'respaldo',
        insignia: insignia ? { id: insignia.id_insignia, titulo: insignia.titulo, estado: insignia.estado } : null
    };
}

// =========================================================
// RUTAS
// =========================================================

// Todas las insignias del estudiante, con su progreso y sus recursos
router.get('/insignias', async (req, res) => {
    try {
        const sesion = await estudianteDeLaSesion(req);
        if (sesion.error) return responderErrorSesion(res, sesion.error);

        const { insignias, conteo, recienDesbloqueadas } = await sincronizar(sesion.idEstudiante);
        const [recursos] = await connection.promise().query(
            'SELECT id_recurso, id_insignia, tipo, titulo FROM recurso_ia WHERE id_estudiante = ? ORDER BY id_recurso',
            [sesion.idEstudiante]
        );

        return res.json({
            conteo,
            recienDesbloqueadas,
            insignias: insignias.map((fila) => insigniaParaLaPagina(
                fila,
                recursos.filter((r) => r.id_insignia === fila.id_insignia)
                    .map((r) => ({ id: `ia-${r.id_recurso}`, tipo: r.tipo, titulo: r.titulo }))
            ))
        });
    } catch (error) {
        console.error('Insignias:', error.message);
        return res.status(500).json({ message: 'No se pudieron cargar tus insignias.' });
    }
});

// Respiraciones y meditaciones creadas para el estudiante
router.get('/recursos', async (req, res) => {
    try {
        const sesion = await estudianteDeLaSesion(req);
        if (sesion.error) return responderErrorSesion(res, sesion.error);

        const { insignias, recienDesbloqueadas } = await sincronizar(sesion.idEstudiante);
        const [recursos] = await connection.promise().query(
            'SELECT * FROM recurso_ia WHERE id_estudiante = ? ORDER BY id_recurso DESC',
            [sesion.idEstudiante]
        );

        // La insignia que cada tipo de recurso está ayudando a conseguir ahora
        const enProgreso = {};
        for (const categoria of Object.keys(CATEGORIAS)) {
            const actual = insignias.find((i) => i.categoria === categoria && i.estado === ESTADO.progreso);
            if (actual) enProgreso[categoria] = insigniaParaLaPagina(actual);
        }

        return res.json({
            recursos: recursos.map((fila) => recursoParaLaPagina(fila, insignias)),
            enProgreso,
            ganadas: insignias.filter((i) => recienDesbloqueadas.includes(i.id_insignia)).map((i) => insigniaParaLaPagina(i))
        });
    } catch (error) {
        console.error('Recursos IA:', error.message);
        return res.status(500).json({ message: 'No se pudieron cargar tus recursos.' });
    }
});

// El estudiante terminó una respiración / meditación o abrió un video
router.post('/actividad', async (req, res) => {
    try {
        const sesion = await estudianteDeLaSesion(req);
        if (sesion.error) return responderErrorSesion(res, sesion.error);

        const tipo = String(req.body?.tipo || '');
        const clave = String(req.body?.clave || '').trim();

        if (!['respiracion', 'meditacion', 'autocuidado', 'video'].includes(tipo) || !/^[A-Za-z0-9_-]{1,80}$/.test(clave)) {
            return res.status(400).json({ message: 'Actividad no válida.' });
        }

        const db = connection.promise();

        // No se cuenta dos veces lo mismo seguido (un video, una vez al día)
        const [repetida] = await db.query(
            tipo === 'video'
                ? 'SELECT 1 FROM actividad_recurso WHERE id_estudiante = ? AND tipo = ? AND clave = ? AND DATE(fecha) = CURDATE() LIMIT 1'
                : 'SELECT 1 FROM actividad_recurso WHERE id_estudiante = ? AND tipo = ? AND clave = ? AND fecha > NOW() - INTERVAL 45 SECOND LIMIT 1',
            [sesion.idEstudiante, tipo, clave]
        );

        let contada = false;
        if (!repetida.length) {
            await db.query('INSERT INTO actividad_recurso (id_estudiante, tipo, clave) VALUES (?, ?, ?)', [sesion.idEstudiante, tipo, clave]);
            contada = true;
        }

        const { insignias, recienDesbloqueadas } = await sincronizar(sesion.idEstudiante);
        const actual = insignias.find((i) => i.categoria === tipo && i.estado === ESTADO.progreso);

        return res.json({
            contada,
            ganadas: insignias.filter((i) => recienDesbloqueadas.includes(i.id_insignia)).map((i) => insigniaParaLaPagina(i)),
            siguiente: actual ? insigniaParaLaPagina(actual) : null
        });
    } catch (error) {
        console.error('Actividad de recurso:', error.message);
        return res.status(500).json({ message: 'No se pudo guardar tu avance.' });
    }
});

// Pedirle a la IA un ejercicio nuevo (máximo 6 por día)
router.post('/generar', async (req, res) => {
    try {
        const sesion = await estudianteDeLaSesion(req);
        if (sesion.error) return responderErrorSesion(res, sesion.error);

        const tipo = String(req.body?.tipo || '');
        if (!TIPOS_RECURSO.includes(tipo)) return res.status(400).json({ message: 'Tipo de recurso no válido.' });

        const db = connection.promise();
        const [[{ hoy }]] = await db.query(
            'SELECT COUNT(*) AS hoy FROM recurso_ia WHERE id_estudiante = ? AND DATE(fecha) = CURDATE()',
            [sesion.idEstudiante]
        );

        if (hoy >= 6) {
            return res.status(429).json({ message: 'Por hoy ya tienes muchos ejercicios nuevos. Vuelve mañana por más.' });
        }

        const { insignias } = await sincronizar(sesion.idEstudiante);
        const insignia = insignias.find((i) => i.categoria === tipo && i.estado === ESTADO.progreso)
            || insignias.filter((i) => i.categoria === tipo).pop();

        const [id] = await crearRecursos(db, sesion.idEstudiante, [{
            tipo,
            insignia: { id: insignia.id_insignia, titulo: insignia.titulo, descripcion: insignia.descripcion }
        }]);

        if (!id) return res.status(500).json({ message: 'No se pudo crear el ejercicio. Inténtalo de nuevo.' });

        const [[fila]] = await db.query('SELECT * FROM recurso_ia WHERE id_recurso = ?', [id]);
        return res.json({ recurso: recursoParaLaPagina(fila, insignias) });
    } catch (error) {
        console.error('Generar recurso:', error.message);
        return res.status(500).json({ message: 'No se pudo crear el ejercicio. Inténtalo de nuevo.' });
    }
});

export default router;
