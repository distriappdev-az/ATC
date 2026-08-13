document.addEventListener("DOMContentLoaded", function() {

  const usuario =
    sessionStorage.getItem("usuario") || "";

  const tipo =
    String(
      sessionStorage.getItem("tipo_usuario") || ""
    ).trim();

  const tipoNombre =
    sessionStorage.getItem(
      "tipo_usuario_nombre"
    ) || "";

  const sector =
    sessionStorage.getItem("sector") || "";


  // ==========================================
  // VALIDAR SESIÓN
  // ==========================================

  if (!usuario) {

    window.location.href = "index.html";

    return;
  }


  // ==========================================
  // INFORMACIÓN
  // ==========================================

  document.getElementById(
    "nombreUsuario"
  ).textContent = usuario;

  document.getElementById(
    "nombreSector"
  ).textContent = sector || "Sin sector";


  document.getElementById(
    "infoUsuario"
  ).textContent = usuario;


  document.getElementById(
    "infoRol"
  ).textContent =
    tipoNombre ||
    obtenerNombreTipo(tipo);


  document.getElementById(
    "infoSector"
  ).textContent =
    sector || "Sin sector";


  // ==========================================
  // PERMISOS
  // ==========================================

  const cardATC =
    document.getElementById("cardATC");

  const cardDistribucion =
    document.getElementById(
      "cardDistribucion"
    );


  // TIPO 1 Y 2 → ATC
  if (tipo !== "1" && tipo !== "2") {

    cardATC.style.display = "none";

  }


  // TIPO 1 Y 3 → DISTRIBUCIÓN
  if (tipo !== "1" && tipo !== "3") {

    cardDistribucion.style.display = "none";

  }

});


function obtenerNombreTipo(tipo) {

  switch (tipo) {

    case "1":
      return "Administrador / Coordinación";

    case "2":
      return "Gestor ATC";

    case "3":
      return "Distribución";

    default:
      return "Usuario";

  }

}


function abrirATC() {

  const tipo =
    String(
      sessionStorage.getItem("tipo_usuario") || ""
    ).trim();


  if (tipo !== "1" && tipo !== "2") {

    alert(
      "No tienes permisos para ingresar al módulo ATC."
    );

    return;
  }


  window.location.href =
    "atc.html";
}


function abrirDistribucion() {

  const tipo =
    String(
      sessionStorage.getItem("tipo_usuario") || ""
    ).trim();


  if (tipo !== "1" && tipo !== "3") {

    alert(
      "No tienes permisos para ingresar al módulo Distribución."
    );

    return;
  }


  window.location.href =
    "distribucion.html";
}


function cerrarSesion() {

  sessionStorage.clear();

  window.location.href =
    "index.html";
}
