import {auth,db,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail,signOut,onAuthStateChanged,updateProfile,doc,setDoc,getDoc,collection,addDoc,getDocs,query,where} from "./firebase.js";

let data={series:[],events:[]},filter="all";
let favorites=JSON.parse(localStorage.getItem("axbet_favorites")||"[]");
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const countries=[
["+93","Afghanistan"],["+355","Albania"],["+213","Algeria"],["+376","Andorra"],["+244","Angola"],["+1-268","Antigua & Barbuda"],["+54","Argentina"],["+374","Armenia"],["+61","Australia"],["+43","Austria"],["+994","Azerbaijan"],["+1-242","Bahamas"],["+973","Bahrain"],["+880","Bangladesh"],["+1-246","Barbados"],["+375","Belarus"],["+32","Belgium"],["+501","Belize"],["+229","Benin"],["+975","Bhutan"],["+591","Bolivia"],["+387","Bosnia & Herzegovina"],["+267","Botswana"],["+55","Brazil"],["+673","Brunei"],["+359","Bulgaria"],["+226","Burkina Faso"],["+257","Burundi"],["+855","Cambodia"],["+237","Cameroon"],["+1","Canada / USA"],["+236","Central African Republic"],["+235","Chad"],["+56","Chile"],["+86","China"],["+57","Colombia"],["+269","Comoros"],["+242","Congo"],["+243","DR Congo"],["+506","Costa Rica"],["+385","Croatia"],["+53","Cuba"],["+357","Cyprus"],["+420","Czechia"],["+45","Denmark"],["+253","Djibouti"],["+1-767","Dominica"],["+593","Ecuador"],["+20","Egypt"],["+503","El Salvador"],["+372","Estonia"],["+268","Eswatini"],["+251","Ethiopia"],["+679","Fiji"],["+358","Finland"],["+33","France"],["+241","Gabon"],["+220","Gambia"],["+995","Georgia"],["+49","Germany"],["+233","Ghana"],["+30","Greece"],["+1-473","Grenada"],["+502","Guatemala"],["+224","Guinea"],["+245","Guinea-Bissau"],["+592","Guyana"],["+509","Haiti"],["+504","Honduras"],["+852","Hong Kong"],["+36","Hungary"],["+354","Iceland"],["+91","India"],["+62","Indonesia"],["+98","Iran"],["+964","Iraq"],["+353","Ireland"],["+972","Israel"],["+39","Italy"],["+1-876","Jamaica"],["+81","Japan"],["+962","Jordan"],["+7","Kazakhstan / Russia"],["+254","Kenya"],["+686","Kiribati"],["+965","Kuwait"],["+996","Kyrgyzstan"],["+856","Laos"],["+371","Latvia"],["+961","Lebanon"],["+266","Lesotho"],["+231","Liberia"],["+218","Libya"],["+423","Liechtenstein"],["+370","Lithuania"],["+352","Luxembourg"],["+853","Macau"],["+261","Madagascar"],["+265","Malawi"],["+60","Malaysia"],["+960","Maldives"],["+356","Malta"],["+692","Marshall Islands"],["+222","Mauritania"],["+230","Mauritius"],["+52","Mexico"],["+373","Moldova"],["+377","Monaco"],["+976","Mongolia"],["+382","Montenegro"],["+212","Morocco"],["+258","Mozambique"],["+95","Myanmar"],["+264","Namibia"],["+674","Nauru"],["+977","Nepal"],["+31","Netherlands"],["+64","New Zealand"],["+505","Nicaragua"],["+227","Niger"],["+234","Nigeria"],["+850","North Korea"],["+389","North Macedonia"],["+47","Norway"],["+968","Oman"],["+92","Pakistan"],["+680","Palau"],["+970","Palestine"],["+507","Panama"],["+675","Papua New Guinea"],["+595","Paraguay"],["+51","Peru"],["+63","Philippines"],["+48","Poland"],["+351","Portugal"],["+974","Qatar"],["+40","Romania"],["+250","Rwanda"],["+1-869","Saint Kitts & Nevis"],["+1-758","Saint Lucia"],["+1-784","Saint Vincent & Grenadines"],["+685","Samoa"],["+378","San Marino"],["+239","Sao Tome & Principe"],["+966","Saudi Arabia"],["+221","Senegal"],["+381","Serbia"],["+248","Seychelles"],["+232","Sierra Leone"],["+65","Singapore"],["+421","Slovakia"],["+386","Slovenia"],["+677","Solomon Islands"],["+252","Somalia"],["+27","South Africa"],["+82","South Korea"],["+34","Spain"],["+94","Sri Lanka"],["+249","Sudan"],["+597","Suriname"],["+46","Sweden"],["+41","Switzerland"],["+963","Syria"],["+886","Taiwan"],["+992","Tajikistan"],["+255","Tanzania"],["+66","Thailand"],["+228","Togo"],["+676","Tonga"],["+216","Tunisia"],["+90","Turkey"],["+993","Turkmenistan"],["+688","Tuvalu"],["+256","Uganda"],["+380","Ukraine"],["+971","UAE"],["+44","United Kingdom"],["+598","Uruguay"],["+998","Uzbekistan"],["+678","Vanuatu"],["+379","Vatican City"],["+58","Venezuela"],["+84","Vietnam"],["+967","Yemen"],["+260","Zambia"],["+263","Zimbabwe"]
];
const countryOptions=countries.map(([code,name])=>`<option value="${code}" ${code==="+92"?"selected":""}>${code} ${name}</option>`).join("");

