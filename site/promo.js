// ===== LAPTOP 3D (Three.js) =====
let clock;
let isRotating = false;

function initLaptop3D() {
  const container = document.getElementById('heroLaptop');
  if (!container) return;

  const width = container.offsetWidth;
  const height = container.offsetHeight;

  clock = new THREE.Clock();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020617);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const laptopGroup = new THREE.Group();
  scene.add(laptopGroup);

  // Base del laptop
  const geo = new THREE.BoxGeometry(3.5, 0.3, 2.2);
  const mat = new THREE.MeshStandardMaterial({ color: 0x263548, roughness: 0.3, metalness: 0.7 });
  const base = new THREE.Mesh(geo, mat);
  base.castShadow = true;
  base.receiveShadow = true;
  laptopGroup.add(base);

  // Teclado
  const kgeo = new THREE.BoxGeometry(2.8, 0.06, 1.8);
  const kmat = new THREE.MeshStandardMaterial({ color: 0x1a2332, roughness: 0.5, metalness: 0.3 });
  const keyboard = new THREE.Mesh(kgeo, kmat);
  keyboard.position.y = -0.11;
  keyboard.castShadow = true;
  laptopGroup.add(keyboard);

  const laptopScreenEl = document.getElementById('laptopScreen');

  // Luces
  const ambient = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambient);

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 10, 7);
  dir.castShadow = true;
  scene.add(dir);

  const fill = new THREE.DirectionalLight(0xffffff, 0.3);
  fill.position.set(-5, 5, -5);
  scene.add(fill);

  function animate() {
    requestAnimationFrame(animate);
    if (isRotating) {
      laptopGroup.rotation.y += 0.008;
      laptopGroup.rotation.x += 0.002;
    }
    if (laptopScreenEl) {
      laptopScreenEl.style.transform = `rotateY(${(laptopGroup.rotation.y * 180 / Math.PI) % 360}deg)`;
    }
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', onWindowResize);
  showLoadingAnimation();
}

function onWindowResize() {
  const container = document.getElementById('heroLaptop');
  if (!container) return;
  const width = container.offsetWidth;
  const height = container.offsetHeight;
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 8);
  const renderer = window.__renderer;
  if (renderer) {
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
  }
}

function showLoadingAnimation() {
  const laptopScreen = document.getElementById('laptopScreen');
  if (!laptopScreen) return;

  const loading = document.createElement('div');
  loading.style.cssText = `
    position: absolute; inset: 12px; border-radius: 12px; background: #0f172a;
    display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif;
  `;
  loading.innerHTML = `
    <div style="text-align: center;">
      <div style="width: 24px; height: 24px; border: 2px solid rgba(59,130,246,.2); border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <div style="margin-top: 8px; font-size: 11px; color: #94a3b8;">Cargando sistema...</div>
    </div>
  `;
  laptopScreen.appendChild(loading);

  const style = document.createElement('style');
  style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
  document.head.appendChild(style);

  setTimeout(() => {
    loading.style.opacity = '0';
    setTimeout(() => loading.remove(), 500);
  }, 2000);
}

// ===== LOGO PERSONALIZABLE =====
function updateLogoOnLaptop() {
  const logoImage = document.getElementById('customLogoImage');
  const laptopScreen = document.getElementById('laptopScreen');
  const previewLogo = document.getElementById('previewLogoImage');

  if (!laptopScreen || !logoImage || !previewLogo) return;

  laptopScreen.querySelectorAll('img').forEach(img => img.remove());

  const img = document.createElement('img');
  img.src = logoImage.src;
  img.alt = 'Logo';
  img.style.cssText = `
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.35);
    width: 120px; height: 120px; object-fit: contain;
    filter: drop-shadow(0 4px 12px rgba(59,130,246,.3)); pointer-events: none;
  `;
  laptopScreen.appendChild(img);
  laptopScreen.style.display = 'block';

  previewLogo.querySelectorAll('img, span').forEach(el => el.remove());
  const previewImg = document.createElement('img');
  previewImg.src = logoImage.src;
  previewImg.alt = 'Logo';
  previewImg.style.cssText = `
    width: 100%; height: 100%; object-fit: contain;
    filter: drop-shadow(0 4px 12px rgba(59,130,246,.3));
  `;
  previewLogo.appendChild(previewImg);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initLaptop3D, 500);

  const laptopScreen = document.getElementById('laptopScreen');
  if (laptopScreen) {
    laptopScreen.style.background = '#0f172a';
  }

  const heroLaptop = document.getElementById('heroLaptop');
  if (heroLaptop) {
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      const heroHeight = heroSection.clientHeight;
      heroLaptop.style.height = Math.max(heroHeight * 0.5, 300) + 'px';
    }
  }
});

