document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('menu');
  const settings = document.getElementById('settings');
  const help = document.getElementById('help');

  const startButton = document.getElementById('startGame');
  const settingsButton = document.getElementById('openSettings');
  const helpButton = document.getElementById('openHelp');
  const backToMenuFromSettings = document.getElementById('backToMenuFromSettings');
  const backToMenuFromHelp = document.getElementById('backToMenuFromHelp');
  const soundToggleButton = document.getElementById('soundToggleButton'); // Sound toggle button

  const menuMusic = new Audio('https://www.televisiontunes.com/uploads/audio/Spongebob%20SquarePants%20-%20APM%20-%20Hawaiian%20Cocktail.mp3');
  menuMusic.loop = true;

  let isSoundOn = JSON.parse(localStorage.getItem('isSoundOn')) || false;

  function toggleSound() {
    isSoundOn = !isSoundOn;
    localStorage.setItem('isSoundOn', JSON.stringify(isSoundOn));
    updateSoundState();
  }

  function updateSoundState() {
    if (isSoundOn) {
      menuMusic.play().catch(() => {});
      soundToggleButton.textContent = 'Sound: On';
    } else {
      menuMusic.pause();
      soundToggleButton.textContent = 'Sound: Off';
    }
  }

  menu.classList.add('active');
  updateSoundState();

  startButton.addEventListener('click', () => {
    menuMusic.pause();
    window.location.href = 'game.html';
  });

  settingsButton.addEventListener('click', () => {
    menu.classList.remove('active');
    settings.classList.add('active');
  });

  helpButton.addEventListener('click', () => {
    menu.classList.remove('active');
    help.classList.add('active');
  });

  backToMenuFromSettings.addEventListener('click', () => {
    settings.classList.remove('active');
    menu.classList.add('active');
    updateSoundState();
  });

  backToMenuFromHelp.addEventListener('click', () => {
    help.classList.remove('active');
    menu.classList.add('active');
    updateSoundState();
  });

  soundToggleButton.addEventListener('click', toggleSound);
});