AXBET WEB FIREBASE V4

Fixed in this build:
- Fixed Login and Create Account buttons on the mandatory account gate.
- Fixed modal layering so the login/register dialog receives clicks.
- Converted authentication into real form submit handling with Enter-key support.
- Added clearer Firebase/network error messages and disabled-button feedback while requests are processing.
- Kept Firebase Email/Password authentication, registration profile creation and password reset flow.
- Kept the user profile, large PKR balance display, Deposits, Withdrawals, Settings, Help & Support and Log Out.
- Kept the supplied AXBET logo and loading GIF throughout splash, authentication and profile surfaces.
- Kept supplied deposit accounts from the TXT source.
- Added connection status, refresh button, improved search, responsive empty states and stronger mobile controls.
- Reworked layout for small phones, large phones, tablets, iPad-sized screens, laptops and large desktop monitors.
- Added safe-area spacing for iPhone/iPad devices and a centered fixed bottom navigation on desktop and mobile.
- Added a wider desktop dashboard with series and events columns while collapsing cleanly to one column on tablets/phones.
- Deposit and withdrawal forms still create pending Firestore requests only. They do not automatically move money or update account balances.

Firebase:
- Uses the supplied AXBET Firebase project configuration.
- Email/password sign-in must be enabled in Firebase Authentication.
- Firestore Security Rules must allow only the intended authenticated operations before production use.

AXBET V5 ACCOUNT HISTORY ADDITIONS
- Existing V4 files and functionality are retained.
- Added Deposit History inside the profile/account area.
- Added Withdrawal History inside the profile/account area.
- Profile deposit and withdrawal counters are now calculated from the signed-in user's Firebase request documents.
- A withdrawal count of one is displayed when that user has exactly one withdrawal request.
- Deposit and withdrawal history entries show amount, date/time, request details and the Firebase request status.
- Newly created deposit requests continue to use status: "pending" and appear in Deposit History after the Firebase request is created.
- Newly created withdrawal requests continue to use status: "pending" and appear in Withdrawal History after the Firebase request is created.
- History queries are restricted by uid on the client query; Firestore Security Rules should independently enforce that users can read only their own request documents.

LIMITATION
- Betting-history functionality was not added. This build only adds the non-betting deposit and withdrawal account-history views.


AXBET LIVE MATCH STATUS FIX
- Fixed the LIVE -> UPCOMING misclassification caused by reading an unreliable third text node from Cricbuzz match cards.
- The scraper now uses the source page category as the authoritative status bucket:
  LIVE = LIVE
  UPCOMING = UPCOMING
  RECENT = RESULT
- Detailed card text is stored separately as match_status and can no longer overwrite the main status.
- Completed/cancelled text on the LIVE page is protected from being shown as LIVE.
- Frontend now refreshes matches automatically every 5 seconds instead of only on first page load or manual refresh.
- Frontend reads /matches.json with no-cache headers and also falls back to matches when events is missing.
- Strict status priority prevents unknown statuses from being treated as LIVE.
- This build fixes stale/incorrect UI state; it does not invent live matches or odds. The displayed state comes from the scraper source.
