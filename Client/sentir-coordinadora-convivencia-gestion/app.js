
(() => {
  const STORAGE_KEY = "sentir_coordinadora_gestion_v3";
  const PROFILE_KEY = "sentir_coordinadora_gestion_profile_v3";

  const defaults = {
    alerts: [
      {id:1, priority:"Alta", title:"Grado 8°B — conflicto entre estudiantes", student:"Camila R.", grade:"8°B", source:"Docente", reporter:"Docente de Matemáticas", date:"2026-10-02", status:"Activa", reviewed:false, description:"Se reportó una discusión recurrente entre dos estudiantes durante el cambio de clase. Se solicita revisión de convivencia."},
      {id:2, priority:"Media", title:"Grado 10°A — posible caso de convivencia", student:"Samuel P.", grade:"10°A", source:"Docente", reporter:"Docente de Español", date:"2026-10-01", status:"Activa", reviewed:false, description:"Se observan dificultades de integración en el grupo. El docente solicita acompañamiento preventivo."},
      {id:3, priority:"Seguimiento", title:"Grado 7°C — seguimiento solicitado", student:"Juliana M.", grade:"7°C", source:"Orientación Escolar", reporter:"Orientación Escolar", date:"2026-09-30", status:"Seguimiento", reviewed:false, description:"Continuar el seguimiento institucional acordado en la última reunión."},
      {id:4, priority:"Alta", title:"Grado 9°A — situación reiterada", student:"Andrés T.", grade:"9°A", source:"Estudiante", reporter:"Reporte estudiantil", date:"2026-09-29", status:"Activa", reviewed:false, description:"El estudiante reporta una situación reiterada que requiere revisión del equipo de convivencia."},
      {id:5, priority:"Media", title:"Grado 6°B — dificultad de integración", student:"Mariana L.", grade:"6°B", source:"Docente", reporter:"Docente directora de grupo", date:"2026-09-28", status:"Atendida", reviewed:true, description:"Se realizó conversación inicial y se acordó observación del grupo durante la semana."},
      {id:6, priority:"Seguimiento", title:"Grado 11°A — seguimiento de acuerdos", student:"Nicolás F.", grade:"11°A", source:"Orientación Escolar", reporter:"Orientación Escolar", date:"2026-09-27", status:"Seguimiento", reviewed:true, description:"Revisar cumplimiento de los compromisos acordados con el grupo."}
    ],
    cases: [
      {id:2314, student:"Camila R.", grade:"8°B", type:"Conflicto entre estudiantes", risk:"Alto", status:"Pendiente", updated:"Hoy, 7:20 a. m.", description:"Conflicto reportado por docente de Matemáticas. Requiere revisión inicial y definición de ruta institucional.", notes:["Caso creado desde una alerta prioritaria."]},
      {id:2315, student:"Samuel P.", grade:"10°A", type:"Convivencia escolar", risk:"Medio", status:"En proceso", updated:"Ayer, 3:40 p. m.", description:"Se está realizando acompañamiento preventivo con el grupo.", notes:["Se conversó con director de grupo.","Próxima revisión programada."]},
      {id:2316, student:"Juliana M.", grade:"7°C", type:"Seguimiento solicitado", risk:"Medio", status:"Escalado", updated:"Ayer, 10:15 a. m.", description:"Caso remitido para acompañamiento especializado de orientación.", notes:["Remitido a Orientación Escolar."]},
      {id:2317, student:"Mariana L.", grade:"6°B", type:"Integración grupal", risk:"Bajo", status:"Cerrado", updated:"28 sep.", description:"Seguimiento finalizado con acuerdos cumplidos.", notes:["Acuerdos cumplidos.","Caso cerrado con seguimiento preventivo."]},
      {id:2318, student:"Andrés T.", grade:"9°A", type:"Situación reiterada", risk:"Alto", status:"En proceso", updated:"29 sep.", description:"Revisión de convivencia en curso.", notes:["Pendiente reunión con acudiente."]},
      {id:2319, student:"Nicolás F.", grade:"11°A", type:"Seguimiento de acuerdos", risk:"Bajo", status:"Cerrado", updated:"27 sep.", description:"Se verificó el cumplimiento de compromisos institucionales.", notes:["Cierre satisfactorio."]}
    ],
    meetings: [
      {id:1,title:"Reunión con acudientes 8°B",type:"Reunión",date:"2026-10-03",time:"08:00",description:"Revisión de situación y acuerdos."},
      {id:2,title:"Mediación entre estudiantes",type:"Mediación",date:"2026-10-03",time:"10:30",description:"Espacio guiado de diálogo."},
      {id:3,title:"Comité de convivencia",type:"Comité",date:"2026-10-06",time:"14:00",description:"Seguimiento de casos institucionales."}
    ],
    commitments: [
      {id:1,text:"Verificar acuerdos del caso #2315",detail:"Responsable: Coordinación de convivencia",done:false},
      {id:2,text:"Contactar acudiente del grado 9°A",detail:"Antes del viernes",done:false},
      {id:3,text:"Compartir estrategia preventiva con 8°B",detail:"En reunión con director de grupo",done:true},
      {id:4,text:"Revisar compromisos del comité",detail:"Próxima sesión institucional",done:false}
    ],
    mediations:[
      {id:101,participants:"Estudiantes 8°B",date:"2026-10-01",agreements:"Mantener comunicación respetuosa, evitar confrontaciones y solicitar acompañamiento docente cuando sea necesario."}
    ]
  };

  function getState(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw){ localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults)); return structuredClone(defaults); }
    try { return JSON.parse(raw); } catch { localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults)); return structuredClone(defaults); }
  }
  function saveState(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  let state = getState();

  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];
  const esc = (v="") => String(v).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  const fmtDate = v => {
    if(!v) return "";
    const d = new Date(v+"T12:00:00");
    return d.toLocaleDateString("es-CO",{day:"2-digit",month:"short",year:"numeric"});
  };
  const slug = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const priorityClass = p => p==="Alta"?"high":p==="Media"?"medium":"tracking";
  const riskClass = r => r==="Alto"?"high":r==="Medio"?"medium":"low";
  const statusClass = s => s==="Cerrado"?"success":s==="Escalado"?"purple":s==="En proceso"?"info":"attention";

  function refreshIcons(){ if(window.lucide) window.lucide.createIcons(); }
  function toast(message){
    const el=$("#toast"); if(!el) return;
    el.textContent=message; el.classList.add("show");
    clearTimeout(window.__toast); window.__toast=setTimeout(()=>el.classList.remove("show"),2400);
  }
  function openModal(id){ const m=document.getElementById(id); if(m){m.classList.add("open");document.body.style.overflow="hidden";refreshIcons();}}
  function closeModal(m){ if(m){m.classList.remove("open");document.body.style.overflow="";} }

  function initShell(){
    const sidebar=$("#sidebar"), backdrop=$("#mobileBackdrop");
    $("#mobileMenuBtn")?.addEventListener("click",()=>{sidebar?.classList.add("open");backdrop?.classList.add("show")});
    backdrop?.addEventListener("click",()=>{sidebar?.classList.remove("open");backdrop.classList.remove("show")});
    $$(".nav-link").forEach(a=>a.addEventListener("click",()=>{sidebar?.classList.remove("open");backdrop?.classList.remove("show")}));
    // Escape cierra el menú lateral en celular
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&sidebar?.classList.contains("open")){sidebar.classList.remove("open");backdrop?.classList.remove("show")}});

    const np=$("#notificationPanel"), pm=$("#profileMenu");
    $("#notificationBtn")?.addEventListener("click",(e)=>{e.stopPropagation();np?.classList.toggle("open");pm?.classList.remove("open")});
    $("#profileTrigger")?.addEventListener("click",(e)=>{e.stopPropagation();pm?.classList.toggle("open");np?.classList.remove("open")});
    $("[data-close-panel]")?.addEventListener("click",()=>np?.classList.remove("open"));
    $$("[data-go]").forEach(el=>el.addEventListener("click",()=>location.href=el.dataset.go));
    document.addEventListener("click",(e)=>{if(np && !np.contains(e.target) && !$("#notificationBtn")?.contains(e.target)) np.classList.remove("open"); if(pm && !pm.contains(e.target) && !$("#profileTrigger")?.contains(e.target)) pm.classList.remove("open")});

    $$("[data-open-modal]").forEach(b=>b.addEventListener("click",()=>openModal(b.dataset.openModal)));
    $$("[data-close-modal]").forEach(b=>b.addEventListener("click",()=>closeModal(b.closest(".modal"))));
    $$(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModal(m)}));
    document.addEventListener("keydown",e=>{if(e.key==="Escape")$$(".modal.open").forEach(closeModal)});

    $("#logoutBtn")?.addEventListener("click",()=>toast("Sesión de demostración cerrada."));
    loadProfile();
  }

  function loadProfile(){
    let p={name:"Laura Martínez", avatar:"assets/coordinadora-avatar.png"};
    try{ p={...p,...JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}")}; }catch{}
    $("#topProfileName") && ($("#topProfileName").textContent=p.name);
    $("#profileDisplayName") && ($("#profileDisplayName").textContent=p.name);
    $$(".js-profile-avatar").forEach(img=>img.src=p.avatar);
    const form=$("#profileForm"); if(form && form.elements.name) form.elements.name.value=p.name;
  }

  function renderDashboard(){
    if(document.body.dataset.page!=="inicio") return;
    const activeAlerts=state.alerts.filter(a=>a.status!=="Atendida").length;
    const tracking=state.cases.filter(c=>c.status!=="Cerrado").length;
    const closed=state.cases.filter(c=>c.status==="Cerrado").length + 34;
    $("#kpiAlerts").textContent=activeAlerts+8;
    $("#kpiTracking").textContent=tracking+17;
    $("#kpiResolved").textContent=closed;

    const holder=$("#priorityAlerts");
    holder.innerHTML=state.alerts.filter(a=>!a.reviewed).slice(0,3).map(a=>`
      <div class="compact-alert">
        <span class="badge ${priorityClass(a.priority)}">${a.priority==="Seguimiento"?"En seguimiento":a.priority+" prioridad"}</span>
        <div class="alert-main"><b>${esc(a.title)}</b><small>Reportada por ${esc(a.reporter)}<br>${fmtDate(a.date)}</small></div>
        <button class="btn btn-soft" onclick="location.href='alertas.html'">Ver resumen</button>
      </div>`).join("");

    const groups=[
      ["Pendientes","Pendiente","clock-3","orange","Por asignar o en revisión"],
      ["En proceso","En proceso","refresh-cw","blue","Con acompañamiento"],
      ["Escalados a Psicología","Escalado","users-round","purple","Requieren atención especializada"],
      ["Cerrados","Cerrado","badge-check","green","Con plan de cierre"]
    ];
    $("#dashboardStatusGrid").innerHTML=groups.map(([label,status,icon,cls,sub])=>{
      let count=state.cases.filter(c=>c.status===status).length;
      const bump={Pendiente:11,"En proceso":16,Escalado:5,Cerrado:33}[status]||0;
      return `<div class="status-card ${cls}"><span class="status-symbol"><i data-lucide="${icon}"></i></span><div><small>${label}</small><strong>${count+bump}</strong><p>${sub}</p></div></div>`;
    }).join("");
  }

  function caseCounts(){
    const count = s => state.cases.filter(c=>c.status===s).length;
    $("#casePendingCount") && ($("#casePendingCount").textContent=count("Pendiente"));
    $("#caseProcessCount") && ($("#caseProcessCount").textContent=count("En proceso"));
    $("#caseEscalatedCount") && ($("#caseEscalatedCount").textContent=count("Escalado"));
    $("#caseClosedCount") && ($("#caseClosedCount").textContent=count("Cerrado"));
  }
  function filteredCases(){
    const q=slug($("#caseSearch")?.value||"");
    const status=$("#caseStatusFilter")?.value||"";
    const risk=$("#caseRiskFilter")?.value||"";
    return state.cases.filter(c=>(!q || slug(`${c.id} ${c.student} ${c.grade} ${c.type}`).includes(q)) && (!status||c.status===status) && (!risk||c.risk===risk));
  }
  function renderCases(){
    if(document.body.dataset.page!=="casos") return;
    caseCounts();
    const items=filteredCases();
    $("#casesTableBody").innerHTML=items.map(c=>`<tr>
      <td><span class="case-id">#${c.id}</span></td>
      <td class="student-cell"><b>${esc(c.student)}</b><small>Estudiante</small></td>
      <td>${esc(c.grade)}</td><td>${esc(c.type)}</td>
      <td><span class="pill ${riskClass(c.risk)}">${c.risk}</span></td>
      <td><span class="pill ${statusClass(c.status)}">${c.status}</span></td>
      <td>${esc(c.updated)}</td>
      <td><button class="table-action" data-case-id="${c.id}" aria-label="Ver caso"><i data-lucide="eye"></i></button></td>
    </tr>`).join("") || `<tr><td colspan="8">No se encontraron casos con esos filtros.</td></tr>`;
    $("#casesMobileList").innerHTML=items.map(c=>`<article class="mobile-case-card">
      <div class="mobile-case-head"><div><h4>Caso #${c.id} · ${esc(c.student)}</h4><p>${esc(c.grade)} · ${esc(c.type)}</p></div><span class="pill ${riskClass(c.risk)}">${c.risk}</span></div>
      <div class="mobile-case-meta"><span class="pill ${statusClass(c.status)}">${c.status}</span><span class="pill info">${esc(c.updated)}</span></div>
      <button class="btn btn-soft" data-case-id="${c.id}"><i data-lucide="eye"></i> Ver información</button>
    </article>`).join("") || `<p>No se encontraron casos.</p>`;
    $$("[data-case-id]").forEach(b=>b.addEventListener("click",()=>showCase(+b.dataset.caseId)));
    refreshIcons();
  }
  function showCase(id){
    const c=state.cases.find(x=>x.id===id); if(!c)return;
    $("#caseDetailContent").innerHTML=`
      <div class="modal-title"><span class="modal-icon purple"><i data-lucide="folder-kanban"></i></span><div><h3>Caso #${c.id}</h3><p>${esc(c.student)} · ${esc(c.grade)}</p></div></div>
      <div class="detail-grid">
        <div class="detail-box"><small>Tipo</small><b>${esc(c.type)}</b></div>
        <div class="detail-box"><small>Nivel de riesgo</small><b>${esc(c.risk)}</b></div>
        <div class="detail-box"><small>Estado actual</small><b>${esc(c.status)}</b></div>
      </div>
      <div class="detail-section"><h4>Resumen institucional</h4><p>${esc(c.description)}</p></div>
      <div class="detail-section"><h4>Notas de seguimiento</h4><div class="note-list">${(c.notes||[]).map(n=>`<div class="note-item"><b>Registro institucional</b><p>${esc(n)}</p></div>`).join("")||"<p>Sin notas todavía.</p>"}</div></div>
      <div class="modal-actions">
        <select id="caseStatusSelect" class="modal-select"><option ${c.status==="Pendiente"?"selected":""}>Pendiente</option><option ${c.status==="En proceso"?"selected":""}>En proceso</option><option ${c.status==="Escalado"?"selected":""}>Escalado</option><option ${c.status==="Cerrado"?"selected":""}>Cerrado</option></select>
        <button class="btn btn-primary" id="saveCaseStatus"><i data-lucide="save"></i> Guardar estado</button>
      </div>`;
    openModal("caseDetailModal");
    $("#saveCaseStatus").addEventListener("click",()=>{c.status=$("#caseStatusSelect").value;c.updated="Ahora";saveState(state);renderCases();closeModal($("#caseDetailModal"));toast("Estado del caso actualizado.");});
    refreshIcons();
  }
  function initCases(){
    if(document.body.dataset.page!=="casos")return;
    ["caseSearch","caseStatusFilter","caseRiskFilter"].forEach(id=>$("#"+id)?.addEventListener(id==="caseSearch"?"input":"change",renderCases));
    $("#clearCaseFilters")?.addEventListener("click",()=>{$("#caseSearch").value="";$("#caseStatusFilter").value="";$("#caseRiskFilter").value="";renderCases()});
    $("#caseCreateForm")?.addEventListener("submit",e=>{
      e.preventDefault(); const fd=new FormData(e.currentTarget);
      const next=Math.max(...state.cases.map(c=>c.id))+1;
      state.cases.unshift({id:next,student:fd.get("student"),grade:fd.get("grade"),type:fd.get("type"),risk:fd.get("risk"),status:"Pendiente",updated:"Ahora",description:fd.get("description"),notes:["Caso registrado desde el panel de Coordinación."]});
      saveState(state); e.currentTarget.reset(); closeModal($("#caseCreateModal")); renderCases(); toast(`Caso #${next} registrado.`);
    });
    renderCases();
  }

  function updateAlertCounts(){
    const c=p=>state.alerts.filter(a=>a.priority===p && !a.reviewed).length;
    $("#alertHighCount").textContent=c("Alta");
    $("#alertMediumCount").textContent=c("Media");
    $("#alertTrackingCount").textContent=c("Seguimiento");
    $("#alertReviewedCount").textContent=state.alerts.filter(a=>a.reviewed).length;
  }

  function openAlertEditor(id=null){
    const form=$("#alertEditorForm"); if(!form) return;
    form.reset();
    form.elements.id.value="";
    $("#alertEditorTitle").textContent=id ? "Editar alerta" : "Nueva alerta";

    if(id){
      const a=state.alerts.find(x=>x.id===id); if(!a) return;
      form.elements.id.value=a.id;
      form.elements.student.value=a.student||"";
      form.elements.grade.value=a.grade||"";
      form.elements.title.value=a.title||"";
      form.elements.priority.value=a.priority||"Media";
      form.elements.source.value=a.source||"Docente";
      form.elements.reporter.value=a.reporter||"";
      form.elements.date.value=a.date||"";
      form.elements.description.value=a.description||"";
    }else{
      form.elements.date.value=new Date().toISOString().slice(0,10);
      form.elements.source.value="Coordinación de convivencia";
      form.elements.reporter.value="Coordinación de convivencia";
    }
    openModal("alertEditorModal");
  }

  function renderAlerts(){
    if(document.body.dataset.page!=="alertas")return;
    updateAlertCounts();
    const q=slug($("#alertSearch")?.value||""), pr=$("#alertPriorityFilter")?.value||"", src=$("#alertSourceFilter")?.value||"";
    const items=state.alerts.filter(a=>(!q||slug(`${a.title} ${a.student} ${a.grade} ${a.description}`).includes(q))&&(!pr||a.priority===pr)&&(!src||a.source===src));
    $("#alertsList").innerHTML=items.map(a=>`<article class="alert-row ${a.reviewed?"reviewed":""}">
      <span class="alert-accent ${priorityClass(a.priority)}"></span>
      <div><h4>${esc(a.title)}</h4><p>${esc(a.description)}</p><div class="alert-meta"><span class="badge ${priorityClass(a.priority)}">${a.priority}</span><small>${esc(a.reporter)} · ${fmtDate(a.date)}</small></div></div>
      <div class="alert-actions">
        <button class="btn btn-soft" data-alert-edit="${a.id}"><i data-lucide="pencil"></i> Editar</button>
        <button class="btn btn-soft" data-alert-view="${a.id}"><i data-lucide="eye"></i> Ver</button>
        ${!a.reviewed?`<button class="btn btn-primary" data-alert-review="${a.id}"><i data-lucide="check"></i> Revisar</button>`:""}
      </div>
    </article>`).join("")||"<p>No hay alertas con esos filtros.</p>";
    $$("[data-alert-edit]").forEach(b=>b.addEventListener("click",()=>openAlertEditor(+b.dataset.alertEdit)));
    $$("[data-alert-view]").forEach(b=>b.addEventListener("click",()=>showAlert(+b.dataset.alertView)));
    $$("[data-alert-review]").forEach(b=>b.addEventListener("click",()=>{const a=state.alerts.find(x=>x.id===+b.dataset.alertReview);a.reviewed=true;a.status="Atendida";saveState(state);renderAlerts();toast("Alerta marcada como revisada.");}));
    refreshIcons();
  }

  function showAlert(id){
    const a=state.alerts.find(x=>x.id===id);if(!a)return;
    $("#alertDetailContent").innerHTML=`
      <div class="modal-title"><span class="modal-icon ${a.priority==="Alta"?"purple":"blue"}"><i data-lucide="bell-ring"></i></span><div><h3>${esc(a.title)}</h3><p>${esc(a.reporter)} · ${fmtDate(a.date)}</p></div></div>
      <div class="detail-grid"><div class="detail-box"><small>Prioridad</small><b>${esc(a.priority)}</b></div><div class="detail-box"><small>Origen</small><b>${esc(a.source)}</b></div><div class="detail-box"><small>Estado</small><b>${a.reviewed?"Revisada":esc(a.status)}</b></div></div>
      <div class="detail-section"><h4>Descripción</h4><p>${esc(a.description)}</p></div>
      <div class="modal-actions">
        <button class="btn btn-soft" id="editAlertFromModal"><i data-lucide="pencil"></i> Editar</button>
        ${!a.reviewed?`<button class="btn btn-soft" id="reviewFromModal"><i data-lucide="check"></i> Marcar revisada</button>`:""}
        <button class="btn btn-primary" id="alertToCase"><i data-lucide="folder-plus"></i> Convertir en caso</button>
      </div>`;
    openModal("alertDetailModal");
    $("#editAlertFromModal")?.addEventListener("click",()=>{closeModal($("#alertDetailModal"));openAlertEditor(a.id);});
    $("#reviewFromModal")?.addEventListener("click",()=>{a.reviewed=true;a.status="Atendida";saveState(state);closeModal($("#alertDetailModal"));renderAlerts();toast("Alerta revisada.");});
    $("#alertToCase")?.addEventListener("click",()=>{
      const next=Math.max(...state.cases.map(c=>c.id))+1;
      state.cases.unshift({id:next,student:a.student,grade:a.grade,type:a.title.split("—")[1]?.trim()||"Situación reportada",risk:a.priority==="Alta"?"Alto":a.priority==="Media"?"Medio":"Bajo",status:"Pendiente",updated:"Ahora",description:a.description,notes:["Caso creado desde la alerta #"+a.id+"."]});
      a.reviewed=true;a.status="Atendida";saveState(state);closeModal($("#alertDetailModal"));renderAlerts();toast(`Alerta convertida en caso #${next}.`);
    });
    refreshIcons();
  }

  function initAlerts(){
    if(document.body.dataset.page!=="alertas")return;
    ["alertSearch","alertPriorityFilter","alertSourceFilter"].forEach(id=>$("#"+id)?.addEventListener(id==="alertSearch"?"input":"change",renderAlerts));
    $("#newAlertBtn")?.addEventListener("click",()=>openAlertEditor());
    $("#markAllReviewed")?.addEventListener("click",()=>{state.alerts.forEach(a=>{a.reviewed=true;a.status="Atendida"});saveState(state);renderAlerts();toast("Todas las alertas quedaron revisadas.");});
    $("#alertEditorForm")?.addEventListener("submit",e=>{
      e.preventDefault();
      const fd=new FormData(e.currentTarget), id=Number(fd.get("id"))||null;
      const data={
        student:fd.get("student").trim(),
        grade:fd.get("grade").trim(),
        title:fd.get("title").trim(),
        priority:fd.get("priority"),
        source:fd.get("source"),
        reporter:fd.get("reporter").trim(),
        date:fd.get("date"),
        description:fd.get("description").trim()
      };
      if(id){
        const a=state.alerts.find(x=>x.id===id);
        if(a) Object.assign(a,data);
        toast("Alerta actualizada correctamente.");
      }else{
        const next=state.alerts.length ? Math.max(...state.alerts.map(a=>a.id))+1 : 1;
        state.alerts.unshift({id:next,...data,status:data.priority==="Seguimiento"?"Seguimiento":"Activa",reviewed:false});
        toast("Nueva alerta registrada.");
      }
      saveState(state);
      closeModal($("#alertEditorModal"));
      renderAlerts();
    });
    renderAlerts();
  }

  function renderTracking(){
    if(document.body.dataset.page!=="seguimiento")return;
    const count=s=>state.cases.filter(c=>c.status===s).length;
    $("#trackingSummary").innerHTML=[
      ["Pendientes",count("Pendiente"),"clock-3","orange"],
      ["En proceso",count("En proceso"),"refresh-cw","blue"],
      ["Escalados",count("Escalado"),"users-round","purple"],
      ["Cerrados",count("Cerrado"),"check-circle-2","green"]
    ].map(x=>`<article><span class="summary-icon ${x[3]}"><i data-lucide="${x[2]}"></i></span><div><small>${x[0]}</small><strong>${x[1]}</strong></div></article>`).join("");
    const q=slug($("#trackingSearch")?.value||""), stage=$("#trackingStageFilter")?.value||"";
    const items=state.cases.filter(c=>(!q||slug(`${c.id} ${c.student} ${c.grade}`).includes(q))&&(!stage||c.status===stage));
    const steps={Pendiente:1,"En proceso":2,Escalado:3,Cerrado:4};
    $("#trackingGrid").innerHTML=items.map(c=>`<article class="tracking-card">
      <div class="tracking-card-head"><div><h4>Caso #${c.id} · ${esc(c.student)}</h4><p>${esc(c.grade)} · ${esc(c.type)}</p></div><span class="pill ${statusClass(c.status)}">${c.status}</span></div>
      <div class="tracking-progress">${[1,2,3,4].map(i=>`<span class="${i<=steps[c.status]?"done":""}"></span>`).join("")}</div>
      <div class="tracking-footer"><small>Última actualización: ${esc(c.updated)}</small><button data-track="${c.id}">Abrir seguimiento</button></div>
    </article>`).join("")||"<p>No se encontraron casos.</p>";
    $$("[data-track]").forEach(b=>b.addEventListener("click",()=>showTracking(+b.dataset.track)));
    refreshIcons();
  }
  function showTracking(id){
    const c=state.cases.find(x=>x.id===id);if(!c)return;
    $("#trackingModalContent").innerHTML=`
      <div class="modal-title"><span class="modal-icon purple"><i data-lucide="activity"></i></span><div><h3>Seguimiento · Caso #${c.id}</h3><p>${esc(c.student)} · ${esc(c.grade)}</p></div></div>
      <div class="detail-grid"><div class="detail-box"><small>Estado</small><b>${esc(c.status)}</b></div><div class="detail-box"><small>Riesgo</small><b>${esc(c.risk)}</b></div><div class="detail-box"><small>Actualizado</small><b>${esc(c.updated)}</b></div></div>
      <div class="detail-section"><h4>Historial de notas</h4><div class="note-list">${(c.notes||[]).map(n=>`<div class="note-item"><b>Nota institucional</b><p>${esc(n)}</p></div>`).join("")}</div></div>
      <form class="inline-note-form" id="trackingNoteForm"><input name="note" required placeholder="Agregar nota de seguimiento..."><button type="submit"><i data-lucide="send"></i></button></form>
      <div class="modal-actions"><select id="trackingStatusSelect" class="modal-select"><option ${c.status==="Pendiente"?"selected":""}>Pendiente</option><option ${c.status==="En proceso"?"selected":""}>En proceso</option><option ${c.status==="Escalado"?"selected":""}>Escalado</option><option ${c.status==="Cerrado"?"selected":""}>Cerrado</option></select><button class="btn btn-primary" id="trackingSaveState">Actualizar etapa</button></div>`;
    openModal("trackingModal");
    $("#trackingNoteForm").addEventListener("submit",e=>{e.preventDefault();const n=e.currentTarget.elements.note.value.trim();if(!n)return;c.notes=c.notes||[];c.notes.push(n);c.updated="Ahora";saveState(state);showTracking(c.id);toast("Nota agregada.");});
    $("#trackingSaveState").addEventListener("click",()=>{c.status=$("#trackingStatusSelect").value;c.updated="Ahora";saveState(state);closeModal($("#trackingModal"));renderTracking();toast("Etapa de seguimiento actualizada.");});
    refreshIcons();
  }
  function initTracking(){
    if(document.body.dataset.page!=="seguimiento")return;
    $("#trackingSearch")?.addEventListener("input",renderTracking);$("#trackingStageFilter")?.addEventListener("change",renderTracking);renderTracking();
  }

  function openMeetingEditor(id=null){
    const form=$("#meetingForm"); if(!form) return;
    form.reset(); form.elements.id.value="";
    $("#meetingModalTitle").textContent=id?"Editar actividad":"Nueva actividad";
    if(id){
      const m=state.meetings.find(x=>x.id===id); if(!m)return;
      form.elements.id.value=m.id; form.elements.title.value=m.title; form.elements.type.value=m.type;
      form.elements.date.value=m.date; form.elements.time.value=m.time; form.elements.description.value=m.description||"";
    }else{
      form.elements.date.value=new Date().toISOString().slice(0,10);
    }
    openModal("meetingModal");
  }

  function openCommitmentEditor(id=null){
    const form=$("#commitmentForm"); if(!form)return;
    form.reset(); form.elements.id.value="";
    $("#commitmentModalTitle").textContent=id?"Editar compromiso":"Nuevo compromiso";
    if(id){
      const c=state.commitments.find(x=>x.id===id); if(!c)return;
      form.elements.id.value=c.id; form.elements.text.value=c.text; form.elements.detail.value=c.detail||"";
    }
    openModal("commitmentModal");
  }

  function openMediationEditor(id=null){
    const form=$("#mediationForm"); if(!form)return;
    form.reset(); form.elements.id.value="";
    $("#mediationModalTitle").textContent=id?"Editar mediación":"Registrar mediación";
    if(id){
      const m=state.mediations.find(x=>x.id===id); if(!m)return;
      form.elements.id.value=m.id; form.elements.participants.value=m.participants; form.elements.date.value=m.date; form.elements.agreements.value=m.agreements;
    }else{
      form.elements.date.value=new Date().toISOString().slice(0,10);
    }
    openModal("mediationModal");
  }

  function renderMeetings(){
    if(document.body.dataset.page!=="convivencia")return;
    $("#meetingCount").textContent=state.meetings.length;
    const completed=state.commitments.filter(c=>c.done).length;
    $("#pendingCommitments").textContent=state.commitments.length-completed;
    $("#commitmentRate").textContent=Math.round((completed/state.commitments.length)*100||0)+"%";

    $("#meetingList").innerHTML=state.meetings.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(m=>{
      const d=new Date(m.date+"T12:00:00"), day=d.getDate(), mon=d.toLocaleDateString("es-CO",{month:"short"}).replace(".","");
      return `<div class="timeline-item editable-item">
        <span class="date-chip"><b>${day}</b><small>${mon}</small></span>
        <div><h4>${esc(m.title)}</h4><p>${esc(m.type)} · ${esc(m.description||"Actividad institucional")}</p></div>
        <span class="timeline-time">${esc(m.time)}</span>
        <div class="item-actions">
          <button class="mini-action edit" data-meeting-edit="${m.id}" title="Editar actividad"><i data-lucide="pencil"></i></button>
          <button class="mini-action delete" data-meeting-delete="${m.id}" title="Eliminar actividad"><i data-lucide="trash-2"></i></button>
        </div>
      </div>`;
    }).join("") || `<p class="empty-state">No hay actividades registradas.</p>`;

    $("#commitmentsList").innerHTML=state.commitments.map(c=>`<div class="commitment ${c.done?"done":""}">
      <input type="checkbox" data-commit="${c.id}" ${c.done?"checked":""} aria-label="Marcar compromiso">
      <div class="commitment-copy"><b>${esc(c.text)}</b><p>${esc(c.detail)}</p></div>
      <div class="item-actions">
        <button class="mini-action edit" data-commit-edit="${c.id}" title="Editar compromiso"><i data-lucide="pencil"></i></button>
        <button class="mini-action delete" data-commit-delete="${c.id}" title="Eliminar compromiso"><i data-lucide="trash-2"></i></button>
      </div>
    </div>`).join("") || `<p class="empty-state">No hay compromisos registrados.</p>`;

    $("#mediationsList").innerHTML=(state.mediations||[]).map(m=>`<div class="editable-row">
      <span class="editable-row-icon"><i data-lucide="handshake"></i></span>
      <div class="editable-row-copy"><b>${esc(m.participants)}</b><p>${fmtDate(m.date)} · ${esc(m.agreements)}</p></div>
      <div class="item-actions">
        <button class="mini-action edit" data-mediation-edit="${m.id}" title="Editar mediación"><i data-lucide="pencil"></i></button>
        <button class="mini-action delete" data-mediation-delete="${m.id}" title="Eliminar mediación"><i data-lucide="trash-2"></i></button>
      </div>
    </div>`).join("") || `<p class="empty-state">Aún no hay mediaciones registradas.</p>`;

    $$("[data-commit]").forEach(i=>i.addEventListener("change",()=>{
      const c=state.commitments.find(x=>x.id===+i.dataset.commit); if(!c)return;
      c.done=i.checked; saveState(state); renderMeetings(); toast(i.checked?"Compromiso completado.":"Compromiso reabierto.");
    }));
    $$("[data-meeting-edit]").forEach(b=>b.addEventListener("click",()=>openMeetingEditor(+b.dataset.meetingEdit)));
    $$("[data-meeting-delete]").forEach(b=>b.addEventListener("click",()=>{
      const id=+b.dataset.meetingDelete; if(!confirm("¿Eliminar esta actividad de convivencia?"))return;
      state.meetings=state.meetings.filter(x=>x.id!==id); saveState(state); renderMeetings(); toast("Actividad eliminada.");
    }));
    $$("[data-commit-edit]").forEach(b=>b.addEventListener("click",()=>openCommitmentEditor(+b.dataset.commitEdit)));
    $$("[data-commit-delete]").forEach(b=>b.addEventListener("click",()=>{
      const id=+b.dataset.commitDelete; if(!confirm("¿Eliminar este compromiso?"))return;
      state.commitments=state.commitments.filter(x=>x.id!==id); saveState(state); renderMeetings(); toast("Compromiso eliminado.");
    }));
    $$("[data-mediation-edit]").forEach(b=>b.addEventListener("click",()=>openMediationEditor(+b.dataset.mediationEdit)));
    $$("[data-mediation-delete]").forEach(b=>b.addEventListener("click",()=>{
      const id=+b.dataset.mediationDelete; if(!confirm("¿Eliminar esta mediación?"))return;
      state.mediations=state.mediations.filter(x=>x.id!==id); saveState(state); renderMeetings(); toast("Mediación eliminada.");
    }));
    refreshIcons();
  }

  function initConvivencia(){
    if(document.body.dataset.page!=="convivencia")return;

    $("#newMeetingBtn")?.addEventListener("click",()=>openMeetingEditor());
    $("#addMeetingLink")?.addEventListener("click",()=>openMeetingEditor());
    $("#newCommitmentBtn")?.addEventListener("click",()=>openCommitmentEditor());
    $("#addCommitmentLink")?.addEventListener("click",()=>openCommitmentEditor());
    $("#newMediationBtn")?.addEventListener("click",()=>openMediationEditor());
    $("#addMediationLink")?.addEventListener("click",()=>openMediationEditor());

    $("#meetingForm")?.addEventListener("submit",e=>{
      e.preventDefault(); const fd=new FormData(e.currentTarget), id=Number(fd.get("id"))||null;
      const data={title:fd.get("title").trim(),type:fd.get("type"),date:fd.get("date"),time:fd.get("time"),description:fd.get("description").trim()};
      if(id){
        const m=state.meetings.find(x=>x.id===id); if(m)Object.assign(m,data);
        toast("Actividad actualizada.");
      }else{
        state.meetings.push({id:Date.now(),...data}); toast("Actividad agendada.");
      }
      saveState(state); closeModal($("#meetingModal")); renderMeetings();
    });

    $("#commitmentForm")?.addEventListener("submit",e=>{
      e.preventDefault(); const fd=new FormData(e.currentTarget), id=Number(fd.get("id"))||null;
      const data={text:fd.get("text").trim(),detail:fd.get("detail").trim()};
      if(id){
        const c=state.commitments.find(x=>x.id===id); if(c)Object.assign(c,data);
        toast("Compromiso actualizado.");
      }else{
        state.commitments.unshift({id:Date.now(),...data,done:false}); toast("Compromiso creado.");
      }
      saveState(state); closeModal($("#commitmentModal")); renderMeetings();
    });

    $("#mediationForm")?.addEventListener("submit",e=>{
      e.preventDefault(); const fd=new FormData(e.currentTarget), id=Number(fd.get("id"))||null;
      const data={participants:fd.get("participants").trim(),date:fd.get("date"),agreements:fd.get("agreements").trim()};
      if(id){
        const m=state.mediations.find(x=>x.id===id); if(m)Object.assign(m,data);
        toast("Mediación actualizada.");
      }else{
        state.mediations.push({id:Date.now(),...data});
        state.commitments.unshift({id:Date.now()+1,text:"Revisar acuerdos de mediación",detail:`Participantes: ${data.participants}`,done:false});
        toast("Mediación registrada y compromiso creado.");
      }
      saveState(state); closeModal($("#mediationModal")); renderMeetings();
    });

    renderMeetings();
  }

  function drawBarChart(){
    const canvas=$("#barChart"); if(!canvas)return;
    const ctx=canvas.getContext("2d"), w=canvas.width,h=canvas.height;
    ctx.clearRect(0,0,w,h);
    const labels=["6°","7°","8°","9°","10°","11°"], vals=[8,10,7,5,6,4];
    const max=12, left=50, bottom=42, top=25, chartH=h-bottom-top, chartW=w-left-20, gap=18, bw=(chartW-gap*(vals.length-1))/vals.length;
    ctx.font="13px Poppins, Arial";ctx.fillStyle="#777292";ctx.textAlign="right";
    for(let i=0;i<=max;i+=3){const y=top+chartH-(i/max)*chartH;ctx.strokeStyle="#EEEAF5";ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w-15,y);ctx.stroke();ctx.fillText(i,left-10,y+4);}
    vals.forEach((v,i)=>{const x=left+i*(bw+gap), bh=(v/max)*chartH,y=top+chartH-bh;const grad=ctx.createLinearGradient(0,y,0,y+bh);grad.addColorStop(0,"#6C4DF6");grad.addColorStop(1,"#B8A8FF");ctx.fillStyle=grad;roundRect(ctx,x,y,bw,bh,10);ctx.fill();ctx.fillStyle="#4A4370";ctx.textAlign="center";ctx.fillText(labels[i],x+bw/2,h-16);});
  }
  function roundRect(ctx,x,y,w,h,r){const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();}
  function drawDonut(){
    const canvas=$("#donutChart");if(!canvas)return;const ctx=canvas.getContext("2d"), vals=[12,18,6,35], labels=["Pendientes","En proceso","Escalados","Cerrados"], colors=["#F4A72D","#65B8FF","#8D6AF7","#2BB673"], total=vals.reduce((a,b)=>a+b,0),cx=canvas.width/2,cy=canvas.height/2-10,r=100;ctx.clearRect(0,0,canvas.width,canvas.height);let start=-Math.PI/2;vals.forEach((v,i)=>{const ang=(v/total)*Math.PI*2;ctx.beginPath();ctx.strokeStyle=colors[i];ctx.lineWidth=34;ctx.arc(cx,cy,r,start,start+ang);ctx.stroke();start+=ang;});ctx.fillStyle="#2D245F";ctx.textAlign="center";ctx.font="700 30px Poppins, Arial";ctx.fillText(total,cx,cy+4);ctx.font="12px Poppins, Arial";ctx.fillStyle="#8B849B";ctx.fillText("casos",cx,cy+26);$("#donutLegend").innerHTML=labels.map((l,i)=>`<span class="legend-item"><i class="legend-dot" style="background:${colors[i]}"></i>${l}</span>`).join("");
  }
  function initReports(){
    if(document.body.dataset.page!=="reportes")return;drawBarChart();drawDonut();window.addEventListener("resize",()=>{drawBarChart();drawDonut()});
    $("#applyReportFilters")?.addEventListener("click",()=>toast("Filtros aplicados al reporte de demostración."));
    $("#printReport")?.addEventListener("click",()=>window.print());
    $("#exportReport")?.addEventListener("click",()=>{
      const rows=[["Grado","Alertas","Casos","Resueltos","Bienestar"],["Sexto",8,5,4,"65%"],["Séptimo",10,6,5,"78%"],["Octavo",7,5,3,"52%"],["Noveno",5,4,3,"41%"],["Décimo",6,4,3,"68%"],["Once",4,3,2,"47%"]];
      const csv=rows.map(r=>r.join(",")).join("\n");const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="reporte_convivencia_sentir.csv";a.click();URL.revokeObjectURL(url);toast("Reporte CSV exportado.");
    });
  }

  function initProfile(){
    if(document.body.dataset.page!=="perfil")return;
    const input=$("#profilePhotoInput");
    input?.addEventListener("change",()=>{
      const file=input.files?.[0];if(!file)return;
      if(file.size>3*1024*1024){toast("Usa una imagen de máximo 3 MB para esta demo.");return;}
      const reader=new FileReader();reader.onload=()=>{let p={};try{p=JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}")}catch{};p.avatar=reader.result;localStorage.setItem(PROFILE_KEY,JSON.stringify(p));loadProfile();toast("Foto de perfil actualizada.");};reader.readAsDataURL(file);
    });
    $("#profileForm")?.addEventListener("submit",e=>{e.preventDefault();const fd=new FormData(e.currentTarget);let p={};try{p=JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}")}catch{};p.name=fd.get("name");p.email=fd.get("email");p.phone=fd.get("phone");p.bio=fd.get("bio");localStorage.setItem(PROFILE_KEY,JSON.stringify(p));loadProfile();toast("Perfil guardado correctamente.");});
  }

  function init(){
    initShell();
    renderDashboard();
    initCases();
    initAlerts();
    initTracking();
    initConvivencia();
    initReports();
    initProfile();
    refreshIcons();
  }
  document.addEventListener("DOMContentLoaded",init);
})();
