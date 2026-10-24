// ===== HERO REAL 3D â€” tu laptop.blend (GLB) + tu web viva en su pantalla =====
(function () {
  'use strict';
  var GLB_URL = 'assets/laptop.glb';
  var WEB_URL = 'demo.html';
  var FRAME_W = 1280;

  function fail(msg) {
    var loader = document.getElementById('realLaptopLoader');
    var err = document.getElementById('realLaptopError');
    if (loader) loader.classList.add('hidden');
    if (err) { err.textContent = msg; err.classList.add('show'); }
    // Ocultar el mockup CSS del laptop (gira vacío cuando el 3D real no carga)
    var laptopMock = document.getElementById('laptop3d');
    if (laptopMock) laptopMock.style.display = 'none';
    var realWrap = document.getElementById('realLaptopWrap');
    if (realWrap) realWrap.style.display = 'none';
    // Cargar el demo en el iframe de la laptop si aún no se ha cargado
    if (typeof window.activateDeliveryDemo === 'function') {
      window.activateDeliveryDemo();
    }
    // Abrir el lightbox con las imágenes estáticas del demo como fallback.
    // Hacemos polling por si el script del lightbox aún no se ha ejecutado.
    // Si el modo video ya está activo, no abrimos el lightbox.
    var attempts = 0;
    var maxAttempts = 50; // 5 segundos
    var timer = setInterval(function () {
      attempts++;
      if (document.body.classList.contains('video-mode')) {
        clearInterval(timer);
        return;
      }
      if (typeof window.openDemoLightbox === 'function') {
        clearInterval(timer);
        window.openDemoLightbox();
      } else if (attempts >= maxAttempts) {
        clearInterval(timer);
      }
    }, 100);
  }

  // Función global para cargar el demo en el iframe de la laptop.
  // Está disponible incluso si Three.js no carga, para que el demo siempre se muestre.
  window.activateDeliveryDemo = function () {
    var iframe = document.getElementById('laptopWebView');
    if (!iframe) return;
    if (!iframe.src || iframe.src === 'about:blank') {
      var ds = iframe.getAttribute('data-src');
      if (ds) {
        iframe.src = ds;
        iframe.removeAttribute('data-src');
      }
    }
  };

  function init() {
    if (document.body.classList.contains('iphone-only')) return;
    var wrap = document.getElementById('realLaptopWrap');
    if (!wrap) return;
    if (typeof THREE === 'undefined') return fail('No cargo Three.js (CDN).');
    if (!THREE.GLTFLoader) return fail('No cargo GLTFLoader (CDN).');
    if (!THREE.CSS3DRenderer) return fail('No cargo CSS3DRenderer (CDN).');
    function W() { return wrap.clientWidth || 800; }
    function H() { return wrap.clientHeight || 520; }
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    } catch (error) {
      return fail('Este navegador no tiene WebGL disponible; se muestra la vista compatible.');
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(W(), H());
    renderer.setClearColor(0x000000, 0);
    if (THREE.sRGBEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
    if (THREE.ACESFilmicToneMapping !== undefined) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
    }
    renderer.domElement.id = 'realLaptopCanvas';
    wrap.appendChild(renderer.domElement);
    var cssRenderer = new THREE.CSS3DRenderer();
    cssRenderer.setSize(W(), H());
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    cssRenderer.domElement.style.left = '0';
    cssRenderer.domElement.style.pointerEvents = 'none';
    cssRenderer.domElement.style.zIndex = '3';
    wrap.appendChild(cssRenderer.domElement);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, W() / H(), 0.1, 3000);
    // Set de luces 4 puntos: key LED dia (6500K), rellenos suaves, rim cyan solo borde
    scene.add(new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 1.1));
    var key = new THREE.DirectionalLight(0xfff6e8, 2.2); // LED dia 6500K calido suave
    key.position.set(40, 60, 80);
    scene.add(key);
    var fill2 = new THREE.DirectionalLight(0xdbeafe, 0.7); // relleno frontal frio
    fill2.position.set(-30, 10, 90);
    scene.add(fill2);
    var rim = new THREE.PointLight(0x22d3ee, 0.35, 500); // rim cyan solo borde, no tinte
    rim.position.set(-50, 30, 40);
    scene.add(rim);
    var top = new THREE.DirectionalLight(0xffffff, 0.6); // cenital para teclas y bisagra
    top.position.set(0, 90, 10);
    scene.add(top);
    // Environment neutro para que los metales no se vean negros
    __rendererRef = renderer;
    buildNeutralEnv(scene);
    var group = new THREE.Group();
    scene.add(group);
    window.__rapivoyReal = { scene: scene, camera: camera, renderer: renderer, cssRenderer: cssRenderer, group: group, W: W, H: H, wrap: wrap };
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && connection.saveData) {
      var loader = document.getElementById('realLaptopLoader');
      if (loader) loader.classList.add('hidden');
      return;
    }
    new THREE.GLTFLoader().load(GLB_URL, onModel, undefined, function () {
      fail('No se pudo cargar el modelo 3D; se muestra la vista compatible.');
    });
  }

  // Entorno neutro procedural (PMREM): evita metales negros sin HDR externo
  function buildNeutralEnv(scene) {
    try {
      var env = new THREE.Scene();
      env.background = new THREE.Color(0xe8edf3);
      var geo = new THREE.PlaneGeometry(50, 50);
      function panel(color, x, y, z, rx, ry) {
        var m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide }));
        m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, 0); env.add(m);
      }
      panel(0xffffff, 0, 25, 0, Math.PI / 2, 0);      // techo blanco (reflejo principal)
      panel(0x9fb6cc, -25, 8, 0, 0, Math.PI / 2);     // lateral frio
      panel(0xc9b8a6, 25, 8, 0, 0, -Math.PI / 2);     // lateral calido tenue
      panel(0x5b7a99, 0, 8, -25, 0, 0);               // fondo azulado
      panel(0xf3f6fa, 0, 8, 25, 0, Math.PI);          // frente claro
      var pm = new THREE.PMREMGenerator(rendererRef());
      var rt = pm.fromScene(env, 0.06);
      scene.environment = rt.texture;
      pm.dispose();
    } catch (e) { /* sin entorno: siguen las luces */ }
  }
  var __rendererRef = null;
  function rendererRef() { return __rendererRef; }

  // Corrige PBR del GLB: baja metalness (negro->color real), sRGB en mapas
  function applyPBRFix(model) {
    model.traverse(function (o) {
      if (!o.isMesh) return;
      var mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(function (mat) {
        if (!mat) return;
        if ('metalness' in mat) mat.metalness = Math.min(mat.metalness, 0.32);
        if ('roughness' in mat) mat.roughness = Math.max(mat.roughness, 0.5);
        if ('envMapIntensity' in mat) mat.envMapIntensity = 1.0;
        if (mat.map && THREE.sRGBEncoding !== undefined) mat.map.encoding = THREE.sRGBEncoding;
        if (mat.emissive) mat.emissive.setHex(0x000000);
        mat.needsUpdate = true;
      });
    });
  }

  function onModel(gltf) {
    var R = window.__rapivoyReal;
    var model = gltf.scene;
    // Modelo exportado con la pantalla mirando al frente (+Z): sin rotacion Y extra.
    // Si tu GLB llega rotado, ajusta model.rotation.y aqui.
    model.rotation.y = 0;
    model.rotation.x = -0.12; // ligera inclinacion hacia la camara (pose natural de laptop)
    applyPBRFix(model); // metalness<=0.32, roughness>=0.5, sRGB, sin emissive
    R.group.add(model);
    R.group.updateMatrixWorld(true);
    var bbox = new THREE.Box3().setFromObject(model);
    var center = bbox.getCenter(new THREE.Vector3());
    var sphere = bbox.getBoundingSphere(new THREE.Sphere());
    R.floatAmp = sphere.radius * 0.02; // amplitud del "flotar", proporcional al modelo
    model.position.sub(center);
    R.group.updateMatrixWorld(true);
    var target = new THREE.Vector3(0, 0, 0); // CENTRO: sin desplazamiento a la derecha
    var screenMesh = null;
    // La tapa viene como nodo propio (Notebook_Lid); el nombre viejo contenia "screen"
    model.traverse(function (o) { if (o.isMesh && /screen|lid/i.test(o.name || '')) screenMesh = o; });
    if (screenMesh) {
      // UNA SOLA PIEZA: no se separa la pantalla de la base. La malla se queda
      // en su sitio original del GLB y la web se mapea COMO HIJA de la malla,
      // asi es imposible que flote: hereda su transformacion al 100%.
      mountScreenUnified(R, model, screenMesh);
      // Bisagra central visible uniendo base y pantalla
      mountHingeVisible(R, model, screenMesh);
      // la tapa permanece abierta siempre: no cierra al iniciar ni al terminar el demo
    }
    var dir = new THREE.Vector3(0.06, 0.26, 1.0).normalize();
    var dist = (sphere.radius / Math.sin(THREE.MathUtils.degToRad(R.camera.fov / 2))) * 0.88;
    R.camStart = dir.clone().multiplyScalar(dist * 1.45);
    R.camEnd = dir.clone().multiplyScalar(dist);
    R.camera.position.copy(R.camStart);
    R.camera.lookAt(target);
    R.target = target;
    var loader = document.getElementById('realLaptopLoader');
    if (loader) loader.classList.add('hidden');
    var heroReal = document.querySelector('.hero-real3d');
    if (heroReal) heroReal.classList.add('loaded');
    startLoop(R);
  }

  // ===== LAPTOP UNA SOLA PIEZA =====
  // La web es HIJA DIRECTA de la malla de pantalla: imposible que flote.
  // Pantalla web encajada al milimetro: base desde el UP MUNDIAL.
  // xW = up x normal => horizontal garantizado (twist imposible).
  // Derecha/arriba reales por signos (giros 180 en plano, jamas espejo).
  function mountScreenUnified(R, model, screenMesh) {
    R.group.updateMatrixWorld(true);
    screenMesh.updateWorldMatrix(true, false);
    try {
      var mats = Array.isArray(screenMesh.material) ? screenMesh.material : [screenMesh.material];
      for (var mi = 0; mi < mats.length; mi++) {
        if (!mats[mi]) continue;
        mats[mi].color = new THREE.Color(0x475569);
        mats[mi].emissive = new THREE.Color(0x000000);
      }
    } catch (e1) {}
    screenMesh.visible = true;
    var geo = screenMesh.geometry;
    geo.computeBoundingBox();
    var lb = geo.boundingBox;
    var lSize = lb.getSize(new THREE.Vector3());
    var lCenter = lb.getCenter(new THREE.Vector3());
    var dims = [{ ax: 'x', v: lSize.x }, { ax: 'y', v: lSize.y }, { ax: 'z', v: lSize.z }];
    dims.sort(function (a, b) { return a.v - b.v; });
    var nAx = dims[0].ax;
    var pA = dims[1].ax, pB = dims[2].ax;
    var sA = pA === 'x' ? lSize.x : (pA === 'y' ? lSize.y : lSize.z);
    var sB = pB === 'x' ? lSize.x : (pB === 'y' ? lSize.y : lSize.z);
    var Uax = sB >= sA ? pB : pA;
    var Vax = (Uax === pA) ? pB : pA;
    function axVec(ax) { return new THREE.Vector3(ax === 'x' ? 1 : 0, ax === 'y' ? 1 : 0, ax === 'z' ? 1 : 0); }
    var wQ = screenMesh.getWorldQuaternion(new THREE.Quaternion());
    var nW = axVec(nAx).applyQuaternion(wQ);
    var camDirRef = new THREE.Vector3(0.06, 0.26, 1.0).normalize();
    if (nW.dot(camDirRef) < 0) nW.negate();
    var xW = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), nW);
    if (xW.lengthSq() < 1e-6) xW.set(1, 0, 0);
    xW.normalize();
    var uW = axVec(Uax).applyQuaternion(wQ);
    if (xW.dot(uW) < 0) xW.negate();
    var yW = new THREE.Vector3().crossVectors(nW, xW).normalize();
    xW = new THREE.Vector3().crossVectors(yW, nW).normalize();
    var vW = axVec(Vax).applyQuaternion(wQ);
    if (yW.dot(vW) < 0) { xW.negate(); yW.negate(); }
    var sizeU = Uax === 'x' ? lSize.x : (Uax === 'y' ? lSize.y : lSize.z);
    var sizeV = Vax === 'x' ? lSize.x : (Vax === 'y' ? lSize.y : lSize.z);
    var thick = nAx === 'x' ? lSize.x : (nAx === 'y' ? lSize.y : lSize.z);
    mountScreenUnifiedBuild(R, screenMesh, lCenter, xW, yW, nW, sizeU, sizeV, thick);
    R.group.updateMatrixWorld(true);
  }

  // Plano web hijo de la malla + bisagra visible (una sola pieza).
  function mountScreenUnifiedBuild(R, screenMesh, lCenter, xW, yW, nW, sizeU, sizeV, thick) {
    var widthWorld = Math.max(sizeU, 0.1);
    var heightWorld = Math.max(sizeV, 0.1);
    var scale = (widthWorld * 0.998) / FRAME_W;
    var frameHpx = Math.max(50, Math.round(FRAME_W * heightWorld / widthWorld));
    var div = document.createElement('div');
    div.style.width = FRAME_W + 'px';
    div.style.height = frameHpx + 'px';
    div.style.background = '#000000';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.borderRadius = '28px';
    div.style.overflow = 'hidden';
    div.style.border = '0';
    var iframe = document.createElement('iframe');
    iframe.dataset.src = WEB_URL + '?demo=1&t=' + Date.now();
    iframe.setAttribute('allowfullscreen', '');
    iframe.muted = true;
    iframe.setAttribute('muted', '');
    iframe.setAttribute('allow', 'fullscreen');
    iframe.onload = function () { try { muteIframeContent(iframe); } catch (e2) {} };
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.style.borderRadius = '20px';
    iframe.style.background = '#000000';
    iframe.style.pointerEvents = 'auto';
    iframe.style.display = 'block';
    div.appendChild(iframe);
    R.demoFrame = iframe;
    var activateDeliveryDemo = function () {
      if (!iframe.src || iframe.src === 'about:blank') {
        iframe.src = iframe.dataset.src;
        delete iframe.dataset.src;
      }
    };
    window.activateDeliveryDemo = activateDeliveryDemo;
    var demoSection = document.getElementById('hero-3d');
    if (demoSection) {
      var sectionRect = demoSection.getBoundingClientRect();
      if (sectionRect.top < window.innerHeight && sectionRect.bottom > 0) {
        activateDeliveryDemo();
      }
    }
    var screenObj = new THREE.CSS3DObject(div);
    var wScale = screenMesh.getWorldScale(new THREE.Vector3());
    var avgS = (Math.abs(wScale.x) + Math.abs(wScale.y) + Math.abs(wScale.z)) / 3 || 1;
    screenObj.scale.set(scale / avgS, scale / avgS, 1);
    screenMesh.updateWorldMatrix(true, false);
    var cW = lCenter.clone().applyMatrix4(screenMesh.matrixWorld);
    var pW = cW.addScaledVector(nW, thick * avgS * 0.5 + 0.004);
    screenObj.position.copy(screenMesh.worldToLocal(pW.clone()));
    var pQ = screenMesh.getWorldQuaternion(new THREE.Quaternion()).invert();
    var xL = xW.clone().applyQuaternion(pQ).normalize();
    var yL = yW.clone().applyQuaternion(pQ).normalize();
    var zL = nW.clone().applyQuaternion(pQ).normalize();
    var cr = new THREE.Vector3().crossVectors(xL, yL);
    if (cr.dot(zL) < 0) { xL.negate(); yL.negate(); }
    var m4 = new THREE.Matrix4().makeBasis(xL, yL, zL);
    screenObj.quaternion.setFromRotationMatrix(m4);
    screenMesh.add(screenObj);
    lid.cssObj = screenObj;
  }

  // Bisagra central visible uniendo base y pantalla (una sola pieza)
  function mountHingeVisible(R, model, screenMesh) {
    try {
      R.group.updateMatrixWorld(true);
      var sBox = new THREE.Box3().setFromObject(screenMesh);
      var wdt = (sBox.max.x - sBox.min.x) * 0.55;
      var rad = Math.max((sBox.max.x - sBox.min.x) * 0.012, 0.02);
      var geoH = new THREE.CylinderGeometry(rad, rad, Math.max(wdt, 0.5), 24);
      geoH.rotateZ(Math.PI / 2);
      var matH = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.3 });
      var hinge = new THREE.Mesh(geoH, matH);
      var wp = new THREE.Vector3((sBox.min.x + sBox.max.x) / 2, sBox.min.y, (sBox.min.z + sBox.max.z) / 2);
      hinge.position.copy(model.worldToLocal(wp.clone()));
      model.add(hinge);
      R.group.updateMatrixWorld(true);
    } catch (e3) {}
  }

  function mountScreen(R, screenMesh) {
    screenMesh.updateWorldMatrix(true, false);

    // Ocultar la malla 3D del GLB (podria tener material verde del exportador Blender).
    // Solo se muestra el contenido web (CSS3DObject) pegado a la pantalla.
    screenMesh.visible = false;

    // Posicion y orientacion WORLD reales del screenMesh (independiente de la jerarquia).
    var worldPos = screenMesh.getWorldPosition(new THREE.Vector3());
    var worldQuat = screenMesh.getWorldQuaternion(new THREE.Quaternion());

    // Dimensiones de la pantalla
    var sb = new THREE.Box3().setFromObject(screenMesh);
    var ss = sb.getSize(new THREE.Vector3());

    // Vectores de orientacion en mundo
    var normal = new THREE.Vector3(0, 0, 1).applyQuaternion(worldQuat).normalize();
    var upV = new THREE.Vector3(0, 1, 0).applyQuaternion(worldQuat).normalize();
    var rightV = new THREE.Vector3(1, 0, 0).applyQuaternion(worldQuat).normalize();

    // Asegurar que la normal apunte hacia la camara (cara visible del display)
    var cameraDir = new THREE.Vector3().subVectors(R.camera.position, worldPos).normalize();
    if (normal.dot(cameraDir) < 0) {
      normal.negate();
      upV.negate();
      rightV.negate();
    }

    // Dimensiones del plano CSS3D (4% de margen tipo bezel)
    var widthWorld = Math.max(ss.x, 0.1);
    var heightWorld = Math.max(ss.y, ss.z, 0.1);
    var scale = (widthWorld * 0.96) / FRAME_W;
    var frameHpx = Math.round(FRAME_W * heightWorld / widthWorld);

    // La pantalla web se posiciona EXACTAMENTE donde esta el screenMesh del modelo,
    // pegada al display, sin desplazarla hacia adelante (eso la separaria de la bisagra).
    var worldPosFront = worldPos.clone();

    // Contenedor del iframe con bordes redondeados
    var div = document.createElement('div');
    div.style.width = FRAME_W + 'px';
    div.style.height = frameHpx + 'px';
    div.style.overflow = 'hidden';
    div.style.background = '#000000';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.borderRadius = '20px';
    div.style.overflow = 'hidden';

    var iframe = document.createElement('iframe');
    iframe.src = WEB_URL;
    iframe.setAttribute('allowfullscreen', '');
    // Silenciar TODOS los sonidos de la pagina mostrada en la pantalla de la laptop
    iframe.muted = true;
    iframe.setAttribute('muted', '');
    // Sin permiso de autoplay de audio (elimina sonido de inicio)
    iframe.setAttribute('allow', 'fullscreen');
    // Inyectar silenciamiento de audio cuando cargue el contenido del iframe
    iframe.onload = function () { muteIframeContent(iframe); };
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.style.borderRadius = '20px';
    iframe.style.background = '#000000';
    iframe.style.pointerEvents = 'auto';
    iframe.style.display = 'block';
    div.appendChild(iframe);

    var screenObj = new THREE.CSS3DObject(div);
    screenObj.scale.set(scale, scale, 1);

    // Posicionar y rotar: unir al pivote de la bisagra (lid.group) si existe
    if (lid.group) {
      lid.group.add(screenObj);
      var localP = lid.group.worldToLocal(worldPosFront);
      screenObj.position.copy(localP);
      // Rotacion relativa al pivote de la bisagra
      var localQuat = lid.group.quaternion.clone().invert().multiply(worldQuat);
      screenObj.quaternion.copy(localQuat);
      lid.cssObj = screenObj;
    } else {
      R.group.add(screenObj);
      screenObj.position.copy(worldPosFront);
      screenObj.quaternion.copy(worldQuat);
    }
    // La pantalla web queda integrada y mapeada directamente sobre el display del portatil.
  }

  // Inyectar silenciamiento de audio dentro del iframe cargado (demo.html y su iframe hijo app/index.html)
  function muteIframeContent(iframeEl) {
    try {
      var doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
      var s = doc.createElement('script');
      s.textContent = '(' + function () {
        'use strict';
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC && AC.prototype) {
          var proto = AC.prototype;
          if (!proto.__rvMuted) {
            proto.__rvMuted = true;
            var cg = proto.createGain;
            proto.createGain = function () {
              var g = cg.call(this);
              g.gain.setValueAtTime(0, this.currentTime);
              return g;
            };
            var rs = proto.resume;
            proto.resume = function () { return Promise.resolve(); };
          }
        }
        var op = window.HTMLMediaElement.prototype.play;
        if (!op.__rvMuted) {
          op.__rvMuted = true;
          window.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
        }
      } + ')();';
      doc.body.appendChild(s);
    } catch (e) {}
  }

  // ===== TAPA DE LA LAPTOP: abrir al iniciar el demo, cerrar al finalizar =====
  // Convencion: pivote en la bisagra trasera (eje X). ang=0 => pose del GLB (tapa
  // vertical). ang POSITIVO => la tapa baja hacia delante sobre el teclado.
  var lid = {
    group: null,      // grupo girado (pivote en la bisagra)
    cssObj: null,     // pantalla CSS3D (web viva) dentro del grupo
    open: 0, close: 0, ang: 0, from: 0, to: 0, t0: 0, dur: 1200, anim: false, opened: false
  };
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lidSet(a) {
    lid.ang = a;
    // la web (CSS3D) es HIJA del pivote: hereda la rotacion y queda pegada a la pantalla
    if (lid.group) lid.group.rotation.x = a;
    // la web se oculta al cerrar (para que no se vea "dada vuelta" sobre la tapa)
    if (lid.cssObj) lid.cssObj.visible = Math.abs(a) < Math.PI / 4;
  }
  function lidAnimate(to, dur) {
    lid.from = lid.ang; lid.to = to; lid.t0 = Date.now();
    lid.dur = dur || 1200; lid.anim = true;
  }
  function openLid() { lidAnimate(lid.open, 1600); lid.opened = true; }
  function closeLid() { lidAnimate(lid.close, 1300); lid.opened = false; }

  function mountLidPivot(R, model, screenMesh) {
    R.group.updateMatrixWorld(true);
    var sBox = new THREE.Box3().setFromObject(screenMesh);
    var base = null;
    model.traverse(function (o) {
      if (base || !o.isMesh || o === screenMesh) return;
      var b = new THREE.Box3().setFromObject(o);
      if ((b.max.y - b.min.y) < (b.max.z - b.min.z) * 0.6 && b.max.y <= sBox.min.y + 2) base = b;
    });
    if (!base) base = new THREE.Box3().setFromObject(model);
    // Bisagra geometrica del notebook: eje X centrado en el ancho, a la altura del
    // borde inferior de la tapa; z se resuelve para que al cerrar (+90° sobre X) el
    // plano del display (z = sBox.max.z) caiga sobre la cara superior de la base
    // (y = base.max.y):  y_p + z_p = base.max.y + sBox.max.z
    var hingeY = sBox.min.y;
    var hinge = new THREE.Vector3(
      (sBox.min.x + sBox.max.x) / 2,
      hingeY,
      base.max.y + sBox.max.z - hingeY
    );
    var pivot = new THREE.Group();
    R.group.add(pivot);
    pivot.position.copy(R.group.worldToLocal(hinge.clone()));
    var off = R.group.worldToLocal(screenMesh.getWorldPosition(new THREE.Vector3()));
    pivot.add(screenMesh);
    screenMesh.position.copy(off.sub(pivot.position));
    // Angulo de cierre calculado desde la normal real del display:
    // rota la tapa el giro mas corto hasta que la pantalla quede boca abajo (sobre el teclado).
    var dispN = displayNormal(screenMesh, base.getCenter(new THREE.Vector3()));
    var close = Math.PI - Math.atan2(dispN.z, dispN.y);
    close = ((close + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; // wrap (-PI, PI]
    lid.group = pivot;
    lid.open = -0.08; // ligeramente reclinada (pose natural de uso)
    lid.close = close;
    lidSet(lid.close); // arranca CERRADA; openLid() la abre
    if (window.console && console.log) {
      console.log('[Lid] hinge=' + hinge.x.toFixed(2) + ',' + hinge.y.toFixed(2) + ',' + hinge.z.toFixed(2) +
        ' dispN=(' + dispN.x.toFixed(2) + ',' + dispN.y.toFixed(2) + ',' + dispN.z.toFixed(2) + ')' +
        ' close=' + THREE.MathUtils.radToDeg(close).toFixed(1) + 'deg');
    }
    return close;
  }

  // Normal de la cara plana mas grande de la tapa (el display), orientada hacia la
  // base (el display siempre mira al teclado); 'toward' = centro de la caja de la base.
  function displayNormal(mesh, toward) {
    mesh.updateWorldMatrix(true, false);
    var g = mesh.geometry, pos = g.attributes.position, idx = g.index;
    var count = idx ? idx.count : pos.count;
    var best = -1, bestA = -1;
    var a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    var ab = new THREE.Vector3(), ac = new THREE.Vector3(), n = new THREE.Vector3();
    for (var i = 0; i + 2 < count; i += 3) {
      var ia = idx ? idx.getX(i) : i, ib = idx ? idx.getX(i + 1) : i + 1, ic = idx ? idx.getX(i + 2) : i + 2;
      a.fromBufferAttribute(pos, ia); b.fromBufferAttribute(pos, ib); c.fromBufferAttribute(pos, ic);
      ab.subVectors(b, a); ac.subVectors(c, a);
      n.crossVectors(ab, ac);
      var area = n.length() * 0.5;
      if (area > bestA) { bestA = area; best = i; }
    }
    if (best < 0) return new THREE.Vector3(0, 0, 1);
    var ja = idx ? idx.getX(best) : best, jb = idx ? idx.getX(best + 1) : best + 1, jc = idx ? idx.getX(best + 2) : best + 2;
    // vertices en espacio world (el modelo esta rotado 90° en Y y re-centrado)
    a.fromBufferAttribute(pos, ja).applyMatrix4(mesh.matrixWorld);
    b.fromBufferAttribute(pos, jb).applyMatrix4(mesh.matrixWorld);
    c.fromBufferAttribute(pos, jc).applyMatrix4(mesh.matrixWorld);
    n.crossVectors(ab.subVectors(b, a), ac.subVectors(c, a)).normalize();
    // orientar hacia afuera: el display mira lejos del centro de la malla
    var mid = new THREE.Vector3().add(a).add(b).add(c).multiplyScalar(1 / 3);
    if (toward) {
      // orientar hacia la base: el display apunta al teclado, no a la tapa trasera
      if (n.dot(new THREE.Vector3().subVectors(toward, mid)) < 0) n.negate();
    } else {
      var mBox = new THREE.Box3().setFromObject(mesh);
      var mCenter = mBox.getCenter(new THREE.Vector3());
      if (n.dot(mid.sub(mCenter)) < 0) n.negate();
    }
    return n;
  }

  function startLoop(R) {
    var clock = new THREE.Clock();
    var mx = 0, my = 0;
    var frameId = 0;
    var lastFrame = 0;
    var active = true;
    var reducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.addEventListener('pointermove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function schedule() {
      if (active && !document.hidden && !frameId) {
        frameId = requestAnimationFrame(tick);
      }
    }
    function tick(now) {
      frameId = 0;
      if (!active || document.hidden) return;
      if (now - lastFrame < 33) {
        schedule();
        return;
      }
      lastFrame = now;
      var t = clock.getElapsedTime();
      // animacion de la tapa (abrir/cerrar)
      if (lid.anim) {
        var lt = Math.min((Date.now() - lid.t0) / lid.dur, 1);
        lidSet(lid.from + (lid.to - lid.from) * easeInOut(lt));
        if (lt >= 1) lid.anim = false;
      }
      var k = Math.min(t / 1.8, 1);
      var e = easeOut(k);
      R.camera.position.lerpVectors(R.camStart, R.camEnd, e);
      R.camera.lookAt(R.target);
      if (!reducedMotion) {
        R.group.position.y = Math.sin(t * 0.9) * (R.floatAmp || 0.7) * e;
        R.group.rotation.y += ((mx * 0.05) - R.group.rotation.y) * 0.04;
        R.group.rotation.x += ((my * 0.02) - R.group.rotation.x) * 0.04;
      }
      R.group.scale.setScalar(0.85 + 0.15 * e);
      R.renderer.render(R.scene, R.camera);
      R.cssRenderer.render(R.scene, R.camera);
      if (!reducedMotion || e < 1 || lid.anim) schedule();
    }
    if (typeof IntersectionObserver === 'function') {
      var observer = new IntersectionObserver(function (entries) {
        active = entries.some(function (entry) { return entry.isIntersecting; });
        if (active) schedule();
      });
      observer.observe(R.wrap);
    }
    document.addEventListener('visibilitychange', schedule);
    schedule();
    window.addEventListener('resize', function () {
      R.camera.aspect = R.W() / R.H();
      R.camera.updateProjectionMatrix();
      R.renderer.setSize(R.W(), R.H());
      R.cssRenderer.setSize(R.W(), R.H());
    });
    var cta = document.getElementById('simulateShipment');
    if (cta) cta.addEventListener('click', function () { R.wrap.classList.add('compact'); }, { once: true });

    // El demo (iframe) avisa cuando empieza y cuando termina el ciclo
    var closeTimer = null;
    window.addEventListener('message', function (ev) {
      var d = ev && ev.data;
      if (!d || typeof d !== 'object') return;
      if (d.rapivoyDemo === 'start') {
        if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
        if (!lid.opened) {
          openLid();
          schedule();
        }
      } else if (d.rapivoyDemo === 'end') {
        // la tapa permanece ABIERTA: no se cierra al terminar el demo
        // (si el mensaje 'start' llega luego, la tapa ya esta abierta)
      }
    });
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = function () {
        reject(new Error('No se pudo cargar ' + src));
      };
      document.head.appendChild(script);
    });
  }

  // Prueba varias URLs de CDN hasta que una cargue
  function loadScriptWithFallback(urls) {
    var idx = 0;
    function tryNext() {
      if (idx >= urls.length) return Promise.reject(new Error('Todos los CDN fallaron'));
      return loadScript(urls[idx]).catch(function (err) {
        idx++;
        return tryNext();
      });
    }
    return tryNext();
  }

  function loadThreeDependencies() {
    var threeUrls = [
      'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
      'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',
      'https://unpkg.com/three@0.128.0/build/three.min.js'
    ];
    var loaded = window.THREE ? Promise.resolve() :
      loadScriptWithFallback(threeUrls);
    return loaded
      .then(function () {
        if (THREE.GLTFLoader) return undefined;
        var gltfUrls = [
          'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',
          'https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js'
        ];
        return loadScriptWithFallback(gltfUrls);
      })
      .then(function () {
        if (THREE.CSS3DRenderer) return undefined;
        var cssUrls = [
          'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/renderers/CSS3DRenderer.js',
          'https://unpkg.com/three@0.128.0/examples/js/renderers/CSS3DRenderer.js'
        ];
        return loadScriptWithFallback(cssUrls);
      });
  }

  function initWhenNearDemo() {
    if (document.body.classList.contains('iphone-only')) return;
    var wrap = document.getElementById('realLaptopWrap');
    if (!wrap) return;
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && connection.saveData) {
      var loader = document.getElementById('realLaptopLoader');
      if (loader) loader.classList.add('hidden');
      return;
    }
    var started = false;
    function start() {
      if (started) return;
      started = true;
      loadThreeDependencies().then(init).catch(function () {
        fail('No se pudo cargar el visor 3D; se muestra la vista compatible.');
      });
    }
    var demo = document.getElementById('hero-3d');
    if (!demo || typeof IntersectionObserver !== 'function') {
      start();
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
      observer.disconnect();
      start();
    }, { rootMargin: '300px 0px' });
    observer.observe(demo);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenNearDemo, { once: true });
  } else { initWhenNearDemo(); }
})();
