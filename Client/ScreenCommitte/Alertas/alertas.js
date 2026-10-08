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

  const alertSearch =
    document.getElementById("alertSearch");

  const priorityFilter =
    document.getElementById("priorityFilter");

  const statusFilter =
    document.getElementById("statusFilter");

  const alertCards =
    document.querySelectorAll(".alert-card");

  const alertModal =
    document.getElementById("alertModal");

  const modalClose =
    document.getElementById("modalClose");

  const viewAlertButtons =
    document.querySelectorAll(".view-alert-button");

  const toast =
    document.getElementById("toast");


  const PROFILE_PHOTO_KEY =
    "sentirCommitteeProfilePhoto";


  // SIDEBAR

  menuButton.addEventListener(
    "click",
    function () {

      sidebar.classList.toggle("open");

      mobileOverlay.classList.toggle("show");

    }
  );


  mobileOverlay.addEventListener(
    "click",
    closeSidebar
  );


  function closeSidebar() {

    sidebar.classList.remove("open");

    mobileOverlay.classList.remove("show");

  }


  window.addEventListener(
    "resize",
    function () {

      if (window.innerWidth > 900) {

        closeSidebar();

      }

    }
  );


  // PERFIL

  profileBox.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();

      profileMenu.classList.toggle("show");

    }
  );


  document.addEventListener(
    "click",
    function (event) {

      if (
        !event.target.closest(".profile-wrapper")
      ) {

        profileMenu.classList.remove("show");

      }

    }
  );


  // FOTO

  changePhotoButton.addEventListener(
    "click",
    function () {

      photoInput.click();

    }
  );


  photoInput.addEventListener(
    "change",
    function (event) {

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


      reader.onload =
        function () {

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


      reader.readAsDataURL(
        file
      );

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


  window.addEventListener(
    "storage",
    function (event) {

      if (
        event.key ===
        PROFILE_PHOTO_KEY
      ) {

        if (event.newValue) {

          showProfilePhoto(
            event.newValue
          );

        }

      }

    }
  );


  // FILTRAR ALERTAS

  function filterAlerts() {

    const searchValue =
      alertSearch.value
        .toLowerCase()
        .trim();


    const priorityValue =
      priorityFilter.value;


    const statusValue =
      statusFilter.value;


    alertCards.forEach(
      function (card) {

        const text =
          card.innerText
            .toLowerCase();


        const priority =
          card.dataset.priority;


        const status =
          card.dataset.status;


        const matchesSearch =
          text.includes(
            searchValue
          );


        const matchesPriority =
          priorityValue === "all" ||
          priority === priorityValue;


        const matchesStatus =
          statusValue === "all" ||
          status === statusValue;


        const showCard =
          matchesSearch &&
          matchesPriority &&
          matchesStatus;


        card.style.display =
          showCard
            ? "block"
            : "none";

      }
    );

  }


  alertSearch.addEventListener(
    "input",
    filterAlerts
  );


  priorityFilter.addEventListener(
    "change",
    filterAlerts
  );


  statusFilter.addEventListener(
    "change",
    filterAlerts
  );


  // MODAL DE ALERTA

  viewAlertButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          const name =
            button.dataset.name;

          const grade =
            button.dataset.grade;

          const title =
            button.dataset.title;

          const description =
            button.dataset.description;

          const priority =
            button.dataset.priority;

          const status =
            button.dataset.status;


          document.getElementById(
            "modalStudent"
          ).textContent =
            name;


          document.getElementById(
            "modalGrade"
          ).textContent =
            "Grado " + grade;


          document.getElementById(
            "modalTitle"
          ).textContent =
            title;


          document.getElementById(
            "modalDescription"
          ).textContent =
            description;


          document.getElementById(
            "modalPriority"
          ).textContent =
            priority;


          document.getElementById(
            "modalStatus"
          ).textContent =
            status;


          alertModal.classList.add(
            "show"
          );

        }
      );

    }
  );


  modalClose.addEventListener(
    "click",
    closeModal
  );


  alertModal.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        alertModal
      ) {

        closeModal();

      }

    }
  );


  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape"
      ) {

        closeModal();

      }

    }
  );


  function closeModal() {

    alertModal.classList.remove(
      "show"
    );

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