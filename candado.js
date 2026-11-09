// Candado de acceso del sitio: UNA contraseña general, sin usuario. Quien la
// tiene, entra; se recuerda en el navegador. Es disuasorio: frena el acceso
// casual, no es seguridad fuerte. Dev. By Ing. Eder Montes 2026.
(function () {
  const HASH = 'c1541cdc6a01b6b79cd54d2493ee59105c7e4b2c633397a952ef635ae6ae2af8';
  const LLAVE = 'qa_docs_acceso_v1';

  // Botón «Salir»: borra el acceso de este navegador y vuelve a pedir la clave.
  function montarSalir() {
    const lado = document.querySelector('.doc-side');
    if (!lado || document.getElementById('candado-salir')) return;
    const b = document.createElement('button');
    b.id = 'candado-salir';
    b.textContent = '⎋ Salir';
    b.title = 'Cierra el acceso en este navegador: la próxima visita pedirá la contraseña';
    b.onclick = () => { try { localStorage.removeItem(LLAVE); } catch (_) { } location.reload(); };
    lado.appendChild(b);
  }

  let autorizado = false;
  try { autorizado = localStorage.getItem(LLAVE) === HASH; } catch (e) { return; }
  if (autorizado) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montarSalir);
    else montarSalir();
    return;
  }

  document.documentElement.classList.add('candado');

  async function sha256(texto) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function montar() {
    const o = document.createElement('div');
    o.id = 'candado-overlay';
    o.innerHTML = `
      <form id="candado-form" autocomplete="off">
        <div class="candado-glyph">i</div>
        <b>Ingenes Tools QA</b>
        <span>Documentación del equipo</span>
        <input id="candado-pass" type="password" placeholder="Contraseña" autofocus>
        <button type="submit">Entrar</button>
        <i id="candado-error"></i>
      </form>`;
    document.body.appendChild(o);
    document.getElementById('candado-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const campo = document.getElementById('candado-pass');
      if (await sha256(campo.value) === HASH) {
        try { localStorage.setItem(LLAVE, HASH); } catch (_) { }
        document.documentElement.classList.remove('candado');
        o.remove();
        montarSalir();
      } else {
        document.getElementById('candado-error').textContent = 'Contraseña incorrecta';
        campo.value = '';
        campo.focus();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
  else montar();
})();