function setConnection(online){const el=$("connection");if(!el)return;el.textContent=online?"Connected":"Offline";el.className="connection "+(online?"online":"offline")}
function visible(){
  if(filter==="live")return data.events.filter(e=>/live|inplay|in-play/i.test(e.status||""));
  if(filter==="upcoming")return data.events.filter(e=>/upcoming|scheduled/i.test(e.status||""));
  if(filter==="cricket")return data.events.filter(e=>!e.sport||String(e.sport).toLowerCase()==="cricket");
  return data.events;
}
function renderSeries(){
  const r=$("series"); r.innerHTML="";
  if(!data.series.length){r.innerHTML='<div class="empty">No series available yet.</div>';return}
  data.series.forEach(s=>{const b=document.createElement("button");b.innerHTML=`<span class="seriesIcon">🏏</span><strong>${esc(s.name)}</strong><small>${esc(s.sport||"Cricket")}</small>`;b.onclick=()=>renderEvents(data.events.filter(e=>e.seriesId===s.id));r.appendChild(b)})
}
// Add tracking for the currently open match in modal
let currentOpenMatchId = null;

function renderEvents(list=visible()){
  const r=$("events"); r.innerHTML=""; $("count").textContent=`${list.length} event${list.length===1?"":"s"}`;
  if(!list.length){r.innerHTML='<div class="empty">No events available. Connect your data feed or add matches to matches.json.</div>';return}
  list.forEach(e=>{
    const d=document.createElement("article");d.className="event";
    const fav=favorites.includes(e.id);
    d.innerHTML=`
      <div class="eventtop">
        <div>
          <div class="eventname" style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span><strong>${esc(e.teamA||"Team A")}</strong></span>
              <span style="font-weight: bold; color: #d32f2f;">${esc(e.scoreA||"")}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span><strong>${esc(e.teamB||"Team B")}</strong></span>
              <span style="font-weight: bold; color: #d32f2f;">${esc(e.scoreB||"")}</span>
            </div>
          </div>
          <small>${esc(e.title||e.startTime||"Time unavailable")}</small>
        </div>
        <button class="star" aria-label="Favorite">${fav?"★":"☆"}</button>
      </div>
      <div class="eventMeta">
        <span class="sportTag">🏏 ${esc(e.sport||"Cricket")}</span>
        <span class="live" style="flex: 1; text-align: right; font-weight: bold; color: #1565c0;">${esc(e.status||"upcoming")}</span>
      </div>
    `;
    
    // Parse score to get Runs, Wickets, Overs, Balls
    function parseScore(scoreStr) {
        if(!scoreStr) return { runs: '-', wkts: '-', overs: '-', balls: '-' };
        // Handle formats like "206-6 (20)" or "61/1 (4.5)"
        const match = scoreStr.match(/^(\d+)(?:[-/](\d+|\w+))?\s*\(([\d\.]+)\)/);
        if(match) {
            const runs = match[1];
            const wkts = match[2] || 'All Out';
            const oversRaw = match[3];
            const oversSplit = oversRaw.split('.');
            const overs = oversSplit[0];
            const balls = oversSplit.length > 1 ? oversSplit[1] : '0';
            return { runs, wkts, overs, balls };
        }
        // Fallback for scores like "65" or "Yet to bat"
        return { runs: scoreStr, wkts: '-', overs: '-', balls: '-' };
    }

    const sA = parseScore(e.scoreA);
    const sB = parseScore(e.scoreB);

    function getDetailsHtml(matchData) {
        const pA = parseScore(matchData.scoreA);
        const pB = parseScore(matchData.scoreB);
        const st = (matchData.status || '').toUpperCase();
        const isUpcoming = st === "UPCOMING" || st.includes("STARTS") || st.match(/\d{1,2}:\d{2}/) || (!matchData.scoreA && !matchData.scoreB && !st.includes('WON') && !st.includes('ABANDONED'));
        const isResult = (!isUpcoming) && (st.includes("WON") || st.includes("TIE") || st.includes("DRAW") || st.includes("ABANDONED"));
        const isLive = !isUpcoming && !isResult;
        
        let themeColor = "#1565c0"; // Live blue
        let statusBadge = "LIVE";
        if (isUpcoming) { themeColor = "#e65100"; statusBadge = "UPCOMING"; }
        if (isResult) { themeColor = "#2e7d32"; statusBadge = "RESULT"; }

        // Inject fullscreen modal CSS explicitly for this view
        const fullscreenCss = `
          <style>
            #modalbox {
              max-width: 100vw !important;
              max-height: 100vh !important;
              height: 100vh !important;
              border-radius: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow-y: auto !important;
              background: #050b16 !important;
              border: none !important;
            }
            .modal {
              padding: 0 !important;
              backdrop-filter: none !important;
            }
            #closeModalBtn {
               z-index: 9999;
            }
          </style>
        `;

        // If upcoming, show a different, elegant upcoming card
        if (isUpcoming) {
            return `${fullscreenCss}
                <div style="background: url('https://www.cricbuzz.com/images/cb_logo.svg') center/cover; min-height: 100vh; padding: max(env(safe-area-inset-top), 20px) 20px; text-align: center; color: white;">
                    <div style="background: rgba(11, 26, 44, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px 20px; margin-top: 50px;">
                        <span style="background: ${themeColor}; color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 0.9em; display: inline-block; margin-bottom: 20px;">${statusBadge}</span>
                        <h3 style="color: #88a1be; font-size: 0.9em; margin-bottom: 30px;">${esc(matchData.title || "Match Details")}</h3>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <div style="flex: 1; text-align: center;">
                                <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 2em;">🏏</div>
                                <strong style="font-size: 1.2em;">${esc(matchData.teamA)}</strong>
                            </div>
                            <div style="font-weight: 900; color: #445973; font-size: 1.5em; padding: 0 15px;">VS</div>
                            <div style="flex: 1; text-align: center;">
                                <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 2em;">🏏</div>
                                <strong style="font-size: 1.2em;">${esc(matchData.teamB)}</strong>
                            </div>
                        </div>

                        <div style="margin-top: 40px; padding: 20px; background: rgba(0,0,0,0.4); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                            <p style="font-weight: bold; font-size: 1.4em; color: #19a8ff; margin: 0;">${esc(matchData.status && matchData.status !== "UPCOMING" ? matchData.status : 'Upcoming Match')}</p>
                            <p style="font-size: 0.85em; color: #555; margin-top: 10px; margin-bottom: 0;">Match begins soon</p>
                        </div>
                    </div>
                </div>
            `;
        }

        // Live or Result View
        return `${fullscreenCss}
            <div style="min-height: 100vh; padding: max(env(safe-area-inset-top), 20px) 20px; text-align: center; color: white;">
                <span style="background: ${themeColor}; color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 0.9em; display: inline-block; margin-bottom: 15px; margin-top: 40px;">${statusBadge}</span>
                <p style="color:#88a1be; margin-bottom:30px; font-size:1em; font-weight:500;">${esc(matchData.title || "Match Details")}</p>
                
                <div style="display:flex; flex-direction: column; gap: 20px;">
                    
                    <!-- Team A Stats -->
                    <div style="padding: 25px 20px; background:linear-gradient(145deg, #0d1c30, #07111e); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: left; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                        <strong style="font-size: 1.3em; color:#fff; display:block; margin-bottom:15px;">${esc(matchData.teamA)}</strong>
                        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                            <div><small style="color:#6a84a3; font-size:0.8em; text-transform:uppercase; font-weight:bold;">Runs</small><br><span style="font-size:2.5em; font-weight:900; color:#18aaff; line-height:1;">${esc(pA.runs)}</span></div>
                            <div style="text-align:center;"><small style="color:#6a84a3; font-size:0.8em; text-transform:uppercase; font-weight:bold;">Wkts</small><br><span style="font-size:1.6em; font-weight:bold; color:#fff;">${esc(pA.wkts)}</span></div>
                            <div style="text-align:center;"><small style="color:#6a84a3; font-size:0.8em; text-transform:uppercase; font-weight:bold;">Overs</small><br><span style="font-size:1.6em; font-weight:bold; color:#fff;">${esc(pA.overs)}<small style="font-size:0.5em; color:#88a1be;">.${esc(pA.balls)}</small></span></div>
                        </div>
                    </div>

                    <!-- VS Badge -->
                    <div style="font-weight:900; color:#22364f; font-size:1.5em;">VS</div>

                    <!-- Team B Stats -->
                    <div style="padding: 25px 20px; background:linear-gradient(145deg, #0d1c30, #07111e); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: left; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                        <strong style="font-size: 1.3em; color:#fff; display:block; margin-bottom:15px;">${esc(matchData.teamB)}</strong>
                        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                            <div><small style="color:#6a84a3; font-size:0.8em; text-transform:uppercase; font-weight:bold;">Runs</small><br><span style="font-size:2.5em; font-weight:900; color:#18aaff; line-height:1;">${esc(pB.runs)}</span></div>
                            <div style="text-align:center;"><small style="color:#6a84a3; font-size:0.8em; text-transform:uppercase; font-weight:bold;">Wkts</small><br><span style="font-size:1.6em; font-weight:bold; color:#fff;">${esc(pB.wkts)}</span></div>
                            <div style="text-align:center;"><small style="color:#6a84a3; font-size:0.8em; text-transform:uppercase; font-weight:bold;">Overs</small><br><span style="font-size:1.6em; font-weight:bold; color:#fff;">${esc(pB.overs)}<small style="font-size:0.5em; color:#88a1be;">.${esc(pB.balls)}</small></span></div>
                        </div>
                    </div>
                </div>
                <div style="margin-top:30px; padding: 20px; background: ${isResult ? 'rgba(46, 125, 50, 0.1)' : 'rgba(21, 101, 192, 0.1)'}; border-radius: 16px; border: 1px solid ${isResult ? 'rgba(46, 125, 50, 0.3)' : 'rgba(21, 101, 192, 0.3)'};">
                    <p style="font-weight:900; font-size: 1.2em; color:${isResult ? '#4caf50' : '#4dabf5'}; margin:0;">${esc(matchData.status || '')}</p>
                    ${isLive ? '<p style="font-size: 0.85em; color: #555; margin-top: 10px; margin-bottom: 0;">Auto-refreshing live data...</p>' : ''}
                </div>
            </div>
        `;
    }

    // Auto-update modal if this match is currently open
    if(currentOpenMatchId === e.id && !$("modal").classList.contains("hidden")) {
        $("mbody").innerHTML = getDetailsHtml(e);
    }

    // Allow clicking the card to view details
    d.style.cursor = "pointer";
    d.onclick = (ev) => {
        if(ev.target.closest('.star')) return;
        currentOpenMatchId = e.id;
        modal('', getDetailsHtml(e), false);
    };

    d.querySelector(".star").onclick=(ev)=>{
        ev.stopPropagation();
        favorites=favorites.includes(e.id)?favorites.filter(x=>x!==e.id):[...favorites,e.id];
        localStorage.setItem("axbet_favorites",JSON.stringify(favorites));
        renderEvents();
    };
    r.appendChild(d);
  });
}

