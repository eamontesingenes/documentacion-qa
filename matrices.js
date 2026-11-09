// Matrices IC por unidad de negocio — SOLO VISUALIZACIÓN (los QA no editan
// aquí): la matriz se exporta a Excel y se trabaja allá. Dev. By Ing. Eder
// Montes 2026.
const MATRIZ_IC_BASE = [
  { nombre: 'Interfaz y Unitarias', puntos: [
    'Test Ancla (Caminos felices)',
    'Test Corruptos (Caracteres Especiales, longitud, campos vacios)',
    'Test Frontera (Limites inf. y sup [edades, score])',
    'Pruebas userPersona (M+H [+salpingo], H+M [+salpingo], M+M, M, H, H+H)',
    'Funcionamiento de botones',
    'Textos e imagenes de nutricion. (Traducciones)',
    "Homologacion secuencial y de textos entre OB'secuencial",
    'Cambio de datos de contacto en validacion telefonica.',
  ]},
  { nombre: 'Datos e Integracion', puntos: [
    'Etapas de Leads (Prelead, Lead, Avanzado, Completo, Filiacion, etc.)',
    'Validacion de Score NSE + INT (MX/USA)',
    "Validacion de parametros (UTM's)",
    'Envio a Kafka (validacion de Topicos)',
    'Envio a Infunnel',
    'Envio a SI (Datos + Filiacion)',
    'Envio a RS (MX/USA)',
    'Envio a Hspot (Datos completos)',
    'IM',
    'Intelisis',
  ]},
  { nombre: 'Citas', puntos: [
    'Agendamiento (Datos + SI)',
    'Reagendamiento',
    'Cancelacion',
    'Espacios Agenda Sintonizada',
    'Envio y/o recepcion de correos.',
    'Tipos de cita (Duracion)',
    'Cambio de sucursales',
    'Pagos (Cupones Rangos, Gratituidad, Tarjeta)',
    'Interfaz Stripe',
  ]},
  { nombre: 'Reglas', puntos: [
    'Edad (Subrogado)',
    'Gestacion (Puede o no llevar el embarazo)',
    'Recomendados (Todas las opciones)',
    'Ubicacion y Sucursales (MX/USA)',
  ]},
  { nombre: 'Cambio Unidad de Negocio', puntos: [
    'Fertilidad a Subrogado',
    'Subrogado a Fertilidad',
    'Cambio de Flags',
    'Cambio de Campañas Marketing',
  ]},
];

const MATRICES_UNIDADES = ['Fertilidad', 'Subrogado'];
let matUnidadActiva = MATRICES_UNIDADES[0];

const matEsc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const matLetra = (i) => String.fromCharCode(65 + i);

function matSeccionHtml(sec, si) {
  const letra = matLetra(si);
  const chip = '<span class="micChip" title="Sin probar: aquí solo se visualiza; el estado se llena en el Excel">—</span>';
  const filas = sec.puntos.map((p, pi) => `
      <tr>
        <td class="micCod">${letra}${pi + 1}</td>
        <td class="micPunto">${matEsc(p)}</td>
        <td class="micEstado">${chip}</td>
        <td class="micObs">—</td>
      </tr>`).join('');
  return `
  <div class="micSec">
    <div class="micSecHead">
      <span class="micSecTitulo">${letra}. ${matEsc(sec.nombre)}</span>
      <span class="micSecN">${sec.puntos.length} punto(s)</span>
    </div>
    <table class="micTabla">
      <thead><tr>
        <th></th>
        <th>Punto a validar</th>
        <th style="text-align:center;">Estado</th>
        <th>Observaciones</th>
      </tr></thead>
      <tbody>${filas}</tbody>
    </table>
  </div>`;
}

function matRender() {
  const cont = document.getElementById('matrices-panel');
  if (!cont) return;
  const tabs = MATRICES_UNIDADES.map((u) =>
    `<button class="tabU${u === matUnidadActiva ? ' on' : ''}" onclick="matCambiarUnidad('${u}')">${matEsc(u)}</button>`).join('');
  cont.innerHTML = `
    <div class="micBarra">
      ${tabs}
      <div style="flex:1;"></div>
      <button class="btnZip" style="margin-top:0;" onclick="matExportarExcel()">⬇ Exportar a Excel
        <small>Matriz_IC_${matEsc(matUnidadActiva)}.xlsx</small></button>
    </div>
    ${MATRIZ_IC_BASE.map((s, i) => matSeccionHtml(s, i)).join('')}`;
}

function matCambiarUnidad(u) {
  matUnidadActiva = u;
  matRender();
}

function matExportarExcel() {
  const filas = [['Sección', 'Código', 'Punto a validar', 'Estado', 'Observaciones']];
  MATRIZ_IC_BASE.forEach((sec, si) => {
    const letra = matLetra(si);
    sec.puntos.forEach((p, pi) => {
      filas.push([sec.nombre, `${letra}${pi + 1}`, p, '', '']);
    });
  });
  const hoja = XLSX.utils.aoa_to_sheet(filas);
  hoja['!cols'] = [{ wch: 26 }, { wch: 8 }, { wch: 70 }, { wch: 10 }, { wch: 45 }];
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, matUnidadActiva.slice(0, 31));
  XLSX.writeFile(libro, `Matriz_IC_${matUnidadActiva}.xlsx`);
}

document.addEventListener('DOMContentLoaded', matRender);
