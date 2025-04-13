document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("physics-container");
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  const aspect = width / height;
  const zoom = 25;
  const camera = new THREE.OrthographicCamera(
    -zoom * aspect,
    zoom * aspect,
    zoom,
    -zoom,
    0.1,
    200
  );
  camera.position.z = 100;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const world = new CANNON.World();
  world.gravity.set(0, -20, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 10;

  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  groundBody.position.y = -15;
  world.addBody(groundBody);

  const ceilingShape = new CANNON.Plane();
  const ceilingBody = new CANNON.Body({ mass: 0 });
  ceilingBody.addShape(ceilingShape);
  ceilingBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
  ceilingBody.position.y = 15;
  world.addBody(ceilingBody);

  const wallShape = new CANNON.Plane();
  const padding = 20;
  const walls = [
    {
      axis: new CANNON.Vec3(0, 1, 0),
      angle: Math.PI / 2,
      position: { x: -25 - padding, y: 0, z: 0 },
    },
    {
      axis: new CANNON.Vec3(0, 1, 0),
      angle: -Math.PI / 2,
      position: { x: 25 + padding, y: 0, z: 0 },
    },
    {
      axis: new CANNON.Vec3(0, 0, 0),
      angle: 0,
      position: { x: 0, y: 0, z: -25 - padding },
    },
    {
      axis: new CANNON.Vec3(0, 1, 0),
      angle: Math.PI,
      position: { x: 0, y: 0, z: 25 + padding },
    },
  ];
  walls.forEach(({ axis, angle, position }) => {
    const wall = new CANNON.Body({ mass: 0 });
    wall.addShape(wallShape);
    if (angle !== 0) wall.quaternion.setFromAxisAngle(axis, angle);
    wall.position.set(position.x, position.y, position.z);
    world.addBody(wall);
  });

  const techItems = [
    { name: "C++", icon: "images/c++.png", size: 7.2 },
    { name: "Java", icon: "images/java.png", size: 7.2 },
    { name: "JavaScript", icon: "images/javascript.png", size: 7.4 },
    { name: "Kotlin", icon: "images/kotlin.png", size: 7.1 },
    { name: "Firebase", icon: "images/firebase.png", size: 7.3 },
    { name: "PHP", icon: "images/php.png", size: 7.1 },
    { name: "HTML", icon: "images/html.png", size: 7.0 },
    { name: "CSS", icon: "images/css.png", size: 7.0 },
    { name: "Node.js", icon: "images/node.png", size: 7.3 },
    { name: "WordPress", icon: "images/wordpress.png", size: 7.5 },
    { name: "Figma", icon: "images/figma.png", size: 7.1 },
  ];

  const balls = [];
  const ballBodies = [];

  function getScaleFactor() {
    const screenWidth = container.clientWidth;
    if (screenWidth <= 600) return 0.8;
    if (screenWidth <= 1200) return 0.9;
    return 1;
  }

  function createBall(index, scaleFactor) {
    const tech = techItems[index];
    const radius = tech.size * scaleFactor;
    const geometry = new THREE.SphereGeometry(radius, 64, 64);

    const texture = new THREE.TextureLoader().load(tech.icon, (tex) => {
      tex.generateMipmaps = true;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      tex.minFilter = THREE.LinearMipMapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
    });

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 50,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 20,
      Math.random() * 10 + 5,
      (Math.random() - 0.5) * 20
    );
    scene.add(mesh);
    balls.push(mesh);

    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({ mass: 1 });
    body.addShape(shape);
    body.position.copy(mesh.position);
    body.linearDamping = 0.4;
    body.angularDamping = 0.4;
    ballBodies.push(body);
  }

  const initialScaleFactor = getScaleFactor();
  for (let i = 0; i < techItems.length; i++) {
    createBall(i, initialScaleFactor);
  }

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  let attractPosition = new THREE.Vector3();
  let isAttracting = false;

  function getMousePosInScene(x, y) {
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((x - rect.left) / rect.width) * 2 - 1,
      -((y - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
    return intersection;
  }

  const enableAttract = (x, y) => {
    isAttracting = true;
    attractPosition = getMousePosInScene(x, y);
  };

  const disableAttract = () => (isAttracting = false);
  

  document.getElementById("interaction-overlay").addEventListener("mousemove", (e) => {
    enableAttract(e.clientX, e.clientY);
  });
  document.getElementById("interaction-overlay").addEventListener("mouseleave", disableAttract);
  window.addEventListener("mousemove", (e) => enableAttract(e.clientX, e.clientY));
  window.addEventListener("mouseleave", disableAttract);
  window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) enableAttract(e.touches[0].clientX, e.touches[0].clientY);
  });
  window.addEventListener("touchend", disableAttract);

  let animationStarted = false;

  function animate() {
    requestAnimationFrame(animate);
    if (!animationStarted) return;

    world.step(1 / 60);

    if (isAttracting) {
      ballBodies.forEach((body) => {
        const force = new CANNON.Vec3(
          attractPosition.x - body.position.x,
          attractPosition.y - body.position.y,
          attractPosition.z - body.position.z
        );
        force.scale(10, force);
        body.applyForce(force, body.position);
      });
    }

    ballBodies.forEach((body, i) => {
      balls[i].position.copy(body.position);
      balls[i].quaternion.copy(body.quaternion);
    });

    renderer.render(scene, camera);
  }

  animate();

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !animationStarted) {
        animationStarted = true;
        ballBodies.forEach((body) => world.addBody(body));
      }
    },
    { threshold: 0.3 }
  );

  observer.observe(container);

  window.addEventListener("resize", () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const newScaleFactor = getScaleFactor();
    techItems.forEach((tech, index) => {
      const radius = tech.size * newScaleFactor;

      const newGeometry = new THREE.SphereGeometry(radius, 64, 64);
      balls[index].geometry.dispose();
      balls[index].geometry = newGeometry;

      const newShape = new CANNON.Sphere(radius);
      ballBodies[index].shapes = [];
      ballBodies[index].addShape(newShape);
    });
  });
});