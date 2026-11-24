/**
 * TBA India — contact form handler
 *
 *  ⚠  YOU DO NOT NEED TO EDIT ANYTHING IN THIS FILE.
 *     Just paste it in and deploy. The "Enquiries" tab and its column
 *     headings are created for you automatically the first time an
 *     enquiry arrives.
 *
 *  WHAT IT DOES on each form submission:
 *    1. Adds a row to the "Enquiries" sheet.
 *    2. Emails your team (NOTIFY_EMAIL) the new enquiry.
 *    3. Sends the person who submitted an automatic confirmation reply
 *       with the next steps (the "auto-response").
 *
 *  SENDING: emails go out FROM indiaops@tbaindia.in through Microsoft 365
 *  once the Microsoft login details are saved in Script Properties (see
 *  MICROSOFT-365-EMAIL.md next to this file). Until then they are sent by
 *  Google from the account that owns this script, so nothing is lost.
 *
 *  SETUP
 *  1. Create a Google Sheet (any name you like).
 *  2. In that Sheet, open the menu:  Extensions  >  Apps Script
 *  3. Delete the sample code, paste this whole file, press Save.
 *  4. Click  Deploy  >  New deployment
 *        Select type:      Web app
 *        Execute as:       Me
 *        Who has access:   Anyone
 *     Click Deploy, then Authorise access.
 *     (Google shows an "unverified app" warning because it is your own
 *      private script — click Advanced, then "Go to ... (unsafe)".)
 *  5. Copy the Web app URL ending in /exec and send it over.
 *
 *  Already deployed an earlier version? Paste this over the old code, then
 *  Deploy > Manage deployments > edit > Version: New version > Deploy.
 *  The /exec URL stays the same.
 */

const SHEET_NAME   = 'Enquiries';
const NOTIFY_EMAIL = 'indiaops@tbaindia.in';   // your team inbox
const BRAND_NAME   = 'TBA India';
const PHONE        = '+91 95860-09183';
const SHARED_TOKEN = '';   // optional extra check; leave empty

const HEADERS = ['Timestamp', 'First Name', 'Last Name', 'Email',
                 'Phone', 'Interest', 'Message', 'Page'];