window.updateLogoOnLaptop = updateLogoOnLaptop;

// ===== SHORTCUT: iPhone aparece cuando el demo de la laptop termina =====
window.addEventListener('message', function (ev) {
  var d = ev && ev.data;
  // Si el mensaje viene reenviado por demo.html, busca en d.data
  var msg = d && d.__reroute ? d.data : d;
  if (msg && msg.rapivoyDemo === 'end') {
    setTimeout(function () {
      document.body.classList.add('iphone-appeared');
      document.body.classList.add('iphone-total-finish');
      // Soplar la pantalla del iPhone
      if (navigator.vibrate) navigator.vibrate(120);
    }, 400);
  }
});

// ===== SHOWCASE 3D INTERACTIVITY =====
function initShowcase() {
  const screens = [
    document.getElementById('screenLeft'),
    document.getElementById('screenRight'),
    document.getElementById('screenBottom')
  ].filter(Boolean);
  const central = document.getElementById('centralDevice');

  const baseTransforms = {
    screenLeft: 'rotate-y-[45deg] rotate-x-[-8deg] translate-z-[-40px]',
    screenRight: '-rotate-y-[45deg] rotate-x-[-8deg] translate-z-[-40px]',
    screenBottom: '-rotate-y-[25deg] rotate-x-[-12deg] translate-z-[-60px] scale-90'
  };

  screens.forEach(screen => {
    const id = screen.id;

    screen.addEventListener('mouseenter', () => {
      screens.forEach(s => {
        if (s === screen) {
          s.style.transform = 'translateZ(60px) scale(1.05) rotateY(0deg) rotateX(0deg)';
        } else {
          const t = s.style.transform;
          s.style.transform = t.replace(/translate[^)]*\)/g, 'translateZ(-20px)');
        }
      });
      if (central) central.style.transform = 'rotateY(0deg) rotateX(2deg) scale(0.95)';
    });

    screen.addEventListener('mouseleave', () => {
      screens.forEach(s => {
        const id2 = s.id;
        s.style.transform = baseTransforms[id2] || '';
      });
      if (central) central.style.transform = 'rotateY(0deg) rotateX(4deg)';
    });
  });

  // Efecto parallax suave al mover el mouse sobre el contenedor
  const container = document.getElementById('showcaseContainer');
  if (container) {
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      screens.forEach(screen => {
        const intensity = screen.id === 'screenLeft' ? 15 :
                          screen.id === 'screenRight' ? -15 : 10;
        screen.style.transform = screen.style.transform.replace(
          /translateZ\([^)]*\)/, `translateZ(-40px)`
        ) + ` rotateX(${y * 10}deg) rotateY(${x * intensity}deg)`;
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const showcase = document.getElementById('showcase-3d');
  const phoneSection = document.getElementById('app-flutter');
  const systemSection = document.querySelector('#sistema-entrega .container');
  if (systemSection && phoneSection) {
    systemSection.appendChild(phoneSection);
  }
  if (systemSection && showcase) {
    systemSection.appendChild(showcase);
    showcase.hidden = false;
  }
  setTimeout(initShowcase, 800);
});
