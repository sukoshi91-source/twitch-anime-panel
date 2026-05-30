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
    if (img) {
      html += '<img class="cover" src="' + img + '" alt="" loading="lazy">';
    } else {
      html += '<div class="cover-placeholder">&#127988;</div>';
    }
    html += '<div class="info">';
    html += '<div class="title">' + node.title + '</div>';
    html += '<div class="meta">';
    if (score && score > 0) {
      html += '<span class="score">&#9733; ' + score.toFixed(1) + '</span>';
    } else {
      html += '<span style="color:#555">Not rated</span>';
    }
    if (currentTab === 'watching') {
      html += '<span class="eps">' + watched + '/' + total + ' eps</span>';
    } else {
      html += '<span class="eps">' + (total !== '?' ? total + ' eps' : '') + '</span>';
    }
    html += '</div>';
    if (currentTab === 'watching') {
      html += '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
    }
    html += '</div></div>';
  }
  html += '</div>';
  container.innerHTML = html;
}

function delay(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

async function loadAll(username, status) {
  var all = [];
  var offset = 0;
  while (true) {
    var malUrl = 'https://api.myanimelist.net/v2/users/' + encodeURIComponent(username) + '/animelist?status=' + status + '&limit=100&offset=' + offset + '&fields=list_status,num_episodes,main_picture';
    var url = PROXY + encodeURIComponent(malUrl);
    var res = await fetch(url, {
      headers: { 'X-MAL-CLIENT-ID': MAL_CLIENT_ID }
    });
    if (!res.ok) throw new Error('Failed to load list (error ' + res.status + ')');
    var data = await res.json();
    if (!data.data || data.data.length === 0) break;
    all = all.concat(data.data);
    if (!data.paging || !data.paging.next) break;
    offset += 100;
    await delay(300);
  }
  return all;
}

async function loadList(username) {
  document.getElementById('username-display').textContent = '@' + username;
  document.getElementById('list-container').innerHTML = '<div class="loading"><span class="spinner"></span>Loading anime list...</div>';
  document.getElementById('count-watching').textContent = '...';
  document.getElementById('count-completed').textContent = '...';
  document.getElementById('count-plan').textContent = '...';
  try {
    var watching = await loadAll(username, 'watching');
    var completed = await loadAll(username, 'completed');
    var plan = await loadAll(username, 'plan_to_watch');
    allData = { watching: watching, completed: completed, plan: plan };
    document.getElementById('count-watching').textContent = watching.length;
    document.getElementById('count-completed').textContent = completed.length;
    document.getElementById('count-plan').textContent = plan.length;
    renderList();
  } catch(e) {
    document.getElementById('list-container').innerHTML = '<div class="error">&#9888; ' + e.message + '</div>';
    document.getElementById('count-watching').textContent = '0';
    document.getElementById('count-completed').textContent = '0';
    document.getElementById('count-plan').textContent = '0';
  }
}

loadList(MAL_USERNAME);