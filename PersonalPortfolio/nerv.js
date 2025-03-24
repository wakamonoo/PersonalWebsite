const canvas = document.getElementById("leafCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const leaves = [];
const leafImage = new Image();
leafImage.src = "images/nerv.png";

// Function to get leaf size based on screen width
function getLeafSize() {
  if (window.innerWidth <= 768) {
    return Math.random() * 40 + 30; // Smaller leaves for mobile
  } else {
    return Math.random() * 80 + 50; // Original size for larger screens
  }
}

// Initialize leaves
for (let i = 0; i < 6; i++) {
  leaves.push({
    x: Math.random() * canvas.width,
    y: Math.random() * document.body.scrollHeight,
    speedX: Math.random() * 0.5 - 0.25,
    speedY: Math.random() * 0.5 + 0.1,
    size: getLeafSize(), // Responsive size
    rotation: Math.random() * 360,
    rotationSpeed: Math.random() * 0.5 - 0.25,
    sway: Math.random() * 2,
    swayDirection: Math.random() > 0.5 ? 1 : -1,
    flip: Math.random() * Math.PI,
    flipSpeed: Math.random() * 0.05 - 0.025,
    opacity: Math.random() * 0.3 + 0.3,
    isWhite: Math.random() > 0.5,
  });
}

function drawLeaves() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  leaves.forEach((leaf) => {
    ctx.save();
    ctx.translate(leaf.x, leaf.y - window.scrollY);

    let scale = Math.sin(leaf.flip) * 0.5 + 0.75;
    ctx.scale(scale, 1);

    ctx.rotate((leaf.rotation * Math.PI) / 180);

    ctx.globalAlpha = leaf.opacity;

    if (leaf.isWhite) {
      ctx.filter = "brightness(0) invert(1) sepia(0) saturate(0)";
    }

    ctx.drawImage(
      leafImage,
      -leaf.size / 2,
      -leaf.size / 2,
      leaf.size,
      leaf.size
    );

    ctx.filter = "none";
    ctx.globalAlpha = 1;

    ctx.restore();

    leaf.x += leaf.speedX + Math.sin(leaf.sway) * 0.3;
    leaf.y += leaf.speedY;
    leaf.rotation += leaf.rotationSpeed;
    leaf.sway += leaf.swayDirection * 0.02;
    leaf.flip += leaf.flipSpeed;

    if (leaf.y > document.body.scrollHeight) {
      leaf.y = -50;
      leaf.x = Math.random() * canvas.width;
    }
  });

  requestAnimationFrame(drawLeaves);
}

// Resize canvas and update leaf sizes when window resizes
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Update leaf sizes
  leaves.forEach((leaf) => {
    leaf.size = getLeafSize();
  });
});

leafImage.onload = () => {
  drawLeaves();
};