/** Finds the Enquiries tab, creating it (with headings) if needed. */
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

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json({ ok: false, error: 'no payload' });
    }
    const d = JSON.parse(e.postData.contents);

    if (SHARED_TOKEN && d.token !== SHARED_TOKEN) {
      return json({ ok: false, error: 'unauthorized' });
    }
    if (d['bot-field']) return json({ ok: true });   // honeypot: drop bots

    // The hidden training registration page has its own sheet + emails.
    if (d.form === 'training-registration') return handleTrainingRegistration_(d);

    getSheet().appendRow([
      new Date(),
      d.first_name || '', d.last_name || '', d.email || '',
      d.phone || '', d.interest || '', d.message || '', d.page || ''
    ]);

    const fullName = ((d.first_name || '') + ' ' + (d.last_name || '')).trim();

    // 1) Notify the team
    sendMail_({
      to: NOTIFY_EMAIL,
      replyTo: d.email || NOTIFY_EMAIL,
      subject: 'New website enquiry - ' + BRAND_NAME + (fullName ? ' (' + fullName + ')' : ''),
      name: BRAND_NAME + ' Website',
      body: [
        'A new enquiry has come in from the ' + BRAND_NAME + ' website.', '',
        'Name:     ' + (fullName    || '-'),
        'Email:    ' + (d.email     || '-'),
        'Phone:    ' + (d.phone     || '-'),
        'Interest: ' + (d.interest  || '-'), '',
        'Message:', (d.message || '-'), '',
        '---', 'It has also been added to the Enquiries sheet.'
      ].join('\n')
    });

    // 2) Auto-response to the person who submitted
    if (isEmail_(d.email)) {
      sendAutoReply_(d, (d.first_name || '').trim());
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/** Confirmation email to the enquirer, explaining the next steps. */
function sendAutoReply_(d, firstName) {
  const hi = firstName ? ('Dear ' + firstName + ',') : 'Hello,';
  const interestLine = d.interest ? ('Regarding: ' + d.interest) : '';

  const plain = [
    hi, '',
    'Thank you for contacting ' + BRAND_NAME + '. We have received your enquiry and a member of our advisory team will be in touch shortly.',
    interestLine, interestLine ? '' : null,
    'What happens next:',
    '1. Our advisory team reviews your enquiry.',
    '2. A ' + BRAND_NAME + ' advisor reaches out within 24 hours (business days) to introduce themselves.',
    '3. We hold a confidential, no-obligation first conversation to understand your goals.',
    '4. Together we decide the right next step - whether selling, buying, mergers & acquisitions, or general advisory.',
    '',
    'Everything you share with us is treated as strictly confidential.',
    '',
    'If your matter is urgent, you can also reach us directly:',
    'Email: ' + NOTIFY_EMAIL,
    'Phone: ' + PHONE,
    '',
    'Warm regards,',
    'The ' + BRAND_NAME + ' Team',
    'Binori B-301, Ambli BRTS Road, Ahmedabad, Gujarat 380058'
  ].filter(function (l) { return l !== null; }).join('\n');

  const esc = function (s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  const html =
  '<div style="margin:0;padding:24px;background:#f1f4f1;font-family:Arial,Helvetica,sans-serif;color:#14211b;">' +
    '<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8e2;">' +
      '<div style="background:#013f22;height:6px;"></div>' +
      '<div style="padding:28px 30px 8px;">' +
        '<p style="margin:0 0 4px;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#a5843f;">' + esc(BRAND_NAME) + '</p>' +
        '<h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;color:#013f22;">Thank you for your enquiry</h1>' +
        '<p style="margin:0 0 14px;font-size:15px;line-height:1.6;">' + esc(hi) + '</p>' +
        '<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Thank you for contacting ' + esc(BRAND_NAME) + '. We have received your enquiry and a member of our advisory team will be in touch shortly.' +
          (d.interest ? ' <strong>Regarding:</strong> ' + esc(d.interest) + '.' : '') + '</p>' +
        '<div style="background:#f2f8f2;border:1px solid #d7e4d7;border-radius:10px;padding:16px 18px;margin:0 0 18px;">' +
          '<p style="margin:0 0 10px;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;color:#013f22;">What happens next</p>' +
          '<ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.7;color:#30443a;">' +
            '<li>Our advisory team reviews your enquiry.</li>' +
            '<li>A ' + esc(BRAND_NAME) + ' advisor reaches out within <strong>24 hours</strong> (business days) to introduce themselves.</li>' +
            '<li>We hold a <strong>confidential, no-obligation</strong> first conversation to understand your goals.</li>' +
            '<li>Together we decide the right next step &mdash; selling, buying, mergers &amp; acquisitions, or general advisory.</li>' +
          '</ol>' +
        '</div>' +
        '<p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#5c6862;">Everything you share with us is treated as strictly confidential.</p>' +
        '<p style="margin:0 0 4px;font-size:14px;line-height:1.6;">If your matter is urgent, reach us directly:</p>' +
        '<p style="margin:0 0 18px;font-size:14px;line-height:1.7;">' +
          'Email: <a href="mailto:' + esc(NOTIFY_EMAIL) + '" style="color:#00502c;">' + esc(NOTIFY_EMAIL) + '</a><br>' +
          'Phone: <a href="tel:+919586009183" style="color:#00502c;">' + esc(PHONE) + '</a>' +
        '</p>' +
      '</div>' +
      '<div style="padding:16px 30px;border-top:1px solid #e2e8e2;background:#fbfbf7;">' +
        '<p style="margin:0;font-size:13px;line-height:1.6;color:#30443a;">Warm regards,<br><strong>The ' + esc(BRAND_NAME) + ' Team</strong></p>' +
        '<p style="margin:8px 0 0;font-size:12px;line-height:1.5;color:#8a948e;">Binori B-301, Ambli BRTS Road, Ahmedabad, Gujarat 380058</p>' +
      '</div>' +
    '</div>' +
    '<p style="max-width:560px;margin:14px auto 0;font-size:11px;line-height:1.5;color:#9aa49d;text-align:center;">This is an automated confirmation of the enquiry you submitted on our website. If you did not submit this, please ignore this email.</p>' +
  '</div>';

  sendMail_({
    to: d.email,
    replyTo: NOTIFY_EMAIL,
    subject: 'We’ve received your enquiry — ' + BRAND_NAME,
    name: BRAND_NAME,
    body: plain,
    htmlBody: html
  });
}

/* ---------- TBA training class registrations (hidden page) ---------- */
/*  Posted by dashboard-access-request.html, which is not linked anywhere
    on the site; it is shared by direct link only.                          */
const TRAINING_SHEET_NAME = 'Training Class Registrations';
const TRAINING_HEADERS = ['Timestamp', 'Franchisee First Name', 'Franchisee Last Name',
                          'TBA Office', 'Agent First Name', 'Agent Last Name',
                          'Agent Email', 'Agent Phone', 'Training Month', 'Status'];

function handleTrainingRegistration_(d) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(TRAINING_SHEET_NAME) || ss.insertSheet(TRAINING_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(TRAINING_HEADERS);
    sheet.getRange(1, 1, 1, TRAINING_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([
    new Date(),
    d.franchisee_first_name || '', d.franchisee_last_name || '', d.office_name || '',
    d.first_name || '', d.last_name || '', d.email || '', d.phone || '',
    d.training_month || '', 'Received'
  ]);

  const agent = ((d.first_name || '') + ' ' + (d.last_name || '')).trim();
  const franchisee = ((d.franchisee_first_name || '') + ' ' + (d.franchisee_last_name || '')).trim();
  const month = d.training_month || 'TBD';

  // 1) Notify the team
  sendMail_({
    to: NOTIFY_EMAIL,
    replyTo: d.email || NOTIFY_EMAIL,
    subject: 'Training class registration - ' + (agent || 'new agent') +
             (d.office_name ? ' (' + d.office_name + ')' : '') + ' - ' + month,
    name: BRAND_NAME + ' Website',
    body: [
      'A new TBA training class registration has come in.', '',
      'Franchisee:      ' + (franchisee     || '-'),
      'TBA office:      ' + (d.office_name  || '-'), '',
      'Agent:           ' + (agent          || '-'),
      'Agent email:     ' + (d.email        || '-'),
      'Agent phone:     ' + (d.phone        || '-'), '',
      'Training month:  ' + month, '',
      '---', 'Logged in the "' + TRAINING_SHEET_NAME + '" sheet.'
    ].join('\n')
  });

  // 2) Confirm to the agent
  if (isEmail_(d.email)) {
    sendMail_({
      to: d.email,
      replyTo: NOTIFY_EMAIL,
      subject: 'Your TBA training class registration — ' + BRAND_NAME,
      name: BRAND_NAME,
      body: [
        (d.first_name ? 'Dear ' + d.first_name + ',' : 'Hello,'), '',
        'You have been registered for a TBA training class' +
          (d.office_name ? ' by ' + d.office_name : '') + '.', '',
        'Month: ' + month, '',
        month === 'TBD'
          ? 'Our team will be in touch to schedule your training class.'
          : 'Our team will email you the class dates and details closer to the time.',
        '',
        'If you have any questions, reply to this email or write to ' + NOTIFY_EMAIL + '.', '',
        'Warm regards,', 'The ' + BRAND_NAME + ' Team'
      ].join('\n')
    });
  }

  return json({ ok: true });
}

/* ---------- Sending email through Microsoft 365 ---------- */
/*  Every email above goes through sendMail_(). When the Microsoft 365 login
    details are saved in Script Properties, it sends through Microsoft Graph
    (Microsoft's email API, the replacement for password-based SMTP) so mail
    really comes FROM the Microsoft 365 mailbox and lands in its Sent folder.
    Until then, or if Microsoft refuses a send, it falls back to Google's
    MailApp so no email is ever lost.

    Script Properties (Project Settings > Script Properties). These are
    secrets: keep them there, never in this file.
      MS_TENANT_ID      Directory (tenant) ID of your Microsoft 365
      MS_CLIENT_ID      Application (client) ID of the app registration
      MS_CLIENT_SECRET  Client secret VALUE of that app registration
      MS_SENDER         Mailbox to send from (optional; default NOTIFY_EMAIL)

    After saving them, run testMicrosoftMail() once from the toolbar.      */

function msConfig_() {
  const props = PropertiesService.getScriptProperties();
  const cfg = {
    tenant: props.getProperty('MS_TENANT_ID'),
    client: props.getProperty('MS_CLIENT_ID'),
    secret: props.getProperty('MS_CLIENT_SECRET'),
    sender: props.getProperty('MS_SENDER') || NOTIFY_EMAIL
  };
  return (cfg.tenant && cfg.client && cfg.secret) ? cfg : null;
}

/** App-only access token for Microsoft Graph, cached for 50 minutes. */
function msToken_(cfg) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('ms_graph_token');
  if (cached) return cached;
  const res = UrlFetchApp.fetch(
    'https://login.microsoftonline.com/' + encodeURIComponent(cfg.tenant) + '/oauth2/v2.0/token', {
      method: 'post',
      payload: {
        client_id: cfg.client,
        client_secret: cfg.secret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
      },
      muteHttpExceptions: true
    });
  if (res.getResponseCode() !== 200) {
    throw new Error('Microsoft sign-in failed (' + res.getResponseCode() + '): ' + res.getContentText());
  }
  const token = JSON.parse(res.getContentText()).access_token;
  cache.put('ms_graph_token', token, 50 * 60);
  return token;
}

/** Send through Microsoft 365 when configured, otherwise through Google. */
function sendMail_(o) {
  const cfg = msConfig_();
  if (cfg) {
    try {
      const recipients = String(o.to).split(',').map(function (a) {
        return { emailAddress: { address: a.trim() } };
      });
      const message = {
        subject: o.subject,
        body: o.htmlBody ? { contentType: 'HTML', content: o.htmlBody }
                         : { contentType: 'Text', content: o.body || '' },
        toRecipients: recipients
      };
      if (o.replyTo) message.replyTo = [{ emailAddress: { address: o.replyTo } }];
      const res = UrlFetchApp.fetch(
        'https://graph.microsoft.com/v1.0/users/' + encodeURIComponent(cfg.sender) + '/sendMail', {
          method: 'post',
          contentType: 'application/json',
          headers: { Authorization: 'Bearer ' + msToken_(cfg) },
          payload: JSON.stringify({ message: message, saveToSentItems: true }),
          muteHttpExceptions: true
        });
      if (res.getResponseCode() === 202) return 'microsoft';
      throw new Error('Graph sendMail ' + res.getResponseCode() + ': ' + res.getContentText());
    } catch (err) {
      console.error('Microsoft 365 send failed, using Google instead: ' + err);
    }
  }
  MailApp.sendEmail(o);
  return 'google';
}

/** Run once after saving the Script Properties: emails NOTIFY_EMAIL a test. */
function testMicrosoftMail() {
  if (!msConfig_()) {
    throw new Error('Microsoft 365 is not set up yet: add MS_TENANT_ID, MS_CLIENT_ID and MS_CLIENT_SECRET in Project Settings > Script Properties.');
  }
  CacheService.getScriptCache().remove('ms_graph_token');
  const via = sendMail_({
    to: NOTIFY_EMAIL,
    subject: BRAND_NAME + ' website: Microsoft 365 email test',
    body: 'If you are reading this, website emails are being sent through Microsoft 365.'
  });
  if (via !== 'microsoft') {
    throw new Error('Microsoft 365 refused the email, so it was sent through Google instead. Open Executions to see the reason.');
  }
  return 'Sent through Microsoft 365 to ' + NOTIFY_EMAIL;
}

/** Light email sanity check so we don't send auto-replies to junk. */
function isEmail_(v) {
  return typeof v === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
}

/** Opening the /exec URL in a browser confirms the deployment is live. */
function doGet() {
  return json({ ok: true, service: BRAND_NAME + ' contact endpoint' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
