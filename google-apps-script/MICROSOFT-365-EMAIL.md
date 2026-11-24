# Send website emails from indiaops@tbaindia.in (Microsoft 365)

The website forms (Contact and the hidden training registration page) log every
response in the Google Sheet and send emails from `Code.gs`. This guide makes
those emails go out **from indiaops@tbaindia.in through Microsoft 365**, so they
appear in that mailbox's Sent folder and carry your own domain.

## Why not plain SMTP?

Microsoft is switching off password-based SMTP sign-in ("SMTP AUTH" with a
username and password) for Microsoft 365. The supported replacement is
**Microsoft Graph**, Microsoft's email API, using an app login instead of a
password. That is what `Code.gs` uses. Nothing has to be installed and no
server is needed.

Until these steps are done, or if Microsoft ever refuses a send, emails are
sent through Google exactly as before, so no email is lost.

---

## Part 1: Microsoft 365 (an admin of tbaindia.in does this)

You need a Microsoft 365 **Global Administrator** or **Application
Administrator** account for step 4.

1. Go to **https://entra.microsoft.com** → **Identity** → **Applications** →
   **App registrations** → **New registration**.
   - Name: `TBA India Website Mailer`
   - Supported account types: **Accounts in this organizational directory only**
   - Leave Redirect URI empty → **Register**
2. On the app's **Overview** page, copy:
   - **Application (client) ID**
   - **Directory (tenant) ID**
3. **Certificates & secrets** → **Client secrets** → **New client secret**.
   - Description: `Website forms`, Expires: **24 months**
   - Copy the **Value** right away (it is shown only once). Note the expiry
     date in your calendar.
4. **API permissions** → **Add a permission** → **Microsoft Graph** →
   **Application permissions** → search `Mail.Send` → tick it → **Add
   permissions**. Then click **Grant admin consent for (your organisation)**
   and confirm. The status should turn green.

### Strongly recommended: limit the app to one mailbox

`Mail.Send` lets the app send as **any** mailbox in your organisation. Restrict
it to indiaops@tbaindia.in. In **Exchange Online PowerShell**
(`Connect-ExchangeOnline` as an admin):

```powershell
# a mail-enabled security group containing only the sending mailbox
New-DistributionGroup -Name "Website Mailer Senders" -Type Security -Members indiaops@tbaindia.in

# allow the app to send only as members of that group
New-ApplicationAccessPolicy -AppId <APPLICATION-CLIENT-ID> `
  -PolicyScopeGroupId "Website Mailer Senders" -AccessRight RestrictAccess `
  -Description "Website forms may only send as indiaops"

# should say Granted for indiaops, and Denied for any other mailbox
Test-ApplicationAccessPolicy -Identity indiaops@tbaindia.in -AppId <APPLICATION-CLIENT-ID>
```

(Microsoft's newer "RBAC for Applications" in Exchange Online does the same
job; either is fine.)

---

## Part 2: Google Apps Script (whoever owns the Google Sheet does this)

1. Open the Google Sheet → **Extensions → Apps Script**. Replace the code with
   the latest `google-apps-script/Code.gs` → **Save**.
2. Click the **gear icon (Project Settings)** → scroll to **Script
   Properties** → **Add script property** for each:

   | Property | Value |
   |---|---|
   | `MS_TENANT_ID` | Directory (tenant) ID from step 2 |
   | `MS_CLIENT_ID` | Application (client) ID from step 2 |
   | `MS_CLIENT_SECRET` | Client secret **Value** from step 3 |
   | `MS_SENDER` | `indiaops@tbaindia.in` (optional, this is the default) |

   → **Save script properties**. Keep these here only; never paste them into
   the code or send them by chat or email.
3. Back in the editor, choose **testMicrosoftMail** in the function dropdown →
   **Run**. Google asks for one new permission ("connect to an external
   service"); allow it. You should see *Sent through Microsoft 365*, and the
   test email appears in indiaops@tbaindia.in (Inbox and Sent Items).
4. **Deploy → Manage deployments → pencil icon → Version: New version →
   Deploy.** The web address stays the same, so the website needs no change.

## If something goes wrong

- **testMicrosoftMail says Microsoft refused the email:** open **Executions**
  in Apps Script and read the error line.
  - `Microsoft sign-in failed (400/401)`: the tenant ID, client ID or secret
    is wrong, or the secret has expired.
  - `Graph sendMail 403 ErrorAccessDenied`: admin consent (step 4) is missing,
    or the mailbox restriction does not include indiaops@tbaindia.in.
- **The client secret expires** (after 24 months): create a new secret in
  step 3 and replace `MS_CLIENT_SECRET`. Until you do, emails quietly fall back
  to Google and are still delivered.
