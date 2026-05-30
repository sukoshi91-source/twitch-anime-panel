var DATA_URL = 'https://sukoshi91-source.github.io/twitch-anime-panel/anime-data.json';
var allData = { watching: [], completed: [], plan: [] };
var currentTab = 'watching';

document.getElementById('tab-watching').addEventListener('click', function() { switchTab('watching'); });
document.getElementById('tab-completed').addEventListener('click', function() { switchTab('completed'); });
document.getElementById('tab-plan').addEventListener('click', function() { switchTab('plan'); });

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
  document.getElementById('tab-' + tab).classList.add('active');
  renderList();
}

function renderList() {
  var container = document.getElementById('list-container');
  var items = allData[currentTab];
  if (!items || items.length === 0) {
    var labels = { watching: 'currently watching', completed: 'completed', plan: 'planning to watch' };
    container.innerHTML = '<div class="empty"><span class="empty-icon">&#127800;</span>Nothing ' + labels[currentTab] + ' yet.</div>';
    return;
  }
  var html = '<div class="list">';
  for (var i = 0; i < items.length; i++) {
    var a = items[i];
    var node = a.node;
    var status = a.list_status;
    var total = node.num_episodes || '?';
    var watched = status.num_episodes_watched || 0;
    var pct = (total && total !== '?') ? Math.round((watched / total) * 100) : 0;
    var img = node.main_picture ? node.main_picture.medium : null;
    var score = status.score;
    html += '<div class="card">';
    html += img ? '<img class="cover" src="' + img + '" alt="" loading="lazy">' : '<div class="cover-placeholder">&#127988;</div>';
    html += '<div class="info"><div class="title">' + node.title + '</div><div class="meta">';
    html += (score && score > 0) ? '<span class="score">&#9733; ' + score.toFixed(1) + '</span>' : '<span style="color:#555">Not rated</span>';
    html += currentTab === 'watching' ? '<span class="eps">' + watched + '/' + total + ' eps</span>' : '<span class="eps">' + (total !== '?' ? total + ' eps' : '') + '</span>';
    html += '</div>';
    if (currentTab === 'watching') {
      html += '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
    }
    html += '</div></div>';
  }
  html += '</div>';
  container.innerHTML = html;
}

function loadData() {
  document.getElementById('list-container').innerHTML = '<div class="loading"><span class="spinner"></span>Loading anime list...</div>';
  fetch(DATA_URL)
    .then(function(res) {
      if (!res.ok) throw new Error('Could not load anime data.');
      return res.json();
    })
    .then(function(data) {
      allData = {
        watching: data.watching || [],
        completed: data.completed || [],
        plan: data.plan || []
      };
      document.getElementById('username-display').textContent = 'NerdIdeias';
      document.getElementById('count-watching').textContent = allData.watching.length;
      document.getElementById('count-completed').textContent = allData.completed.length;
      document.getElementById('count-plan').textContent = allData.plan.length;
      renderList();
    })
    .catch(function(e) {
      document.getElementById('list-container').innerHTML = '<div class="error">&#9888; ' + e.message + '</div>';
    });
}

loadData();
