document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("physics-container");
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 150);
  camera.position.z = 90;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  const world = new CANNON.World();
  world.gravity.set(0, -20, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 10;

  // Ground
  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(1, 0, 0),
    -Math.PI / 2
  );
  groundBody.position.y = -15;
  world.addBody(groundBody);

  // Walls
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

  techItems.forEach((tech) => {
    const radius = tech.size;
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const texture = new THREE.TextureLoader().load(tech.icon);
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 30,
    });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(
      (Math.random() - 0.5) * 20,
      Math.random() * 10 + 10,
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
    ballBodies.push(body); // world.addBody(body) will be delayed
  });

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // Mouse attraction
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

  renderer.domElement.addEventListener("mousemove", (event) => {
    isAttracting = true;
    attractPosition = getMousePosInScene(event.clientX, event.clientY);
  });

  renderer.domElement.addEventListener("mouseleave", () => {
    isAttracting = false;
  });

  renderer.domElement.addEventListener("touchmove", (event) => {
    if (event.touches.length > 0) {
      isAttracting = true;
      const touch = event.touches[0];
      attractPosition = getMousePosInScene(touch.clientX, touch.clientY);
    }
  });

  renderer.domElement.addEventListener("touchend", () => {
    isAttracting = false;
  });

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

    ballBodies.forEach((body, index) => {
      balls[index].position.copy(body.position);
      balls[index].quaternion.copy(body.quaternion);
    });

    renderer.render(scene, camera);
  }

  animate();

  // IntersectionObserver to trigger physics only when visible
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !animationStarted) {
        animationStarted = true;
        ballBodies.forEach((body) => world.addBody(body));
      }
    },
    {
      threshold: 0.3, // adjust as needed
    }
  );

  observer.observe(container);

  window.addEventListener("resize", () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
});
