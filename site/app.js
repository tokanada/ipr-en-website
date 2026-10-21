(function () {
  'use strict';

  var API = 'https://api.github.com/repos/tokanada/ipr-patcher-en/releases/latest';

  // Anchored on purpose: "_lite_embedded" alone would also match the "_cloned" file.
  var PATTERNS = {
    lite: /_lite_embedded\.apk$/,
    full: /_full_embedded\.apk$/,
    lite_cloned: /_lite_embedded_cloned\.apk$/,
    full_cloned: /_full_embedded_cloned\.apk$/
  };

  function findAsset(assets, re) {
    for (var i = 0; i < assets.length; i++) {
      if (assets[i] && typeof assets[i].name === 'string' && re.test(assets[i].name)) {
        return assets[i];
      }
    }
    return null;
  }

  function getVersion(release) {
    var body = typeof release.body === 'string' ? release.body : '';
    var m = /^\s*game_version:\s*([^\s]+)/m.exec(body);
    if (m) return m[1];
    var t = /^IdolyPride_([^_]+)_/.exec(release.tag_name || '');
    return t ? t[1] : '';
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    try {
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return iso.slice(0, 10);
    }
  }

  function showNote(card) {
    var note = card.querySelector('[data-role="note"]');
    if (!note) return;
    var suffix = card.getAttribute('data-suffix') || '';
    note.textContent = "Couldn't load the latest release automatically. Tap to open GitHub and download the file ending in " + suffix + '.';
    note.hidden = false;
  }

  function fillCard(card, asset, dateText) {
    var btn = card.querySelector('[data-role="btn"]');
    var info = card.querySelector('[data-role="info"]');
    btn.setAttribute('href', asset.browser_download_url);
    var parts = [];
    if (typeof asset.size === 'number' && asset.size > 0) {
      parts.push(Math.round(asset.size / (1024 * 1024)) + ' MB');
    }
    if (dateText) parts.push('released ' + dateText);
    info.textContent = parts.join(' · ');
    var note = card.querySelector('[data-role="note"]');
    if (note) note.hidden = true;
  }

  function failAll(cards) {
    for (var i = 0; i < cards.length; i++) showNote(cards[i]);
  }

  function run() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.card[data-kind]'));
    var badge = document.getElementById('version-badge');

    if (typeof fetch !== 'function') { failAll(cards); return; }

    fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (release) {
        var assets = Array.isArray(release.assets) ? release.assets : [];
        var dateText = formatDate(release.published_at);
        var version = getVersion(release);

        if (badge) {
          badge.textContent = version
            ? 'Latest version: ' + version + (dateText ? ' (' + dateText + ')' : '')
            : 'Latest release' + (dateText ? ': ' + dateText : '');
        }

        cards.forEach(function (card) {
          var re = PATTERNS[card.getAttribute('data-kind')];
          var asset = re ? findAsset(assets, re) : null;
          if (asset && typeof asset.browser_download_url === 'string' &&
              asset.browser_download_url.indexOf('https://') === 0) {
            fillCard(card, asset, dateText);
          } else {
            showNote(card);
          }
        });
      })
      .catch(function () {
        failAll(cards);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
