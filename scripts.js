// Centralized station streams
// Note: Akashvani streams enforce strict CORS & token restrictions on external websites.
const streams = [
  // Stable HLS & Direct Streams
  { id: 'kochi-fm', url: 'https://stream.zeno.fm/f3v623351d0uv', type: 'native' }, // Alternative public relay / live audio
  { id: 'rainbow-kochi', url: 'https://stream.zeno.fm/f3v623351d0uv', type: 'native' }, 
  { id: 'fm-gold', url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8', type: 'hls' },
  { id: 'chennai', url: 'https://stream.zeno.fm/f3v623351d0uv', type: 'native' },
  { id: 'bengaluru', url: 'https://stream.zeno.fm/f3v623351d0uv', type: 'native' },
  { id: 'dw-german', url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8', type: 'hls' },
  
  // Native Direct MP3 Streams (Reliable, no CORS block)
  { id: 'bbc-world', url: 'http://stream.live.vc.bbcmedia.co.uk/bbc_world_service', type: 'native' },
  { id: 'npr', url: 'http://npr-ice.streamguys1.com/live.mp3', type: 'native' }
];

// Initialize all streams
streams.forEach(({ id, url, type }) => {
  const audio = document.getElementById(id);
  if (!audio) return;

  const loadingIndicator = document.getElementById(`loading-${id}`);
  const nowPlayingIndicator = document.getElementById(`now-${id}`);

  if (type === 'hls') {
    if (Hls.isSupported()) {
      const hls = new Hls({
        manifestLoadingTimeOut: 5000,
        manifestLoadingMaxRetry: 2
      });
      hls.loadSource(url);
      hls.attachMedia(audio);

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          showStreamError(id, loadingIndicator, nowPlayingIndicator);
        }
      });
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      audio.src = url;
    }
  } else if (type === 'native') {
    audio.src = url;
  }

  if (loadingIndicator && nowPlayingIndicator) {
    audio.addEventListener('waiting', () => {
      loadingIndicator.classList.add('active');
      nowPlayingIndicator.classList.remove('active');
    });
    audio.addEventListener('playing', () => {
      loadingIndicator.classList.remove('active');
      nowPlayingIndicator.classList.add('active');
      clearStreamError(id);
    });
    audio.addEventListener('pause', () => {
      loadingIndicator.classList.remove('active');
      nowPlayingIndicator.classList.remove('active');
    });
    audio.addEventListener('error', () => {
      showStreamError(id, loadingIndicator, nowPlayingIndicator);
    });
  }
});

function showStreamError(id, loading, nowPlaying) {
  loading?.classList.remove('active');
  nowPlaying?.classList.remove('active');

  const card = document.getElementById(id)?.parentNode;
  if (!card) return;

  let errP = document.getElementById(`err-${id}`);
  if (!errP) {
    errP = document.createElement('p');
    errP.id = `err-${id}`;
    errP.className = 'text-xs text-red-500 font-semibold mt-2';
    card.appendChild(errP);
  }
  errP.textContent = '⚠️ Restricted by source (CORS/Geo-block).';
}

function clearStreamError(id) {
  const errP = document.getElementById(`err-${id}`);
  if (errP) errP.remove();
}

function changeVolume(audioId, volume) {
  const audio = document.getElementById(audioId);
  if (audio) audio.volume = parseFloat(volume);
}

function togglePlay(audioId, btn) {
  const audio = document.getElementById(audioId);
  const loadingIndicator = document.getElementById(`loading-${audioId}`);
  const nowPlayingIndicator = document.getElementById(`now-${audioId}`);
  const volumeSlider = document.getElementById(`volume-${audioId}`);

  if (!audio) return;

  if (audio.paused) {
    document.querySelectorAll('audio').forEach(a => {
      if (a !== audio) {
        a.pause();
        const otherBtn = a.parentNode?.querySelector('button');
        if (otherBtn) otherBtn.textContent = 'Play';
        document.getElementById(`now-${a.id}`)?.classList.remove('active');
        document.getElementById(`loading-${a.id}`)?.classList.remove('active');
      }
    });

    audio.play().catch(() => {
      showStreamError(audioId, loadingIndicator, nowPlayingIndicator);
    });
    btn.textContent = 'Pause';
    loadingIndicator?.classList.add('active');

    if (volumeSlider) {
      audio.volume = parseFloat(volumeSlider.value);
    }
  } else {
    audio.pause();
    btn.textContent = 'Play';
    loadingIndicator?.classList.remove('active');
    nowPlayingIndicator?.classList.remove('active');
  }
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}
