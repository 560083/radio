// Centralized station streams
const streams = [
  // HLS Streams
  { id: 'kochi-fm', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio045/playlist.m3u8', type: 'hls' },
  { id: 'rainbow-kochi', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio044/playlist.m3u8', type: 'hls' },
  { id: 'fm-gold', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio001/playlist.m3u8', type: 'hls' },
  { id: 'chennai', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio048/playlist.m3u8', type: 'hls' },
  { id: 'bengaluru', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio042/playlist.m3u8', type: 'hls' },
  { id: 'dw-german', url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8', type: 'hls' },
  
  // Native MP3 Streams
  { id: 'bbc-world', url: 'http://stream.live.vc.bbcmedia.co.uk/bbc_world_service', type: 'native' },
  { id: 'npr', url: 'http://npr-ice.streamguys1.com/live.mp3', type: 'native' }
];

// Initialize all streams
streams.forEach(({ id, url, type }) => {
  const audio = document.getElementById(id);
  if (!audio) return;

  // Get corresponding indicator elements
  const loadingIndicator = document.getElementById(`loading-${id}`);
  const nowPlayingIndicator = document.getElementById(`now-${id}`);

  // --- Initialize Stream Source ---
  if (type === 'hls') {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(audio);
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      audio.src = url;
    } else {
      audio.outerHTML = `<p class="text-red-500">HLS stream not supported.</p>`;
    }
  } else if (type === 'native') {
    audio.src = url;
  }

  // --- NEW: Add Event Listeners for Loading/Playing Indicators ---
  if (loadingIndicator && nowPlayingIndicator) {
    audio.addEventListener('waiting', () => {
      loadingIndicator.classList.add('active');
      nowPlayingIndicator.classList.remove('active');
    });
    audio.addEventListener('stalled', () => {
      loadingIndicator.classList.add('active');
      nowPlayingIndicator.classList.remove('active');
    });
    audio.addEventListener('playing', () => {
      loadingIndicator.classList.remove('active');
      nowPlayingIndicator.classList.add('active');
    });
    audio.addEventListener('pause', () => {
      loadingIndicator.classList.remove('active');
      nowPlayingIndicator.classList.remove('active');
    });
    audio.addEventListener('ended', () => {
      loadingIndicator.classList.remove('active');
      nowPlayingIndicator.classList.remove('active');
    });
  }
});

// --- NEW: Function to change volume ---
function changeVolume(audioId, volume) {
  const audio = document.getElementById(audioId);
  audio.volume = parseFloat(volume);
}

// Play/pause toggle function
function togglePlay(audioId, btn) {
  const audio = document.getElementById(audioId);
  const loadingIndicator = document.getElementById(`loading-${audioId}`);
  const nowPlayingIndicator = document.getElementById(`now-${audioId}`);
  const volumeSlider = document.getElementById(`volume-${audioId}`);

  if (audio.paused) {
    // Pause all other audios, hide indicators, and reset buttons
    document.querySelectorAll('audio').forEach(a => {
      if (a !== audio) {
        a.pause();
        a.currentTime = 0;
        
        const otherBtn = a.nextElementSibling;
        if (otherBtn && otherBtn.tagName === 'BUTTON') {
          otherBtn.textContent = 'Play';
        }
        
        // Hide their indicators
        document.getElementById(`now-${a.id}`)?.classList.remove('active');
        document.getElementById(`loading-${a.id}`)?.classList.remove('active');
      }
    });

    // Play this one
    audio.play();
    btn.textContent = 'Pause';
    loadingIndicator?.classList.add('active'); // Show loading immediately
    
    // Set initial volume from its slider
    if (volumeSlider) {
      audio.volume = parseFloat(volumeSlider.value);
    }

  } else {
    // Pause this one
    audio.pause();
    btn.textContent = 'Play';
    loadingIndicator?.classList.remove('active');
    nowPlayingIndicator?.classList.remove('active');
  }
}

// Dark mode toggle
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}
