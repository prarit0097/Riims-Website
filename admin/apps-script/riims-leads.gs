/**
 * ============================================================================
 * RIIMS — website leads -> Google Sheet (Apps Script receiver)
 *
 * Paste this into the leads spreadsheet: Extensions -> Apps Script -> replace
 * everything -> set SECRET below -> Deploy -> New deployment -> Web app
 *   Execute as:      Me
 *   Who has access:  Anyone
 * Copy the /exec URL and paste it (with the same SECRET) into
 * RIIMS Admin -> Leads -> "Google Sheet sync".
 *
 * WHY "Anyone": a web app that runs as you cannot ask an unauthenticated
 * server to log in, so the URL itself is the endpoint. That is why SECRET
 * exists — without it, anyone who learns the URL could append junk rows.
 *
 * Column mapping is by HEADER NAME, not position: the script reads row 1 and
 * writes each field into the column with the matching header. Reordering or
 * adding columns in the sheet will not break it. Headers it knows:
 *   s.n. | created_time | full_name | phone_number | city | problem
 *   (plus lead_id + source, appended once if missing)
 *
 * lead_id is what makes re-sends safe: the admin server retries a failed push,
 * and a row can be written even when the reply is lost on the way back. Rows
 * whose lead_id is already present are skipped, so a retry never duplicates.
 * ============================================================================
 */

var SECRET = 'PASTE_THE_SECRET_FROM_RIIMS_ADMIN_HERE';
var SHEET_NAME = ''; // blank = first sheet in the spreadsheet

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000); // concurrent submissions must not interleave appends
  } catch (err) {
    return json({ ok: false, error: 'busy' });
  }
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!SECRET || SECRET.indexOf('PASTE_THE_SECRET') === 0) {
      return json({ ok: false, error: 'SECRET is not set in the Apps Script' });
    }
    if (String(body.secret || '') !== SECRET) return json({ ok: false, error: 'bad secret' });

    var sh = sheet();
    if (body.type === 'ping') return json({ ok: true, pong: true, sheet: sh.getName() });

    var rows = Array.isArray(body.rows) ? body.rows : [];
    if (!rows.length) return json({ ok: true, added: 0, skipped: 0 });

    var map = headerMap(sh);
    var seen = existingIds(sh, map);
    var width = sh.getLastColumn();
    var out = [];
    var skipped = 0;

    for (var i = 0; i < rows.length; i++) {
      var r = rows[i] || {};
      var id = String(r.lead_id || '');
      if (id && seen[id]) { skipped++; continue; }   // already in the sheet
      if (id) seen[id] = true;                        // and not twice in one batch
      out.push(buildRow(r, map, width, sh.getLastRow() + out.length));
    }

    if (out.length) {
      sh.getRange(sh.getLastRow() + 1, 1, out.length, width).setValues(out);
    }
    return json({ ok: true, added: out.length, skipped: skipped });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

/** GET is only here so opening the URL in a browser tells you it is alive. */
function doGet() {
  return json({ ok: true, service: 'RIIMS leads receiver' });
}

function sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return (SHEET_NAME && ss.getSheetByName(SHEET_NAME)) || ss.getSheets()[0];
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** "s.n." / "Created Time" / "phone_number" all normalise to a comparable key. */
function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * header name -> 1-based column. Appends lead_id / source once if the sheet
 * does not have them yet (everything else must already exist as a header).
 */
function headerMap(sh) {
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, 6).setValues([['s.n.', 'created_time', 'full_name', 'phone_number', 'city', 'problem']]);
  }
  var lastCol = Math.max(sh.getLastColumn(), 1);
  var head = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  for (var i = 0; i < head.length; i++) {
    var k = norm(head[i]);
    if (k && !(k in map)) map[k] = i + 1;
  }
  ['leadid', 'source'].forEach(function (key) {
    if (!(key in map)) {
      lastCol++;
      sh.getRange(1, lastCol).setValue(key === 'leadid' ? 'lead_id' : 'source');
      map[key] = lastCol;
    }
  });
  return map;
}

/** Existing lead_id values, so a retry cannot append the same lead twice. */
function existingIds(sh, map) {
  var col = map.leadid;
  var seen = {};
  if (!col || sh.getLastRow() < 2) return seen;
  var vals = sh.getRange(2, col, sh.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) {
    var v = String(vals[i][0] || '');
    if (v) seen[v] = true;
  }
  return seen;
}

function buildRow(r, map, width, lastRow) {
  var row = new Array(width);
  for (var i = 0; i < width; i++) row[i] = '';

  var put = function (key, value) {
    var c = map[key];
    if (c && c <= width) row[c - 1] = value;
  };

  // created_time as a real Date so the sheet sorts/filters it as a date.
  var when = r.created_time ? new Date(r.created_time) : new Date();
  if (isNaN(when.getTime())) when = new Date();

  put('sn', lastRow);                    // header is row 1, so row N = serial N-1
  put('createdtime', when);
  put('fullname', r.full_name || '');
  put('phonenumber', r.phone_number || '');
  put('city', r.city || '');
  put('problem', r.problem || '');
  put('leadid', r.lead_id || '');
  put('source', r.source || 'website');
  return row;
}
