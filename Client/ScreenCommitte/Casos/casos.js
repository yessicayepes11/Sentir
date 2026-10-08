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

  const caseSearch =
    document.getElementById("caseSearch");

  const gradeFilter =
    document.getElementById("gradeFilter");

  const priorityFilter =
    document.getElementById("priorityFilter");

  const statusFilter =
    document.getElementById("statusFilter");

  const caseCards =
    document.querySelectorAll(".case-card");

  const casesCount =
    document.getElementById("casesCount");

  const summaryButtons =
    document.querySelectorAll(".summary-button");

  const caseModal =
    document.getElementById("caseModal");

  const modalClose =
    document.getElementById("modalClose");

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


  // FILTROS

  function filterCases() {

    const searchValue =
      caseSearch.value
        .toLowerCase()
        .trim();


    const gradeValue =
      gradeFilter.value;


    const priorityValue =
      priorityFilter.value;


    const statusValue =
      statusFilter.value;


    let visibleCases = 0;


    caseCards.forEach(
      function (card) {

        const cardText =
          card.innerText
            .toLowerCase();


        const cardGrade =
          card.dataset.grade;


        const cardPriority =
          card.dataset.priority;


        const cardStatus =
          card.dataset.status;


        const matchesSearch =
          cardText.includes(
            searchValue
          );


        const matchesGrade =
          gradeValue === "all" ||
          cardGrade === gradeValue;


        const matchesPriority =
          priorityValue === "all" ||
          cardPriority === priorityValue;


        const matchesStatus =
          statusValue === "all" ||
          cardStatus === statusValue;


        const shouldShow =
          matchesSearch &&
          matchesGrade &&
          matchesPriority &&
          matchesStatus;


        card.style.display =
          shouldShow
            ? "grid"
            : "none";


        if (shouldShow) {

          visibleCases++;

        }

      }
    );


    casesCount.textContent =
      visibleCases === 1
        ? "1 caso visible"
        : visibleCases +
          " casos visibles";

  }


  caseSearch.addEventListener(
    "input",
    filterCases
  );


  gradeFilter.addEventListener(
    "change",
    filterCases
  );


  priorityFilter.addEventListener(
    "change",
    filterCases
  );


  statusFilter.addEventListener(
    "change",
    filterCases
  );


  // MODAL

  summaryButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          document.getElementById(
            "modalStudent"
          ).textContent =
            button.dataset.student;


          document.getElementById(
            "modalGrade"
          ).textContent =
            "Grado " +
            button.dataset.grade;


          document.getElementById(
            "modalCaseTitle"
          ).textContent =
            button.dataset.title;


          document.getElementById(
            "modalDescription"
          ).textContent =
            button.dataset.description;


          document.getElementById(
            "modalPriority"
          ).textContent =
            button.dataset.priority;


          document.getElementById(
            "modalStatus"
          ).textContent =
            button.dataset.status;


          document.getElementById(
            "modalReporter"
          ).textContent =
            button.dataset.reporter;


          document.getElementById(
            "modalDate"
          ).textContent =
            button.dataset.date;


          caseModal.classList.add(
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


  caseModal.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        caseModal
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

    caseModal.classList.remove(
      "show"
    );

  }

});