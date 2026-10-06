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

  const changePhotoMainButton =
    document.getElementById("changePhotoMainButton");

  const photoInput =
    document.getElementById("photoInput");

  const profilePhoto =
    document.getElementById("profilePhoto");

  const profileFallback =
    document.getElementById("profileFallback");

  const largeProfilePhoto =
    document.getElementById("largeProfilePhoto");

  const largeProfileFallback =
    document.getElementById("largeProfileFallback");

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


  // MENÚ PERFIL

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


  // ABRIR SELECTOR FOTO

  changePhotoButton.addEventListener(
    "click",
    function () {

      photoInput.click();

    }
  );


  changePhotoMainButton.addEventListener(
    "click",
    function () {

      photoInput.click();

    }
  );


  // SELECCIONAR FOTO

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


      if (
        file.size >
        4 * 1024 * 1024
      ) {

        showToast(
          "La imagen debe pesar menos de 4 MB."
        );

        return;

      }


      const reader =
        new FileReader();


      reader.onload =
        function () {

          const imageData =
            reader.result;


          try {

            localStorage.setItem(
              PROFILE_PHOTO_KEY,
              imageData
            );


            showProfilePhoto(
              imageData
            );


            showToast(
              "Foto actualizada en todas las pantallas."
            );

          } catch (error) {

            showToast(
              "No fue posible guardar la foto."
            );

          }

        };


      reader.readAsDataURL(
        file
      );


      event.target.value = "";

    }
  );


  // CARGAR FOTO GUARDADA

  const savedPhoto =
    localStorage.getItem(
      PROFILE_PHOTO_KEY
    );


  if (savedPhoto) {

    showProfilePhoto(
      savedPhoto
    );

  }


  // MOSTRAR FOTO

  function showProfilePhoto(
    imageData
  ) {

    profilePhoto.src =
      imageData;

    profilePhoto.style.display =
      "block";

    profileFallback.style.display =
      "none";


    largeProfilePhoto.src =
      imageData;

    largeProfilePhoto.style.display =
      "block";

    largeProfileFallback.style.display =
      "none";

  }


  // SINCRONIZAR ENTRE PESTAÑAS

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