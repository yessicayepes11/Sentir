/* ==========================================================================
   MI DISPONIBILIDAD (Agenda de psicología)
   Franjas por día guardadas en la tabla `disponibilidad` de la base de datos.
   - Crear disponibilidad de la semana: mismo horario para varios días.
   - Editar día: agregar, quitar o cambiar las franjas de un día.
   Las franjas que ya tienen una cita quedan "Reservadas" y no se pueden quitar.
   ========================================================================== */

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DURACIONES_FRANJA = [15, 20, 30, 45, 60, 90, 120];

let semanaInicio = lunesDe(new Date());
let franjasSemana = [];

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('availabilitySection')) return;
    document.getElementById('weekPrev').addEventListener('click', () => moverSemana(-7));
    document.getElementById('weekNext').addEventListener('click', () => moverSemana(7));
    document.getElementById('weekTodayBtn').addEventListener('click', () => { semanaInicio = lunesDe(new Date()); cargarSemana(); });
    document.getElementById('createWeekBtn').addEventListener('click', abrirCrearSemana);
    irASemanaConDisponibilidad();
    document.addEventListener('sentir:datos', cargarSemana);
});

/* Al entrar se muestra la semana del próximo horario libre (si esta semana ya no tiene) */
async function irASemanaConDisponibilidad() {
    try {
        const { franjas } = await sentirApi('/disponibilidad/libres?dias=60');
        const contador = document.getElementById('tabCountDispo');
        if (contador) contador.innerText = franjas && franjas.length ? franjas.length : '';
        const finSemana = isoLocal(diaDeSemana(6));
        if (franjas && franjas.length && !franjas.some(f => f.fecha <= finSemana)) {
            semanaInicio = lunesDe(new Date(franjas[0].fecha + 'T12:00:00'));
        }
    } catch (error) { /* si falla se queda en la semana actual */ }
    cargarSemana();
}

