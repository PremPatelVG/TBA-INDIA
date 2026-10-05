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
 *  No SMTP server is required — Google sends these emails for you. They are
 *  sent FROM the Google account that owns this script, so for a professional
 *  "from" address, create/own this script under indiaops@tbaindia.in (or any
 *  tbaindia.in Google Workspace account).
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

    getSheet().appendRow([
      new Date(),
      d.first_name || '', d.last_name || '', d.email || '',
      d.phone || '', d.interest || '', d.message || '', d.page || ''
    ]);

    const fullName = ((d.first_name || '') + ' ' + (d.last_name || '')).trim();

    // 1) Notify the team
    MailApp.sendEmail({
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

  MailApp.sendEmail({
    to: d.email,
    replyTo: NOTIFY_EMAIL,
    subject: 'We’ve received your enquiry — ' + BRAND_NAME,
    name: BRAND_NAME,
    body: plain,
    htmlBody: html
  });
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
