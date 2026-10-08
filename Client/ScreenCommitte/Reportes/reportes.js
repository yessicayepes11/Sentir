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

  const reportModal =
    document.getElementById("reportModal");

  const modalClose =
    document.getElementById("modalClose");

  const modalReportTitle =
    document.getElementById("modalReportTitle");

  const modalReportDescription =
    document.getElementById("modalReportDescription");

  const reportButtons =
    document.querySelectorAll(
      ".report-button, .table-report-button"
    );

  const toast =
    document.getElementById("toast");


  const PROFILE_PHOTO_KEY =
    "sentirCommitteeProfilePhoto";


  // SIDEBAR

  menuButton.addEventListener(
    "click",
    function () {

      sidebar.classList.toggle(
        "open"
      );

      mobileOverlay.classList.toggle(
        "show"
      );

    }
  );


  mobileOverlay.addEventListener(
    "click",
    closeSidebar
  );


  function closeSidebar() {

    sidebar.classList.remove(
      "open"
    );

    mobileOverlay.classList.remove(
      "show"
    );

  }


  window.addEventListener(
    "resize",
    function () {

      if (
        window.innerWidth > 900
      ) {

        closeSidebar();

      }

    }
  );


  // PERFIL

  profileBox.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();

      profileMenu.classList.toggle(
        "show"
      );

    }
  );


  document.addEventListener(
    "click",
    function (event) {

      if (
        !event.target.closest(
          ".profile-wrapper"
        )
      ) {

        profileMenu.classList.remove(
          "show"
        );

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
        !file.type.startsWith(
          "image/"
        )
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

    }
  );


  const savedPhoto =
    localStorage.getItem(
      PROFILE_PHOTO_KEY
    );


  if (savedPhoto) {

    showProfilePhoto(
      savedPhoto
    );

  }


  function showProfilePhoto(
    imageData
  ) {

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
        PROFILE_PHOTO_KEY &&
        event.newValue
      ) {

        showProfilePhoto(
          event.newValue
        );

      }

    }
  );


  // ABRIR REPORTES

  reportButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          const reportName =
            button.dataset.report;


          const description =
            button.dataset.description;


          modalReportTitle.textContent =
            reportName;


          modalReportDescription.textContent =
            description;


          reportModal.classList.add(
            "show"
          );

        }
      );

    }
  );


  // CERRAR MODAL

  modalClose.addEventListener(
    "click",
    closeModal
  );


  reportModal.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        reportModal
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

    reportModal.classList.remove(
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