/* ---------- Fechas (siempre en hora local, formato YYYY-MM-DD) ---------- */
function isoLocal(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function lunesDe(fecha) {
    const d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
}
function diaDeSemana(indice) {
    const d = new Date(semanaInicio);
    d.setDate(d.getDate() + indice);
    return d;
}
function hoyISO() { return isoLocal(new Date()); }
function minutos(hora) { return Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5)); }
function horaDe(min) { return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`; }
function horaFin(hora, duracion) { return horaDe(minutos(hora) + Number(duracion)); }
function hora12(hora) {
    const [h, m] = hora.split(':').map(Number);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`;
}
// "8:00 – 9:00 a. m." (el a. m./p. m. solo una vez si es el mismo)
function rangoCorto(hora, duracion) {
    const fin = horaFin(hora, duracion);
    const a = hora12(hora), b = hora12(fin);
    return a.slice(-5) === b.slice(-5) ? `${a.slice(0, -6)} – ${b}` : `${a} – ${b}`;
}
function horasEntre(inicio, fin, duracion) {
    const lista = [];
    for (let m = minutos(inicio); m + duracion <= minutos(fin); m += duracion) lista.push(horaDe(m));
    return lista;
}
function fechaLarga(iso) {
    const texto = new Date(iso + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function moverSemana(dias) {
    semanaInicio.setDate(semanaInicio.getDate() + dias);
    cargarSemana();
}

/* ---------- Vista de la semana ---------- */
async function cargarSemana() {
    if (typeof refrescarDispoCalendario === 'function') refrescarDispoCalendario();
    const grid = document.getElementById('weekGrid');
    const desde = isoLocal(diaDeSemana(0));
    const hasta = isoLocal(diaDeSemana(6));
    const opciones = { day: 'numeric', month: 'short' };
    document.getElementById('weekLabel').innerText =
        `${diaDeSemana(0).toLocaleDateString('es-CO', opciones)} – ${diaDeSemana(6).toLocaleDateString('es-CO', { ...opciones, year: 'numeric' })}`;
    document.getElementById('weekTodayBtn').disabled = isoLocal(semanaInicio) === isoLocal(lunesDe(new Date()));

    grid.innerHTML = '<p class="week-loading"><i class="fa-solid fa-spinner fa-spin"></i> Cargando disponibilidad…</p>';
    try {
        const datos = await sentirApi(`/disponibilidad?desde=${desde}&hasta=${hasta}`);
        franjasSemana = datos.franjas || [];
        pintarSemana();
    } catch (error) {
        grid.innerHTML = `<p class="week-loading">${escaparHTML(error.message)}</p>`;
    }
}

function pintarSemana() {
    const hoy = hoyISO();
    const grid = document.getElementById('weekGrid');

    grid.innerHTML = DIAS_SEMANA.map((nombre, i) => {
        const fecha = isoLocal(diaDeSemana(i));
        const franjas = franjasSemana.filter(f => f.fecha === fecha);
        const pasado = fecha < hoy;
        return `
            <div class="week-day ${fecha === hoy ? 'is-today' : ''} ${pasado ? 'is-past' : ''}" data-fecha="${fecha}">
                <div class="week-day-head">
                    <strong>${nombre}</strong>
                    <span>${diaDeSemana(i).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div class="week-slots">
                    ${franjas.length ? franjas.map(f => `
                        <span class="week-slot ${f.reservada ? 'reserved' : ''}" title="${f.reservada ? 'Reservada: tiene una cita' : 'Disponible'}">
                            ${f.reservada ? '<i class="fa-solid fa-lock"></i>' : ''}${rangoCorto(f.hora, f.duracion)}
                        </span>`).join('')
                    : `<p class="week-empty">${pasado ? 'Sin registro' : 'Sin disponibilidad'}</p>`}
                </div>
                <button type="button" class="week-edit-btn" data-editar="${fecha}" ${pasado ? 'disabled' : ''}>
                    <i class="fa-solid ${pasado ? 'fa-clock-rotate-left' : 'fa-pen'}"></i> ${pasado ? 'Día pasado' : 'Editar día'}
                </button>
            </div>`;
    }).join('');

    grid.querySelectorAll('[data-editar]').forEach(b => b.addEventListener('click', () => abrirEditarDia(b.dataset.editar)));

    const libres = franjasSemana.filter(f => !f.reservada).length;
    const reservadas = franjasSemana.length - libres;
    document.getElementById('weekTotal').innerText = franjasSemana.length
        ? `${franjasSemana.length} franjas esta semana · ${libres} disponibles · ${reservadas} reservadas`
        : 'Aún no tienes disponibilidad en esta semana. Usa "Crear disponibilidad".';
}

function selectDuracion(id, valor = 60) {
    return `<select id="${id}">${DURACIONES_FRANJA.map(d => `<option value="${d}" ${d === Number(valor) ? 'selected' : ''}>${d < 60 ? d + ' min' : d === 60 ? '1 hora' : d === 90 ? '1 h 30 min' : '2 horas'}</option>`).join('')}</select>`;
}

/* ---------- Crear disponibilidad: un día, la semana o un mes ---------- */
const NOMBRES_MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Días de un mes (YYYY-MM) que caen en los días de la semana elegidos (0 = lunes … 6 = domingo), desde hoy
function fechasDelMes(mes, diasSemana) {
    const [anio, m] = mes.split('-').map(Number);
    const hoy = hoyISO();
    const fechas = [];
    for (let d = new Date(anio, m - 1, 1); d.getMonth() === m - 1; d.setDate(d.getDate() + 1)) {
        const fecha = isoLocal(d);
        if (fecha >= hoy && diasSemana.includes((d.getDay() + 6) % 7)) fechas.push(fecha);
    }
    return fechas;
}

function abrirCrearSemana() {
    const hoy = hoyISO();
    const lunesVisible = isoLocal(diaDeSemana(0));
    // El día y el mes por defecto salen de la semana que se está viendo
    const diaInicial = lunesVisible > hoy ? lunesVisible : hoy;
    const mesInicial = diaInicial.slice(0, 7);
    const mesHoy = hoy.slice(0, 7);

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-calendar-plus"></i></div>
            <div><h3>Crear disponibilidad</h3><p>Elige si es para un día, una semana o un mes, y el horario en que atiendes</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="modal-field"><label>PERIODO</label>
                <div class="period-tabs" id="cwPeriodo">
                    <button type="button" data-periodo="dia"><i class="fa-solid fa-calendar-day"></i> Un día</button>
                    <button type="button" data-periodo="semana" class="active"><i class="fa-solid fa-calendar-week"></i> Semana</button>
                    <button type="button" data-periodo="mes"><i class="fa-solid fa-calendar-days"></i> Mes</button>
                </div>
            </div>

            <div class="modal-field" data-solo="dia"><label>DÍA</label>
                <input type="date" id="cwDia" value="${diaInicial}" min="${hoy}">
            </div>

            <div class="modal-field" data-solo="semana"><label>DÍAS · SEMANA DEL ${document.getElementById('weekLabel').innerText.toUpperCase()}</label>
                <div class="day-picker" id="cwSemana">
                    ${DIAS_SEMANA.map((nombre, i) => {
                        const fecha = isoLocal(diaDeSemana(i));
                        const pasado = fecha < hoy;
                        return `<label class="day-pick ${pasado ? 'disabled' : ''}">
                            <input type="checkbox" value="${fecha}" ${pasado ? 'disabled' : i < 5 ? 'checked' : ''}>
                            <span>${nombre.slice(0, 3)}<small>${diaDeSemana(i).getDate()}</small></span>
                        </label>`;
                    }).join('')}
                </div>
            </div>

            <div data-solo="mes">
                <div class="modal-field"><label>MES</label>
                    <select id="cwMes">${Array.from({ length: 6 }, (_, k) => {
                        const d = new Date(Number(mesHoy.slice(0, 4)), Number(mesHoy.slice(5, 7)) - 1 + k, 1);
                        const valor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                        return `<option value="${valor}" ${valor === mesInicial ? 'selected' : ''}>${NOMBRES_MES[d.getMonth()].replace(/^./, c => c.toUpperCase())} ${d.getFullYear()}</option>`;
                    }).join('')}</select>
                </div>
                <div class="modal-field"><label>DÍAS DE LA SEMANA QUE ATIENDES</label>
                    <div class="day-picker" id="cwMesDias">
                        ${DIAS_SEMANA.map((nombre, i) => `<label class="day-pick">
                            <input type="checkbox" value="${i}" ${i < 5 ? 'checked' : ''}>
                            <span>${nombre.slice(0, 3)}</span>
                        </label>`).join('')}
                    </div>
                </div>
            </div>

            <div class="modal-field"><label>HORARIO</label>
                <div class="time-blocks" id="cwBloques"></div>
                <button type="button" class="btn-secondary small-btn" id="cwAddBloque"><i class="fa-solid fa-plus"></i> Agregar otro bloque</button>
            </div>
            <div class="modal-field"><label>DURACIÓN DE CADA FRANJA</label>${selectDuracion('cwDuracion')}</div>
            <p class="slot-preview" id="cwPreview"></p>
            <p class="modal-error" id="cwError"><i class="fa-solid fa-circle-exclamation"></i> <span></span></p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="cwCancel">Cancelar</button>
            <button class="modal-btn-confirm" id="cwSave"><i class="fa-solid fa-check"></i> Guardar disponibilidad</button>
        </div>
    `);

    const $ = (sel) => overlay.querySelector(sel);
    const bloques = $('#cwBloques');
    const errorMsg = $('#cwError');
    const mostrarError = (texto) => { errorMsg.querySelector('span').innerText = texto; errorMsg.classList.add('show'); };
    let periodo = 'semana';

    const mostrarPeriodo = () => {
        overlay.querySelectorAll('#cwPeriodo [data-periodo]').forEach(b => b.classList.toggle('active', b.dataset.periodo === periodo));
        overlay.querySelectorAll('[data-solo]').forEach(el => { el.hidden = el.dataset.solo !== periodo; });
        actualizar();
    };

    const agregarBloque = (inicio, fin) => {
        bloques.insertAdjacentHTML('beforeend', `
            <div class="time-block">
                <input type="time" class="tb-inicio" value="${inicio}" step="300">
                <span>a</span>
                <input type="time" class="tb-fin" value="${fin}" step="300">
                <button type="button" class="gc-btn del" title="Quitar bloque"><i class="fa-solid fa-xmark"></i></button>
            </div>`);
        const fila = bloques.lastElementChild;
        fila.querySelector('button').addEventListener('click', () => { fila.remove(); actualizar(); });
        actualizar();
    };

    const leerFechas = () => {
        if (periodo === 'dia') return $('#cwDia').value ? [$('#cwDia').value] : [];
        if (periodo === 'semana') return [...overlay.querySelectorAll('#cwSemana input:checked')].map(i => i.value);
        const dias = [...overlay.querySelectorAll('#cwMesDias input:checked')].map(i => Number(i.value));
        return fechasDelMes($('#cwMes').value, dias);
    };

    const leer = () => {
        const fechas = leerFechas();
        const duracion = Number($('#cwDuracion').value);
        const lista = [...bloques.querySelectorAll('.time-block')].map(b => ({ inicio: b.querySelector('.tb-inicio').value, fin: b.querySelector('.tb-fin').value }));
        const horas = [...new Set(lista.filter(b => b.inicio && b.fin && b.inicio < b.fin).flatMap(b => horasEntre(b.inicio, b.fin, duracion)))];
        return { fechas, duracion, lista, horas };
    };

    function actualizar() {
        if (!$('#cwPreview')) return;
        errorMsg.classList.remove('show');
        const { fechas, horas } = leer();
        const texto = periodo === 'dia' ? 'el día elegido'
            : periodo === 'semana' ? `${fechas.length} día(s) de la semana`
            : `${fechas.length} día(s) de ${$('#cwMes').selectedOptions[0].text.toLowerCase()}${$('#cwMes').value === hoy.slice(0, 7) ? ' (desde hoy)' : ''}`;
        $('#cwPreview').innerHTML = fechas.length && horas.length
            ? `<i class="fa-solid fa-circle-info"></i> Se crearán <strong>${horas.length}</strong> franjas por día en <strong>${texto}</strong>: <strong>${horas.length * fechas.length}</strong> en total.`
            : '<i class="fa-solid fa-circle-info"></i> Elige al menos un día y un horario.';
    }

    overlay.querySelectorAll('#cwPeriodo [data-periodo]').forEach(b => b.addEventListener('click', () => { periodo = b.dataset.periodo; mostrarPeriodo(); }));
    agregarBloque('08:00', '12:00');
    agregarBloque('14:00', '17:00');
    mostrarPeriodo();
    overlay.addEventListener('input', actualizar);
    overlay.addEventListener('change', actualizar);
    $('#cwAddBloque').addEventListener('click', () => agregarBloque('', ''));
    $('#cwCancel').addEventListener('click', () => closeSentirModal(overlay));

    $('#cwSave').addEventListener('click', async () => {
        const { fechas, duracion, lista, horas } = leer();
        if (!fechas.length) return mostrarError(periodo === 'mes' ? 'No quedan días de ese mes con los días de la semana elegidos.' : 'Elige al menos un día.');
        if (fechas.some(f => f < hoy)) return mostrarError('No se puede crear disponibilidad en días que ya pasaron.');
        if (!lista.length) return mostrarError('Agrega al menos un bloque de horario.');
        if (lista.some(b => !b.inicio || !b.fin || b.inicio >= b.fin)) return mostrarError('En cada bloque, la hora de inicio debe ser antes de la hora de fin.');
        if (!horas.length) return mostrarError('El horario es más corto que la duración de una franja.');

        const boton = $('#cwSave');
        boton.disabled = true;
        boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando…';
        try {
            const r = await sentirApi('/disponibilidad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fechas, duracion, bloques: lista })
            });
            closeSentirModal(overlay);
            showToast({
                title: 'Disponibilidad guardada',
                message: `Se crearon ${r.creadas} franjas en ${fechas.length} día(s).` + (r.repetidas ? ` ${r.repetidas} ya existían y se dejaron igual.` : ''),
                icon: 'fa-calendar-check', type: 'success'
            });
            // Muestra la semana del primer día creado
            semanaInicio = lunesDe(new Date(fechas.slice().sort()[0] + 'T12:00:00'));
            cargarSemana();
        } catch (error) {
            mostrarError(error.message);
            boton.disabled = false;
            boton.innerHTML = '<i class="fa-solid fa-check"></i> Guardar disponibilidad';
        }
    });
}

/* ---------- Editar un día ---------- */
function abrirEditarDia(fecha) {
    // Copia de trabajo de las franjas del día
    let franjas = franjasSemana.filter(f => f.fecha === fecha).map(f => ({ hora: f.hora, duracion: f.duracion, reservada: f.reservada }));

    const overlay = openSentirModal(`
        <div class="sentir-modal-header">
            <div class="sentir-modal-icon"><i class="fa-solid fa-calendar-day"></i></div>
            <div><h3>Editar disponibilidad</h3><p>${fechaLarga(fecha)}</p></div>
        </div>
        <div class="sentir-modal-body">
            <div class="day-slot-list" id="edLista"></div>
            <div class="day-add">
                <label>AGREGAR FRANJA</label>
                <div class="day-add-row">
                    <input type="time" id="edHora" step="300">
                    ${selectDuracion('edDuracion')}
                    <button type="button" class="btn-secondary small-btn" id="edAgregar"><i class="fa-solid fa-plus"></i> Agregar</button>
                </div>
                <label>AGREGAR VARIAS (RANGO)</label>
                <div class="day-add-row">
                    <input type="time" id="edDesde" step="300" value="08:00">
                    <span>a</span>
                    <input type="time" id="edHasta" step="300" value="12:00">
                    <button type="button" class="btn-secondary small-btn" id="edRango"><i class="fa-solid fa-wand-magic-sparkles"></i> Generar</button>
                </div>
            </div>
            <p class="modal-error" id="edError"><i class="fa-solid fa-circle-exclamation"></i> <span></span></p>
        </div>
        <div class="sentir-modal-actions">
            <button class="modal-btn-cancel" id="edVaciar"><i class="fa-solid fa-eraser"></i> Vaciar día</button>
            <button class="modal-btn-cancel" id="edCancel">Cancelar</button>
            <button class="modal-btn-confirm" id="edSave"><i class="fa-solid fa-check"></i> Guardar día</button>
        </div>
    `);

    const $ = (sel) => overlay.querySelector(sel);
    const errorMsg = $('#edError');
    const mostrarError = (texto) => { errorMsg.querySelector('span').innerText = texto; errorMsg.classList.add('show'); };
    overlay.addEventListener('input', () => errorMsg.classList.remove('show'));

    // Dos franjas no se pueden cruzar en el tiempo
    const choca = (hora, duracion, ignorar = -1) => franjas.some((f, i) => i !== ignorar &&
        minutos(hora) < minutos(f.hora) + Number(f.duracion) && minutos(f.hora) < minutos(hora) + Number(duracion));

    const pintar = () => {
        franjas.sort((a, b) => a.hora.localeCompare(b.hora));
        $('#edLista').innerHTML = franjas.length ? franjas.map((f, i) => `
            <div class="day-slot ${f.reservada ? 'reserved' : ''}">
                <i class="fa-solid ${f.reservada ? 'fa-lock' : 'fa-clock'}"></i>
                <span class="day-slot-time">${rangoCorto(f.hora, f.duracion)}</span>
                ${f.reservada
                    ? '<span class="day-slot-tag">Reservada</span>'
                    : `${selectDuracion('dur' + i, f.duracion).replace('<select', `<select data-dur="${i}"`)}
                       <button type="button" class="gc-btn del" data-quitar="${i}" title="Quitar franja"><i class="fa-solid fa-trash-can"></i></button>`}
            </div>`).join('')
            : '<p class="week-empty">Este día no tiene franjas. Agrégalas abajo.</p>';

        $('#edLista').querySelectorAll('[data-quitar]').forEach(b => b.addEventListener('click', () => {
            franjas.splice(Number(b.dataset.quitar), 1); pintar();
        }));
        $('#edLista').querySelectorAll('[data-dur]').forEach(s => s.addEventListener('change', () => {
            const i = Number(s.dataset.dur);
            if (choca(franjas[i].hora, s.value, i)) { s.value = franjas[i].duracion; return mostrarError('Con esa duración se cruza con la siguiente franja.'); }
            franjas[i].duracion = Number(s.value); pintar();
        }));
    };
    pintar();

    $('#edAgregar').addEventListener('click', () => {
        const hora = $('#edHora').value;
        const duracion = Number($('#edDuracion').value);
        if (!hora) return mostrarError('Elige la hora de la franja.');
        if (choca(hora, duracion)) return mostrarError('Esa franja se cruza con otra que ya tienes.');
        franjas.push({ hora, duracion, reservada: false });
        $('#edHora').value = '';
        errorMsg.classList.remove('show');
        pintar();
    });

    $('#edRango').addEventListener('click', () => {
        const desde = $('#edDesde').value, hasta = $('#edHasta').value;
        const duracion = Number($('#edDuracion').value);
        if (!desde || !hasta || desde >= hasta) return mostrarError('En el rango, la hora de inicio debe ser antes de la hora de fin.');
        const nuevas = horasEntre(desde, hasta, duracion).filter(h => !choca(h, duracion));
        if (!nuevas.length) return mostrarError('No se agregó nada: el rango ya está ocupado o es muy corto.');
        nuevas.forEach(hora => franjas.push({ hora, duracion, reservada: false }));
        errorMsg.classList.remove('show');
        pintar();
    });

    $('#edVaciar').addEventListener('click', () => {
        franjas = franjas.filter(f => f.reservada);
        pintar();
    });
    $('#edCancel').addEventListener('click', () => closeSentirModal(overlay));

    $('#edSave').addEventListener('click', async () => {
        const boton = $('#edSave');
        boton.disabled = true;
        boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando…';
        try {
            const r = await sentirApi(`/disponibilidad/dia/${fecha}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ franjas: franjas.filter(f => !f.reservada).map(f => ({ hora: f.hora, duracion: f.duracion })) })
            });
            closeSentirModal(overlay);
            showToast({
                title: 'Día actualizado',
                message: `${r.franjas.length} franja(s) para el ${fechaLarga(fecha).toLowerCase()}.`,
                icon: 'fa-calendar-check', type: 'success'
            });
            cargarSemana();
        } catch (error) {
            mostrarError(error.message);
            boton.disabled = false;
            boton.innerHTML = '<i class="fa-solid fa-check"></i> Guardar día';
        }
    });
}
