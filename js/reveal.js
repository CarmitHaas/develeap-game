"use strict";

// ─── REVEAL + SUBMIT ──────────────────────────────────────────────
// On the true ending: shows the winning code + submit-to-form button.
// On every other ending: shows just the submit button (player can share which
// ending they got + notes).
// The Google Form is the validation point. Light code obfuscation only.
//
// To set up the Google Form integration:
//   1. Build the form on a Develeap-owned Google account.
//   2. Add fields: Code (short answer, optional), Name (optional), Slack handle (optional),
//      Which ending? (short answer or single-choice from 5 options),
//      What would you do differently? (paragraph, optional).
//   3. For each field, get its `entry.<id>` from the prefill URL:
//      Click 3-dot menu → "Get pre-filled link" → fill placeholder values → "Get link".
//      The URL will contain `entry.123456=...&entry.789012=...`.
//   4. Replace FORM_PREFILL_URL_TEMPLATE below. Keep the {CODE} and {ENDING} placeholders.
//   5. Done.

// Obfuscated winner code. Generated via base64. Decoded at runtime.
// To change the code: btoa('YOUR-NEW-CODE') in browser console, paste here.
const _CODE_B64 = 'REVWRUxFQVAtVEhVUi1QUk9ELTdLM00='; // → DEVELEAP-THUR-PROD-7K3M

// Set this once the Google Form exists. Use {CODE} and {ENDING} placeholders
// where the entry values should land. Example:
//   https://docs.google.com/forms/d/e/FORM_ID/viewform?usp=pp_url&entry.111={CODE}&entry.222={ENDING}
const FORM_PREFILL_URL_TEMPLATE = 'https://docs.google.com/forms/d/e/REPLACE_FORM_ID/viewform?usp=pp_url&entry.REPLACE_CODE_ID={CODE}&entry.REPLACE_ENDING_ID={ENDING}';

// Friendly ending names that go into the form's "Which ending" field.
const ENDING_LABELS = {
  true_ending:     'הסוף הנכון (DevOps Diplomat)',
  ok_ending:       'Survivor',
  bad_ending:      'Postmortem Pending',
  absurd_ending:   'Acting CTO Brian',
  colossal_ending: 'End of the Cloud'
};

function _decodeCode() {
  try { return atob(_CODE_B64); } catch (e) { return 'CODE-ERROR'; }
}

function getWinnerCode() {
  return _decodeCode();
}

function getFormUrl(endingKey, includeCode) {
  const codePart   = includeCode ? encodeURIComponent(_decodeCode()) : '';
  const endingPart = encodeURIComponent(ENDING_LABELS[endingKey] || endingKey || '');
  return FORM_PREFILL_URL_TEMPLATE
    .replace('{CODE}', codePart)
    .replace('{ENDING}', endingPart);
}

function copyCodeToClipboard() {
  const code = _decodeCode();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => {
      notify('📋 הקוד הועתק');
    }, () => {
      notify('ההעתקה נכשלה - סמנו את הקוד ידנית');
    });
  } else {
    notify('ההעתקה לא נתמכת - סמנו ידנית');
  }
}

// Render the reveal/submit block. Two modes:
//   - true ending (revealsCode=true): shows the code + copy + submit button
//   - any other ending: shows just a submit button (player shares which ending
//     they reached + optional notes via the form)
function renderReveal(endingKey, revealsCode) {
  const formReady = !FORM_PREFILL_URL_TEMPLATE.includes('REPLACE_FORM_ID');
  const formUrl   = getFormUrl(endingKey, !!revealsCode);

  if (revealsCode) {
    const code = _decodeCode();
    const formButton = formReady
      ? `<a href="${formUrl}" target="_blank" rel="noopener" class="end-btn primary">שלחו את הקוד לטופס →</a>`
      : `<span class="end-btn" style="opacity:0.6;cursor:default;">(קישור הטופס יוגדר בקרוב)</span>`;
    return `
      <div class="reveal-block" dir="rtl">
        <div class="reveal-headline">🏆 הגעתם לסוף הנכון. זה הקוד שלכם:</div>
        <div class="reveal-code" id="reveal-code-text">${code}</div>
        <div class="reveal-actions">
          <button class="end-btn" onclick="copyCodeToClipboard()">📋 העתקה</button>
          ${formButton}
        </div>
        <div class="reveal-skip">השליחה רשות. אפשר גם פשוט להמשיך לשחק.</div>
      </div>
    `;
  }

  // Non-true ending: invite the player to share which ending they got + notes
  const formButton = formReady
    ? `<a href="${formUrl}" target="_blank" rel="noopener" class="end-btn primary">שתפו אותנו לאיזה סוף הגעתם →</a>`
    : `<span class="end-btn" style="opacity:0.6;cursor:default;">(קישור הטופס יוגדר בקרוב)</span>`;
  return `
    <div class="reveal-block reveal-soft" dir="rtl">
      <div class="reveal-headline">📨 רוצים לשתף איך זה התגלגל?</div>
      <div class="reveal-soft-text">בטופס תוכלו לכתוב לאיזה סוף הגעתם, מה הייתם עושים אחרת, או סתם להגיד שלום. הקוד הזוכה לא נחשף בסוף הזה - אבל אם הצלחתם להגיע אליו במשחק קודם, אתם מוזמנים להוסיף אותו.</div>
      <div class="reveal-actions">
        ${formButton}
      </div>
      <div class="reveal-skip">השליחה רשות. אפשר גם פשוט לשחק שוב ולנסות סוף אחר.</div>
    </div>
  `;
}
