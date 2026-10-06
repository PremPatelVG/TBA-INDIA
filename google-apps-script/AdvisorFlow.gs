/**
 * TBA India — "Become an Advisor" application + approval flow
 * ===========================================================
 * A separate Apps Script from the contact-form one. It:
 *   1. Receives advisor applications from the website form.
 *   2. Logs each to an "Advisor Applications" sheet (status: Pending).
 *   3. Emails the approver (Sanjiv) the application, with BOTH:
 *        - one-click Approve / Reject buttons, and
 *        - the ability to simply reply "yes" to approve.
 *   4. On approval, automatically emails the applicant a welcome message
 *      with TWO files attached (from Google Drive). Marks the row Approved
 *      so it can never send twice.
 *
 * No SMTP needed — Google sends the mail.
 *
 * ───────────────────────────────────────────────────────────────────────
 *  EVERYTHING RUNS THROUGH indiaops@tbaindia.in
 *  ---------------------------------------------
 *  Google Apps Script always sends email FROM the account that owns the
 *  script, and the reply-scanner reads THAT SAME account's mailbox. So this
 *  script MUST be created while signed in as  indiaops@tbaindia.in.  Then:
 *    • Sanjiv receives the application email FROM indiaops@tbaindia.in.
 *    • His "yes" reply comes back INTO the indiaops inbox (where the
 *      scanner can see it).
 *    • The applicant's welcome email (with the 2 files) is sent FROM
 *      indiaops@tbaindia.in.
 *    • A confirmation of the outcome is sent to indiaops and cc'd to Sanjiv.
 *
 *  BEFORE IT WORKS, FILL IN THE 3 THINGS MARKED  << >>  BELOW:
 *    1. APPROVER_EMAIL  — Sanjiv's email address.
 *    2. FILE_ID_1 / FILE_ID_2 — the Drive file IDs of the 2 files to send.
 *         (Upload the 2 files to Google Drive, open each, Share > anyone with
 *          link OR keep private; copy the ID from the URL:
 *          https://drive.google.com/file/d/<<THIS IS THE ID>>/view )
 *
 *  SETUP  (do all of this while signed in as indiaops@tbaindia.in)
 *    1. Sign in to Google as indiaops@tbaindia.in. Create a Google Sheet
 *       (or reuse one you own). Extensions > Apps Script.
 *    2. Paste this file. Save.
 *    3. Run the function `installApprovalReplyScanner` once (toolbar > Run)
 *       and authorise — this installs the background check that watches the
 *       indiaops inbox for Sanjiv's "yes" replies every 5 minutes.
 *    4. Deploy > New deployment > Web app:
 *         Execute as:     Me (indiaops@tbaindia.in)
 *         Who has access: Anyone
 *       Copy the /exec URL — that's what the website form posts to.
 *
 *  The one-click Approve / Reject buttons work regardless of which mailbox
 *  Sanjiv reads from; only the reply-"yes" shortcut needs his reply to land
 *  back in the indiaops inbox, which the setup above guarantees.
 */

// ============================ CONFIG ============================
const APPROVER_EMAIL = '<< SANJIV_EMAIL@tbaindia.in >>';
const FILE_ID_1      = '<< GOOGLE_DRIVE_FILE_ID_1 >>';
const FILE_ID_2      = '<< GOOGLE_DRIVE_FILE_ID_2 >>';

const BRAND_NAME  = 'TBA India';
// The hub mailbox. THIS SCRIPT MUST BE OWNED BY THIS ACCOUNT: every email is
// sent from it, and Sanjiv's replies return to it for the scanner to read.
const TEAM_EMAIL  = 'indiaops@tbaindia.in';
const PHONE       = '+91 95860-09183';
const SHEET_NAME  = 'Advisor Applications';
const TOKEN       = 'tba-advisor-2026';        // guards the approve/reject links
const APPROVE_WORDS = ['yes', 'approve', 'approved', 'go ahead', 'proceed'];

