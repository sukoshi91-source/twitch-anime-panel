var MAL_CLIENT_ID = '5d969505224e4cfc789d4f064c96fec8';
var MAL_USERNAME = 'NerdIdeias';
var PROXY = 'https://corsproxy.io/?';
var allData = { watching: [], completed: [], plan: [] };
var currentTab = 'watching';

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
  document.getElementById('tab-' + tab).classList.add('active');
  renderList();
}

document.getElementById('tab-watching').addEventListener('click', function() { switchTab('watching'); });
document.getElementById('tab-completed').addEventListener('click', function() { switchTab('completed'); });
document.getElementById('tab-plan').addEventListener('click', function() { switchTab('plan'); });

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

function fetchPage(username, status, offset) {
  var malUrl = 'https://api.myanimelist.net/v2/users/' + encodeURIComponent(username) + '/animelist?status=' + status + '&limit=100&offset=' + offset + '&fields=list_status,num_episodes,main_picture';
  var url = PROXY + encodeURIComponent(malUrl);
  return fetch(url, { headers: { 'X-MAL-CLIENT-ID': MAL_CLIENT_ID } })
    .then(function(res) {
      if (!res.ok) throw new Error('Failed to load list (error ' + res.status + ')');
      return res.json();
    });
}

function loadAll(username, status) {
  var all = [];
  function nextPage(offset) {
    return fetchPage(username, status, offset).then(function(data) {
      if (!data.data || data.data.length === 0) return all;
      all = all.concat(data.data);
      if (!data.paging || !data.paging.next) return all;
      return nextPage(offset + 100);
    });
  }
  return nextPage(0);
}

function loadList(username) {
  document.getElementById('username-display').textContent = '@' + username;
  document.getElementById('list-container').innerHTML = '<div class="loading"><span class="spinner"></span>Loading anime list...</div>';
  document.getElementById('count-watching').textContent = '...';
  document.getElementById('count-completed').textContent = '...';
  document.getElementById('count-plan').textContent = '...';

  Promise.all([
    loadAll(username, 'watching'),
    loadAll(username, 'completed'),
    loadAll(username, 'plan_to_watch')
  ]).then(function(results) {
    allData = { watching: results[0], completed: results[1], plan: results[2] };
    document.getElementById('count-watching').textContent = results[0].length;
    document.getElementById('count-completed').textContent = results[1].length;
    document.getElementById('count-plan').textContent = results[2].length;
    renderList();
  }).catch(function(e) {
    document.getElementById('list-container').innerHTML = '<div class="error">&#9888; ' + e.message + '</div>';
    document.getElementById('count-watching').textContent = '0';
    document.getElementById('count-completed').textContent = '0';
    document.getElementById('count-plan').textContent = '0';
  });
}

loadList(MAL_USERNAME);