async function ensureUserDoc(user,profile={}){
  const ref=doc(db,"users",user.uid);const s=await getDoc(ref);
  if(!s.exists())await setDoc(ref,{uid:user.uid,fullName:profile.fullName||user.displayName||"",email:user.email||"",countryCode:profile.countryCode||"+92",phone:profile.phone||"",currency:"PKR",balancePkr:0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
  loadBalance(user.uid);
}
async function loadBalance(uid){try{const s=await getDoc(doc(db,"users",uid));$("balance").textContent=s.exists()?Number(s.data().balancePkr||0).toLocaleString():"0";}catch(e){$("balance").textContent="0";}}
function closeModal(){
  currentOpenMatchId = null;
  $("modal").classList.add("hidden");
  if(!auth.currentUser)showGate();
}
function modal(t,b,logo=true){
  $("authGate").classList.add("hidden");
  $("mtitle").textContent=t;$("mbody").innerHTML=b;$("modalLogoWrap").classList.toggle("hidden",!logo);$("modal").classList.remove("hidden");
  setTimeout(()=>{const first=$("modalbox")?.querySelector("input:not([disabled])");first?.focus();},40);
}
function message(id,text,ok=false){const el=$(id);if(el){el.textContent=text;el.className=ok?"msg success":"msg error";}}
function buttonBusy(id,busy,text){const b=$(id);if(!b)return;b.disabled=busy;b.dataset.original=b.dataset.original||b.textContent;b.textContent=busy?text:b.dataset.original;}

function authModal(register=false){
  const title=register?"Create your AXBET account":"Welcome back";
  const body=register?`
    <form id="authForm" novalidate>
      <div class="formGrid"><label>Full Name<input id="fullName" autocomplete="name" placeholder="Your full name" required></label><label>Email<input id="email" type="email" autocomplete="email" placeholder="you@example.com" required></label></div>
      <label>Phone Number</label><div class="phoneRow"><select id="countryCode" aria-label="Country code">${countryOptions}</select><input id="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="Phone number" required></div>
      <div class="formGrid"><label>Password<input id="password" type="password" autocomplete="new-password" placeholder="At least 6 characters" required></label><label>Confirm Password<input id="confirmPassword" type="password" autocomplete="new-password" placeholder="Repeat password" required></label></div>
      <button class="action" id="authAction" type="submit">Create Account</button><p id="authMsg"></p><p class="switchText">Already have an account? <button class="linkBtn" id="switchLogin" type="button">Login</button></p>
    </form>`:
    `<form id="authForm" novalidate>
      <label>Email<input id="email" type="email" autocomplete="email" placeholder="you@example.com" required></label>
      <label>Password<input id="password" type="password" autocomplete="current-password" placeholder="Your password" required></label>
      <button class="action" id="authAction" type="submit">Login</button><button class="forgot" id="forgotBtn" type="button">Forgot your password?</button><p id="authMsg"></p><p class="switchText">Don't have an account? <button class="linkBtn" id="switchRegister" type="button">Register</button></p>
    </form>`;
  modal(title,body,true);
  $("authForm").onsubmit=async e=>{
    e.preventDefault();
    const email=$("email").value.trim(),password=$("password").value;
    try{
      buttonBusy("authAction",true,register?"Creating…":"Signing in…");
      if(register){
        const fullName=$("fullName").value.trim(),phone=$("phone").value.trim(),countryCode=$("countryCode").value,confirm=$("confirmPassword").value;
        if(!fullName||!email||!phone){message("authMsg","Please complete all required fields.");return}
        if(!password||password.length<6){message("authMsg","Password must be at least 6 characters.");return}
        if(password!==confirm){message("authMsg","Passwords do not match.");return}
        const cred=await createUserWithEmailAndPassword(auth,email,password);
        await updateProfile(cred.user,{displayName:fullName});
        await ensureUserDoc(cred.user,{fullName,phone,countryCode});
        closeModal();showApp();
      }else{
        if(!email||!password){message("authMsg","Enter your email and password.");return}
        await signInWithEmailAndPassword(auth,email,password);
        closeModal();showApp();
      }
    }catch(err){message("authMsg",friendlyAuthError(err));}
    finally{buttonBusy("authAction",false,"");}
  };
  if(register){$("switchLogin").onclick=()=>authModal(false);}else{$("switchRegister").onclick=()=>authModal(true);$("forgotBtn").onclick=forgotPassword;}
}
function friendlyAuthError(err){
  const c=err?.code||"";
  if(c.includes("email-already-in-use"))return"This email is already registered.";
  if(c.includes("invalid-credential")||c.includes("wrong-password")||c.includes("user-not-found"))return"Email or password is incorrect.";
  if(c.includes("invalid-email"))return"Please enter a valid email address.";
  if(c.includes("weak-password"))return"Password is too weak.";
  if(c.includes("too-many-requests"))return"Too many attempts. Please wait a moment and try again.";
  if(c.includes("network-request-failed"))return"Network error. Check your internet connection and try again.";
  return err?.message||"Something went wrong.";
}
async function forgotPassword(){
  const email=prompt("Enter your AXBET account email:");
  if(!email)return;
  try{await sendPasswordResetEmail(auth,email.trim());alert("Password reset email sent. Please check your inbox.");}
  catch(e){alert(friendlyAuthError(e));}
}

async function getUserRequests(type){
  const u=auth.currentUser;
  if(!u)return [];
  const snap=await getDocs(query(collection(db,type),where("uid","==",u.uid)));
  return snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
}
function formatRequestDate(value){
  if(!value)return "Date unavailable";
  const d=new Date(value);return Number.isNaN(d.getTime())?String(value):d.toLocaleString();
}
function statusBadge(status){
  const raw=String(status||"pending").trim();
  const st=raw.toLowerCase();
  let cls="pending";
  if(st.includes("successfully received")) cls="depositSuccess";
  else if(st.includes("successfully transferred")) cls="withdrawSuccess";
  else if(st==="approved"||st==="completed"||st==="success") cls="success";
  else if(st==="rejected"||st==="failed"||st==="cancelled") cls="failed";
  return `<span class="historyStatus ${cls}">${esc(raw)}</span>`;
}
function historyRows(items,type){
  if(!items.length)return `<div class="historyEmpty">No ${type} history found for this account.</div>`;
  return items.map(x=>{
    const amount=Number(x.amountPkr||0).toLocaleString();
    const extra=type==="deposit"?(x.reference?`Reference: ${esc(x.reference)}`:"No reference ID"):(`${esc(x.method||"Payment method unavailable")} • ${esc(x.account||"Account unavailable")}`);
    return `<div class="historyRow"><div class="historyMain"><strong>PKR ${amount}</strong><small>${extra}</small><small>${formatRequestDate(x.createdAt)}</small></div><div>${statusBadge(x.status)}</div></div>`;
  }).join("");
}
async function openHistory(type){
  const title=type==="deposit"?"Deposit History":"Withdrawal History";
  try{
    modal(title,`<div class="historyLoading">Loading ${type} history…</div>`);
    const items=await getUserRequests(type==="deposit"?"depositRequests":"withdrawalRequests");
    modal(title,`<div class="notice">Only requests belonging to the signed-in account are shown. Request status comes from the Firebase request record.</div><div class="historyList">${historyRows(items,type)}</div>`);
  }catch(e){
    modal(title,`<div class="historyEmpty">Unable to load ${type} history right now. Check the Firebase connection and Firestore rules.</div>`);
  }
}
async function loadHistoryCounts(uid){
  try{
    const [deposits,withdrawals]=await Promise.all([
      getDocs(query(collection(db,"depositRequests"),where("uid","==",uid))),
      getDocs(query(collection(db,"withdrawalRequests"),where("uid","==",uid)))
    ]);
    return {deposits:deposits.size,withdrawals:withdrawals.size};
  }catch(e){return {deposits:0,withdrawals:0};}
}
async function accountModal(){
  const u=auth.currentUser;if(!u){authModal(false);return}
  loadBalance(u.uid);
  getDoc(doc(db,"users",u.uid)).then(async s=>{
    const p=s.exists()?s.data():{};
    const bal=Number(p.balancePkr||0).toLocaleString();
    const counts=await loadHistoryCounts(u.uid);
    modal("My Profile",`<div class="profileHero"><img src="logo.png" alt="AXBET"><div><h3>${esc(p.fullName||u.displayName||"AXBET Member")}</h3><p>${esc(u.email||"")}</p><span>Member account • ${esc(p.countryCode||"+92")} ${esc(p.phone||"")}</span></div></div><div class="balanceCard"><small>AVAILABLE BALANCE</small><strong>PKR <span id="profileBalance">${bal}</span></strong><div class="balanceSub">Your displayed balance is controlled by your authorized account/admin workflow.</div></div><div class="profileStats"><div><b>${counts.deposits}</b><small>Deposits</small></div><div><b>${counts.withdrawals}</b><small>Withdrawals</small></div><div><b>${favorites.length}</b><small>Favorites</small></div></div><div class="profileGrid"><button class="profileAction" id="depositBtn"><b>＋</b><span>Deposits</span><small>Add a deposit request</small></button><button class="profileAction" id="withdrawBtn"><b>↗</b><span>Withdrawals</span><small>Submit a withdrawal request</small></button><button class="profileAction historyAction" id="depositHistoryBtn"><b>☷</b><span>Deposit History</span><small>${counts.deposits} request${counts.deposits===1?"":"s"}</small></button><button class="profileAction historyAction" id="withdrawHistoryBtn"><b>☷</b><span>Withdrawal History</span><small>${counts.withdrawals} request${counts.withdrawals===1?"":"s"}</small></button><button class="profileAction" id="settingsBtn"><b>⚙</b><span>Settings</span><small>Profile & account settings</small></button><button class="profileAction" id="helpBtn"><b>?</b><span>Help & Support</span><small>Account information</small></button><button class="profileAction danger" id="logout"><b>↪</b><span>Log Out</span><small>Sign out of this device</small></button></div>`);
    $("depositBtn").onclick=depositModal;$('withdrawBtn').onclick=withdrawModal;$('depositHistoryBtn').onclick=()=>openHistory("deposit");$('withdrawHistoryBtn').onclick=()=>openHistory("withdrawal");$("settingsBtn").onclick=settingsModal;$('helpBtn').onclick=helpModal;$('logout').onclick=()=>signOut(auth);
  }).catch(()=>modal("My Profile","<p>Unable to load your profile right now.</p>"));
}
function helpModal(){modal("Help & Support",`<div class="notice">Account access, profile updates, deposit requests and withdrawal requests are handled through the connected Firebase account and the app's authorized workflow.</div><div class="supportBox"><b>Login problems</b><p>Use Forgot your password from the login screen to request a reset email.</p></div><div class="supportBox"><b>Deposit problems</b><p>Keep your transaction/reference ID and submit one request. Requests remain pending until reviewed.</p></div><div class="supportBox"><b>Account security</b><p>Never share your password or verification information with another person.</p></div>`)}
function depositModal(){
  modal("Deposits",`<div class="notice">Use one of the available payment accounts below, then submit your request. This form records a request only and does not move money automatically.</div><div class="paymentCard"><strong>Rakhshanda Jabeen</strong><div class="payRow"><span>NayaPay</span><b>03359405954</b><button data-copy="03359405954">Copy</button></div><div class="payRow"><span>SadaPay</span><b>03359405954</b><button data-copy="03359405954">Copy</button></div><div class="payRow"><span>Upaisa</span><b>03359405954</b><button data-copy="03359405954">Copy</button></div><div class="payRow"><span>Easypaisa</span><b>03439881669</b><button data-copy="03439881669">Copy</button></div></div><label>Deposit Amount (PKR)<input id="depositAmount" type="number" min="1" inputmode="decimal" placeholder="Enter amount"></label><label>Reference / Transaction ID<input id="depositRef" placeholder="Transaction/reference number"></label><button class="action" id="submitDeposit">Submit Deposit Request</button><p id="depositMsg"></p>`);
  document.querySelectorAll("[data-copy]").forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);b.textContent="Copied";setTimeout(()=>b.textContent="Copy",1000);}catch{b.textContent="Copy manually";}});
  $("submitDeposit").onclick=async()=>{const amount=Number($("depositAmount").value);if(!amount||amount<=0){message("depositMsg","Enter a valid deposit amount.");return}try{buttonBusy("submitDeposit",true,"Submitting…");await addDoc(collection(db,"depositRequests"),{uid:auth.currentUser.uid,email:auth.currentUser.email||"",amountPkr:amount,reference:$("depositRef").value.trim(),status:"pending",createdAt:new Date().toISOString()});message("depositMsg","Deposit request submitted successfully.",true);$("depositAmount").value="";$("depositRef").value="";}catch(e){message("depositMsg","Could not submit request. Check your Firebase connection/security rules.");}finally{buttonBusy("submitDeposit",false,"");}};
}
function withdrawModal(){
  modal("Withdrawals",`<div class="notice">Withdrawal requests are submitted for review. No automatic transfer is performed from this form.</div><label>Amount (PKR)<input id="withdrawAmount" type="number" min="1" inputmode="decimal" placeholder="Enter amount"></label><label>Payment Method<select id="withdrawMethod"><option>NayaPay</option><option>SadaPay</option><option>Upaisa</option><option>Easypaisa</option><option>Bank Transfer</option></select></label><label>Account / Wallet Number<input id="withdrawAccount" inputmode="tel" placeholder="Enter account number"></label><button class="action" id="submitWithdraw">Submit Withdrawal Request</button><p id="withdrawMsg"></p>`);
  $("submitWithdraw").onclick=async()=>{const amount=Number($("withdrawAmount").value),account=$("withdrawAccount").value.trim();if(!amount||amount<=0||!account){message("withdrawMsg","Complete all required fields.");return}try{buttonBusy("submitWithdraw",true,"Submitting…");await addDoc(collection(db,"withdrawalRequests"),{uid:auth.currentUser.uid,email:auth.currentUser.email||"",amountPkr:amount,method:$("withdrawMethod").value,account,status:"pending",createdAt:new Date().toISOString()});message("withdrawMsg","Withdrawal request submitted successfully.",true);}catch(e){message("withdrawMsg","Could not submit request. Check your Firebase connection/security rules.");}finally{buttonBusy("submitWithdraw",false,"");}};
}
function settingsModal(){
  const u=auth.currentUser;
  getDoc(doc(db,"users",u.uid)).then(s=>{const p=s.exists()?s.data():{};modal("Settings",`<label>Full Name<input id="setName" value="${esc(p.fullName||u.displayName||"")}"></label><label>Email<input value="${esc(u.email||"")}" disabled></label><label>Country Code<select id="setCountry">${countries.map(([c,n])=>`<option value="${c}" ${c===(p.countryCode||"+92")?"selected":""}>${c} ${n}</option>`).join("")}</select></label><label>Phone Number<input id="setPhone" inputmode="tel" value="${esc(p.phone||"")}"></label><button class="action" id="saveSettings">Save Settings</button><button class="forgot" id="settingsReset">Send Password Reset Email</button><p id="settingsMsg"></p>`);$("saveSettings").onclick=async()=>{try{buttonBusy("saveSettings",true,"Saving…");const name=$("setName").value.trim();if(!name){message("settingsMsg","Full name is required.");return}await updateProfile(u,{displayName:name});await setDoc(doc(db,"users",u.uid),{fullName:name,countryCode:$("setCountry").value,phone:$("setPhone").value.trim(),updatedAt:new Date().toISOString()},{merge:true});message("settingsMsg","Settings saved successfully.",true);$("accountQuick").innerHTML=`<span>◉</span> ${esc(name)}`;}catch(e){message("settingsMsg","Could not save settings. Please try again.");}finally{buttonBusy("saveSettings",false,"");}};$("settingsReset").onclick=async()=>{try{await sendPasswordResetEmail(auth,u.email);message("settingsMsg","Password reset email sent.",true)}catch(e){message("settingsMsg",friendlyAuthError(e))}};});
}
function showApp(){$("authGate").classList.add("hidden");$("authBar").classList.remove("hidden");}
function showGate(){$("authGate").classList.remove("hidden");$("authBar").classList.add("hidden");}
let matchesRefreshTimer = null;
let matchesLoading = false;

