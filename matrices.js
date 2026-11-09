// Matriz IC (Fertilidad / Subrogado) — prototipo visual: el diseño NO se edita
// aquí; el estado SÍ se cicla (se guarda solo en el navegador de cada QA) y
// viaja al Excel exportado. Dev. By Ing. Eder Montes 2026.
const MATRIZ_IC_BASE = [
  { nombre: "Interfaz y Unitarias", puntos: [
    "Test Ancla (Caminos felices)",
    "Test Corruptos (Caracteres Especiales, longitud, campos vacios)",
    "Test Frontera (Limites inf. y sup [edades, score])",
    "Pruebas userPersona (M+H [+salpingo], H+M [+salpingo], M+M, M, H, H+H)",
    "Funcionamiento de botones",
    "Textos e imagenes de nutricion. (Traducciones)",
    "Homologacion secuencial y de textos entre OB'secuencial",
    "Cambio de datos de contacto en validacion telefonica.",
  ]},
  { nombre: "Datos e Integracion", puntos: [
    "Etapas de Leads (Prelead, Lead, Avanzado, Completo, Filiacion, etc.)",
    "Validacion de Score NSE + INT (MX/USA)",
    "Validacion de parametros (UTM's)",
    "Envio a Kafka (validacion de Topicos)",
    "Envio a Infunnel",
    "Envio a SI (Datos + Filiacion)",
    "Envio a RS (MX/USA)",
    "Envio a Hspot (Cita, Medico, Etc.)",
    "IM",
    "Intelisis",
  ]},
  { nombre: "Citas", puntos: [
    "Agendamiento (Datos + SI)",
    "Reagendamiento",
    "Cancelacion",
    "Espacios Agenda Sintonizada",
    "Envio y/o recepcion de correos.",
    "Tipos de cita (Duracion)",
    "Cambio de sucursales",
    "Pagos (Cupones Rangos, Gratituidad, Tarjeta)",
    "Interfaz Stripe",
    "Difentes Tipos de Tarjetas",
  ]},
  { nombre: "Reglas", puntos: [
    "Edad (Subrogado)",
    "Gestacion (Puede o no llevar el embarazo)",
    "Recomendados (Todas las opciones)",
    "Ubicacion y Sucursales (MX/USA)",
  ]},
  { nombre: "Cambio Unidad de Negocio", puntos: [
    "Fertilidad a Subrogado",
    "Subrogado a Fertilidad",
    "Cambio de Flags",
    "Cambio de Campañas Marketing",
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
  3: { etiqueta: 'OK', excel: 'OK', color: '#1e8449' },
  2: { etiqueta: 'WARN', excel: 'WARN', color: '#c9a227' },
  1: { etiqueta: 'FAIL', excel: 'FAIL', color: '#c0392b' },
  0: { etiqueta: 'NA', excel: 'NA', color: '#b0b7bd' },
  4: { etiqueta: 'Pendiente', excel: 'Pendiente por probar', color: '#2f7fd1' },
};
const MAT_CICLO = { 3: 2, 2: 1, 1: 0, 0: 4, 4: null };
function matCiclarEstado(codigo) {
  const cur = matEstados[codigo];
  const sig = cur in MAT_CICLO ? MAT_CICLO[cur] : 3;
  if (sig === null) delete matEstados[codigo]; else matEstados[codigo] = sig;
  try { localStorage.setItem('qa_mat_web_estados_v1', JSON.stringify(matEstados)); } catch (e) { }
  matRender();
}
function matChipHtml(codigo) {
  const regla = MAT_PUNTAJE[matEstados[codigo]];
  const clic = `onclick="matCiclarEstado('${codigo}')" role="button"`;
  const ciclo = 'Clic para ciclar OK → WARN → FAIL → NA → Pendiente → sin probar (se guarda solo en tu navegador)';
  if (!regla) return '<span class="micChip micChipClic" ' + clic + ' title="' + ciclo + '">—</span>';
  return '<span class="micChip micChipClic" ' + clic + ' style="color:#fff;background:' + regla.color + ';border:1px solid ' + regla.color + ';" title="' + ciclo + '">' + regla.etiqueta + '</span>';
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

// Arma el libro con ExcelJS: título y ficha arriba, cada sección como fila de
// grupo (sin columna repetida), Estado con desplegable OK/WARN/FAIL y colores
// automáticos (formato condicional) también para lo que se elija en Excel.
function matArmarLibro() {
  const NAVY = 'FF1F3864', GRIS = 'FFF4F6F8', BLANCO = 'FFFFFFFF';
  const borde = { style: 'thin', color: { argb: 'FFD5DBDB' } };
  const bordes = { top: borde, left: borde, bottom: borde, right: borde };
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Matriz de Cobertura');
  ws.columns = [{ width: 10 }, { width: 74 }, { width: 13 }, { width: 48 }];

  ws.mergeCells('A1:D1');
  const titulo = ws.getCell('A1');
  titulo.value = MAT_FICHA.titulo;
  titulo.font = { bold: true, size: 16, color: { argb: BLANCO } };
  titulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
  titulo.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(1).height = 30;

  [['URL a probar', MAT_FICHA.url], ['Tester', MAT_FICHA.tester], ['PM', MAT_FICHA.pm]]
    .forEach((par, i) => {
      const r = ws.getRow(2 + i);
      r.getCell(1).value = par[0];
      r.getCell(1).font = { bold: true };
      ws.mergeCells(`B${2 + i}:D${2 + i}`);
      r.getCell(2).value = par[1];
    });

  const hdr = ws.getRow(6);
  ['Código', 'Punto a validar', 'Estado', 'Observaciones'].forEach((v, i) => {
    const c = hdr.getCell(i + 1);
    c.value = v;
    c.font = { bold: true, color: { argb: BLANCO } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    c.border = bordes;
    c.alignment = { horizontal: i === 2 ? 'center' : 'left' };
  });

  let fila = 7;
  MATRIZ_IC_BASE.forEach((sec, si) => {
    const letra = matLetra(si);
    ws.mergeCells(`A${fila}:D${fila}`);
    const s = ws.getCell(`A${fila}`);
    s.value = `${letra}. ${sec.nombre.toUpperCase()}  (${sec.puntos.length} puntos)`;
    s.font = { bold: true, color: { argb: NAVY } };
    s.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRIS } };
    s.border = bordes;
    fila++;
    sec.puntos.forEach((p, pi) => {
      const cod = letra + (pi + 1);
      const regla = MAT_PUNTAJE[matEstados[cod]];
      const r = ws.getRow(fila);
      r.getCell(1).value = cod;
      r.getCell(2).value = p;
      r.getCell(3).value = regla ? regla.excel : '';
      for (let c = 1; c <= 4; c++) r.getCell(c).border = bordes;
      r.getCell(1).font = { size: 10, color: { argb: 'FF8A929A' } };
      r.getCell(2).alignment = { wrapText: true };
      r.getCell(3).alignment = { horizontal: 'center' };
      r.getCell(3).dataValidation = {
        type: 'list', allowBlank: true, formulae: ['"OK,WARN,FAIL,NA,Pendiente por probar"'],
        showErrorMessage: true, errorTitle: 'Estado', error: 'Elige OK, WARN, FAIL, NA o Pendiente por probar',
      };
      fila++;
    });
  });

  const estiloCF = (fondo, letra2) => ({
    fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: fondo } },
    font: { bold: true, color: { argb: letra2 } },
  });
  ws.addConditionalFormatting({
    ref: `C7:C${fila - 1}`,
    rules: [
      { type: 'containsText', operator: 'containsText', text: 'Pendiente', priority: 1, style: estiloCF('FFD6E4F7', 'FF1F5FA0') },
      { type: 'containsText', operator: 'containsText', text: 'NA', priority: 2, style: estiloCF('FFE8EAED', 'FF6E7987') },
      { type: 'containsText', operator: 'containsText', text: 'OK', priority: 3, style: estiloCF('FFD9EAD3', 'FF1E8449') },
      { type: 'containsText', operator: 'containsText', text: 'WARN', priority: 4, style: estiloCF('FFFCF3CF', 'FF9A6512') },
      { type: 'containsText', operator: 'containsText', text: 'FAIL', priority: 5, style: estiloCF('FFF5D6D1', 'FFC0392B') },
    ],
  });
  return wb;
}

async function matExportarExcel() {
  const wb = matArmarLibro();
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Matriz_IC_Fertilidad_Subrogado.xlsx';
  a.click();
  URL.revokeObjectURL(a.href);
}

// Copia el número de la tarjeta (sin espacios, listo para pegar en el checkout).
function matCopiarTarjeta(tarjeta, numero) {
  navigator.clipboard.writeText(numero).then(() => {
    const num = tarjeta.querySelector('.numTarjeta');
    const original = num.textContent;
    num.textContent = '✓ copiado';
    setTimeout(() => { num.textContent = original; }, 900);
  }).catch(() => { });
}

document.addEventListener('DOMContentLoaded', matRender);
