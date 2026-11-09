// Matriz IC (Fertilidad / Subrogado) — prototipo visual: el diseño NO se edita
// aquí; el estado SÍ se cicla (se guarda solo en el navegador de cada QA) y
// viaja al Excel exportado. Dev. By Ing. Eder Montes 2026.
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

const MATRICES_UNIDADES = ['Fertilidad / Subrogado'];
let matUnidadActiva = MATRICES_UNIDADES[0];

// Ficha de la matriz: se pinta arriba y encabeza el Excel exportado.
const MAT_FICHA = {
  titulo: 'Matriz de Cobertura',
  url: 'onboarding-tawny-kappa.vercel.app',
  tester: 'Eder Montes',
  pm: 'Pedro Andonegui',
};

// Estados marcados en ESTE navegador (prototipo visual): no se comparten
// entre QAs ni editan la matriz — solo pintan y viajan al Excel exportado.
let matEstados = {};
try { matEstados = JSON.parse(localStorage.getItem('qa_mat_web_estados_v1') || '{}'); } catch (e) { matEstados = {}; }
const MAT_PUNTAJE = {
  3: { etiqueta: 'OK', color: '#1e8449' },
  2: { etiqueta: 'WARN', color: '#c9a227' },
  1: { etiqueta: 'FAIL', color: '#c0392b' },
};
function matCiclarEstado(codigo) {
  const cur = matEstados[codigo];
  const sig = cur === 3 ? 2 : cur === 2 ? 1 : cur === 1 ? null : 3;
  if (sig === null) delete matEstados[codigo]; else matEstados[codigo] = sig;
  try { localStorage.setItem('qa_mat_web_estados_v1', JSON.stringify(matEstados)); } catch (e) { }
  matRender();
}
function matChipHtml(codigo) {
  const regla = MAT_PUNTAJE[matEstados[codigo]];
  const clic = `onclick="matCiclarEstado('${codigo}')" role="button"`;
  if (!regla) return '<span class="micChip micChipClic" ' + clic + ' title="Clic para ciclar OK → WARN → FAIL → sin probar (se guarda solo en tu navegador)">—</span>';
  return '<span class="micChip micChipClic" ' + clic + ' style="color:#fff;background:' + regla.color + ';border:1px solid ' + regla.color + ';" title="Clic para ciclar OK → WARN → FAIL → sin probar">' + regla.etiqueta + '</span>';
}

const matEsc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const matLetra = (i) => String.fromCharCode(65 + i);

function matSeccionHtml(sec, si) {
  const letra = matLetra(si);
  const filas = sec.puntos.map((p, pi) => `
      <tr>
        <td class="micCod">${letra}${pi + 1}</td>
        <td class="micPunto">${matEsc(p)}</td>
        <td class="micEstado">${matChipHtml(letra + (pi + 1))}</td>
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
    <div class="micFicha">
      <h3>${matEsc(MAT_FICHA.titulo)}</h3>
      <div class="micFichaDatos">
        <span><b>URL a probar:</b> <a href="https://${matEsc(MAT_FICHA.url)}" target="_blank" rel="noopener">${matEsc(MAT_FICHA.url)}</a></span>
        <span><b>Tester:</b> ${matEsc(MAT_FICHA.tester)}</span>
        <span><b>PM:</b> ${matEsc(MAT_FICHA.pm)}</span>
      </div>
    </div>
    <div class="micBarra">
      ${tabs}
      <div style="flex:1;"></div>
      <button class="btnZip" style="margin-top:0;" onclick="matExportarExcel()">⬇ Exportar a Excel
        <small>Matriz_IC_Fertilidad_Subrogado.xlsx · con tus estados marcados</small></button>
    </div>
    ${MATRIZ_IC_BASE.map((s, i) => matSeccionHtml(s, i)).join('')}`;
}

function matCambiarUnidad(u) {
  matUnidadActiva = u;
  matRender();
}

function matExportarExcel() {
  const filas = [
    [MAT_FICHA.titulo],
    ['URL a probar', MAT_FICHA.url],
    ['Tester', MAT_FICHA.tester],
    ['PM', MAT_FICHA.pm],
    [],
    ['Sección', 'Código', 'Punto a validar', 'Estado', 'Observaciones'],
  ];
  MATRIZ_IC_BASE.forEach((sec, si) => {
    const letra = matLetra(si);
    sec.puntos.forEach((p, pi) => {
      const cod = letra + (pi + 1);
      const regla = MAT_PUNTAJE[matEstados[cod]];
      filas.push([sec.nombre, cod, p, regla ? regla.etiqueta : '', '']);
    });
  });
  const hoja = XLSX.utils.aoa_to_sheet(filas);
  hoja['!cols'] = [{ wch: 26 }, { wch: 8 }, { wch: 70 }, { wch: 10 }, { wch: 45 }];
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Fertilidad y Subrogado');
  XLSX.writeFile(libro, 'Matriz_IC_Fertilidad_Subrogado.xlsx');
}

document.addEventListener('DOMContentLoaded', matRender);
