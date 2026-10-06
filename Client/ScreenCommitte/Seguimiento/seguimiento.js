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


  const trackingSearch =
    document.getElementById("trackingSearch");

  const gradeFilter =
    document.getElementById("gradeFilter");

  const statusFilter =
    document.getElementById("statusFilter");

  const trackingCards =
    document.querySelectorAll(".tracking-card");


  const trackingModal =
    document.getElementById("trackingModal");

  const modalClose =
    document.getElementById("modalClose");

  const viewTrackingButtons =
    document.querySelectorAll(".view-tracking-button");


  const modalStudent =
    document.getElementById("modalStudent");

  const modalGrade =
    document.getElementById("modalGrade");

  const modalCase =
    document.getElementById("modalCase");

  const modalStatus =
    document.getElementById("modalStatus");

  const modalProgress =
    document.getElementById("modalProgress");

  const modalProgressFill =
    document.getElementById("modalProgressFill");

  const modalResponsible =
    document.getElementById("modalResponsible");

  const modalLast =
    document.getElementById("modalLast");

  const modalNext =
    document.getElementById("modalNext");

  const modalDescription =
    document.getElementById("modalDescription");


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


  // FOTO DE PERFIL

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

        };


      reader.readAsDataURL(file);

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
        event.key === PROFILE_PHOTO_KEY &&
        event.newValue
      ) {

        showProfilePhoto(
          event.newValue
        );

      }

    }
  );


  // FILTRAR SEGUIMIENTOS

  function filterTracking() {

    const searchValue =
      trackingSearch.value
        .toLowerCase()
        .trim();


    const gradeValue =
      gradeFilter.value;


    const statusValue =
      statusFilter.value;


    trackingCards.forEach(
      function (card) {

        const cardText =
          card.innerText
            .toLowerCase();


        const grade =
          card.dataset.grade;


        const status =
          card.dataset.status;


        const matchesSearch =
          cardText.includes(
            searchValue
          );


        const matchesGrade =
          gradeValue === "all" ||
          grade === gradeValue;


        const matchesStatus =
          statusValue === "all" ||
          status === statusValue;


        const shouldShow =
          matchesSearch &&
          matchesGrade &&
          matchesStatus;


        card.style.display =
          shouldShow
            ? "block"
            : "none";

      }
    );

  }


  trackingSearch.addEventListener(
    "input",
    filterTracking
  );


  gradeFilter.addEventListener(
    "change",
    filterTracking
  );


  statusFilter.addEventListener(
    "change",
    filterTracking
  );


  // ABRIR DETALLE

  viewTrackingButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          modalStudent.textContent =
            button.dataset.student;


          modalGrade.textContent =
            "Grado " +
            button.dataset.grade;


          modalCase.textContent =
            button.dataset.case;


          modalStatus.textContent =
            button.dataset.status;


          modalProgress.textContent =
            button.dataset.progress;


          modalResponsible.textContent =
            button.dataset.responsible;


          modalLast.textContent =
            button.dataset.last;


          modalNext.textContent =
            button.dataset.next;


          modalDescription.textContent =
            button.dataset.description;


          const percentage =
            parseInt(
              button.dataset.progress
            );


          modalProgressFill.style.width =
            "0%";


          trackingModal.classList.add(
            "show"
          );


          setTimeout(
            function () {

              modalProgressFill.style.width =
                percentage + "%";

            },
            100
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


  trackingModal.addEventListener(
    "click",
    function (event) {

      if (
        event.target === trackingModal
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

    trackingModal.classList.remove(
      "show"
    );

  }

});