async function loadMatches(){
  if(matchesLoading)return;
  matchesLoading=true;
  try{
    const r=await fetch(`/matches.json?ts=${Date.now()}`,{
      cache:"no-store",
      headers:{"Cache-Control":"no-cache","Pragma":"no-cache"}
    });
    if(!r.ok)throw new Error("match file");
    const x=await r.json();

    // The backend now returns one authoritative status per event:
    // LIVE, UPCOMING, or RESULT. Never infer state from the displayed time.
    const events=Array.isArray(x.events)
      ? x.events
      : Array.isArray(x.matches) ? x.matches : [];

    data={
      series:Array.isArray(x.series)?x.series:[],
      events:events.map(e=>({
        ...e,
        status:String(e.status||"").toUpperCase()
      }))
    };

    setConnection(true);
    renderSeries();
    renderEvents();
  }catch(e){
    setConnection(false);
    renderSeries();
    renderEvents();
  }finally{
    matchesLoading=false;
  }
}

function startMatchesAutoRefresh(){
  if(matchesRefreshTimer)clearInterval(matchesRefreshTimer);
  matchesRefreshTimer=setInterval(()=>loadMatches(),5000);
}

$("gateLogin").onclick=e=>{e.preventDefault();authModal(false)};
$("gateRegister").onclick=e=>{e.preventDefault();authModal(true)};
$("balanceBtn").onclick=accountModal;
$("close").onclick=closeModal;
$("modal").addEventListener("click",e=>{if(e.target===$("modal"))closeModal()});
$("refresh").onclick=async()=>{const b=$("refresh");b.classList.add("spin");await loadMatches();setTimeout(()=>b.classList.remove("spin"),350)};
startMatchesAutoRefresh();

