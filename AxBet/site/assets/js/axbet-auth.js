/**
 * AXBET Firebase Authentication & Player Management
 * - Firebase 13.1.0 ESM
 * - Email-only registration (Phone/mobile removed)
 * - Real-time Balance sync with Firestore
 * - Deposits & Withdrawals matching Firestore Security Rules
 * - Dynamic Header State: Login/Registration disappear on sign-in
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyCDTMuH0UbB5CYAxgfFj97UtowM2drCN_8",
  authDomain: "axbetorg.firebaseapp.com",
  databaseURL: "https://axbetorg-default-rtdb.firebaseio.com",
  projectId: "axbetorg",
  storageBucket: "axbetorg.firebasestorage.app",
  messagingSenderId: "910584871383",
  appId: "1:910584871383:web:db8e554e207653f0c17392",
  measurementId: "G-M3Z6EE1T5K"
};

// Initialize Firebase SDKs
const app = initializeApp(firebaseConfig);
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  // Analytics optional on localhost/file protocol
}

const auth = getAuth(app);
const db = getFirestore(app);

// State
let currentUser = null;
let userProfile = null;
let unsubscribeUserDoc = null;

// ============================================================================
// UI INJECTION: MODALS (LOGIN, REGISTER, DEPOSIT, WITHDRAW, TRANSACTIONS)
// ============================================================================

function injectModals() {
  if (document.getElementById("axbet-modals-root")) return;

  const root = document.createElement("div");
  root.id = "axbet-modals-root";
  root.innerHTML = `
    <!-- Overlay Backdrop -->
    <div id="axbet-modal-backdrop" class="axbet-modal-backdrop" style="display:none;"></div>

    <!-- Login Modal -->
    <div id="axbet-login-modal" class="axbet-modal" style="display:none;">
      <div class="axbet-modal-box">
        <button class="axbet-modal-close" onclick="window.axbetCloseModals()">&times;</button>
        <div class="axbet-modal-header">
          <div class="axbet-modal-logo"><span class="ax-y">AX</span><span class="ax-w">BET</span></div>
          <h2>Log in to your Account</h2>
          <p>Access live betting, casino, and your wallet</p>
        </div>
        <form id="axbet-login-form" class="axbet-form">
          <div id="axbet-login-error" class="axbet-alert-error" style="display:none;"></div>
          <div class="axbet-input-group">
            <label>Email Address</label>
            <input type="email" id="login-email" required placeholder="Enter your email" autocomplete="username">
          </div>
          <div class="axbet-input-group">
            <label>Password</label>
            <input type="password" id="login-password" required placeholder="Enter password" autocomplete="current-password">
          </div>
          <button type="submit" id="login-submit-btn" class="axbet-btn-primary">LOG IN</button>
          <div class="axbet-modal-switch">
            Don't have an account? <a href="javascript:void(0)" onclick="window.axbetSwitchToRegister()">Register now</a>
          </div>
        </form>
      </div>
    </div>

    <!-- Registration Modal -->
    <div id="axbet-register-modal" class="axbet-modal" style="display:none;">
      <div class="axbet-modal-box">
        <button class="axbet-modal-close" onclick="window.axbetCloseModals()">&times;</button>
        <div class="axbet-modal-header">
          <div class="axbet-modal-logo"><span class="ax-y">AX</span><span class="ax-w">BET</span></div>
          <h2>Create AXBET Account</h2>
          <p>Sign up with your email to start playing immediately</p>
        </div>
        <form id="axbet-register-form" class="axbet-form">
          <div id="axbet-reg-error" class="axbet-alert-error" style="display:none;"></div>
          <div class="axbet-input-group">
            <label>Email Address</label>
            <input type="email" id="reg-email" required placeholder="name@example.com" autocomplete="email">
          </div>
          <div class="axbet-input-group">
            <label>Password (min. 6 characters)</label>
            <input type="password" id="reg-password" required minlength="6" placeholder="Create strong password" autocomplete="new-password">
          </div>
          <div class="axbet-input-group">
            <label>Confirm Password</label>
            <input type="password" id="reg-confirm-password" required minlength="6" placeholder="Confirm your password" autocomplete="new-password">
          </div>
          <div class="axbet-input-group">
            <label>Currency</label>
            <select id="reg-currency" class="axbet-select">
              <option value="PKR">Pakistani Rupee (PKR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="USDT">Tether (USDT)</option>
            </select>
          </div>
          <div class="axbet-input-group">
            <label>Promo Code (Optional)</label>
            <input type="text" id="reg-promo" placeholder="Enter promo code if any">
          </div>
          <button type="submit" id="reg-submit-btn" class="axbet-btn-primary">COMPLETE REGISTRATION</button>
          <div class="axbet-modal-switch">
            Already registered? <a href="javascript:void(0)" onclick="window.axbetSwitchToLogin()">Log in here</a>
          </div>
        </form>
      </div>
    </div>

    <!-- Deposit Modal -->
    <div id="axbet-deposit-modal" class="axbet-modal" style="display:none;">
      <div class="axbet-modal-box axbet-modal-wide">
        <button class="axbet-modal-close" onclick="window.axbetCloseModals()">&times;</button>
        <div class="axbet-modal-header">
          <div class="axbet-modal-logo"><span class="ax-y">AX</span><span class="ax-w">BET</span> CASHIER</div>
          <h2>Deposit Funds</h2>
          <p>Instant deposit via Easypaisa, JazzCash, Bank Transfer or Crypto</p>
        </div>
        <form id="axbet-deposit-form" class="axbet-form">
          <div id="axbet-deposit-alert" class="axbet-alert-success" style="display:none;"></div>
          <div id="axbet-deposit-error" class="axbet-alert-error" style="display:none;"></div>
          
          <div class="axbet-method-grid">
            <label class="axbet-method-card active">
              <input type="radio" name="deposit-method" value="JazzCash" checked>
              <span class="method-name">JazzCash</span>
            </label>
            <label class="axbet-method-card">
              <input type="radio" name="deposit-method" value="Easypaisa">
              <span class="method-name">Easypaisa</span>
            </label>
            <label class="axbet-method-card">
              <input type="radio" name="deposit-method" value="Bank Transfer">
              <span class="method-name">Bank Transfer</span>
            </label>
            <label class="axbet-method-card">
              <input type="radio" name="deposit-method" value="Crypto USDT">
              <span class="method-name">USDT (TRC20)</span>
            </label>
          </div>

          <div class="axbet-bank-info" id="deposit-account-details">
            <p><strong>Official Agent Account:</strong> 0300-1234567 (Title: AXBET Official)</p>
            <small>Transfer the exact amount to the account above and enter your Transaction ID (TID) below.</small>
          </div>

          <div class="axbet-input-group">
            <label>Amount (PKR)</label>
            <input type="number" id="deposit-amount" min="100" max="500000" step="50" required placeholder="Minimum 100 PKR">
          </div>
          <div class="axbet-input-group">
            <label>Sender Account / Phone Number</label>
            <input type="text" id="deposit-sender" required placeholder="Account number transferred from">
          </div>
          <div class="axbet-input-group">
            <label>Transaction ID / Reference (TID)</label>
            <input type="text" id="deposit-txid" required placeholder="e.g. 1294810293">
          </div>
          <button type="submit" id="deposit-submit-btn" class="axbet-btn-primary">SUBMIT DEPOSIT REQUEST</button>
        </form>
      </div>
    </div>

    <!-- Withdrawal Modal -->
    <div id="axbet-withdraw-modal" class="axbet-modal" style="display:none;">
      <div class="axbet-modal-box axbet-modal-wide">
        <button class="axbet-modal-close" onclick="window.axbetCloseModals()">&times;</button>
        <div class="axbet-modal-header">
          <div class="axbet-modal-logo"><span class="ax-y">AX</span><span class="ax-w">BET</span> CASHIER</div>
          <h2>Withdraw Funds</h2>
          <p>Available Balance: <strong id="withdraw-available-bal" style="color:#FFC107;">0.00 PKR</strong></p>
        </div>
        <form id="axbet-withdraw-form" class="axbet-form">
          <div id="axbet-withdraw-alert" class="axbet-alert-success" style="display:none;"></div>
          <div id="axbet-withdraw-error" class="axbet-alert-error" style="display:none;"></div>

          <div class="axbet-input-group">
            <label>Withdrawal Method</label>
            <select id="withdraw-method" class="axbet-select">
              <option value="JazzCash">JazzCash</option>
              <option value="Easypaisa">Easypaisa</option>
              <option value="Bank Transfer">Bank Transfer (All Pakistani Banks)</option>
              <option value="USDT">Crypto (USDT TRC20)</option>
            </select>
          </div>
          <div class="axbet-input-group">
            <label>Account Title / Beneficiary Name</label>
            <input type="text" id="withdraw-title" required placeholder="Full Name on account">
          </div>
          <div class="axbet-input-group">
            <label>Account Number / IBAN</label>
            <input type="text" id="withdraw-account" required placeholder="03XXXXXXXXX or Bank IBAN">
          </div>
          <div class="axbet-input-group">
            <label>Amount to Withdraw (PKR)</label>
            <input type="number" id="withdraw-amount" min="500" step="50" required placeholder="Minimum 500 PKR">
          </div>
          <button type="submit" id="withdraw-submit-btn" class="axbet-btn-primary">REQUEST WITHDRAWAL</button>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  // Bind Form Submissions
  document.getElementById("axbet-login-form").addEventListener("submit", handleLogin);
  document.getElementById("axbet-register-form").addEventListener("submit", handleRegister);
  document.getElementById("axbet-deposit-form").addEventListener("submit", handleDeposit);
  document.getElementById("axbet-withdraw-form").addEventListener("submit", handleWithdrawal);

  // Method radio card clicks
  document.querySelectorAll(".axbet-method-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".axbet-method-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
    });
  });
}

// ============================================================================
// MODAL CONTROLLERS
// ============================================================================

window.axbetOpenLogin = function () {
  window.axbetCloseModals();
  document.getElementById("axbet-modal-backdrop").style.display = "block";
  document.getElementById("axbet-login-modal").style.display = "flex";
  document.getElementById("login-email")?.focus();
};

window.axbetOpenRegister = function () {
  window.axbetCloseModals();
  document.getElementById("axbet-modal-backdrop").style.display = "block";
  document.getElementById("axbet-register-modal").style.display = "flex";
  document.getElementById("reg-email")?.focus();
};

window.axbetOpenDeposit = function () {
  if (!currentUser) {
    window.axbetOpenLogin();
    return;
  }
  window.axbetCloseModals();
  document.getElementById("axbet-modal-backdrop").style.display = "block";
  document.getElementById("axbet-deposit-modal").style.display = "flex";
};

window.axbetOpenWithdraw = function () {
  if (!currentUser) {
    window.axbetOpenLogin();
    return;
  }
  const bal = userProfile?.balance || 0;
  const availEl = document.getElementById("withdraw-available-bal");
  if (availEl) availEl.innerText = `${bal.toFixed(2)} PKR`;
  window.axbetCloseModals();
  document.getElementById("axbet-modal-backdrop").style.display = "block";
  document.getElementById("axbet-withdraw-modal").style.display = "flex";
};

window.axbetCloseModals = function () {
  const backdrop = document.getElementById("axbet-modal-backdrop");
  if (backdrop) backdrop.style.display = "none";
  document.querySelectorAll(".axbet-modal").forEach(m => m.style.display = "none");
  // clear errors
  document.querySelectorAll(".axbet-alert-error, .axbet-alert-success").forEach(e => {
    e.style.display = "none";
    e.innerText = "";
  });
};

window.axbetSwitchToRegister = function () {
  window.axbetOpenRegister();
};

window.axbetSwitchToLogin = function () {
  window.axbetOpenLogin();
};

// Close on backdrop click
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "axbet-modal-backdrop") {
    window.axbetCloseModals();
  }
});

// ============================================================================
// AUTH HANDLERS: EMAIL ONLY (NO PHONE)
// ============================================================================

async function handleRegister(e) {
  e.preventDefault();
  const errEl = document.getElementById("axbet-reg-error");
  const btn = document.getElementById("reg-submit-btn");
  errEl.style.display = "none";

  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const confirmPassword = document.getElementById("reg-confirm-password").value;
  const currency = document.getElementById("reg-currency").value || "PKR";
  const promo = document.getElementById("reg-promo")?.value.trim() || "";

  if (password !== confirmPassword) {
    errEl.innerText = "Passwords do not match.";
    errEl.style.display = "block";
    return;
  }

  btn.disabled = true;
  btn.innerText = "Creating Account...";

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // Create user document in Firestore matching security rules
    // Rule specifies: role == 'user', balance == 0
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      role: "user",
      balance: 0.0,
      realBalance: 0.0,
      currency: currency,
      promoCode: promo,
      createdAt: serverTimestamp()
    });

    window.axbetCloseModals();
  } catch (error) {
    errEl.innerText = error.message || "Registration failed. Please try again.";
    errEl.style.display = "block";
  } finally {
    btn.disabled = false;
    btn.innerText = "COMPLETE REGISTRATION";
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const errEl = document.getElementById("axbet-login-error");
  const btn = document.getElementById("login-submit-btn");
  errEl.style.display = "none";

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  btn.disabled = true;
  btn.innerText = "Signing in...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.axbetCloseModals();
  } catch (error) {
    errEl.innerText = error.message || "Invalid email or password.";
    errEl.style.display = "block";
  } finally {
    btn.disabled = false;
    btn.innerText = "LOG IN";
  }
}

window.axbetSignOut = async function () {
  try {
    if (unsubscribeUserDoc) {
      unsubscribeUserDoc();
      unsubscribeUserDoc = null;
    }
    await signOut(auth);
  } catch (e) {
    console.error("Sign out error:", e);
  }
};

// ============================================================================
// FINANCIAL TRANSACTIONS (DEPOSITS & WITHDRAWALS MATCHING RULES)
// ============================================================================

async function handleDeposit(e) {
  e.preventDefault();
  const alertEl = document.getElementById("axbet-deposit-alert");
  const errEl = document.getElementById("axbet-deposit-error");
  const btn = document.getElementById("deposit-submit-btn");
  alertEl.style.display = "none";
  errEl.style.display = "none";

  if (!currentUser) return;

  const method = document.querySelector('input[name="deposit-method"]:checked')?.value || "JazzCash";
  const amount = parseFloat(document.getElementById("deposit-amount").value);
  const sender = document.getElementById("deposit-sender").value.trim();
  const txid = document.getElementById("deposit-txid").value.trim();

  if (isNaN(amount) || amount < 100) {
    errEl.innerText = "Minimum deposit amount is 100 PKR.";
    errEl.style.display = "block";
    return;
  }

  btn.disabled = true;
  btn.innerText = "Submitting...";

  try {
    const depData = {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      amount: amount,
      currency: "PKR",
      method: method,
      senderAccount: sender,
      transactionId: txid,
      status: "Pending", // matches security rule: request.resource.data.status in ['Pending', 'pending']
      createdAt: serverTimestamp()
    };

    // 1. Write to top-level /deposits collection
    await addDoc(collection(db, "deposits"), depData);

    // 2. Write to user sub-collection /users/{uid}/deposits
    await addDoc(collection(db, "users", currentUser.uid, "deposits"), depData);

    alertEl.innerHTML = `<strong>Deposit Request Submitted!</strong><br>Amount: ${amount.toFixed(2)} PKR via ${method}. Status: <em>Pending Verification</em>.`;
    alertEl.style.display = "block";
    document.getElementById("axbet-deposit-form").reset();
  } catch (err) {
    errEl.innerText = "Deposit submission failed: " + err.message;
    errEl.style.display = "block";
  } finally {
    btn.disabled = false;
    btn.innerText = "SUBMIT DEPOSIT REQUEST";
  }
}

async function handleWithdrawal(e) {
  e.preventDefault();
  const alertEl = document.getElementById("axbet-withdraw-alert");
  const errEl = document.getElementById("axbet-withdraw-error");
  const btn = document.getElementById("withdraw-submit-btn");
  alertEl.style.display = "none";
  errEl.style.display = "none";

  if (!currentUser) return;

  const method = document.getElementById("withdraw-method").value;
  const title = document.getElementById("withdraw-title").value.trim();
  const account = document.getElementById("withdraw-account").value.trim();
  const amount = parseFloat(document.getElementById("withdraw-amount").value);
  const currentBal = userProfile?.balance || 0;

  if (isNaN(amount) || amount < 500) {
    errEl.innerText = "Minimum withdrawal is 500 PKR.";
    errEl.style.display = "block";
    return;
  }

  if (amount > currentBal) {
    errEl.innerText = `Insufficient balance. Available: ${currentBal.toFixed(2)} PKR.`;
    errEl.style.display = "block";
    return;
  }

  btn.disabled = true;
  btn.innerText = "Submitting...";

  try {
    const withData = {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      amount: amount,
      currency: "PKR",
      method: method,
      accountTitle: title,
      accountNumber: account,
      status: "Pending", // matches security rule: request.resource.data.status in ['Pending', 'pending']
      createdAt: serverTimestamp()
    };

    // 1. Top-level /withdrawals
    await addDoc(collection(db, "withdrawals"), withData);

    // 2. User sub-collection /users/{uid}/withdrawals
    await addDoc(collection(db, "users", currentUser.uid, "withdrawals"), withData);

    alertEl.innerHTML = `<strong>Withdrawal Request Submitted!</strong><br>Amount: ${amount.toFixed(2)} PKR to ${title} (${account}). Status: <em>Pending Approval</em>.`;
    alertEl.style.display = "block";
    document.getElementById("axbet-withdraw-form").reset();
  } catch (err) {
    errEl.innerText = "Withdrawal submission failed: " + err.message;
    errEl.style.display = "block";
  } finally {
    btn.disabled = false;
    btn.innerText = "REQUEST WITHDRAWAL";
  }
}

// ============================================================================
// DYNAMIC UI UPDATER: HEADER LOGIN/REGISTER DISAPPEARS ON AUTH
// ============================================================================

function setupAuthListener() {
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
      // 1. Listen to real-time user document updates in Firestore
      if (unsubscribeUserDoc) unsubscribeUserDoc();
      const userRef = doc(db, "users", user.uid);

      unsubscribeUserDoc = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          userProfile = snapshot.data();
          updateAuthenticatedUI(user, userProfile);
        } else {
          // If first-time user without firestore doc, create it
          setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            role: "user",
            balance: 0.0,
            realBalance: 0.0,
            currency: "PKR",
            createdAt: serverTimestamp()
          }).then(() => {
            userProfile = { balance: 0.0 };
            updateAuthenticatedUI(user, userProfile);
          });
        }
      });
    } else {
      userProfile = null;
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }
      updateUnauthenticatedUI();
    }
  });
}

function updateAuthenticatedUI(user, profile) {
  const balance = profile?.balance || 0.0;
  const balanceStr = balance.toFixed(2);
  const emailShort = user.email ? user.email.split("@")[0] : "Player";
  const uidShort = user.uid.substring(0, 8);

  // 1. HIDE all Login & Registration buttons/links across the page
  document.querySelectorAll(`
    a[href*="registration"],
    button[class*="login"],
    button[class*="auth"],
    .user-control-btn--login,
    .btn--registration,
    .btn--login,
    .auth-dropdown-trigger
  `).forEach(el => {
    el.style.setProperty("display", "none", "important");
  });

  // 2. Also hide the registration widget on page
  const regWidget = document.querySelector(".registration-layout-widget");
  if (regWidget) {
    regWidget.innerHTML = `
      <div class="axbet-user-card-widget">
        <div class="axbet-card-header">
          <div class="axbet-user-avatar">👤</div>
          <div>
            <h3>${user.email}</h3>
            <span class="axbet-id-badge">ID: ${uidShort}</span>
          </div>
        </div>
        <div class="axbet-balance-display">
          <label>MAIN BALANCE</label>
          <div class="balance-num">${balanceStr} <span class="cur">PKR</span></div>
        </div>
        <div class="axbet-card-actions">
          <button onclick="window.axbetOpenDeposit()" class="axbet-btn-primary">+ DEPOSIT</button>
          <button onclick="window.axbetOpenWithdraw()" class="axbet-btn-outline">WITHDRAW</button>
        </div>
      </div>
    `;
  }

  // 3. Insert or update the Authenticated Player Bar in header
  let playerBar = document.getElementById("axbet-player-bar");
  if (!playerBar) {
    playerBar = document.createElement("div");
    playerBar.id = "axbet-player-bar";
    playerBar.className = "axbet-player-bar";

    const headerControls = document.querySelector(".header-top__controls, .user-control-dashboard, header");
    if (headerControls) {
      headerControls.prepend(playerBar);
    }
  }

  playerBar.style.display = "flex";
  playerBar.innerHTML = `
    <div class="axbet-player-info">
      <div class="axbet-player-meta">
        <span class="axbet-player-email">${user.email}</span>
        <span class="axbet-player-id">ID: ${uidShort}</span>
      </div>
      <div class="axbet-player-balance" onclick="window.axbetOpenDeposit()" title="Click to Deposit">
        <span class="bal-label">BALANCE:</span>
        <strong id="user-header-balance">${balanceStr} PKR</strong>
      </div>
    </div>
    <div class="axbet-player-actions">
      <button onclick="window.axbetOpenDeposit()" class="axbet-bar-btn axbet-bar-deposit">+ DEPOSIT</button>
      <button onclick="window.axbetOpenWithdraw()" class="axbet-bar-btn axbet-bar-withdraw">WITHDRAW</button>
      <button onclick="window.axbetSignOut()" class="axbet-bar-btn axbet-bar-logout" title="Log Out">LOG OUT</button>
    </div>
  `;
}

function updateUnauthenticatedUI() {
  // 1. Show all Login and Registration buttons
  document.querySelectorAll(`
    a[href*="registration"],
    button[class*="login"],
    button[class*="auth"],
    .user-control-btn--login,
    .btn--registration,
    .btn--login,
    .auth-dropdown-trigger
  `).forEach(el => {
    el.style.removeProperty("display");
  });

  // 2. Hide authenticated player bar
  const playerBar = document.getElementById("axbet-player-bar");
  if (playerBar) {
    playerBar.style.display = "none";
  }
}

// ============================================================================
// REMOVE ALL PHONE & MOBILE REGISTRATION / BIND CLICK TRIGGERS
// ============================================================================

function purifyAndBindUI() {
  // 1. Intercept any Login button click
  document.querySelectorAll(`
    button[class*="login"],
    button[class*="auth"],
    .user-control-btn--login,
    .auth-dropdown-trigger
  `).forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.axbetOpenLogin();
    };
  });

  // 2. Intercept any Registration button click
  document.querySelectorAll(`
    a[href*="registration"],
    .btn--registration,
    .registration-field-submit__button
  `).forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.axbetOpenRegister();
    };
  });

  // 3. Remove phone-number specific tabs and SMS buttons on the page
  document.querySelectorAll(`
    .registration-field-phone-mega,
    .registration-field-phone-mega-confirmation,
    .registration-field-phone-confirmation,
    .registration-field-phone-mega__confirmation,
    .ui-ico--phone-reg,
    .registration-field-phone-confirmation__button
  `).forEach(el => el.remove());

  // Replace text "By phone" with "By Email"
  document.querySelectorAll(".ui-tabs__item, .registration-layout-widget-form__header, p, span").forEach(el => {
    if (el.children.length === 0 && (el.innerText.includes("By phone") || el.innerText.includes("via SMS"))) {
      el.innerText = el.innerText.replace(/By phone/g, "By Email").replace(/via SMS/g, "with Email");
    }
  });

  // 4. Transform on-page registration form into direct Email/Password
  const regForm = document.querySelector(".registration-layout-widget-form");
  if (regForm && !regForm.dataset.axbetEnhanced) {
    regForm.dataset.axbetEnhanced = "true";
    regForm.onsubmit = (e) => {
      e.preventDefault();
      window.axbetOpenRegister();
    };
  }
}

// ============================================================================
// INIT ENTRYPOINT
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  injectModals();
  purifyAndBindUI();
  setupAuthListener();
});

// Also trigger immediately if script loads after DOM ready
if (document.readyState === "interactive" || document.readyState === "complete") {
  injectModals();
  purifyAndBindUI();
  setupAuthListener();
}

