const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    navigation.classList.toggle('is-open', !isOpen);
  });

  navigation.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuButton.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
    }
  });
}

const welcomeMessage = document.querySelector('#welcome-message');
const welcomeText = welcomeMessage?.querySelector('.welcome-text');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (welcomeMessage instanceof HTMLElement && welcomeText instanceof HTMLElement) {
  const fullMessage = welcomeMessage.getAttribute('aria-label') ?? '';
  if (reduceMotion) {
    welcomeText.textContent = fullMessage;
    welcomeMessage.querySelector('.type-caret')?.remove();
  } else {
    const characters = Array.from(fullMessage);
    let position = 0;
    welcomeText.textContent = '';
    const typeNextCharacter = () => {
      if (position >= characters.length) {
        welcomeMessage.querySelector('.type-caret')?.remove();
        return;
      }
      welcomeText.textContent += characters[position];
      position += 1;
      window.setTimeout(typeNextCharacter, 28);
    };
    window.setTimeout(typeNextCharacter, 220);
  }
}

const ambientLayer = document.querySelector('#ambient-layer');
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
const canAnimatePage = !reduceMotion && hasFinePointer;
const floatingSymbols = ['🧋', '🐈', '✨', '☁️', '🌼', '✿', '♡', '✦'];

if (ambientLayer instanceof HTMLElement && !reduceMotion) {
  ambientLayer.removeAttribute('aria-hidden');
  const palette = ['#ff4fa3', '#7547ff', '#b59aff', '#ff9bcb'];
  const iconCount = hasFinePointer ? floatingSymbols.length : 5;
  for (let index = 0; index < iconCount; index += 1) {
    const icon = document.createElement('button');
    const duration = 18 + Math.random() * 14;
    icon.className = 'ambient-icon';
    icon.type = 'button';
    icon.textContent = floatingSymbols[index];
    icon.setAttribute('aria-label', 'Mở thiệp chúc mừng ngày Nhà giáo Việt Nam 20/11');
    icon.title = 'Chạm để mở lời chúc 20/11';
    icon.style.setProperty('--left', `${Math.random() * 96}%`);
    icon.style.setProperty('--size', `${16 + Math.random() * 14}px`);
    icon.style.setProperty('--duration', `${duration}s`);
    icon.style.setProperty('--delay', `${-Math.random() * duration}s`);
    icon.style.setProperty('--drift', `${Math.round(Math.random() * 100 - 50)}px`);
    icon.style.setProperty('--tint', palette[index % palette.length]);
    icon.style.setProperty('--alpha', `${0.3 + Math.random() * 0.18}`);
    ambientLayer.append(icon);
  }

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const icon = event.target.closest('.ambient-icon');
    if (!(icon instanceof HTMLButtonElement) || !ambientLayer.contains(icon)) return;
    event.preventDefault();

    const bounds = icon.getBoundingClientRect();
    const x = event instanceof MouseEvent && event.clientX ? event.clientX : bounds.left + bounds.width / 2;
    const y = event instanceof MouseEvent && event.clientY ? event.clientY : bounds.top + bounds.height / 2;
    createCelebrationBurst(x, y);
    icon.classList.add('is-bursting');
    window.setTimeout(() => icon.classList.remove('is-bursting'), 360);
    openTeacherCard();
  }, true);
}

if (canAnimatePage) {
  const palette = ['#ff4fa3', '#7547ff', '#b59aff', '#ff9bcb'];
  let lastParticleAt = 0;
  document.addEventListener('pointermove', (event) => {
    const now = performance.now();
    if (event.pointerType !== 'mouse' || now - lastParticleAt < 95) return;
    lastParticleAt = now;

    const particle = document.createElement('span');
    particle.className = 'cursor-spark';
    particle.setAttribute('aria-hidden', 'true');
    particle.textContent = floatingSymbols[Math.floor(Math.random() * floatingSymbols.length)];
    particle.style.left = `${event.clientX}px`;
    particle.style.top = `${event.clientY}px`;
    particle.style.setProperty('--spark-color', palette[Math.floor(Math.random() * palette.length)]);
    particle.style.setProperty('--spark-size', `${13 + Math.random() * 9}px`);
    particle.style.setProperty('--spark-x', `${Math.round(Math.random() * 56 - 28)}px`);
    particle.style.setProperty('--spark-y', `${Math.round(15 + Math.random() * 32)}px`);
    document.body.append(particle);
    window.setTimeout(() => particle.remove(), 900);
  }, { passive: true });
}

