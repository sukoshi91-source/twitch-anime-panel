var PROXY_URL = 'https://mal-proxy-topaz.vercel.app/api/mal';

// Pre-fill if already configured
window.Twitch.ext.configuration.onChanged(function() {
  var cfg = window.Twitch.ext.configuration.broadcaster;
  if (cfg && cfg.content) {
    try {
      var parsed = JSON.parse(cfg.content);
      if (parsed.malUsername) {
        document.getElementById('mal-input').value = parsed.malUsername;
      }
    } catch(e) {}
  }
});

document.getElementById('save-btn').addEventListener('click', function() {
  saveConfig();
});

document.getElementById('mal-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') saveConfig();
});

function saveConfig() {
  var username = document.getElementById('mal-input').value.trim();
  var btn = document.getElementById('save-btn');
  var status = document.getElementById('status');

  if (!username) {
    status.textContent = 'Please enter a username.';
    status.className = 'status err';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Verifying...';
  status.textContent = '';

  fetch(PROXY_URL + '?username=' + encodeURIComponent(username))
    .then(function(res) {
      if (!res.ok) throw new Error('Could not reach MAL API.');
      return res.json();
    })
    .then(function(data) {
      if (data.error) throw new Error(data.error);
      window.Twitch.ext.configuration.set('broadcaster', '1', JSON.stringify({ malUsername: username }));
      status.textContent = '✓ Saved! Viewers will now see your anime list.';
      status.className = 'status ok';
    })
    .catch(function(e) {
      status.textContent = e.message;
      status.className = 'status err';
    })
    .finally(function() {
      btn.disabled = false;
      btn.textContent = 'Save';
    });
}