import $_2a9 from './$_2a9.js';$_2a9();import{execAsync as m,uniqueBy as me,index_useAppStorage as ne,index_useT as _e,index_useHttpModule as $,useGlobalStore as R,index_getConfig as fe,index_getConfigs as ae,isDef as pe,useRouterMethodsWithLang as j,createEvent as he,debounce as be,router_useRoute as ve,whenever as ye,InformationRouteName as Pe}from"../../../shared-assets/Desktop/__shared_base-app_c69ef01e26.js";import{createModel as oe,useErrorController as z,RequestError as J,useCoreConfig as H,isFrame as se}from"./entry-9812699cfc.js";import{ref as T,runtimeCore_esmBundler_computed as V,unref as l,isRef as D,runtimeCore_esmBundler_watch as E,onBeforeMount as Se}from"../../../shared-assets/Desktop/__shared__vue_58e4ccdf24.js";import{PARTITION_IDS_WITH_PRODUCT_IDS_FIELD_NAME as Ge,useGameCashback as Ae,LIVE_CASINO_FLAG_ICON_BY_LANGUAGE_MAP as ke}from"./9ba713ab5f.js";import{usePromotion as we}from"./b029ddf091.js";import{useIframePostMessageApi as re}from"./7054048f81.js";const Te=(e,t)=>e.trim().toLowerCase().includes(t.trim().toLowerCase()),Z=10,Re=async(e,t,a)=>{$_2a9();let n,o;if(!t.length)return;t.length>Z&&(t.length=Z);let s;try{s=([n,o]=m(()=>e.getItem("thirdPartyRecentlyPlayedGames")),n=await n,o(),n)}catch(i){}return s||(s={}),s[a]=t,e.setItem("thirdPartyRecentlyPlayedGames",s)},ie=async(e,t)=>{$_2a9();var a,n;let o,s,i;try{i=(n=((a=([o,s]=m(()=>e.getItem("thirdPartyRecentlyPlayedGames")),o=await o,s(),o))!=null?a:{})[t])!=null?n:[]}catch(r){i=[]}return i},Ce=async(e,t,a)=>{$_2a9();let n,o;const s=([n,o]=m(()=>ie(e,a)),n=await n,o(),n),i=me([JSON.parse(JSON.stringify(t)),...s],"id");return Re(e,i,a)},Le=async({partitionId:e,productsIds:t,titleSearch:a})=>{$_2a9();let n,o;const s=ne();let i=([n,o]=m(()=>ie(s,e)),n=await n,o(),n);return t&&t.length&&(i=i.filter(r=>t.includes(r.productId))),a&&(i=i.filter(({name:r})=>Te(r,a))),i.map(r=>oe(r))},nt=(e,t)=>{$_2a9();const a=ne();return Ce(a,e,t)},Q={0:"v3_tpp_widgets_casino_cashback",1:"v3_tpp_widgets_casino_cashback_vip"},ce=e=>{switch(e){case 996:return 824;case 999:return 825;default:return e}},Be=e=>Q[e]||Q[0],Fe=e=>e===1?"casino-game-live__ribbon--orange":"casino-game-live__ribbon--yellow",We=e=>{$_2a9();var t;return`${_e()(Be(e.id))} ${(t=e.percent)!=null?t:e.cashbackValue}%`},Oe=e=>{if(!(!(e!=null&&e.length)||e.includes(-1)))return e.map(ce).join(",")},le=e=>!!(e!=null&&e.some(t=>t===999||t===825)),ue=e=>Ge.includes(e)?"productIds":"brandIds",X={success:!1,games:[]},Ne=async({params:e,options:t,headers:a})=>{$_2a9();let n,o;const s=$(),{logError:i}=z();let r=!0;const{games:c}=([n,o]=m(()=>s("/service-api/third-party/aggregator/Games/Search",{method:"POST",headers:a,body:e,signal:t.signal,isUseXAuth:t.isUserAuth}).execute().catch(u=>{if(i({error:u,message:"[ThirdParty] error during load service Games/Search:"}),u instanceof J)throw u;return r=!1,{games:[]}})),n=await n,o(),n);return{success:r,games:c}},De=async({partitionId:e,subcategoriesIds:t,productsIds:a,gameIds:n,bonusId:o,titleSearch:s,limit:i,offset:r,filterType:c="or",abortController:u})=>{$_2a9();let g,f;const{fcountry:_,lng:P,whence:h,ref:y,gr:p}=H(),{isUserAuth:v}=R(),b=fe(594);if(!v&&le(t))return X;const G=ue(e),A={partIds:e===-1?void 0:[e],categoriesFilter:{ids:t!=null&&t.includes(-1)?void 0:t,type:c},...a?{[G]:a}:{},gameIds:n,demoExistsFilter:b?"onlyWithDemo":void 0,nameSubstr:s==null?void 0:s.trim(),bonusId:o,limit:i,skip:r},F={signal:u==null?void 0:u.signal,isUserAuth:v},C={"X-Language":P,"X-Whence":h,"X-FCountry":_,"X-Country":_,"X-Referral":y,"X-Group":p},{games:k,success:L}=([g,f]=m(()=>Ne({params:A,options:F,headers:C})),g=await g,f(),g);return{success:L,games:k}},Ee=async({params:e,options:t,headers:a})=>{$_2a9();let n,o;const s=$(),{logError:i}=z();let r=!0;const{games:c}=([n,o]=m(()=>s("/service-api/third-party/content-aggregator/agg_v3/api/v2/Games/List",{headers:a,params:e,signal:t.signal,isUseXAuth:t.isUserAuth}).execute().catch(u=>{if(i({error:u,message:"[ThirdParty] error during load service Games/List:"}),u instanceof J)throw u;return r=!1,{games:[]}})),n=await n,o(),n);return{success:r,games:c}},Ue=async({partitionId:e,subcategoriesIds:t,productsIds:a,gameIds:n,bonusId:o,titleSearch:s,limit:i,offset:r,filterType:c="or",isSmartSearchEnabled:u=!0,abortController:g})=>{$_2a9();let f,_;const[P,h]=ae(594,2186),{whence:y,fcountry:p,lng:v,gr:b,ref:G}=H(),{isUserAuth:A}=R();if(!A&&le(t)||g!=null&&g.signal.aborted)return X;const F=Array.isArray(a)&&a.length>0?a.join(","):void 0,C=Array.isArray(n)&&n.length>0?n.join(","):void 0,k=ue(e),L={partIds:e===-1?void 0:String(e),categoriesFilterIds:Oe(t),categoriesFilterType:c,...k?{[k]:F}:{},gameIds:C,bonusId:o,nameSubstr:s==null?void 0:s.trim(),limit:i,skip:r,demoExistsFilter:P?"onlyWithDemo":void 0,useSmartSearch:h&&u},x={signal:g==null?void 0:g.signal,isUserAuth:A},U={"X-Language":v,"X-Whence":y,"X-FCountry":p,"X-Country":p,"X-Referral":G,"X-Group":b},{games:w,success:q}=([f,_]=m(()=>Ee({params:L,options:x,headers:U})),f=await f,_(),f);return{success:q,games:w}},Ie=async()=>{$_2a9();let e,t;const{cashback:a,isLoaded:n,fetchCashback:o}=Ae();if(n.value||([e,t]=m(()=>o()),e=await e,t()),a.value)return[{...a.value,ribbonClass:Fe(a.value.id),ribbonTitle:We(a.value)}]},Me=e=>$_2a9() && e.length?e.map(t=>ke[t]).filter(pe):[],Xe=async({categoryId:e,brand:t,liveGamesSettings:a})=>{$_2a9();let n,o;if(e!==37)return;let s,i,r;return t.id===126&&(s=([n,o]=m(()=>Ie()),n=await n,o(),n)),a.flags&&(i=Me(a.flags)),a.limits&&(r=a.limits),{cashbackRibbons:s,flagsSrc:i,limits:r}},$e=e=>({isNew:e.includes("new"),isHot:e.includes("hot"),isPromo:e.includes("promo")}),ee=e=>{var t;return e.imgBackgroundImgPath&&e.imgOverlayPath?e.imgBackgroundImgPath:(t=e.imgLogoPath)!=null?t:""},He=e=>{var t;return e.imgBackgroundImgWebpPath&&e.imgOverlayWebpPath?e.imgBackgroundImgWebpPath:(t=e.imgWebpPath)!=null?t:""},xe=async({id:e,name:t,partId:a,categoryIds:n=[],isDemoAvailable:o,ribbons:s=[],product:i,brand:r,images:c={},liveGamesSettings:u={},needTransfer:g,bonusWageringBan:f,nameForUrl:_,isTest:P})=>{$_2a9();let h,y;const p=([h,y]=m(()=>Xe({categoryId:a,brand:r,liveGamesSettings:u})),h=await h,y(),h),{isNew:v,isHot:b,isPromo:G}=$e(s);return oe({id:e,name:t,categoryId:a,categories:n,hasDemo:o,productId:i.id,productName:i.name,brandId:r.id,brandName:r.name,brandPictogram:r.imgPictogramPath,brandBanner:r.imgBannerPath,image:c.imgLogoPath,imageWebpPath:c.imgWebpPath,imageVertical:c.imgVerticalPath,imageVerticalWebpPath:c.imgVerticalWebpPath,backgroundImgWebpPath:He(c),background:ee(c),backgroundImage:ee(c),logo:c.imgOverlayPath,logoWebpPath:c.imgOverlayWebpPath,isNew:v,isPromo:G,isHot:b,cashback:p==null?void 0:p.cashbackRibbons,limits:p==null?void 0:p.limits,flagsSrc:p==null?void 0:p.flagsSrc,flags:p==null?void 0:p.flagsSrc,slug:_,test:P,needTransfer:g,bonusWageringBan:f})},qe=e=>{var t;return(t=e.subcategoriesIds)!=null&&t.length?{...e,subcategoriesIds:e.subcategoriesIds.map(ce).filter(a=>!!a)}:e},Ve=e=>Promise.all(e.map(async t=>xe(t))),te=async e=>{$_2a9();var t;let a,n,o,s,i,r,c,u;if((t=e.abortController)!=null&&t.signal.aborted)return X;const[g,f]=ae(2585,2671),{subcategoriesIds:_}=e,P=_==null?void 0:_.includes(847);if(!g&&P)return{success:!0,games:([a,n]=m(()=>Le(e)),a=await a,n(),a)};let h;const y=qe(e);f?h=([o,s]=m(()=>Ue(y)),o=await o,s(),o):h=([i,r]=m(()=>De(y)),i=await i,r(),i);const p=([c,u]=m(()=>{var v;return Ve((v=h.games)!=null?v:[])}),c=await c,u(),c);return{success:h.success,games:p}},at=(e,t)=>{$_2a9();const a=$(),n=R(),{fcountry:o,ref:s}=H();return a("/service-api/third-party/promo-rng/api/start",{isUseXAuth:n.isUserAuth,params:{promo_action_id:e,ref_id:s,geo_id:t!=null?t:o}}).execute()},ot=(e,t)=>{$_2a9();const a=$(),n=R(),{fcountry:o,ref:s}=H();return a("/service-api/third-party/promo-rng/api/play",{isUseXAuth:n.isUserAuth,params:{promo_action_id:e,ref_id:s,geo_id:t!=null?t:o},method:"POST"}).execute()},je=16,st=({partitionId:e,subcategoryId:t=-1,productsIds:a,searchQuery:n,tournamentId:o,limit:s=je,isRedirectAllow:i=!1})=>{$_2a9();const r=T([]),c=T(0),u=V(()=>$_2a9() && l(r).length>0),g=T(!1),f=T(!1),_=T(!0),{logError:P}=z(),h=R(),{routerPushWithLang:y}=j(h.getLanguage),p=V(()=>$_2a9() && l(t)===999&&!h.isUserAuth),v=V(()=>{$_2a9();var d;return(d=l(t))!=null?d:-1}),b=T(),G=()=>{var d;b.value&&((d=b.value)==null||d.abort()),b.value=new AbortController},A=()=>{b.value=void 0},F=()=>{var d;b.value&&((d=b.value)==null||d.abort(),A())},C=async()=>{y({})},k=he(),L=async()=>{$_2a9();var d;let S,W,B,O,I,K,Y=!1;if(!(l(p)||l(g))){if(i&&((d=l(a))!=null&&d.includes(NaN))){_.value=!1,[S,W]=m(()=>C()),S=await S,W();return}G(),_.value=!0;try{const N={partitionId:l(e),subcategoriesIds:[v.value],productsIds:l(a),tournamentId:l(o),abortController:l(b),titleSearch:l(n),limit:l(s),offset:l(c)},{success:de,games:M}=([B,O]=m(()=>te(N)),B=await B,O(),B);de&&(r.value=[...l(r),...M],c.value+=M.length,f.value=!0,g.value=M.length<l(s)),i&&l(r).length===0&&([I,K]=m(()=>C()),I=await I,K()),k(M)}catch(N){if(N instanceof J){if(N.isCancel){Y=!0;return}A(),P({isOnlyMessage:!0,message:`[ThirdParty] cannot fetch games, error: ${N.message}`})}}finally{Y||(_.value=!1)}}},x=async()=>{$_2a9();let d,S;try{const W={partitionId:l(e),subcategoriesIds:[v.value],productsIds:l(a),tournamentId:l(o),abortController:l(b),titleSearch:l(n),limit:l(s),offset:0},{success:B,games:O}=([d,S]=m(()=>te(W)),d=await d,S(),d);B&&(r.value=O,f.value=!0,g.value=O.length<l(s))}catch(W){P({error:!0,message:"[ThirdParty] cannot fetch games, error: "})}},U=()=>{F(),f.value=!1,g.value=!1,r.value=[],c.value=0},w=async()=>{$_2a9();let d,S;U(),[d,S]=m(()=>L()),d=await d,S()},q=1e3/2,ge=be(w,q);return D(e)&&E(e,w),D(t)&&E(t,w),D(o)&&E(o,w),D(a)&&E(a,w),D(n)&&E(n,ge),{isLoading:_,games:r,isGamesAvailable:u,allGamesLoaded:g,firstGamesLoaded:f,onFetchGamesEvent:k,fetchGames:L,resetGames:U,updateGames:x}},ze=()=>({parseAdditionalData:(a={})=>{var n,o;return{bonusWinsData:(n=a==null?void 0:a.bonusWinsData)!=null?n:[],currency:(o=a==null?void 0:a.currency)!=null?o:""}},formatBonusName:(a,n="",o=!0)=>{const s=o?" ":"";switch(a.type){case"fs":return`${a.amount}${s}FS`;case"cash":return`${a.amount}${s}${n}`;case"deposit":return`${a.amount}%`;default:return""}}}),rt=()=>{$_2a9();const t=ve().name,{parseAdditionalData:a}=ze(),n=T(a()),{config:o,isLoaded:s,fetchConfig:i}=we(t);return ye(s,()=>{var r;const c=(r=o.value)==null?void 0:r.additionalData;n.value=a(c)}),Se(i),{isLoaded:s,routeName:t,additionalData:n}},it=()=>{$_2a9();const e=R(),{routerPushWithLang:t}=j(e.getLanguage),a=re(),n=se();return{openOfficeBonus:()=>{n?a.openBonus():t("/office/bonuses/wager")},openDeposit:()=>{n?a.openOfficeRechargePage():t("/office/recharge")}}},ct=()=>{$_2a9();const e=se(),t=re(),a=R(),{routerPushWithLang:n}=j(a.getLanguage);return{navigateToSlots:()=>{if(e){t.openThirdParty({section:"categories"},{type:"subcategory",id:String(1)});return}n("/slots")},navigateToBonus:()=>{if(e){t.openThirdParty({section:"promo"},{type:"prizes"});return}n("/office/bonuses/wager")},navigateToDeposit:()=>{if(e){t.openOffice({officePage:"recharge"});return}n("/office/recharge")},navigateToAccount:()=>{if(e){t.openOffice({officePage:"account"});return}n("/office/account")},navigateToSupport:()=>{if(e){t.openOffice({officePage:"support"});return}n("/office/support")},navigateToGame:_=>{if(e){t.openThirdParty({section:"categories"},{type:"game",partId:String(1),id:String(_)});return}n(`/slots?game=${_}`)},navigateToSettings:()=>{if(e){t.openOffice({officePage:"account"});return}n("/office/settings")},navigateToWebsiteRules:()=>{$_2a9();if(e){t.openInformation({page:Pe.MAIN_RULES});return}n("/information/rules/terms/1")}}},Je=`pirat_sit.png
size:2048,2048
filter:Linear,Linear
pma:true
Belt
bounds:1343,80,61,110
rotate:90
Cyrcle
bounds:1340,550,62,110
rotate:90
Hairs
bounds:1276,1150,495,896
Hairs_back
bounds:1879,903,161,255
Hand back
bounds:904,17,124,232
rotate:90
Hand front
bounds:400,12,268,156
Hat
bounds:746,143,705,358
Hat back
bounds:1746,208,404,203
rotate:90
Highlight l
bounds:1267,862,7,6
Highlight r
bounds:1773,1150,8,8
Keys
bounds:1879,814,87,112
rotate:90
Pupil l
bounds:670,144,26,24
Pupil r
bounds:2002,1920,26,27
Sclera l
bounds:1422,503,45,26
rotate:90
Sclera r
bounds:1223,841,42,27
Shadow belt
bounds:2002,1949,37,97
Shadow cyrcle
bounds:2,7,14,36
rotate:90
Shadow fingers
bounds:1340,522,26,80
rotate:90
Shadow hand back
bounds:1773,1160,227,187
Shadow keys
bounds:1223,521,91,115
rotate:90
Shin back
bounds:1773,1349,227,697
Shin front
bounds:1276,794,354,601
rotate:90
Sholder front
bounds:1453,166,291,446
Torso
bounds:2,503,548,1219
rotate:90
Upper Leg front
bounds:2,170,742,331
closed-l
bounds:1455,112,68,52
closed-r
bounds:1244,2,81,62
forearm strong
bounds:1223,614,178,483
rotate:90
hand idle
bounds:1746,6,281,200
lower teeth
bounds:1223,870,89,47
rotate:90
oral
bounds:1138,60,104,81
shadow front
bounds:1708,614,178,158
rotate:90
shadow lower teeth
bounds:1138,11,89,47
shadow strong
bounds:670,11,232,130
shadow upper teeth
bounds:1223,961,90,48
rotate:90
shoulder strong
bounds:2,23,145,396
rotate:90
stone
bounds:2,1053,1272,993
tongue
bounds:1244,66,97,75
upper teeth
bounds:1993,810,91,53
rotate:90

pirat_sit_2.png
size:2048,512
filter:Linear,Linear
pma:true
Foot back
bounds:1801,175,329,225
rotate:90
Foot front
bounds:796,3,350,205
Forearm back
bounds:1426,275,373,229
Forearm front
bounds:796,210,308,294
Shadow hat
bounds:1426,49,370,224
Sholder back
bounds:436,206,298,358
rotate:90
Upper Leg back
bounds:2,77,432,427
forearm idle
bounds:1106,221,318,283
hand strong
bounds:1798,2,238,171
shadow idle
bounds:1148,18,201,210
rotate:90
`,lt=Object.freeze(Object.defineProperty({__proto__:null,default:Je},Symbol.toStringTag,{value:"Module"}));export{je as DEFAULT_REQUEST_LIMIT,nt as addGameToRecentlyPlayedStorage,at as getGameInfo,te as getGamesBy,ot as participateInGame,lt as pirat_sit,st as useGames,it as useNavigation,ct as useTreasureHuntNavigation,rt as useWelcomeBonus,ze as welcomeBonusUtils};