const musicToggle = document.querySelector('#music-toggle');
const musicPlayer = document.querySelector('.music-player');
const musicStatus = document.querySelector('#music-status');
let audioContext;
let musicMasterGain;
let musicTimer;
let musicStep = 0;
let teacherCardOpen = false;
let teacherCard;

function createCelebrationBurst(x, y) {
  const particles = ['✦', '✧', '✿', '✨', '♡', '✳', '❀', '✦'];
  const colors = ['#ff4fa3', '#7547ff', '#b59aff', '#ff9bcb', '#d8a82c'];

  particles.forEach((symbol, index) => {
    const particle = document.createElement('span');
    const angle = (Math.PI * 2 * index) / particles.length;
    const distance = 28 + Math.random() * 35;
    particle.className = 'celebration-particle';
    particle.textContent = symbol;
    particle.setAttribute('aria-hidden', 'true');
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty('--particle-x', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--particle-y', `${Math.sin(angle) * distance}px`);
    particle.style.setProperty('--particle-color', colors[index % colors.length]);
    document.body.append(particle);
    window.setTimeout(() => particle.remove(), 850);
  });
}

function setMusicVolume(volume) {
  if (!audioContext || !musicMasterGain) return;
  musicMasterGain.gain.cancelScheduledValues(audioContext.currentTime);
  musicMasterGain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.12);
}

function openTeacherCard() {
  if (!(teacherCard instanceof HTMLDialogElement)) return;
  if (!teacherCard.open) teacherCard.showModal();
  teacherCardOpen = true;
  setMusicVolume(0.18);
  musicStatus?.setAttribute('aria-label', 'Nhạc nền đã giảm âm lượng để đọc thiệp');
  if (musicStatus instanceof HTMLElement && musicTimer) {
    musicStatus.textContent = 'Nhạc nền nhỏ · lời chúc 20/11';
    playTone(1046.5, audioContext.currentTime + 0.04, 0.24, 0.09, 'sine');
  }
}

function closeTeacherCard() {
  if (teacherCard instanceof HTMLDialogElement && teacherCard.open) teacherCard.close();
}

document.body.insertAdjacentHTML('beforeend', `
  <dialog class="teacher-modal" aria-labelledby="teacher-card-title" aria-describedby="teacher-card-message">
    <article class="teacher-card">
      <button class="teacher-card-close" type="button" aria-label="Đóng thiệp">×</button>
      <span class="teacher-card-flower flower-one" aria-hidden="true">✿</span>
      <span class="teacher-card-flower flower-two" aria-hidden="true">✳</span>
      <span class="teacher-card-flower flower-three" aria-hidden="true">✧</span>
      <p class="teacher-card-date">20 · 11 · TRI ÂN</p>
      <h2 id="teacher-card-title">🌸 CHÚC MỪNG NGÀY NHÀ GIÁO VIỆT NAM 20/11 🌸</h2>
      <div class="teacher-card-divider" aria-hidden="true"><span>✿</span></div>
      <p id="teacher-card-message">Nhân ngày 20/11, Doanh xin gửi lời tri ân sâu sắc và ngàn lời chúc tốt đẹp nhất đến quý Thầy Cô! Cảm ơn Thầy Cô đã luôn là người đưa đò tận tụy, truyền ngọn lửa tri thức và nâng cánh cho những ước mơ của chúng em bay xa. Chúc Thầy Cô luôn mạnh khỏe, hạnh phúc và luôn tràn đầy nhiệt huyết với sự nghiệp trồng người cao quý! 💖✨</p>
      <p class="teacher-card-signature">Thân thương,<br><strong>Doanh 💖</strong></p>
      <button class="teacher-card-button" type="button">Đóng thiệp <span aria-hidden="true">♡</span></button>
    </article>
  </dialog>
`);

teacherCard = document.querySelector('.teacher-modal');
const closeCardButton = teacherCard?.querySelector('.teacher-card-close');
const closeCardFooter = teacherCard?.querySelector('.teacher-card-button');
closeCardButton?.addEventListener('click', closeTeacherCard);
closeCardFooter?.addEventListener('click', closeTeacherCard);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && teacherCard instanceof HTMLDialogElement && teacherCard.open) {
    event.preventDefault();
    closeTeacherCard();
  }
}, true);
teacherCard?.addEventListener('click', (event) => {
  if (event.target === teacherCard) closeTeacherCard();
});
teacherCard?.addEventListener('close', () => {
  teacherCardOpen = false;
  setMusicVolume(0.62);
  if (musicStatus instanceof HTMLElement && musicTimer) {
    musicStatus.textContent = 'Đang phát · giai điệu gốc';
    musicStatus.removeAttribute('aria-label');
  }
});