const HEADERS = ['Timestamp', 'App ID', 'First Name', 'Last Name', 'Email',
                 'Phone', 'City', 'Background', 'Message', 'Status', 'Decided At'];
const COL = { ts: 1, id: 2, first: 3, last: 4, email: 5, phone: 6, city: 7,
              background: 8, message: 9, status: 10, decidedAt: 11 };

// ======================= FORM INTAKE (web app POST) =======================
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return json({ ok: false, error: 'no payload' });
    const d = JSON.parse(e.postData.contents);
    if (d['bot-field']) return json({ ok: true });            // honeypot
    if (!isEmail_(d.email)) return json({ ok: false, error: 'invalid email' });

    const appId = 'APP-' + Date.now().toString(36).toUpperCase();
    getSheet().appendRow([
      new Date(), appId, d.first_name || '', d.last_name || '', d.email || '',
      d.phone || '', d.city || '', d.background || '', d.message || '', 'Pending', ''
    ]);

    notifyApprover_(appId, d);

    // optional confirmation to the applicant that we received it
    sendApplicantAck_(d);

    return json({ ok: true, id: appId });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// ===================== APPROVE / REJECT via link (web app GET) =====================
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action && p.id) {
    if (p.token !== TOKEN) return htmlPage_('Not authorised', 'This approval link is not valid.');
    const decision = p.action === 'approve' ? 'Approved' : (p.action === 'reject' ? 'Rejected' : null);
    if (!decision) return htmlPage_('Unknown action', 'Nothing to do.');
    const res = decide_(p.id, decision, 'link');
    return htmlPage_(res.title, res.message);
  }
  return json({ ok: true, service: BRAND_NAME + ' advisor endpoint' });
}

// ===================== REPLY "YES" scanner (time trigger) =====================
/** Run installApprovalReplyScanner() once to schedule this every 5 minutes. */
function scanApprovalReplies() {
  // threads that carry our marker and have not been handled yet
  const threads = GmailApp.search('subject:"Advisor application" "[APP-" -label:tba-advisor-done', 0, 25);
  const doneLabel = getOrCreateLabel_('tba-advisor-done');

  threads.forEach((thread) => {
    const msgs = thread.getMessages();
    // the approver's most recent reply in this thread
    let reply = null;
    for (let i = msgs.length - 1; i >= 0; i--) {
      const from = msgs[i].getFrom().toLowerCase();
      if (from.indexOf(APPROVER_EMAIL.toLowerCase()) !== -1) { reply = msgs[i]; break; }
    }
    if (!reply) return;

    const idMatch = /\[(APP-[A-Z0-9]+)\]/.exec(thread.getFirstMessageSubject() || reply.getSubject());
    if (!idMatch) return;
    const appId = idMatch[1];

    const firstLine = (reply.getPlainBody() || '').trim().split('\n')[0].toLowerCase();
    const approved = APPROVE_WORDS.some((w) => firstLine === w || firstLine.indexOf(w) === 0);

    if (approved) {
      const res = decide_(appId, 'Approved', 'reply');
      reply.getThread().addLabel(doneLabel);
      Logger.log(appId + ' -> ' + res.title);
    }
  });
}

