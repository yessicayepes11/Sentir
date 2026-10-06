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


  const PROFILE_PHOTO_KEY =
    "sentirCommitteeProfilePhoto";


  // SIDEBAR MOBILE

  menuButton.addEventListener(
    "click",
    function () {

      sidebar.classList.toggle("open");

      mobileOverlay.classList.toggle("show");

    }
  );


  mobileOverlay.addEventListener(
    "click",
    function () {

      closeSidebar();

    }
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


  // CAMBIAR FOTO

  changePhotoButton.addEventListener(
    "click",
    function () {

      photoInput.click();

    }
  );


  photoInput.addEventListener(
    "change",
    function (event) {

      const selectedFile =
        event.target.files[0];


      if (!selectedFile) {
        return;
      }


      if (
        !selectedFile.type.startsWith("image/")
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


          try {

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

          } catch (error) {

            showToast(
              "No fue posible guardar la imagen."
            );

          }

        };


      reader.readAsDataURL(
        selectedFile
      );

  });


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

  function showProfilePhoto(imageData) {

    profilePhoto.src =
      imageData;

    profilePhoto.style.display =
      "block";

    profileFallback.style.display =
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