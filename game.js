const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 470;
canvas.height = 949;

const playerImage = new Image();
playerImage.src = 'https://tr.rbxcdn.com/180DAY-48d75acc420244bf8848981c4971f9bc/420/420/Hat/Webp/noFilter';

const stablePlatformImage = new Image();
stablePlatformImage.src = 'https://static.wikia.nocookie.net/spongebob/images/6/68/Jellyfish_stock_art_1.png/revision/latest?cb=20190216195152';

const movingPlatformImage = new Image();
movingPlatformImage.src = 'https://static.wikia.nocookie.net/spongebob/images/e/e2/Chum_Bucket_chum_stock_art.png/revision/latest/thumbnail/width/360/height/450?cb=20230124082042';

const deathSound = new Audio('https://www.myinstants.com/media/sounds/cursed-plankton.mp3');
const jumpSound = new Audio('https://www.myinstants.com/media/sounds/sponge-bob-womp.mp3');

let isSoundOn = JSON.parse(localStorage.getItem('isSoundOn')) || false;

const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 60,
  width: 70,
  height: 70,
  dx: 0,
  dy: 0,
  jumpPower: -20,
};

const gravity = 0.5;

let platforms = [];
const platformWidth = 80;
const platformHeight = 70;
const platformCount = Math.floor(canvas.height / 150);

let particles = [];

let score = 0;
let isGameOver = false;

const gameOverOverlay = document.getElementById('gameOver');
const tryAgainButton = document.getElementById('tryAgain');
const backToMenuButton = document.getElementById('backToMenu');

tryAgainButton.addEventListener('click', () => {
  gameOverOverlay.classList.remove('active');
  resetGame();
  gameLoop();
});

backToMenuButton.addEventListener('click', () => {
  window.location.href = './index.html';
});

function playSound(sound) {
  if (isSoundOn) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}

function createPlatforms() {
  platforms = [];
  let yOffset = canvas.height - 20;

  for (let i = 0; i < platformCount; i++) {
    platforms.push({
      x: Math.random() * (canvas.width - platformWidth),
      y: yOffset,
      width: platformWidth,
      height: platformHeight,
      isJumpedOn: false,
      visible: true,
      breakable: Math.random() > 0.7,
      broken: false,
      moving: Math.random() > 0.5,
      speed: Math.random() * 2 + 1,
    });
    yOffset -= canvas.height / platformCount;
  }

  const firstPlatform = platforms[0];
  player.x = firstPlatform.x + firstPlatform.width / 2 - player.width / 2;
  player.y = firstPlatform.y - player.height;
  score = 0;
}

function drawPlayer() {
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function drawPlatforms() {
  platforms.forEach(platform => {
    if (platform.visible) {
      const image = platform.moving ? movingPlatformImage : stablePlatformImage;
      ctx.drawImage(image, platform.x, platform.y, platform.width, platform.height);
    }
  });
}

function drawParticles() {
  particles.forEach((particle, index) => {
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    particle.x += particle.dx;
    particle.y += particle.dy;
    particle.size -= 0.1;

    if (particle.size <= 0) {
      particles.splice(index, 1)
    }
  });
}

function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = '25px Broadway, sans-serif';
  ctx.fillText(`Score: ${score}`, 10, 30);
}

function movePlayer() {
  player.dy += gravity;
  player.y += player.dy;
  player.x += player.dx;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function checkCollisions() {
  platforms.forEach(platform => {
    if (
      platform.visible &&
      player.dy > 0 &&
      player.y + player.height >= platform.y &&
      player.y + player.height <= platform.y + platformHeight + 5 &&
      player.x + player.width > platform.x &&
      player.x < platform.x + platformWidth
    ) {
      player.dy = player.jumpPower;
      player.y = platform.y - player.height;

      playSound(jumpSound);

      if (!platform.isJumpedOn) {
        platform.isJumpedOn = true;
        score++;

        const particleColor = platform.moving ? 'yellow' : 'cyan';
        for (let i = 0; i < 10; i++) {
          particles.push({
            x: platform.x + Math.random() * platform.width,
            y: platform.y,
            dx: Math.random() * 2 - 1,
            dy: Math.random() * -2,
            size: 5,
            color: particleColor,
          });
        }

        if (platform.breakable) {
          platform.broken = true;
          platform.visible = false;
        }
      }
    }
  });
}

function scrollPlatforms() {
  platforms.forEach(platform => {
    if (platform.moving && !platform.broken) {
      platform.x += platform.speed;
      if (platform.x < 0 || platform.x + platform.width > canvas.width) {
        platform.speed = -platform.speed;
      }
    }
  });

  if (player.y < canvas.height / 3) {
    const shift = canvas.height / 3 - player.y;
    player.y += shift;

    platforms.forEach(platform => {
      platform.y += shift;
    });

    platforms = platforms.filter(platform => platform.y < canvas.height);

    while (platforms.length < platformCount) {
      const lastPlatformY = platforms.length > 0 ? platforms[platforms.length - 1].y : canvas.height;
      const newPlatformY = lastPlatformY - canvas.height / 3;
      platforms.push({
        x: Math.random() * (canvas.width - platformWidth),
        y: newPlatformY,
        width: platformWidth,
        height: platformHeight,
        isJumpedOn: false,
        visible: true,
        breakable: Math.random() > 0.7,
        broken: false,
        moving: Math.random() > 0.5,
        speed: Math.random() * 2 + 1,
      });
    }
  }
}

function checkGameOver() {
  if (player.y > canvas.height) {
    playSound(deathSound);
    isGameOver = true;
    gameOverOverlay.classList.add('active');
  }
}

function resetGame() {
  createPlatforms();
  player.dx = 0;
  player.dy = 0;
  isGameOver = false;
}

function gameLoop() {
  if (isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlatforms();
  drawParticles();
  drawPlayer();
  drawScore();

  movePlayer();
  checkCollisions();
  scrollPlatforms();
  checkGameOver();

  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') player.dx = -5;
  if (e.key === 'ArrowRight') player.dx = 5;
});

document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
});

createPlatforms();
gameLoop();