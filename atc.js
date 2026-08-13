// ============================================================
// ATC - PQR ENEE UTCD
// ============================================================

let listaPQR = [];

const usuarioSesion =
  sessionStorage.getItem("usuario") || "";

const sectorSesion =
  sessionStorage.getItem("sector") || "";

const tipoUsuarioSesion =
  String(
    sessionStorage.getItem("tipo_usuario") || ""
  ).trim();


document.addEventListener(
  "DOMContentLoaded",
  function() {

    // ==========================================
    // VALIDAR SESIÓN
    // ==========================================

    if (!usuarioSesion) {

      window.location.href = "index.html";

      return;
    }


    // ==========================================
    // VALIDAR PERMISO ATC
    // ==========================================

    if (
      tipoUsuarioSesion !== "1" &&
      tipoUsuarioSesion !== "2"
    ) {

      alert(
        "No tienes permisos para ingresar al módulo ATC."
      );

      window.location.href = "menu.html";

      return;
    }


    // ==========================================
    // DATOS DE USUARIO
    // ==========================================

    document.getElementById(
      "nombreUsuario"
    ).textContent =
      usuarioSesion;

    document.getElementById(
      "nombreSector"
    ).textContent =
      sectorSesion || "Sin sector";


    // ==========================================
    // EVENTOS
    // ==========================================

    document
      .getElementById("buscar")
      .addEventListener(
        "input",
        aplicarFiltros
      );


    document
      .getElementById("filtroEstado")
      .addEventListener(
        "change",
        aplicarFiltros
      );


    // ==========================================
    // CARGAR PQR
    // ==========================================

    cargarPQR();

  }
);


// ============================================================
// CARGAR LISTA PQR
// ============================================================

async function cargarPQR() {

  const tbody =
    document.getElementById("tablaPQR");

  const estadoCarga =
    document.getElementById("estadoCarga");


  tbody.innerHTML = `
    <tr>
      <td colspan="8" class="mensaje-tabla">
        <i class="fa-solid fa-spinner fa-spin"></i>
        Cargando PQR...
      </td>
    </tr>
  `;


  estadoCarga.textContent =
    "Actualizando...";


  try {

    const response = await fetch(
      CONFIG.URL_APPS_SCRIPT,
      {
        method: "POST",
        mode: "cors",

        body: JSON.stringify({

          action: "obtenerListaPQR",

          usuario: usuarioSesion,

          modulo: "ATC"

        })

      }
    );


    const data =
      await response.json();


    if (data.status !== "Éxito") {

      throw new Error(
        data.message ||
        "No se pudo obtener la lista de PQR."
      );

    }


    listaPQR =
      Array.isArray(data.pqr)
        ? data.pqr
        : [];


    llenarFiltroEstados();

    actualizarResumen();

    aplicarFiltros();


    estadoCarga.textContent =
      "Actualizado";


  } catch (error) {

    console.error(error);


    tbody.innerHTML = `
      <tr>
        <td
          colspan="8"
          class="mensaje-tabla mensaje-error"
        >
          <i class="fa-solid fa-triangle-exclamation"></i>
          ${escaparHTML(error.message)}
        </td>
      </tr>
    `;


    estadoCarga.textContent =
      "Error";

  }

}


// ============================================================
// FILTRO DE ESTADOS
// ============================================================

function llenarFiltroEstados() {

  const select =
    document.getElementById(
      "filtroEstado"
    );


  const estadoActual =
    select.value;


  const estados = [];


  listaPQR.forEach(function(pqr) {

    const estado =
      String(
        pqr.estado || ""
      ).trim();

    if (
      estado &&
      !estados.includes(estado)
    ) {

      estados.push(estado);

    }

  });


  estados.sort();


  select.innerHTML = `
    <option value="">
      Todos los estados
    </option>
  `;


  estados.forEach(function(estado) {

    const option =
      document.createElement("option");

    option.value = estado;

    option.textContent = estado;

    select.appendChild(option);

  });


  if (
    estados.includes(estadoActual)
  ) {

    select.value = estadoActual;

  }

}


// ============================================================
// RESUMEN
// ============================================================

function actualizarResumen() {

  let pendientes = 0;
  let atendidas = 0;


  listaPQR.forEach(function(pqr) {

    const estado =
      normalizarTexto(
        pqr.estado || ""
      );


    if (estado === "PENDIENTE") {

      pendientes++;

    } else {

      atendidas++;

    }

  });


  document.getElementById(
    "totalPQR"
  ).textContent =
    listaPQR.length;


  document.getElementById(
    "totalPendientes"
  ).textContent =
    pendientes;


  document.getElementById(
    "totalAtendidas"
  ).textContent =
    atendidas;

}


