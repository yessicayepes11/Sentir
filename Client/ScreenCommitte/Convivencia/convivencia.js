document.addEventListener("DOMContentLoaded", function () {

  const sidebar =
    document.getElementById("sidebar");

  const menuButton =
    document.getElementById("menuButton");

  const mobileOverlay =
    document.getElementById("mobileOverlay");

  const profileBox =
    document.getElementById("profileBox");

  const profileMenu =
    document.getElementById("profileMenu");

  const changePhotoButton =
    document.getElementById("changePhotoButton");

  const photoInput =
    document.getElementById("photoInput");

  const profilePhoto =
    document.getElementById("profilePhoto");

  const profileFallback =
    document.getElementById("profileFallback");

  const toast =
    document.getElementById("toast");

  const formModal =
    document.getElementById("formModal");

  const modalClose =
    document.getElementById("modalClose");

  const modalTitle =
    document.getElementById("modalTitle");

  const dynamicForm =
    document.getElementById("dynamicForm");

  const formTitle =
    document.getElementById("formTitle");

  const formDescription =
    document.getElementById("formDescription");

  const dateTimeRow =
    document.getElementById("dateTimeRow");

  const formDate =
    document.getElementById("formDate");

  const formTime =
    document.getElementById("formTime");

  const activitiesList =
    document.getElementById("activitiesList");

  const commitmentList =
    document.getElementById("commitmentList");

  const mediationList =
    document.getElementById("mediationList");

  const pendingCounter =
    document.getElementById("pendingCounter");

  const complianceCounter =
    document.getElementById("complianceCounter");

  const PROFILE_PHOTO_KEY =
    "sentirCommitteeProfilePhoto";

  let formType = "";
  let editingElement = null;


  // SIDEBAR

  menuButton.addEventListener("click", function () {

    sidebar.classList.toggle("open");

    mobileOverlay.classList.toggle("show");

  });


  mobileOverlay.addEventListener("click", function () {

    closeSidebar();

  });


  function closeSidebar() {

    sidebar.classList.remove("open");

    mobileOverlay.classList.remove("show");

  }


  window.addEventListener("resize", function () {

    if (window.innerWidth > 900) {

      closeSidebar();

    }

  });


  // PERFIL

  profileBox.addEventListener("click", function (event) {

    event.stopPropagation();

    profileMenu.classList.toggle("show");

  });


  document.addEventListener("click", function (event) {

    if (
      !event.target.closest(".profile-wrapper")
    ) {

      profileMenu.classList.remove("show");

    }

  });


  // FOTO

  changePhotoButton.addEventListener("click", function () {

    photoInput.click();

  });


  photoInput.addEventListener("change", function (event) {

    const file =
      event.target.files[0];


    if (!file) {
      return;
    }


    if (
      !file.type.startsWith("image/")
    ) {

      showToast(
        "Selecciona una imagen válida."
      );

      return;

    }


    const reader =
      new FileReader();


    reader.onload = function () {

      const imageData =
        reader.result;


      localStorage.setItem(
        PROFILE_PHOTO_KEY,
        imageData
      );


      showProfilePhoto(
        imageData
      );


      showToast(
        "Foto actualizada correctamente."
      );

    };


    reader.readAsDataURL(file);

  });


  const savedPhoto =
    localStorage.getItem(
      PROFILE_PHOTO_KEY
    );


  if (savedPhoto) {

    showProfilePhoto(
      savedPhoto
    );

  }


  function showProfilePhoto(imageData) {

    profilePhoto.src =
      imageData;

    profilePhoto.style.display =
      "block";

    profileFallback.style.display =
      "none";

  }


  // ABRIR FORMULARIOS

  document.getElementById(
    "newActivityButton"
  ).addEventListener(
    "click",
    function () {

      openForm(
        "activity",
        "Nueva actividad"
      );

    }
  );


  document.getElementById(
    "addActivityButton"
  ).addEventListener(
    "click",
    function () {

      openForm(
        "activity",
        "Nueva actividad"
      );

    }
  );


  document.getElementById(
    "newCommitmentButton"
  ).addEventListener(
    "click",
    function () {

      openForm(
        "commitment",
        "Nuevo compromiso"
      );

    }
  );


  document.getElementById(
    "addCommitmentButton"
  ).addEventListener(
    "click",
    function () {

      openForm(
        "commitment",
        "Nuevo compromiso"
      );

    }
  );


  document.getElementById(
    "registerMediationButton"
  ).addEventListener(
    "click",
    function () {

      openForm(
        "mediation",
        "Registrar mediación"
      );

    }
  );


  document.getElementById(
    "addMediationButton"
  ).addEventListener(
    "click",
    function () {

      openForm(
        "mediation",
        "Registrar mediación"
      );

    }
  );


  function openForm(
    type,
    title
  ) {

    formType = type;

    editingElement = null;

    modalTitle.textContent =
      title;

    dynamicForm.reset();


    if (
      type === "commitment"
    ) {

      dateTimeRow.style.display =
        "none";

    } else {

      dateTimeRow.style.display =
        "grid";

    }


    formModal.classList.add(
      "show"
    );

  }


  // GUARDAR

  dynamicForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();


      if (
        editingElement
      ) {

        updateExistingItem();

      } else {

        createNewItem();

      }


      closeModal();

    }
  );


  function createNewItem() {

    if (
      formType === "activity"
    ) {

      createActivity();

    }


    if (
      formType === "commitment"
    ) {

      createCommitment();

    }


    if (
      formType === "mediation"
    ) {

      createMediation();

    }

  }


  // CREAR ACTIVIDAD

  function createActivity() {

    const date =
      formDate.value
        ? new Date(
            formDate.value + "T00:00:00"
          )
        : new Date();


    const day =
      date.getDate();


    const month =
      date
        .toLocaleString(
          "es-CO",
          { month: "short" }
        )
        .replace(".", "")
        .toUpperCase();


    const activity =
      document.createElement(
        "article"
      );


    activity.className =
      "activity-item";


    activity.innerHTML = `
      <div class="date-box">
        <strong>${day}</strong>
        <span>${month}</span>
      </div>

      <div class="activity-info">
        <strong>${formTitle.value}</strong>
        <span>${formDescription.value}</span>
      </div>

      <div class="activity-hour">
        ${formTime.value || "08:00"}
      </div>

      <div class="item-actions">
        <button class="edit-button activity-edit">
          <i class="fa-solid fa-pen"></i>
        </button>

        <button class="delete-button activity-delete">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    `;


    activitiesList.appendChild(
      activity
    );


    showToast(
      "Actividad agregada."
    );

  }


  // CREAR COMPROMISO

  function createCommitment() {

    const item =
      document.createElement(
        "article"
      );


    item.className =
      "commitment-item";


    item.innerHTML = `
      <label class="check-area">
        <input
          type="checkbox"
          class="commitment-checkbox"
        >

        <span class="custom-checkbox"></span>
      </label>

      <div class="commitment-info">
        <strong>${formTitle.value}</strong>
        <span>${formDescription.value}</span>
      </div>

      <div class="item-actions">
        <button class="edit-button commitment-edit">
          <i class="fa-solid fa-pen"></i>
        </button>

        <button class="delete-button commitment-delete">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    `;


    commitmentList.appendChild(
      item
    );


    updateCommitmentStats();


    showToast(
      "Compromiso agregado."
    );

  }


  // CREAR MEDIACIÓN

  function createMediation() {

    const item =
      document.createElement(
        "article"
      );


    item.className =
      "mediation-item";


    item.innerHTML = `
      <div class="mediation-icon">
        <i class="fa-solid fa-handshake"></i>
      </div>

      <div class="mediation-info">
        <strong>${formTitle.value}</strong>
        <span>${formDescription.value}</span>
      </div>

      <div class="item-actions">
        <button class="edit-button mediation-edit">
          <i class="fa-solid fa-pen"></i>
        </button>

        <button class="delete-button mediation-delete">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    `;


    mediationList.appendChild(
      item
    );


    showToast(
      "Mediación registrada."
    );

  }


  // EVENTOS DINÁMICOS

  document.addEventListener(
    "click",
    function (event) {

      const deleteButton =
        event.target.closest(
          ".delete-button"
        );


      if (deleteButton) {

        const item =
          deleteButton.closest(
            ".activity-item, .commitment-item, .mediation-item"
          );


        if (
          item &&
          confirm(
            "¿Deseas eliminar este elemento?"
          )
        ) {

          item.remove();


          updateCommitmentStats();


          showToast(
            "Elemento eliminado."
          );

        }

      }


      const editButton =
        event.target.closest(
          ".edit-button"
        );


      if (editButton) {

        editItem(
          editButton
        );

      }

    }
  );


  // EDITAR

  function editItem(button) {

    editingElement =
      button.closest(
        ".activity-item, .commitment-item, .mediation-item"
      );


    if (
      editingElement.classList.contains(
        "activity-item"
      )
    ) {

      formType =
        "activity";

      modalTitle.textContent =
        "Editar actividad";

      formTitle.value =
        editingElement
          .querySelector(
            ".activity-info strong"
          )
          .textContent
          .trim();

      formDescription.value =
        editingElement
          .querySelector(
            ".activity-info span"
          )
          .textContent
          .trim();

      formTime.value =
        editingElement
          .querySelector(
            ".activity-hour"
          )
          .textContent
          .trim();

      dateTimeRow.style.display =
        "grid";

    }


    if (
      editingElement.classList.contains(
        "commitment-item"
      )
    ) {

      formType =
        "commitment";

      modalTitle.textContent =
        "Editar compromiso";

      formTitle.value =
        editingElement
          .querySelector(
            ".commitment-info strong"
          )
          .textContent
          .trim();

      formDescription.value =
        editingElement
          .querySelector(
            ".commitment-info span"
          )
          .textContent
          .trim();

      dateTimeRow.style.display =
        "none";

    }


    if (
      editingElement.classList.contains(
        "mediation-item"
      )
    ) {

      formType =
        "mediation";

      modalTitle.textContent =
        "Editar mediación";

      formTitle.value =
        editingElement
          .querySelector(
            ".mediation-info strong"
          )
          .textContent
          .trim();

      formDescription.value =
        editingElement
          .querySelector(
            ".mediation-info span"
          )
          .textContent
          .trim();

      dateTimeRow.style.display =
        "grid";

    }


    formModal.classList.add(
      "show"
    );

  }


  function updateExistingItem() {

    if (
      formType === "activity"
    ) {

      editingElement
        .querySelector(
          ".activity-info strong"
        )
        .textContent =
          formTitle.value;


      editingElement
        .querySelector(
          ".activity-info span"
        )
        .textContent =
          formDescription.value;


      editingElement
        .querySelector(
          ".activity-hour"
        )
        .textContent =
          formTime.value || "08:00";

    }


    if (
      formType === "commitment"
    ) {

      editingElement
        .querySelector(
          ".commitment-info strong"
        )
        .textContent =
          formTitle.value;


      editingElement
        .querySelector(
          ".commitment-info span"
        )
        .textContent =
          formDescription.value;

    }


    if (
      formType === "mediation"
    ) {

      editingElement
        .querySelector(
          ".mediation-info strong"
        )
        .textContent =
          formTitle.value;


      editingElement
        .querySelector(
          ".mediation-info span"
        )
        .textContent =
          formDescription.value;

    }


    showToast(
      "Cambios guardados."
    );

  }


  // CHECKS

  document.addEventListener(
    "change",
    function (event) {

      if (
        event.target.classList.contains(
          "commitment-checkbox"
        )
      ) {

        const item =
          event.target.closest(
            ".commitment-item"
          );


        item.classList.toggle(
          "completed",
          event.target.checked
        );


        updateCommitmentStats();

      }

    }
  );


  function updateCommitmentStats() {

    const items =
      commitmentList.querySelectorAll(
        ".commitment-item"
      );


    const checked =
      commitmentList.querySelectorAll(
        ".commitment-checkbox:checked"
      );


    const total =
      items.length;


    const completed =
      checked.length;


    const pending =
      total - completed;


    const percentage =
      total === 0
        ? 0
        : Math.round(
            (completed / total) * 100
          );


    pendingCounter.textContent =
      pending;


    complianceCounter.textContent =
      percentage + "%";

  }


  updateCommitmentStats();


  // MODAL

  modalClose.addEventListener(
    "click",
    closeModal
  );


  formModal.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        formModal
      ) {

        closeModal();

      }

    }
  );


  function closeModal() {

    formModal.classList.remove(
      "show"
    );

    editingElement =
      null;

  }


  // TOAST

  function showToast(message) {

    toast.textContent =
      message;

    toast.classList.add(
      "show"
    );


    clearTimeout(
      window.toastTimer
    );


    window.toastTimer =
      setTimeout(
        function () {

          toast.classList.remove(
            "show"
          );

        },
        2200
      );

  }

});