document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tabs button").forEach(x=>x.classList.remove("active"));b.classList.add("active");filter=b.dataset.filter;renderEvents()});
document.querySelectorAll(".bottom button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".bottom button").forEach(x=>x.classList.remove("active"));b.classList.add("active");if(b.dataset.page==="popular"){renderSeries();renderEvents()}if(b.dataset.page==="favorites"){const f=data.events.filter(e=>favorites.includes(e.id));modal("Favorites",f.length?f.map(e=>`<div class="favoriteRow">★ ${esc(e.teamA)} vs ${esc(e.teamB)}</div>`).join(""):"<p>No favorites yet.</p>")}if(b.dataset.page==="betslip")modal("Bet Slip","<div class=\"notice\">Selections added to the bet slip will appear here. The current build does not submit real-money wagers from this panel.</div><p>Your selections list is empty.</p>");if(b.dataset.page==="account")accountModal()});
$("search").onclick=()=>{const q=prompt("Search team or event");if(q)renderEvents(data.events.filter(e=>(e.teamA+" "+e.teamB+" "+(e.series||"")).toLowerCase().includes(q.toLowerCase())))};
window.addEventListener("online",()=>setConnection(true));window.addEventListener("offline",()=>setConnection(false));

onAuthStateChanged(auth,user=>{if(user){showApp();$("authBar").innerHTML=`<button class="accountBar" id="accountQuick"><span>◉</span> ${esc(user.displayName||user.email||"Account")}</button>`;$("accountQuick").onclick=accountModal;ensureUserDoc(user)}else{$("balance").textContent="0";showGate();}});
setConnection(navigator.onLine);
setTimeout(()=>$("splash").classList.add("hidden"),900);
loadMatches();

