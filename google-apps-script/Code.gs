/**
 * TBA India — contact form handler
 * ---------------------------------------------------------------
 * Receives enquiries from the website contact form, appends each one
 * as a row in a Google Sheet and emails a notification.
 *
 * SETUP (once):
 *   1. Create a Google Sheet. Add a tab named exactly "Enquiries" with
 *      this header row:
 *        Timestamp | First Name | Last Name | Email | Phone | Interest | Message | Page
 *   2. Copy the Sheet ID from its URL and paste it into SHEET_ID below.
 *      https://docs.google.com/spreadsheets/d/<<<THIS PART>>>/edit
 *   3. Choose any random string as SHARED_TOKEN and paste the SAME value
 *      into contact-us.html (the data-sheet-token attribute on the form).
 *   4. In the Sheet: Extensions > Apps Script, delete the sample code,
 *      paste this file, and Save.
 *   5. Deploy > New deployment > type "Web app":
 *        Execute as:      Me
 *        Who has access:  Anyone
 *      Authorise when prompted (you will see an "unverified app" warning —
 *      it is your own script: Advanced > Go to project).
 *   6. Copy the /exec URL and paste it into contact-us.html
 *      (the data-sheet-endpoint attribute on the form).
 *
 * NOTE: after editing this script you must Deploy > New deployment (or
 * "Manage deployments" > edit > new version) for changes to take effect.
 */

const SHEET_ID     = 'PASTE_YOUR_SHEET_ID_HERE';
const SHEET_NAME   = 'Enquiries';
const NOTIFY_EMAIL = 'indiaops@tbaindia.in';
const SHARED_TOKEN = 'PASTE_THE_SAME_TOKEN_AS_THE_WEBSITE';

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json({ ok: false, error: 'no payload' });
    }
    const d = JSON.parse(e.postData.contents);

    // Reject anything that does not carry the shared token.
    if (SHARED_TOKEN && d.token !== SHARED_TOKEN) {
      return json({ ok: false, error: 'unauthorized' });
    }
    // Honeypot: bots fill hidden fields. Accept silently, record nothing.
    if (d['bot-field']) return json({ ok: true });

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) return json({ ok: false, error: 'sheet tab "' + SHEET_NAME + '" not found' });

    sheet.appendRow([
      new Date(),
      d.first_name || '',
      d.last_name  || '',
      d.email      || '',
      d.phone      || '',
      d.interest   || '',
      d.message    || '',
      d.page       || ''
    ]);

    const fullName = ((d.first_name || '') + ' ' + (d.last_name || '')).trim();
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      replyTo: d.email || NOTIFY_EMAIL,
      subject: 'New website enquiry - TBA India' + (fullName ? ' (' + fullName + ')' : ''),
      name: 'TBA India Website',
      body: [
        'A new enquiry has come in from the TBA India website.',
        '',
        'Name:     ' + (fullName || '-'),
        'Email:    ' + (d.email    || '-'),
        'Phone:    ' + (d.phone    || '-'),
        'Interest: ' + (d.interest || '-'),
        '',
        'Message:',
        (d.message || '-'),
        '',
        '---',
        'This enquiry has also been added to the Enquiries sheet.'
      ].join('\n')
    });

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// Lets you open the /exec URL in a browser to confirm the deployment is live.
function doGet() {
  return json({ ok: true, service: 'TBA India contact endpoint' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
