const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./entry-9812699cfc.js","./368c2257ae.css","./923f79380a.js","./5ec4946244.js","./9ba713ab5f.js","./243bebfb0d.css","./bb3928369e.js","./b4c98828f9.css"])))=>i.map(i=>d[i]);
import $_2a9 from './$_2a9.js';$_2a9();import{UiPreloader as J,index_useCookies as Y,useStorage as Q,useGlobalStore as d,useRouterMethodsWithLang as f,router_useRouter as X,router_useRoute as ee,InformationRouteName as v,index_useEventListener as te,index_useVModal as k,navigateTo as oe,useCoreBus as C,index_getConfig as B,browser_useSharedStore as ne,whenever as se,index_useT as ie}from"../../../shared-assets/Desktop/__shared_base-app_c69ef01e26.js";import{CookieKeys as ae,__vitePreload as S,isFrame as l,messageTypes as g,setTimeoutSafe as re,useShowRegistrationForm as ce,useShowLoginDropdown as le,useNotificationStore as ue,isV2Project as ge,useSectionAvailability as pe}from"./entry-9812699cfc.js";import{ref as M,runtimeCore_esmBundler_computed as F,defineComponent as de,resolveComponent as he,openBlock as fe,createBlock as me,unref as be}from"../../../shared-assets/Desktop/__shared__vue_58e4ccdf24.js";const L=({name:e,component:t,componentLoader:o=J,middleware:n=[],excludesMiddleware:s=[],options:i})=>$_2a9() && ({name:e,component:t,componentLoader:o,options:i,middleware:[...n].filter(r=>!s.includes(r))}),U=e=>$_2a9() && !Y().get(ae.IS_AUTOTESTING_MODE)?L(e):Q("is_autotesing_without_notifications",!1,sessionStorage).value?{name:"DummyNotification",middleware:[],component:()=>S(()=>import("./entry-9812699cfc.js").then(s=>s.Dummy$1),__vite__mapDeps([0,1]),import.meta.url)}:L(e),Pe=200,_e=()=>{$_2a9();const e=d(),{getLinkWithLang:t}=f(e.getLanguage);return t("/promo")},Te=e=>{try{if(window.MobileAppApi){const{type:t,data:o={},...n}=e;window.MobileAppApi.postMessage(JSON.stringify({...o,...n,type:t}))}if(window.MobileAppApiV2){const{type:t,data:o={},...n}=e;window.MobileAppApiV2.postMessage(JSON.stringify({type:t,data:{...o,...n}}))}}catch(t){console.error("Iframe post message wasn't send (for android)",t,"Message:",e)}},Ae=e=>{var t,o,n,s;const{type:i,data:r={},...u}=e!=null?e:{};if(console.log("[ThirdParty mobile debug] sendMessageToIosApp",{oldData:{...r,...u,type:i},newData:{type:i,payload:{data:{...r,...u}}}}),(t=window.webkit)!=null&&t.messageHandlers){console.log("[ThirdParty mobile debug] has messageHandlers");try{(o=window.webkit)!=null&&o.messageHandlers.promotion&&(console.log("[ThirdParty mobile debug] send old postback",{...r,...u,type:i}),(s=(n=window.webkit.messageHandlers)==null?void 0:n.promotion)==null||s.postMessage({...r,...u,type:i}).catch(p=>{console.error("Iframe post message wasn't send (for ios)",p,"Message:",e)})),console.log("[ThirdParty mobile debug] send new postback",{type:i,payload:{data:{...r,...u}}}),window.webkit.messageHandlers[i].postMessage({data:{...r,...u}}).catch(p=>{console.error("Iframe post message wasn't send (for ios)",p,"Message:",e)})}catch(p){console.error("Iframe post message wasn't send (for ios)",p,"Message:",e)}}},Oe=e=>{var t;if((t=window.top)!=null&&t.postMessage)try{const{type:o,data:n={},...s}=e;window.top.postMessage({...n,...s,type:o},"*")}catch(o){console.error("Iframe post message wasn't send",o,"Message:",e)}},a=e=>{e!=null&&e.type||console.error(`Can't send data without required "type" parameter`,"Message:",e),console.log("[ThirdParty mobile debug] sendMessageToHostApp"),Oe(e),Te(e),Ae(e)},b=(e,t=!1)=>{$_2a9();if(l()){a({type:g.IFRAME_CHANGE_ROUTE,path:e,isChangeDomain:t});return}const o=X();ee().fullPath!==e&&o.push(e)},Re=()=>{b(_e()),l()&&a({type:"IFRAME_OPEN_PROMO_STORE"})},Ee=e=>{l()&&a({type:"IFRAME_OPEN_PROMOPAGE",...e})},ye=()=>{a({type:g.IFRAME_GO_BACK})},W=Object.freeze({1:"football",2:"ice-hockey",4:"tennis",26:"formula-1",40:"esports",66:"cricket",85:"fifa"}),Se=e=>Object.hasOwnProperty.call(W,e),H=({path:e,...t})=>{$_2a9();const o=d(),{getLinkWithLang:n}=f(o.getLanguage);if(!e){const s=[];t.pageType&&s.push(t.pageType),s.push(t.section),t.menuSection&&s.push(t.menuSection);const{sportId:i}=t;if(i)if(Se(i)){const r=W[i];s.push(r)}else throw new Error(`[IframePostMessageApi.openBetting]: No path found for sportId=${i}`);e=`/${s.join("/")}`}return n(`/${e}`.replace(/\/\//g,"/"))},we=(e,t={})=>{b(H(e)),l()&&a({type:"IFRAME_OPEN_BETTING",...e,...t})},z=e=>{$_2a9();var t;const o=d(),{getLinkWithLang:n}=f(o.getLanguage);return n(`/allgamesentrance${(t=e.path)!=null?t:""}`)},Ne=(e={})=>{b(z(e)),l()&&a({type:"IFRAME_OPEN_ALL_GAMES_ENTRANCE",...e})},G=(e={})=>{$_2a9();const t=d(),{getLinkWithLang:o}=f(t.getLanguage),{page:n=v.RULES,category:s}=e||{};let i=`/bonus/${n}`;return s&&(i+=`?category=${s}`),o(i)},Ie=(e={})=>{if(b(G(e)),l()){const{category:t}=e||{};a({type:"IFRAME_OPEN_BONUS",category:t})}},$=(e={})=>{$_2a9();const t=["information"],{page:o}=e,n=d(),{getLinkWithLang:s}=f(n.getLanguage);return o&&t.push(o),s(`/${t.join("/")}`)},Me=(e={})=>{b($(e)),l()&&a({type:"IFRAME_OPEN_INFORMATION",...e})},D=e=>{$_2a9();const t=d(),{getLinkWithLang:o}=f(t.getLanguage);return o(`/office/${e.officePage}`)},Le=e=>{b(D(e)),l()&&(e.officePage==="recharge"?a({type:"IFRAME_OPEN_TOP_UP"}):e.officePage==="support"?a({type:"IFRAME_OPEN_SUPPORT"}):a({type:"IFRAME_OPEN_OFFICE",page:e.officePage}))},j=e=>{$_2a9();const t=d(),{getLinkWithLang:o}=f(t.getLanguage);return o(`/promotions/${e.pagePath}`)},ve=e=>{l()?a({type:"IFRAME_OPEN_BETTING",...e}):b(j(e))},y={slots:1,bingo:47,keno:49,fishingHunting:12,poker:24,liveCasino:37,virtualSports:41,tvGames:51,slotsVulkan:65,scratchCards:66,crashGames:149,asianGames:151,cardGames:99,skillGames:103},ke=e=>{var t;if("path"in e)return null;switch(e.section){case"myCasino":return{section:"mycasino",type:"category"};case"lkCashback":return{section:"mycasino",type:"vipcashback"};case"lobby":return{section:"categories",type:"category"};case"slots":case"bingo":case"keno":case"fishingHunting":case"poker":case"liveCasino":case"virtualSports":case"tvGames":case"slotsVulkan":case"scratchCards":case"crashGames":case"asianGames":case"cardGames":case"skillGames":return e.game?{section:"categories",type:"game",id:e.game,needTransfer:"false"}:(t=e.products)!=null&&t.length?{section:"categories",type:"provider",partId:y[e.section],id:e.products[0]}:e.subcategory?{section:"categories",type:"subcategory",id:y[e.section],filterId:String(e.subcategory)}:{section:"categories",type:"subcategory",id:y[e.section]}}return null},V=e=>{$_2a9();const t=d(),{getLinkWithLang:o}=f(t.getLanguage);if("path"in e)return`${e.path}`;const{section:n,...s}=e,i={};Object.entries(s).forEach(([u,p])=>{i[u]=p.toString()});const r=new URLSearchParams(i);return o(`/${n}?${r.toString()}`)},Ce=(e={section:"slots"},t=null)=>{t||(t=ke(e)),b(V(e)),console.log("[ThirdParty mobile debug] openThirdParty"),l()&&a({type:"IFRAME_OPEN_CASINO",...e,data:{...t}})};var Be=Object.defineProperty,Fe=(e,t,o)=>t in e?Be(e,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[t]=o,c=(e,t,o)=>Fe(e,typeof t!="symbol"?t+"":t,o);class Ue{constructor(){c(this,"goBack",ye),c(this,"changeRoute",b),c(this,"openBetting",we),c(this,"getOpenBettingPath",H),c(this,"openOurGamesEntrance",Ne),c(this,"getOpenOurGamesEntrancePath",z),c(this,"openBonus",Ie),c(this,"getOpenBonusPath",G),c(this,"openInformation",Me),c(this,"getOpenInformationPath",$),c(this,"openOffice",Le),c(this,"getOpenOfficePath",D),c(this,"openPromotion",ve),c(this,"getOpenPromotionPath",j),c(this,"openThirdParty",Ce),c(this,"getThirdPartyPath",V),c(this,"openPromoStore",Re),c(this,"openPromoPage",Ee)}initNotification(){console.log("[ThirdParty mobile debug] initNotification"),a({type:g.IFRAME_INIT})}authorization(){console.log("[ThirdParty mobile debug] authorization"),a({type:g.IFRAME_AUTHORIZATION})}registration(){console.log("[ThirdParty mobile debug] registration"),a({type:g.IFRAME_REGISTRATION})}scrollToTop(){a({type:g.IFRAME_SCROLL_TO_TOP})}openOfficeRechargePage(){a({type:g.IFRAME_OPEN_TOP_UP})}scrollToBottom(){a({type:g.IFRAME_SCROLL_TO_BOTTOM})}updateFrameHeight(t){a({type:g.IFRAME_UPDATE_FRAME_HEIGHT,height:t})}openHome(){a({type:g.IFRAME_OPEN_HOME}),this.changeRoute(this.getOpenHomePath())}openSupport(){a({type:g.IFRAME_OPEN_SUPPORT})}pageNotFound(){a({type:g.IFRAME_PAGE_NOT_FOUND})}getOpenHomePath(){return"/"}showFrame(){a({type:g.IFRAME_SHOW_CONTENT})}hideFrame(){a({type:g.IFRAME_HIDE_CONTENT})}setMetaTitle(t){a({type:g.IFRAME_CHANGE_TITLE,title:t})}openLinkInBrowser(t){a({type:g.IFRAME_OPEN_LINK_IN_BROWSER,link:t})}}const T=()=>new Ue,Ze=()=>{$_2a9();const e=(m,h="smooth")=>()=>{const _=document.getElementById(m);_==null||_.scrollIntoView({behavior:h})},t=m=>{const h=document.getElementById(m);if(!h)return;const _=h.getBoundingClientRect().top+window.scrollY;window.scrollTo({top:_,behavior:"smooth"})},o=(m="auto")=>{l()?T().scrollToTop():window.scrollTo({top:0,behavior:m})},n=M(!1),s=M(),i=()=>{n.value=!0,clearTimeout(s.value),s.value=re(()=>{n.value=!1},Pe)};let r;return{isScrolling:n,scrollTo:e,scrollToTarget:t,scrollToTop:o,startListenScroll:()=>{$_2a9();r=te(window,"scroll",i)},stopListenScroll:()=>{r==null||r()},blockScroll:()=>{document.body.style.overflow="hidden"},releaseScroll:()=>{document.body.style.overflow=""},adjustScrollPosition:(m,h,_=0)=>{const N=m.getBoundingClientRect();h.forEach(({selector:q,direction:R})=>{const I=document.querySelector(q);if(!I)return;const E=I.getBoundingClientRect(),K=N.top<E.bottom,Z=N.bottom>E.top;(R===-1&&K||R===1&&Z)&&window.scrollBy(0,R*E.height-_)})}}},Je=()=>{const e=T();return()=>{e.updateFrameHeight(document.body.clientHeight)}},We=()=>{$_2a9();const e=k(),{showLoginDropdown:t}=le(),{showRegistrationForm:o}=ce(),n=T(),s=l();return{authorizationCallback:()=>{s?n.authorization():t(),e.hideAll()},registrationCallback:()=>{s?n.registration():o(),e.hideAll()}}},x=()=>{$_2a9();const{getLanguage:e}=d(),{routerPushWithLang:t,getLocationWithLang:o}=f(e);return{goToRegistrationPage:()=>t("/registration"),goToRegistrationPageWithCasinoBonus:()=>t("/registration?bonus=CASINO"),goToRegistrationPageWithCasinoBonusByPhone:()=>t("/registration?bonus=CASINO&type=phone"),goToRegistrationPageWithCasinoBonusByEmail:()=>t("/registration?type=email&bonus=CASINO"),goToRegistrationPageWithReturnUrl:P=>$_2a9() && oe(o(`/registration?redirectUrl=${P}`)),goToAuthorizationPage:()=>t("/user/login"),goToAuthorizationPageWithReturnUrl:P=>t(`/user/login?return-url=${P}`)}},He=()=>{$_2a9();const e=k(),t=C(),o=l(),{authorizationCallback:n,registrationCallback:s}=We();x();const i=T(),r=B(263);return{onAuthorizationCallback:A=>{if(o){i.authorization(),e.hideAll();return}n(),e.hideAll()},onRegistrationCallback:A=>{if(r){e.hideAll(),t.emit("maybeShowTrustlyDepositModal");return}if(o){i.registration(),e.hideAll();return}s(),e.hideAll()}}},O="NOTIFICATION_USER_NOT_AUTHORIZED_NAME",ze=()=>U({name:O,component:()=>S(()=>import("./923f79380a.js"),__vite__mapDeps([2,0,1,3,4,5]),import.meta.url)}),Ge=()=>U({name:O,component:()=>S(()=>import("./bb3928369e.js"),__vite__mapDeps([6,0,1,7]),import.meta.url)}),Ye=()=>{$_2a9();const{openNotifications:e,notificationHide:t,notificationShow:o}=ue(),{onAuthorizationCallback:n,onRegistrationCallback:s}=He(),r=ne().get(3,!1),u=()=>{const m=e.value.find(({name:h})=>h.includes(O));m&&t(m.name)},p=()=>{u(),s()},A=()=>{u(),n()},P=()=>{e.value.some(({name:h})=>h.includes(O))||o(ze())},w=()=>{e.value.some(({name:h})=>h.includes(O))||o(Ge())};return se(r,u),{registerWithHidingNotifications:p,loginWithHidingNotifications:A,showNotificationUserNotAuthorized:P,showNotificationPromoUserNotAuthorized:w}},Qe=e=>{$_2a9();const t=d(),{getLinkWithLang:o}=f(t.getLanguage);return{pageLocation:o(e)}},Xe=()=>{$_2a9();const e=d(),t=F(()=>e.isUserAuth),{routerPushWithLang:o}=f(e.getLanguage),{goToRegistrationPage:n}=x();return{navigateToRechargeOrRegistration:()=>{if(!t.value){n();return}o("/office/recharge")}}},et=()=>{$_2a9();const e=C(),t=l(),{getLanguage:o}=d(),n=T();f(o);const s=()=>{ge()?e.emit("triggerShowConsultant"):e.emit("showConsultant")};return{openSupport:(r=!0)=>{if(t){n.openSupport();return}s()},showConsultant:s}},tt=()=>{$_2a9();const e=d(),t=T(),{routerPushWithLang:o}=f(e.getLanguage);return{navigateToAccountPage:()=>{if(l()){t.openOffice({officePage:"account"});return}o("/office/account")},navigateToSettingsPage:()=>{if(l()){t.openOffice({officePage:"account"});return}o("/office/settings")},navigateToRulesPage:()=>{$_2a9();if(l()){t.openInformation({page:v.RULES});return}o("/information/rules")},navigateToRechargePage:async()=>{if(l()){t.openOffice({officePage:"recharge"});return}o("/office/recharge")}}},$e="thirdPartyPromo",De=de({__name:"BonusesBreadcrumbs",props:{bonusName:{default:""}},setup(e){$_2a9();const t=ie(),{getLanguage:o}=d(),{isSectionVisible:n}=pe(),s=B(181),i=F(()=>[{id:"",ico:"home",link:{name:"main",params:{lng:o,section:""}},label:"",title:t("v3_tpp_app_common_main_page"),onClick:()=>{}},{id:"",ico:"",link:{name:n(16)?$e:"bonuses-rules",params:{lng:o,section:""}},label:t(s),title:t(s),onClick:()=>{}},...e.bonusName?[{id:"",ico:"",link:void 0,label:e.bonusName,title:e.bonusName,onClick:()=>{}}]:[]]);return(r,u)=>{$_2a9();const p=he("UiBreadcrumbs");return fe(),me(p,{items:be(i)},null,8,["items"])}}}),ot=Object.freeze(Object.defineProperty({__proto__:null,default:De},Symbol.toStringTag,{value:"Module"})),je=`piratka2.webp
size:2048,2048
filter:Linear,Linear
pma:true
body
bounds:2,156,1116,1871
cap_shadow
bounds:1120,68,564,294
closed-l
bounds:660,71,132,83
closed-r
bounds:1955,1099,96,73
rotate:90
extension cap
bounds:1749,226,518,207
rotate:90
glare-l
bounds:2,2,10,9
glare-r
bounds:343,19,7,7
hair
bounds:1120,746,833,1281
key
bounds:180,16,138,161
rotate:90
lower teeth
bounds:1955,1445,139,68
rotate:90
oral
bounds:343,28,164,126
radyzhka-l
bounds:1686,259,35,33
radyzhka-r
bounds:1955,969,35,36
ring
bounds:1955,1197,90,105
sclera-l
bounds:945,124,64,30
sclera-r
bounds:1686,294,68,37
rotate:90
shadow key
bounds:2,13,141,176
rotate:90
shadow lower teeth
bounds:1955,1304,139,68
rotate:90
shadow ring
bounds:1955,1007,90,73
rotate:90
shadow trenchik
bounds:794,89,65,149
rotate:90
shadow upper teeth
bounds:1955,1586,141,67
rotate:90
shoulder-l
bounds:1120,364,380,627
rotate:90
tongue
bounds:509,41,149,113
trenchik
bounds:1955,1872,74,155
upper teeth
bounds:1955,1729,141,74
rotate:90

piratka2_2.webp
size:2048,2048
filter:Linear,Linear
pma:true
cap
bounds:626,1496,1067,511
forearm-l
bounds:430,459,443,361
rotate:90
forearm-l2
bounds:2,2,491,370
hair-back
bounds:793,481,243,329
rotate:90
hair-shadow
bounds:2,904,622,1103
hand-l
bounds:1709,1123,440,272
rotate:90
hand-l2
bounds:1695,1565,442,285
rotate:90
hand_back
bounds:626,1001,493,1081
rotate:90
head
bounds:2,374,426,528
open mouth
bounds:793,726,325,273
shadow1
bounds:495,87,370,300
rotate:90
shadow2
bounds:1120,753,339,246
`,nt=Object.freeze(Object.defineProperty({__proto__:null,default:je},Symbol.toStringTag,{value:"Module"}));export{ot as BonusesBreadcrumbs,De as _sfc_main,b as changeRoute,H as getBettingPath,G as getBonusPath,$ as getInformationPath,D as getOfficePath,z as getOurGamesEntrancePath,V as getThirdPartyPath,we as openBetting,Ie as openBonus,Me as openInformation,Le as openOffice,Ne as openOurGamesEntrance,Ce as openThirdParty,nt as piratka2_webp,a as sendMessageToHostApp,We as useAuthModalButton,x as useAuthRedirects,T as useIframePostMessageApi,He as useLandingAuthMethods,tt as useNavigateToPage,Ye as useNotificationUserNotAuthorized,Qe as usePageLocation,Ze as useScrollHelpers,et as useShowConsultant,Je as useUpdateFrameHeight,Xe as useWelcomeBonusNavigation};