/* AXBET V5 back-navigation addition */

/* AXBET V5 back-navigation addition
   Uses browser history so Back returns to the actual previous view,
   rather than forcing navigation to Popular. */
(function () {
  if (window.__axbetV5BackNavigationInstalled) return;
  window.__axbetV5BackNavigationInstalled = true;

  function textOf(el) {
    return ((el && el.textContent) || "").trim().toLowerCase();
  }

  function isTargetView() {
    const body = document.body;
    if (!body) return false;
    const text = textOf(body);
    return (
      text.includes("bet slip") ||
      text.includes("betslip") ||
      text.includes("favorites") ||
      text.includes("favourites") ||
      text.includes("profile") ||
      text.includes("deposit history") ||
      text.includes("withdrawal history") ||
      text.includes("account activities")
    );
  }

  function addBackButton() {
    if (!isTargetView()) return;
    if (document.querySelector(".axbet-v5-back-button")) return;

    const candidates = Array.from(document.querySelectorAll(
      "main, section, [role='main'], .page, .content, .container, .modal, .panel"
    ));

    let target = candidates.find(function (el) {
      const t = textOf(el);
      return t.includes("bet slip") || t.includes("favorites") ||
             t.includes("favourites") || t.includes("profile") ||
             t.includes("deposit history") || t.includes("withdrawal history");
    }) || candidates[0];

    if (!target) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "axbet-v5-back-button";
    button.setAttribute("aria-label", "Go back");
    button.innerHTML = "<span aria-hidden='true'>←</span><span>Back</span>";

    button.addEventListener("click", function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Only a fallback when there is no browser history.
        // It does not replace normal back behavior.
        window.location.hash = "";
      }
    });

    target.insertBefore(button, target.firstChild);
  }

  addBackButton();

  const observer = new MutationObserver(function () {
    addBackButton();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.addEventListener("popstate", function () {
    setTimeout(addBackButton, 0);
  });
})();
setInterval(async () => { await loadMatches(); }, 5000);
