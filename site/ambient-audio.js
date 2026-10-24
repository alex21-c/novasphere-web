(() => {
  const toggle = document.getElementById('ambientAudioToggle');
  const volume = document.getElementById('ambientAudioVolume');
  const status = document.getElementById('ambientAudioStatus');
  if (!toggle || !volume || !status) return;

  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  let audioContext = null;
  let masterGain = null;
  let oscillators = [];
  let progressionTimer = 0;
  let isPlaying = false;

  const chordProgression = [
    [261.63, 329.63, 392],
    [220, 261.63, 329.63],
    [174.61, 220, 261.63],
    [196, 246.94, 293.66]
  ];

  function updateVolume() {
    if (masterGain && audioContext) {
      masterGain.gain.setTargetAtTime(Number(volume.value), audioContext.currentTime, 0.25);
    }
  }

  function setPlaying(playing, message) {
    isPlaying = playing;
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.querySelector('.ambient-audio-label').textContent = playing ? 'Silenciar' : 'Activar sonido';
    status.textContent = message;
  }

  async function startAudio() {
    if (!AudioContextConstructor) {
      setPlaying(false, 'Este navegador no permite reproducir audio.');
      return;
    }

    try {
      const context = new AudioContextConstructor();
      await context.resume();
      if (context.state !== 'running') {
        await context.close();
        throw new Error('El navegador no pudo iniciar el audio.');
      }

      const gain = context.createGain();
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.connect(context.destination);

      const voices = chordProgression[0].map((frequency) => {
        const oscillator = context.createOscillator();
        const voiceGain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, context.currentTime);
        voiceGain.gain.setValueAtTime(0.16, context.currentTime);
        oscillator.connect(voiceGain);
        voiceGain.connect(gain);
        oscillator.start();
        return oscillator;
      });

      audioContext = context;
      masterGain = gain;
      oscillators = voices;
      gain.gain.setTargetAtTime(Number(volume.value), context.currentTime, 1.2);
      let chordIndex = 0;
      progressionTimer = window.setInterval(() => {
        if (!audioContext || audioContext.state !== 'running') return;
        chordIndex = (chordIndex + 1) % chordProgression.length;
        chordProgression[chordIndex].forEach((frequency, index) => {
          voices[index].frequency.setTargetAtTime(frequency, context.currentTime, 1.1);
        });
      }, 7000);
      setPlaying(true, 'Sonido ambiental suave activado.');
    } catch (error) {
      setPlaying(false, 'No se pudo iniciar el sonido. Puedes seguir usando el sitio sin audio.');
      console.error('No se pudo iniciar el sonido ambiental:', error);
    }
  }

  function stopAudio() {
    const context = audioContext;
    const gain = masterGain;
    const voices = oscillators;
    if (!context || !gain) return;

    audioContext = null;
    masterGain = null;
    oscillators = [];
    window.clearInterval(progressionTimer);
    gain.gain.setTargetAtTime(0, context.currentTime, 0.16);
    window.setTimeout(() => {
      voices.forEach((oscillator) => oscillator.stop());
      context.close().catch((error) => {
        console.error('No se pudo cerrar el sonido ambiental:', error);
      });
    }, 900);
    setPlaying(false, 'Sonido ambiental apagado.');
  }

  toggle.addEventListener('click', () => {
    if (isPlaying) {
      stopAudio();
    } else {
      void startAudio();
    }
  });
  volume.addEventListener('input', updateVolume);
})();
