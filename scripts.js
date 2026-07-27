// Centralized station streams
const streams = [
  // Stations with open stream links or proxy sources
  { id: 'kochi-fm', url: 'https://stream.zeno.fm/f3v623351d0uv', type: 'native', officialUrl: 'https://akashvani.gov.in/' },
  { id: 'rainbow-kochi', url: 'https://stream.zeno.fm/f3v623351d0uv', type: 'native', officialUrl: 'https://akashvani.gov.in/' },
  { id: 'fm-gold', url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8', type: 'hls', officialUrl: 'https://akashvani.gov.in/' },
  { id: 'chennai', url: 'https://stream.zeno.fm/f3v623351d0uv', type: 'native', officialUrl: 'https://akashvani.gov.in/' },
  { id: 'bengaluru', url: 'https://stream.zeno.fm/f3v623351d0uv', type: 'native', officialUrl: 'https://akashvani.gov.in/' },
  { id: 'dw-german', url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8', type: 'hls', officialUrl: 'https://www.dw.com/' },
  
  // Direct open MP3 Streams (No CORS limits)
  { id: 'bbc-world', url: 'http://stream.live.vc.bbcmedia.co.uk/bbc_world_service', type: 'native', officialUrl: 'https://www.bbc.co.uk/sounds' },
  { id: 'npr', url: 'http://npr-ice.streamguys1.com/live.mp3', type: 'native', officialUrl: 'https://www.npr.org/' }
];

// Initialize all streams
streams.forEach((station) => {
  const { id, url, type } = station;
  const audio = document.getElementById(id);
  if (!audio) return;

  const loadingIndicator = document.getElementById(`loading-${id}`);
  const nowPlayingIndicator = document.getElementById(`now-${id}`);

  if (type === 'hls') {
    if (Hls.isSupported()) {
      const hls = new Hls({ manifestLoadingTimeOut: 4000 });
      hls.loadSource(url);
      hls.attachMedia(audio);

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          showStreamError(station, loadingIndicator, nowPlayingIndicator);
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
      showStreamError(station, loadingIndicator, nowPlayingIndicator);
    });
  }
});

// Display CORS error with a clickable fallback link
function showStreamError(station, loading, nowPlaying) {
  loading?.classList.remove('active');
  nowPlaying?.classList.remove('active');

  const card = document.getElementById(station.id)?.parentNode;
  if (!card) return;

  let errBox = document.getElementById(`err-${station.id}`);
  if (!errBox) {
    errBox = document.createElement('div');
    errBox.id = `err-${station.id}`;
    errBox.className = 'mt-2 text-xs text-red-500 font-medium';
    card.appendChild(errBox);
  }

  errBox.innerHTML = `
    <p>⚠️ Direct playback blocked by source (CORS).</p>
    <a href="${station.officialUrl}" target="_blank" class="inline-block mt-1 text-blue-500 underline font-semibold">
      🔗 Listen on official site →
    </a>
  `;
}

function clearStreamError(id) {
  const errBox = document.getElementById(`err-${id}`);
  if (errBox) errBox.remove();
}

function changeVolume(audioId, volume) {
  const audio = document.getElementById(audioId);
  if (audio) audio.volume = parseFloat(volume);
}

function togglePlay(audioId, btn) {
  const audio = document.getElementById(audioId);
  const stationObj = streams.find(s => s.id === audioId);
  const loadingIndicator = document.getElementById(`loading-${audioId}`);
  const nowPlayingIndicator = document.getElementById(`now-${audioId}`);
  const volumeSlider = document.getElementById(`volume-${audioId}`);

  if (!audio) return;

  if (audio.paused) {
    // Stop all other active audio streams
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
      if (stationObj) showStreamError(stationObj, loadingIndicator, nowPlayingIndicator);
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
