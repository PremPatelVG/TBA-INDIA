/**
 * TBA India — contact form handler
 *
 *  ⚠  YOU DO NOT NEED TO EDIT ANYTHING IN THIS FILE.
 *     Just paste it in and deploy. The "Enquiries" tab and its column
 *     headings are created for you automatically the first time an
 *     enquiry arrives.
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
 */

const SHEET_NAME   = 'Enquiries';
const NOTIFY_EMAIL = 'indiaops@tbaindia.in';
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
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      replyTo: d.email || NOTIFY_EMAIL,
      subject: 'New website enquiry - TBA India' + (fullName ? ' (' + fullName + ')' : ''),
      name: 'TBA India Website',
      body: [
        'A new enquiry has come in from the TBA India website.', '',
        'Name:     ' + (fullName    || '-'),
        'Email:    ' + (d.email     || '-'),
        'Phone:    ' + (d.phone     || '-'),
        'Interest: ' + (d.interest  || '-'), '',
        'Message:', (d.message || '-'), '',
        '---', 'It has also been added to the Enquiries sheet.'
      ].join('\n')
    });

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/** Opening the /exec URL in a browser confirms the deployment is live. */
function doGet() {
  return json({ ok: true, service: 'TBA India contact endpoint' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
