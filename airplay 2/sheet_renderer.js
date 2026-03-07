/**
 * Sheet music display using VexFlow 5.
 * Renders a note list [{ t, note, dur }, ...] as staff notation.
 */
(function (global) {
  'use strict';

  var MUSIC_API = 'http://localhost:8766';

  /** Map our note name (e.g. C4, F#3) to VexFlow pitch string (lowercase e.g. c/4, f#/3). */
  function noteNameToVexPitch(name) {
    if (!name || typeof name !== 'string') return 'c/4';
    var s = name.trim();
    var octave = 4;
    var match = s.match(/^([A-G]#?b?)(\d+)$/i);
    if (match) {
      var pitch = match[1].toLowerCase().replace('b', 'b');
      octave = parseInt(match[2], 10);
      return pitch + '/' + octave;
    }
    if (s.length === 1 && /[A-G]/i.test(s)) return s.toLowerCase() + '/4';
    return 'c/4';
  }

  /** Map duration in seconds to VexFlow duration (q=quarter, h=half, w=whole, 8=eighth). */
  function durToVex(dur, bpm) {
    if (bpm && bpm > 0) {
      var beatSec = 60 / bpm;
      if (dur >= beatSec * 3.5) return 'w';
      if (dur >= beatSec * 1.5) return 'h';
      if (dur >= beatSec * 0.75) return 'q';
      return '8';
    }
    if (dur >= 1.5) return 'w';
    if (dur >= 0.6) return 'h';
    if (dur >= 0.2) return 'q';
    return '8';
  }

  /**
   * Render sheet music into container.
   * @param {string} containerId - ID of the div to render into
   * @param {Array} notes - [{ t, note, dur, velocity? }, ...]
   * @param {Object} options - { bpm?: number, clef?: 'treble' | 'bass', maxNotes?: number }
   */
  function renderSheetMusic(containerId, notes, options) {
    options = options || {};
    var bpm = options.bpm || 120;
    var maxNotes = options.maxNotes || 32;
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (!notes || notes.length === 0) {
      container.innerHTML = '<p class="sheet-empty">No notes to display. Import a MIDI or MP3 first.</p>';
      return;
    }

    if (typeof VexFlow === 'undefined') {
      container.innerHTML = '<p class="sheet-empty">VexFlow not loaded. Cannot render sheet music.</p>';
      return;
    }

    var slice = notes.slice(0, maxNotes);
    var width = Math.min(800, (container.offsetWidth || 600));
    var height = 220;

    try {
      var VF = (typeof VexFlow !== 'undefined' && VexFlow.Factory) ? VexFlow : (typeof Vex !== 'undefined' && Vex.Flow && Vex.Flow.Factory) ? Vex.Flow : null;
      if (!VF || !VF.Factory) {
        container.innerHTML = '<p class="sheet-empty">VexFlow not loaded.</p>';
        return;
      }
      var factory = new VF.Factory({
        renderer: { selector: '#' + containerId, width: width, height: height }
      });
      var staveNotes = slice.map(function (n) {
        var pitch = noteNameToVexPitch(n.note);
        var d = durToVex(n.dur != null ? n.dur : 0.5, bpm);
        return factory.StaveNote({ keys: [pitch], duration: d });
      });
      var voice = factory.Voice().addTickables(staveNotes);
      var system = factory.System();
      system
        .addStave({ voices: [voice] })
        .addClef('treble')
        .addTimeSignature('4/4');
      factory.draw();
    } catch (e) {
      container.innerHTML = '<p class="sheet-empty">Could not draw notation: ' + String(e) + '</p>';
    }
  }

  /** Fetch song list from Music API and return { songs: [{ id, label }] }. */
  function fetchSongList(cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', MUSIC_API + '/api/songs');
    xhr.onload = function () {
      if (xhr.status !== 200) {
        if (cb) cb([]);
        return;
      }
      try {
        var data = JSON.parse(xhr.responseText);
        var songs = (data.songs || []).map(function (id) {
          return { id: id, label: id.replace(/_/g, ' ') };
        });
        if (cb) cb(songs);
      } catch (e) {
        if (cb) cb([]);
      }
    };
    xhr.onerror = function () { if (cb) cb([]); };
    xhr.send();
  }

  /** Fetch song JSON (notes) from Music API. */
  function fetchSong(songId, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', MUSIC_API + '/api/songs/' + encodeURIComponent(songId));
    xhr.onload = function () {
      if (xhr.status !== 200) {
        if (cb) cb(null);
        return;
      }
      try {
        var data = JSON.parse(xhr.responseText);
        if (cb) cb(data);
      } catch (e) {
        if (cb) cb(null);
      }
    };
    xhr.onerror = function () { if (cb) cb(null); };
    xhr.send();
  }

  global.SheetRenderer = {
    renderSheetMusic: renderSheetMusic,
    noteNameToVexPitch: noteNameToVexPitch,
    fetchSongList: fetchSongList,
    fetchSong: fetchSong,
    MUSIC_API: MUSIC_API
  };
})(typeof window !== 'undefined' ? window : this);