// ============================================================
// APLICAR FILTROS
// ============================================================

function aplicarFiltros() {

  const texto =
    normalizarTexto(
      document.getElementById(
        "buscar"
      ).value
    );


  const estado =
    normalizarTexto(
      document.getElementById(
        "filtroEstado"
      ).value
    );


  const filtradas =
    listaPQR.filter(function(pqr) {

      const contenido = [

        pqr.item,

        pqr.estado,

        pqr.fecha_de_ingreso,

        pqr.nombre_cliente,

        pqr.municipio,

        pqr.tipo_de_danio,

        pqr.ingresado_por,

        pqr.direccion

      ]
        .map(function(valor) {
          return normalizarTexto(valor);
        })
        .join(" ");


      const coincideTexto =
        !texto ||
        contenido.includes(texto);


      const coincideEstado =
        !estado ||
        normalizarTexto(
          pqr.estado
        ) === estado;


      return (
        coincideTexto &&
        coincideEstado
      );

    });


  renderizarTabla(filtradas);

}


// ============================================================
// TABLA
// ============================================================

function renderizarTabla(registros) {

  const tbody =
    document.getElementById(
      "tablaPQR"
    );


  document.getElementById(
    "contadorResultados"
  ).textContent =
    registros.length +
    (
      registros.length === 1
        ? " registro"
        : " registros"
    );


  if (!registros.length) {

    tbody.innerHTML = `
      <tr>
        <td
          colspan="8"
          class="mensaje-tabla"
        >
          <i class="fa-solid fa-folder-open"></i>
          No se encontraron PQR.
        </td>
      </tr>
    `;

    return;
  }


  tbody.innerHTML =
    registros.map(function(pqr) {

      return `

        <tr>

          <td class="item-cell">
            ${escaparHTML(pqr.item)}
          </td>

          <td>
            ${crearBadgeEstado(pqr.estado)}
          </td>

          <td>
            ${escaparHTML(
              pqr.fecha_de_ingreso
            )}
          </td>

          <td>
            ${escaparHTML(
              pqr.nombre_cliente
            )}
          </td>

          <td>
            ${escaparHTML(
              pqr.municipio
            )}
          </td>

          <td>
            ${escaparHTML(
              pqr.tipo_de_danio
            )}
          </td>

          <td>
            ${escaparHTML(
              pqr.ingresado_por
            )}
          </td>

          <td>

            <button
              class="btn-ver"
              onclick="abrirPQR('${escaparJS(pqr.item)}')"
            >
              <i class="fa-solid fa-eye"></i>
              Ver
            </button>

          </td>

        </tr>

      `;

    }).join("");

}


// ============================================================
// BADGE ESTADO
// ============================================================

function crearBadgeEstado(estado) {

  const texto =
    String(estado || "Sin estado")
      .trim();


  const normalizado =
    normalizarTexto(texto);


  let clase =
    "estado-default";


  if (
    normalizado === "PENDIENTE"
  ) {

    clase =
      "estado-pendiente";

  } else if (

    normalizado === "ATENDIDA" ||
    normalizado === "TERMINADA" ||
    normalizado === "CERRADA"

  ) {

    clase =
      "estado-atendida";

  }


  return `
    <span class="estado-badge ${clase}">
      ${escaparHTML(texto)}
    </span>
  `;

}


// ============================================================
// ABRIR PQR
// ============================================================

function abrirPQR(item) {

  if (!item) return;


  sessionStorage.setItem(
    "item_pqr",
    item
  );


  window.location.href =
    "detallepqr.html";

}


// ============================================================
// NUEVA PQR
// ============================================================

function nuevaPQR() {

  window.location.href =
    "nuevapqr.html";

}


// ============================================================
// VOLVER
// ============================================================

function volverMenu() {

  window.location.href =
    "menu.html";

}


// ============================================================
// CERRAR SESIÓN
// ============================================================

function cerrarSesion() {

  sessionStorage.clear();

  window.location.href =
    "index.html";

}


// ============================================================
// UTILIDADES
// ============================================================

function normalizarTexto(valor) {

  return String(
    valor === undefined ||
    valor === null
      ? ""
      : valor
  )
    .trim()
    .toUpperCase();

}


function escaparHTML(valor) {

  return String(
    valor === undefined ||
    valor === null
      ? ""
      : valor
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function escaparJS(valor) {

  return String(
    valor === undefined ||
    valor === null
      ? ""
      : valor
  )
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");

}