function playTone(frequency, startAt, duration, volume, waveform = 'sine', addVibrato = false) {
  const oscillator = audioContext.createOscillator();
  const envelope = audioContext.createGain();
  oscillator.type = waveform;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  envelope.gain.setValueAtTime(0.0001, startAt);
  envelope.gain.exponentialRampToValueAtTime(volume, startAt + 0.025);
  envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(envelope);
  envelope.connect(musicMasterGain ?? audioContext.destination);

  if (addVibrato) {
    const vibrato = audioContext.createOscillator();
    const vibratoGain = audioContext.createGain();
    vibrato.frequency.value = 5;
    vibratoGain.gain.value = 3;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(oscillator.frequency);
    vibrato.start(startAt);
    vibrato.stop(startAt + duration);
  }

  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.03);
}

function playMusicStep() {
  if (!audioContext || audioContext.state !== 'running') return;

  const time = audioContext.currentTime + 0.04;
  const step = musicStep % 16;
  const chordProgression = [
    [261.63, 329.63, 392],
    [220, 261.63, 329.63],
    [174.61, 220, 261.63],
    [196, 246.94, 293.66]
  ];
  const melody = [659.25, 587.33, 523.25, 0, 587.33, 523.25, 440, 0, 523.25, 587.33, 659.25, 0, 783.99, 659.25, 587.33, 0];

  if (step === 0) {
    chordProgression[Math.floor(musicStep / 16) % chordProgression.length].forEach((frequency) => {
      playTone(frequency, time, 3.5, 0.018, 'triangle');
    });
  }
  if (step === 0 || step === 8) playTone(78, time, 0.18, 0.045);
  if (melody[step] > 0) playTone(melody[step], time, 0.42, 0.035, 'sine', true);
  musicStep += 1;
}

async function toggleMusic() {
  if (!(musicToggle instanceof HTMLButtonElement) || !(musicStatus instanceof HTMLElement)) return;
  musicToggle.disabled = true;

  if (musicTimer) {
    window.clearInterval(musicTimer);
    musicTimer = undefined;
    await audioContext?.close();
    audioContext = undefined;
    musicMasterGain = undefined;
    musicToggle.setAttribute('aria-pressed', 'false');
    musicToggle.setAttribute('aria-label', 'Bật nhạc nền');
    musicToggle.textContent = '▶';
    musicPlayer?.classList.remove('is-playing');
    musicStatus.textContent = 'Nhạc đang tắt';
    musicToggle.disabled = false;
    return;
  }

  try {
    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) throw new Error('Trình duyệt này không hỗ trợ phát nhạc nền.');
    audioContext = new AudioContextConstructor();
    await audioContext.resume();
    musicMasterGain = audioContext.createGain();
    musicMasterGain.gain.value = teacherCardOpen ? 0.18 : 0.62;
    musicMasterGain.connect(audioContext.destination);
    musicStep = 0;
    playMusicStep();
    musicTimer = window.setInterval(playMusicStep, 250);
    musicToggle.setAttribute('aria-pressed', 'true');
    musicToggle.setAttribute('aria-label', 'Tắt nhạc nền');
    musicToggle.textContent = 'Ⅱ';
    musicPlayer?.classList.add('is-playing');
    musicStatus.textContent = 'Đang phát · giai điệu gốc';
  } catch (error) {
    musicStatus.textContent = error instanceof Error ? error.message : 'Không thể phát nhạc trên trình duyệt này.';
    await audioContext?.close();
    audioContext = undefined;
    musicMasterGain = undefined;
  } finally {
    musicToggle.disabled = false;
  }
}

musicToggle?.addEventListener('click', toggleMusic);

const contactForm = document.querySelector('#contact-form');
if (contactForm instanceof HTMLFormElement) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const topic = String(formData.get('topic') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();
    const subject = encodeURIComponent(`[Portfolio] ${topic} — ${name}`);
    const body = encodeURIComponent(`Tên: ${name}\nEmail: ${email}\nChủ đề: ${topic}\n\n${message}`);
    const status = document.querySelector('#form-status');

    if (!(status instanceof HTMLElement)) {
      throw new Error('Không tìm thấy vùng thông báo trạng thái biểu mẫu.');
    }

    status.textContent = 'Đang mở ứng dụng email của bạn. Nếu ứng dụng không mở, hãy gửi trực tiếp đến doanh030501@gmail.com.';
    window.location.href = `mailto:doanh030501@gmail.com?subject=${subject}&body=${body}`;
  });
}

document.querySelectorAll('[data-print]').forEach((button) => {
  button.addEventListener('click', () => window.print());
});