function installApprovalReplyScanner() {
  ScriptApp.getProjectTriggers().forEach((t) => {
    if (t.getHandlerFunction() === 'scanApprovalReplies') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('scanApprovalReplies').timeBased().everyMinutes(5).create();
  return 'Reply scanner installed (runs every 5 minutes).';
}

// ============================ CORE DECISION ============================
function decide_(appId, decision, via) {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  for (let r = 1; r < values.length; r++) {
    if (values[r][COL.id - 1] !== appId) continue;
    const current = values[r][COL.status - 1];
    if (current !== 'Pending') {
      return { title: 'Already handled', message: 'This application was already marked "' + current + '".' };
    }
    sheet.getRange(r + 1, COL.status).setValue(decision);
    sheet.getRange(r + 1, COL.decidedAt).setValue(new Date() + ' (' + via + ')');

    const applicant = {
      first_name: values[r][COL.first - 1], last_name: values[r][COL.last - 1],
      email: values[r][COL.email - 1],
    };
    if (decision === 'Approved') {
      sendApplicantApproval_(applicant);
      notifyTeamApproved_(appId, applicant, via);
    }
    return {
      title: decision === 'Approved' ? 'Approved ✓' : 'Rejected',
      message: decision === 'Approved'
        ? 'Approved. ' + applicant.first_name + ' has been emailed the welcome pack with both files attached.'
        : 'Marked as rejected. No email was sent to the applicant.',
    };
  }
  return { title: 'Not found', message: 'No application with ID ' + appId + '.' };
}

// ============================ EMAILS ============================
function notifyApprover_(appId, d) {
  const fullName = ((d.first_name || '') + ' ' + (d.last_name || '')).trim();
  const url = ScriptApp.getService().getUrl();
  const approve = url + '?action=approve&id=' + encodeURIComponent(appId) + '&token=' + encodeURIComponent(TOKEN);
  const reject  = url + '?action=reject&id='  + encodeURIComponent(appId) + '&token=' + encodeURIComponent(TOKEN);
  const esc = htmlEscape_;

  const html =
    '<div style="font-family:Arial,sans-serif;color:#14211b;max-width:600px">' +
      '<h2 style="color:#013f22;margin:0 0 4px">New advisor application</h2>' +
      '<p style="color:#5c6862;margin:0 0 16px">Reference: <strong>' + esc(appId) + '</strong></p>' +
      '<table style="border-collapse:collapse;font-size:14px;line-height:1.6">' +
        row_('Name', fullName) + row_('Email', d.email) + row_('Phone', d.phone) +
        row_('City', d.city) + row_('Background', d.background) + row_('Message', d.message) +
      '</table>' +
      '<p style="margin:22px 0 10px;font-size:14px"><strong>To approve, reply to this email with just "yes"</strong> — or use a button:</p>' +
      '<p>' +
        '<a href="' + approve + '" style="background:#00502c;color:#fff;text-decoration:none;font-weight:bold;padding:11px 22px;border-radius:999px;display:inline-block;margin-right:10px">Approve &amp; send files</a>' +
        '<a href="' + reject + '" style="background:#f1f4f1;color:#7d1f2a;text-decoration:none;font-weight:bold;padding:11px 22px;border-radius:999px;display:inline-block">Reject</a>' +
      '</p>' +
      '<p style="color:#8a948e;font-size:12px;margin-top:18px">On approval, the applicant is automatically emailed the welcome pack with both files attached.</p>' +
    '</div>';

  MailApp.sendEmail({
    to: APPROVER_EMAIL,
    replyTo: TEAM_EMAIL,   // Sanjiv's reply returns to indiaops, where the scanner reads it
    subject: 'Advisor application from ' + (fullName || 'applicant') + ' [' + appId + ']',
    name: BRAND_NAME + ' Applications',
    htmlBody: html,
    body: 'New advisor application ' + appId + ' from ' + fullName + ' (' + d.email + ').\n' +
          'Reply "yes" to approve, or open the email in HTML to use the buttons.',
  });
}

/** After approval, confirm the outcome to indiaops and cc Sanjiv. */
function notifyTeamApproved_(appId, a, via) {
  const name = ((a.first_name || '') + ' ' + (a.last_name || '')).trim();
  MailApp.sendEmail({
    to: TEAM_EMAIL,
    cc: APPROVER_EMAIL,
    name: BRAND_NAME + ' Applications',
    subject: 'Approved & sent — advisor ' + (name || a.email) + ' [' + appId + ']',
    body: 'Application ' + appId + ' from ' + (name || a.email) + ' (' + a.email + ') ' +
      'has been approved (via ' + via + ').\n\n' +
      'The applicant has just been emailed the welcome message with both ' +
      'onboarding files attached. No further action is needed.\n\n' +
      '— ' + BRAND_NAME + ' advisor flow',
  });
}

function sendApplicantAck_(d) {
  MailApp.sendEmail({
    to: d.email,
    replyTo: TEAM_EMAIL,
    name: BRAND_NAME,
    subject: 'We’ve received your advisor application — ' + BRAND_NAME,
    body: 'Dear ' + (d.first_name || '') + ',\n\n' +
      'Thank you for your interest in becoming an advisor with ' + BRAND_NAME + '. ' +
      'We have received your application and it is now under review. ' +
      'You will hear from us shortly with the next steps.\n\n' +
      'Warm regards,\nThe ' + BRAND_NAME + ' Team\n' + TEAM_EMAIL + ' | ' + PHONE,
  });
}

function sendApplicantApproval_(a) {
  const file1 = DriveApp.getFileById(FILE_ID_1).getBlob();
  const file2 = DriveApp.getFileById(FILE_ID_2).getBlob();
  const html =
    '<div style="font-family:Arial,sans-serif;color:#14211b;max-width:560px">' +
      '<div style="height:6px;background:#013f22"></div>' +
      '<div style="padding:24px 4px">' +
        '<p style="font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#a5843f;margin:0 0 4px">' + BRAND_NAME + '</p>' +
        '<h1 style="color:#013f22;font-size:22px;margin:0 0 14px">Welcome aboard — your application is approved</h1>' +
        '<p style="font-size:15px;line-height:1.6">Dear ' + htmlEscape_(a.first_name) + ',</p>' +
        '<p style="font-size:15px;line-height:1.6">We are delighted to let you know that your application to join ' + BRAND_NAME + ' as an advisor has been <strong>approved</strong>.</p>' +
        '<p style="font-size:15px;line-height:1.6">Please find attached the two documents to get you started. Review them, and a member of our team will be in touch to guide you through the next steps.</p>' +
        '<ol style="font-size:14px;line-height:1.7;color:#30443a">' +
          '<li>Go through both attached documents.</li>' +
          '<li>Complete and return anything they ask for.</li>' +
          '<li>We schedule your onboarding conversation.</li>' +
        '</ol>' +
        '<p style="font-size:14px;line-height:1.6">Questions? Reach us at <a href="mailto:' + TEAM_EMAIL + '" style="color:#00502c">' + TEAM_EMAIL + '</a> or ' + PHONE + '.</p>' +
        '<p style="font-size:14px;line-height:1.6;margin-top:18px">Warm regards,<br><strong>The ' + BRAND_NAME + ' Team</strong></p>' +
      '</div>' +
    '</div>';

  MailApp.sendEmail({
    to: a.email,
    replyTo: TEAM_EMAIL,
    name: BRAND_NAME,
    subject: 'Your advisor application is approved — ' + BRAND_NAME,
    htmlBody: html,
    body: 'Dear ' + (a.first_name || '') + ',\n\nYour application to join ' + BRAND_NAME +
      ' as an advisor has been approved. The two onboarding documents are attached. ' +
      'Our team will be in touch with the next steps.\n\nWarm regards,\nThe ' + BRAND_NAME + ' Team',
    attachments: [file1, file2],
  });
}

// ============================ HELPERS ============================
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}
function getOrCreateLabel_(name) {
  return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
}
function row_(k, v) {
  return '<tr><td style="padding:4px 14px 4px 0;color:#5c6862;vertical-align:top">' + k +
         '</td><td style="padding:4px 0"><strong>' + htmlEscape_(v || '-') + '</strong></td></tr>';
}
function htmlEscape_(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function isEmail_(v) {
  return typeof v === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
}
function htmlPage_(title, message) {
  return HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,sans-serif;max-width:520px;margin:48px auto;padding:28px;border:1px solid #e2e8e2;border-radius:14px">' +
    '<div style="height:6px;background:#013f22;border-radius:4px;margin:-28px -28px 20px"></div>' +
    '<h1 style="color:#013f22;font-size:22px;margin:0 0 10px">' + htmlEscape_(title) + '</h1>' +
    '<p style="color:#30443a;font-size:15px;line-height:1.6;margin:0">' + htmlEscape_(message) + '</p>' +
    '</div>'
  )
}
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
