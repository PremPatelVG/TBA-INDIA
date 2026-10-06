# Become an Advisor — approval flow on Microsoft 365 / Outlook

This is the **Outlook / Microsoft 365** version of the advisor-join approval
flow. (If your email is on Google/Gmail instead, use
`../google-apps-script/AdvisorFlow.gs`.)

Everything runs through **indiaops@tbaindia.in**:

```
Applicant submits the Microsoft Form
        │
        ▼
Power Automate flow (signed in as indiaops@tbaindia.in)
        │
        ├─► Applicant gets an "application received" email
        │
        ▼
Sanjiv gets an Approval in Outlook  →  clicks ✅ Approve  or  ❌ Reject
        │
        ├─ Approve → applicant is emailed the welcome note + the 2 files
        │            and indiaops (cc Sanjiv) gets an "approved & sent" note
        │
        └─ Reject  → (optional) applicant gets a polite "not this time" note
```

Everything below uses **only standard Microsoft 365 connectors** — Microsoft
Forms, Approvals, Office 365 Outlook, and OneDrive. No premium Power Automate
license is required.

> ⚠️ **Do all of this while signed in as `indiaops@tbaindia.in`** (or another
> mailbox on the tbaindia.in tenant that you want everything sent *from*).
> Power Automate sends email from the account that owns the flow's connection.

---

## Part A — Create the application form (Microsoft Forms)

1. Go to **forms.microsoft.com** → **New Form**.
2. Title it **"Become a TBA India Advisor"**. Add a short description, e.g.
   *"Tell us about yourself. Our leadership reviews every application personally."*
3. Add these questions (keep the names/order — they map to the emails):

   | # | Question | Type | Required |
   |---|----------|------|----------|
   | 1 | First name | Text (short) | ✔ |
   | 2 | Last name | Text (short) | ✔ |
   | 3 | Email | Text (short) — turn on **Restrictions → Email** | ✔ |
   | 4 | Phone | Text (short) | ✔ |
   | 5 | City | Text (short) | — |
   | 6 | Professional background | Text (short) | — |
   | 7 | Why do you want to join TBA India as an advisor? | Text (long) | ✔ |

4. (Optional) **Style** → set the theme colour to brand green `#013f22` and
   add the TBA logo.
5. Top-right **Collect responses** → set **"Anyone can respond"** →
   **Copy** the link. If you want it embedded inside the website page, also
   copy the **Embed** `<iframe>` code. **Send me either one** and I'll wire it
   into the "Become an Advisor" page.

---

## Part B — Put the 2 onboarding files in OneDrive

1. In the **indiaops** OneDrive, make a folder, e.g. **`TBA Advisor Onboarding`**.
2. Upload the **2 files** that approved applicants should receive.
   (Keep the names simple, e.g. `Advisor-Welcome-Pack.pdf`,
   `Advisor-Agreement.pdf`.)

---

## Part C — Build the Power Automate flow

Go to **make.powerautomate.com** (signed in as indiaops) →
**Create → Automated cloud flow** → name it **"Advisor application approval"**.

### 1. Trigger
- Search for and pick **Microsoft Forms → "When a new response is submitted"**.
- **Form Id**: choose *Become a TBA India Advisor*.

### 2. Get the answers
- **+ New step → Microsoft Forms → "Get response details"**.
- **Form Id**: the same form. **Response Id**: pick the dynamic value
  **"Response Id"** from the trigger.

### 3. (Optional) Tell the applicant we received it
- **+ New step → Office 365 Outlook → "Send an email (V2)"**.
  - **To**: the **Email** dynamic value from *Get response details*.
  - **Subject**: `We've received your advisor application — TBA India`
  - **Body** (switch the body box to **</> HTML** mode and paste
    `email-applicant-received.html` from this folder; replace `[First name]`
    with the **First name** dynamic value).

### 4. Ask Sanjiv to approve
- **+ New step → Approvals → "Start and wait for an approval"**.
  - **Approval type**: **Approve/Reject – First to respond**.
  - **Title**: `Advisor application from ` + **First name** + ` ` + **Last name**
  - **Assigned to**: Sanjiv's email address.
  - **Details** (supports Markdown — paste and drop the dynamic values in):
    ```
    **New advisor application**

    - **Name:** [First name] [Last name]
    - **Email:** [Email]
    - **Phone:** [Phone]
    - **City:** [City]
    - **Background:** [Professional background]

    **Why they want to join:**
    [Why do you want to join...]

    Click **Approve** to automatically send the welcome pack with both files,
    or **Reject** to decline.
    ```

### 5. Branch on the decision
- **+ New step → Condition**. Set: **Outcome** *(from the approval step)*
  **is equal to** `Approve`.

#### IF YES — send the welcome pack
1. **OneDrive for Business → "Get file content"** → pick **file 1** from
   `TBA Advisor Onboarding`.
2. **OneDrive for Business → "Get file content"** → pick **file 2**.
3. **Office 365 Outlook → "Send an email (V2)"**:
   - **To**: the applicant **Email**.
   - **Subject**: `Your advisor application is approved — TBA India`
   - **Body**: HTML mode → paste `email-applicant-approved.html` and replace
     `[First name]` with the dynamic value.
   - **Show advanced options → Attachments**. Add **2** attachments:
     - *Attachments Name – 1*: file 1's name (e.g. `Advisor-Welcome-Pack.pdf`)
       *Attachments Content – 1*: **File content** from step 1.
     - *Attachments Name – 2*: file 2's name
       *Attachments Content – 2*: **File content** from step 2.
4. **Office 365 Outlook → "Send an email (V2)"** — confirmation:
   - **To**: `indiaops@tbaindia.in`  •  **CC**: Sanjiv's email.
   - **Subject**: `Approved & sent — advisor [First name] [Last name]`
   - **Body**: `The applicant has been emailed the welcome pack with both files attached. No further action needed.`

#### IF NO — (optional) polite decline
- **Office 365 Outlook → "Send an email (V2)"** to the applicant **Email**,
  or leave this branch empty to do nothing.

### 6. Save and test
- **Save** → **Test → Manually** → submit the Microsoft Form once with your own
  email. Check: you get the "received" note, Sanjiv gets the Outlook approval,
  and on **Approve** you receive the welcome email with both files.

---

## Notes

- **Sending "from indiaops":** because the Outlook/OneDrive/Forms connections
  are all signed in as indiaops, every email is sent **from indiaops@tbaindia.in**
  automatically. To send from a *shared* mailbox instead, use the **From (Send
  as)** advanced field on "Send an email (V2)" — the indiaops account needs
  **Send As** permission on that shared mailbox.
- **Approve from anywhere:** Sanjiv can approve straight from the Outlook email,
  the Teams Approvals app, or the Power Automate mobile app — no password games,
  no typing "yes".
- **Keeping a record:** the flow run history in Power Automate logs every
  application and decision. If you'd also like each one written to an Excel file
  or SharePoint list, add a "Add a row into a table" / "Create item" step after
  the trigger — tell me and I'll extend this guide.
- **Alternative (keep the custom website form):** if you have a **premium**
  Power Automate plan, we can skip Microsoft Forms and let the website's own
  "Become an Advisor" form trigger the flow via a "When a HTTP request is
  received" trigger. Same flow from Part C step 2 onward. Ask me and I'll add
  those steps.
