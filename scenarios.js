// ═══════════════════════════════════════════════════════
//  CHAOS OR RELEASE v2 — MASTER SCENARIOS (FINAL)
//  All content from official Master Game Content PDF
// ═══════════════════════════════════════════════════════

const SCENARIOS = [

  // ════════════════════════════════════════════════════
  //  LEVEL 1 — THE DEPLOYMENT TRENCHES (14 rounds)
  // ════════════════════════════════════════════════════

  { id:'l1-1', level:1, round:1, levelName:'The Deployment Trenches', type:'text',
    title:'Q1 — The Last-Minute Checkout Bug',
    body:'A checkout bug has been found 10 minutes before go-live.\n\n→ Affects 2% of users with 10+ items in cart\n→ Fix takes 1 hour\n→ The sale starts in 2 hours\n→ All other functionality is working perfectly\n\nDeploy or Delay?',
    answer:'delay', explanation:'DELAY — You have a 2-hour buffer. Fixing a critical checkout bug before your biggest sale is worth the 1-hour delay. Never ship a known checkout bug.' },

  { id:'l1-2', level:1, round:2, levelName:'The Deployment Trenches', type:'text',
    title:'Q2 — The Old OS Login Crash',
    body:'The app crashes on login for 4% of users running old OS versions.\n\n→ 4% of 2,000,000 users = 80,000 users locked out\n→ No workaround available\n→ Fix requires 6 hours of QA\n→ Core app works fine for the other 96%\n\nDeploy or Delay?',
    answer:'delay', explanation:'DELAY — 80,000 users locked out is a P0 critical failure. You cannot release a broken login experience. Fix it first.' },

  { id:'l1-3', level:1, round:3, levelName:'The Deployment Trenches', type:'text',
    title:'Q3 — The Rate Limiter Misconfiguration',
    body:'The API rate limiter is set to 100 req/min instead of the intended 1000 req/min.\n\n→ Maximum real-world usage is only 80 req/min\n→ No user will ever hit the limit at current traffic\n→ Fix requires a full redeploy\n→ Zero user impact at current traffic levels\n\nDeploy or Delay?',
    answer:'deploy', explanation:'DEPLOY — Zero user impact. 80 req/min is less than the 100 limit. Ship now and fix the config value in the next cycle. No one is being blocked.' },

  { id:'l1-4', level:1, round:4, levelName:'The Deployment Trenches', type:'text',
    title:'Q4 — The API Documentation Typo',
    body:'A minor typo has been found in the API documentation.\n\n→ "recieve" instead of "receive" in one endpoint description\n→ All underlying API logic is 100% correct\n→ No functional impact whatsoever\n→ Developers can still integrate perfectly\n\nDeploy or Delay?',
    answer:'deploy', explanation:"DEPLOY — Typos in documentation are not release blockers. Never stall business value for a spelling error. Fix it in the next doc update." },

  { id:'l1-5', level:1, round:5, levelName:'The Deployment Trenches', type:'text',
    title:'Q5 — The Dev Environment Memory Warning',
    body:'High memory usage (90%) detected during testing.\n\n→ Only occurs in the development environment\n→ Production environment metrics are completely stable\n→ Production-parity tests have all passed\n→ Likely caused by dev tooling overhead\n\nDeploy or Delay?',
    answer:'deploy', explanation:"DEPLOY — Dev environment oddities should not stop a production release if prod-parity tests passed. Dev tooling inflates memory. Production is stable." },

  { id:'l1-6', level:1, round:6, levelName:'The Deployment Trenches', type:'text',
    title:'Q6 — The Security Patch',
    body:'A security patch is available for a medium-risk vulnerability.\n\n→ CVSS score: 5.4 (Medium risk)\n→ Patching and verification takes 2 hours\n→ Release is scheduled for right now\n→ Vulnerability is in a public-facing endpoint\n\nDeploy or Delay?',
    answer:'delay', explanation:'DELAY — Security takes precedence. A medium-risk vulnerability in a public release is a liability. Always patch before releasing to production.' },

  { id:'l1-7', level:1, round:7, levelName:'The Deployment Trenches', type:'text',
    title:'Q7 — The IE11 Visual Glitch',
    body:'Frontend colors appear slightly off-brand on Internet Explorer 11.\n\n→ Only 0.5% of total traffic uses IE11\n→ All functionality works correctly on IE11\n→ Chrome, Safari, Firefox, Edge: all perfect\n→ Pure cosmetic issue — no UX or checkout impact\n\nDeploy or Delay?',
    answer:'deploy', explanation:'DEPLOY — IE11 visual glitches affecting 0.5% of users are not worth delaying the release for the other 99.5%. Ship it and fix IE11 in a hotfix.' },

  { id:'l1-8', level:1, round:8, levelName:'The Deployment Trenches', type:'text',
    title:'Q8 — The Failed Migration Script',
    body:'A database migration script failed during staging deployment.\n\n→ Devs say "it\'s fine, we\'ll run it manually in production"\n→ Script failed with a foreign key constraint error\n→ Manual execution has not been tested or documented\n→ Production database has live customer data\n\nDeploy or Delay?',
    answer:'delay', explanation:"DELAY — Never 'run it manually' in production if it failed in staging. Fix the automation first. Manual DB migrations on live data = recipe for disaster." },

  { id:'l1-9', level:1, round:9, levelName:'The Deployment Trenches', type:'text',
    title:'Q9 — The Broken Analytics',
    body:'The analytics tool has stopped tracking button click events.\n\n→ Core application functionality is completely perfect\n→ Checkout, payments, auth — all working 100%\n→ Only click-tracking events are missing\n→ Revenue and UX are completely unaffected\n\nDeploy or Delay?',
    answer:'deploy', explanation:"DEPLOY — Analytics are secondary to user functionality. Do not stop the release. Fix click tracking in the next sprint. Users are not impacted." },

  { id:'l1-10', level:1, round:10, levelName:'The Deployment Trenches', type:'text',
    title:'Q10 — The Slow Password Reset',
    body:'Password reset emails are taking 5 minutes to arrive instead of 10 seconds.\n\n→ Users trying to reset their password are waiting 5+ minutes\n→ Many users are repeatedly clicking "Resend" creating a backlog\n→ This could lock users out of their accounts\n→ Email queue is growing exponentially\n\nDeploy or Delay?',
    answer:'delay', explanation:'DELAY — User experience failure. Users will spam the reset button causing a massive backlog and frustration. Fix the email service before releasing.' },

  { id:'l1-11', level:1, round:11, levelName:'The Deployment Trenches', type:'text',
    title:'Q11 — The Dark Mode OLED Flicker',
    body:'The new "Dark Mode" feature has a flickering bug on certain OLED screens.\n\n→ Only affects some OLED screen models\n→ Regular LCD screens: works perfectly\n→ Flickering is visual only — no data loss\n→ Dark Mode is a "nice-to-have" feature, not core functionality\n\nDeploy or Delay?',
    answer:'deploy', explanation:"DEPLOY — Dark Mode is a nice-to-have feature. Users can disable it or wait for a hotfix. A cosmetic bug on a non-core feature is not a release blocker." },

  { id:'l1-12', level:1, round:12, levelName:'The Deployment Trenches', type:'text',
    title:'Q12 — The Payment Gateway 500 Errors',
    body:'The third-party payment gateway is having intermittent 500 errors globally.\n\n→ Not your code — provider-side infrastructure issue\n→ 15-20% of payment attempts are failing\n→ Provider status page shows "Investigating"\n→ Your release includes critical payment feature updates\n\nDeploy or Delay?',
    answer:'delay', explanation:'DELAY — If payments fail, your release is considered a failure. Wait for provider stability before deploying. Timing matters.' },

  { id:'l1-13', level:1, round:13, levelName:'The Deployment Trenches', type:'text',
    title:'Q13 — The Log Space Bomb',
    body:'Application logs are filling up disk space 5x faster than normal.\n\n→ Current disk usage: growing at 10GB/hour\n→ Total disk space available: 50GB\n→ Core app performance: currently fast\n→ If disk fills: total system crash — everything goes down\n\nDeploy or Delay?',
    answer:'delay', explanation:'DELAY — You will have a total system crash (Disk Full) within hours. The core app will go down completely. Fix log verbosity before deploying anything.' },

  { id:'l1-14', level:1, round:14, levelName:'The Deployment Trenches', type:'text',
    title:'Q14 — The Deleted Test Database',
    body:'A developer accidentally deleted a "test_db" database during cleanup.\n\n→ Production database: completely unaffected\n→ All customer data: safe and intact\n→ Test database only contained dummy/seed data\n→ No CI/CD pipelines currently depend on this test DB\n\nDeploy or Delay?',
    answer:'deploy', explanation:"DEPLOY — Internal developer accidents should not stop the customer release pipeline. Production is unaffected. Recreate the test DB later." },

  // ════════════════════════════════════════════════════
  //  LEVEL 2 — THE ARCHITECT'S ANATOMY (6 rounds)
  // ════════════════════════════════════════════════════

  { id:'l2-1', level:2, round:1, levelName:"The Architect's Anatomy", type:'image_quiz',
    title:'Round 1: The First Request',
    body:"Traffic is leaving the user's laptop but is being blocked before it reaches the Web Server.\n\nThe 'Safety First' update is blocking ALL incoming traffic.\n\nIdentify the missing 'Gatekeeper' component represented by the '?'.",
    imageUrl:'/images/l2-1-firewall.svg',
    imageAlt:'Network diagram showing traffic blocked by unknown component',
    quiz:{ question:"What is the missing 'Gatekeeper' component represented by the '?'?",
      options:['A — Keyboard','B — Firewall / Router','C — Hard Drive','D — RAM'],
      correct:1, explanation:'A Firewall/Router is the network gatekeeper that controls which traffic is allowed through to the web server.' },
    answer:'delay', explanation:"DELAY — Never disable a firewall entirely in production. Write a specific Allow rule for Port 80 instead. Disabling the firewall is a critical security mistake." },

  { id:'l2-2', level:2, round:2, levelName:"The Architect's Anatomy", type:'image_quiz',
    title:'Round 2: The Memory Wall',
    body:"Look at the Telemetry Graph. The CPU is completely normal and stable.\n\nBut the system is crashing every 4 hours despite normal CPU usage.\n\nIdentify the software phenomenon you are witnessing.",
    imageUrl:'/images/l2-2-memoryleak.svg',
    imageAlt:'Telemetry showing normal CPU but rising memory',
    quiz:{ question:'What software phenomenon are you witnessing in this telemetry graph?',
      options:['A — Infinite Loop (CPU Spike)','B — Memory Leak','C — Disk Fragmentation','D — Power Surge'],
      correct:1, explanation:'Memory Leak: program allocates memory but never releases it. CPU stays normal while RAM climbs until crash.' },
    answer:'deploy', explanation:"DEPLOY — In DevOps, keeping the service Up while investigating is the priority. Deploy the auto-restart every 2 hours to stay online while the team finds the actual memory leak." },

  { id:'l2-3', level:2, round:3, levelName:"The Architect's Anatomy", type:'image_quiz',
    title:'Round 3: The Protocol Mismatch',
    body:"Users are trying to connect via HTTPS (Secure), but packets are being dropped at the Transport Layer.\n\nThe Transport Layer is configured to allow only 'Unreliable/Connectionless' traffic.\n\nIdentify what protocol is currently allowed.",
    imageUrl:'/images/l2-3-protocol.svg',
    imageAlt:'Transport layer dropping HTTPS packets due to wrong protocol',
    quiz:{ question:'What protocol is currently allowed at the Transport Layer (causing HTTPS to drop)?',
      options:['A — TCP','B — UDP','C — FTP','D — SSH'],
      correct:1, explanation:'UDP is connectionless and unreliable. HTTPS requires TCP for its reliable, connection-based TLS handshake.' },
    answer:'delay', explanation:"DELAY — Security over Availability. Never route users to unencrypted HTTP. Properly configure TCP/SSL. 10,000 users wait securely, not insecurely." },

  { id:'l2-4', level:2, round:4, levelName:"The Architect's Anatomy", type:'image_quiz',
    title:'Round 4: The 502 Ghost',
    body:"The Load Balancer is throwing a 502 Bad Gateway error for 33% of your users.\n\nAnalyze the load balancer diagram carefully.\n\nIdentify the root cause of the errors.",
    imageUrl:'/images/l2-4-loadbalancer.svg',
    imageAlt:'Load balancer with one dead server still in rotation',
    quiz:{ question:'What is the root cause of the 502 Bad Gateway errors?',
      options:['A — The Load Balancer is overloaded',"B — Server C is 'Dead' but the Load Balancer is still sending traffic to it",'C — The Database is full',"D — The User's internet is slow"],
      correct:1, explanation:'Server C crashed but remains in LB rotation. Every 3rd request hits the dead server, returning 502.' },
    answer:'deploy', explanation:"DEPLOY — Drain Server C from the Load Balancer immediately. Stop the 502 errors now — investigate why Server C died after stopping the bleeding." },

  { id:'l2-5', level:2, round:5, levelName:"The Architect's Anatomy", type:'image_quiz',
    title:'Round 5: The Database Deadlock',
    body:"The database has completely stopped processing all writes.\n\nAnalyze the circular dependency diagram between Transaction A and Transaction B.\n\nIdentify the database state shown.",
    imageUrl:'/images/l2-5-deadlock.svg',
    imageAlt:'Two transactions in circular lock dependency',
    quiz:{ question:'Based on this circular dependency, what state is the database in?',
      options:['A — Race Condition','B — Deadlock','C — Buffer Overflow','D — Cache Miss'],
      correct:1, explanation:'Deadlock: transactions each wait for a lock held by the other. Circular dependency where neither can proceed.' },
    answer:'deploy', explanation:"DEPLOY — Deploy the Kill All command to clear the deadlock. Standard recovery practice: clear the deadlock and let the app retry transactions automatically." },

  { id:'l2-6', level:2, round:6, levelName:"The Architect's Anatomy", type:'image_quiz',
    title:'Round 6: The WAF False Positive',
    body:"Your WAF is blocking all users with apostrophes in their names (O'Reilly, D'Angelo) during the BIGGEST SALE OF THE YEAR.\n\nIdentify what type of security event this is.",
    imageUrl:'/images/l2-6-waf.svg',
    imageAlt:'WAF blocking legitimate customers with apostrophe surnames',
    quiz:{ question:"Your WAF is blocking customers named O'Reilly and D'Angelo. This is a:",
      options:['A — Successful Hack Block','B — False Positive','C — Buffer Underflow','D — Zero-Day Exploit'],
      correct:1, explanation:'False Positive: security incorrectly flags legitimate traffic as malicious. WAF regex blocks valid surnames.' },
    answer:'delay', explanation:"DELAY — Bypassing a WAF on a search field during a high-traffic sale is an open invitation for real SQL Injection. Rewrite the WAF regex logic properly first." },

  // ════════════════════════════════════════════════════
  //  LEVEL 3 — DIGITAL FORENSIC TRAIL (8 missions)
  // ════════════════════════════════════════════════════

  { id:'l3-1', level:3, round:1, levelName:'Digital Forensic Trail', type:'forensic_trail',
    title:'Mission 1: The OS Crash',
    body:'The app is crashing for a segment of users. Investigate the trail to determine severity before making your final deployment decision.',
    clues:[
      { id:'c1', label:'Clue 1 — User Impact',
        text:'Total user base: 2,000,000\nPercentage on old OS: 4%\nCrash happens at login — zero access to the app.\n\nCalculate how many users are affected.',
        question:'2M users, 4% on old OS. How many users are affected?',
        options:['A — 40,000 users','B — 80,000 users','C — 100,000 users','D — 20,000 users'],
        correct:1, points:2, explanation:'4% of 2,000,000 = 80,000 users completely locked out.' },
      { id:'c2', label:'Clue 2 — Workaround',
        text:'Crash occurs at the login screen.\nNo cached session available.\nNo alternative login method exists.\nThese users cannot access ANY part of the app.',
        question:'Is there a workaround available for the 80,000 affected users?',
        options:['A — Yes, a workaround exists','B — No workaround available'],
        correct:1, points:2, explanation:'No workaround. 80,000 users are completely locked out.' },
      { id:'c3', label:'Clue 3 — Fix Timeline',
        text:'Root cause identified: incompatible API call on old OS.\nFix development: 2 hours.\nQA testing required: 6 hours total.\nNo shortcut available for QA.',
        question:'Given 80,000 users locked out with no workaround, what is the right call?',
        options:['A — Deploy anyway — 96% still work','B — Delay for safety — fix before release'],
        correct:1, points:2, explanation:'80,000 users locked out with no workaround is a P0. Fix before deploying.' }
    ],
    answer:'delay', explanation:'DELAY — 80,000 users locked out is a P0 critical failure. You cannot release a broken login. Fix it first, then deploy.' },

  { id:'l3-2', level:3, round:2, levelName:'Digital Forensic Trail', type:'forensic_trail',
    title:'Mission 2: The Rate Limit Mystery',
    body:'The API rate limiter seems misconfigured. Investigate whether this is actually a problem before deciding.',
    clues:[
      { id:'c1', label:'Clue 1 — Traffic Check',
        text:'Current API rate limit: 100 requests/minute\nIntended limit: 1,000 requests/minute\nMaximum real usage observed: 80 requests/minute\n\nThe limit is lower than intended — but does it matter?',
        question:'Max usage is 80 req/min and limit is 100. Will users be blocked?',
        options:['A — Yes, users will be blocked','B — No — 80 is under 100, no impact'],
        correct:1, points:2, explanation:'80 req/min is below the 100 req/min limit. No user will actually be rate-limited.' },
      { id:'c2', label:'Clue 2 — Security vs Config',
        text:'Security team: rate limit of 100 vs 1000 is a configuration error.\nNo evidence of malicious use.\nThe lower limit actually provides more DDoS protection.\nNo security vulnerability introduced.',
        question:'Is this a security risk or just a configuration error?',
        options:['A — Config Error only','B — Security Breach'],
        correct:0, points:2, explanation:'Config error only. The lower value actually offers more protection. No security risk.' },
      { id:'c3', label:'Clue 3 — Fix Complexity',
        text:'Changing rate limit value: 2 minutes of work.\nRequires: a full redeploy to take effect.\nCurrent release is already staged and ready.\nNo users are being blocked at current traffic.',
        question:'Should we delay the release for a 2-min config fix with zero user impact?',
        options:['A — Yes, delay and fix now','B — No — deploy now, fix in next cycle'],
        correct:1, points:2, explanation:'Zero user impact. Deploy now and fix the config value in the next release cycle.' }
    ],
    answer:'deploy', explanation:'DEPLOY — Zero user impact. Max usage (80) is below the misconfigured limit (100). Ship now and fix the rate limit config in the next deployment cycle.' },

  { id:'l3-3', level:3, round:3, levelName:'Digital Forensic Trail', type:'forensic_trail',
    title:'Mission 3: The Ghost in the Server',
    body:'A server is crashing every 4 hours. Investigate the telemetry to understand the root cause and best response.',
    clues:[
      { id:'c1', label:'Clue 1 — Telemetry',
        text:'CPU utilization: 10% (completely normal)\nRAM utilization: 98% (critical)\nPattern: RAM grows steadily from each restart.\nCPU stays flat while RAM climbs continuously.',
        question:'CPU is 10%, RAM is 98% and climbing. What is this?',
        options:['A — CPU Leak / Infinite Loop','B — Memory Leak'],
        correct:1, points:2, explanation:'Classic memory leak: CPU normal, RAM steadily climbs until system OOM crash.' },
      { id:'c2', label:'Clue 2 — Priority',
        text:'Server crashes every 4 hours after restart.\nDuring downtime: 100% of users affected for ~5 minutes.\nEngineering team: working on root cause fix.\nRoot cause fix ETA: 2-3 days of investigation.',
        question:'Server crashing every 4 hours — what priority is this?',
        options:['A — High Priority — needs immediate action','B — Medium Priority — can wait'],
        correct:0, points:2, explanation:'High Priority. Regular crashes every 4 hours is unacceptable. Needs immediate mitigation.' },
      { id:'c3', label:'Clue 3 — Mitigation',
        text:'Proposal: auto-restart the server every 2 hours.\nThis prevents the crash before RAM hits 100%.\nUsers experience zero downtime during graceful restart.\nBuys time for developers to find the actual leak.\nCan be deployed in 15 minutes.',
        question:'Can we deploy an auto-restart every 2 hours as a temporary patch?',
        options:['A — Yes — valid DevOps mitigation','B — No — only fix the root cause'],
        correct:0, points:2, explanation:'Auto-restart is a valid temporary mitigation. Keeps service up while team investigates.' }
    ],
    answer:'deploy', explanation:'DEPLOY — Deploy the auto-restart patch to keep the service running. Standard DevOps practice: mitigate first, investigate second. Users stay online while the team finds the memory leak.' },

  { id:'l3-4', level:3, round:4, levelName:'Digital Forensic Trail', type:'forensic_trail',
    title:'Mission 4: The Payment Proxy',
    body:'The payment gateway is returning errors. Investigate scope and options.',
    clues:[
      { id:'c1', label:'Clue 1 — Error Source',
        text:'Payment gateway returning 504 Gateway Timeout errors.\n504 = upstream server (provider) is not responding.\nYour application code: no changes made.\nProvider status page: shows active incident.\nMultiple companies affected globally.',
        question:'Gateway is returning 504 errors. Whose fault is this?',
        options:['A — Our code is at fault','B — Provider infrastructure fault'],
        correct:1, points:2, explanation:'504 errors indicate the upstream provider is timing out. Provider-side fault, not our code.' },
      { id:'c2', label:'Clue 2 — Revenue Impact',
        text:'Payment gateway handles ALL transactions.\nNo fallback payment method currently configured.\nCurrent error rate: 100% of payment attempts failing.\nRevenue: $0 processed per minute.',
        question:'Does this payment gateway issue affect 100% of revenue?',
        options:['A — Yes, 100% of payments failing','B — No, partial impact only'],
        correct:0, points:2, explanation:'Yes — 100% of revenue is blocked. No payment can be processed.' },
      { id:'c3', label:'Clue 3 — Backup Option',
        text:'Backup payment gateway (Stripe) exists in the system.\nSwitching: 10 minutes of configuration + deployment.\nBackup gateway: fully tested and verified.\nProvider ETA for fix: 2-4 hours (unknown).',
        question:'Can we switch to a backup gateway in 10 minutes?',
        options:['A — Yes, backup is available','B — No backup available'],
        correct:0, points:2, explanation:'Backup exists but deploying during an active incident carries its own risks.' }
    ],
    answer:'delay', explanation:'DELAY — Wait for provider stability, then deploy the backup gateway switch as a planned operation. Do not rush deployments during active incidents.' },

  { id:'l3-5', level:3, round:5, levelName:'Digital Forensic Trail', type:'forensic_trail',
    title:'Mission 5: The CSS Conflict',
    body:'A visual bug has been reported. Investigate the actual impact before deciding.',
    clues:[
      { id:'c1', label:'Clue 1 — Severity',
        text:'"Add to Cart" and "Checkout" buttons appear pink instead of red.\nBrand color #FF0000 (red) rendering as #FF69B4 (pink).\nCaused by a CSS specificity conflict.\nButtons are fully clickable and functional.',
        question:'Buttons are pink instead of red — how severe is this?',
        options:['A — P0 Critical — immediate fix required','B — P3 Low — cosmetic issue only'],
        correct:1, points:2, explanation:'P3 — cosmetic only. The buttons still work, users can still checkout.' },
      { id:'c2', label:'Clue 2 — Functional Impact',
        text:'Checkout flow tested end-to-end: WORKING\nAdd to cart: WORKING\nPayment processing: WORKING\nOrder confirmation: WORKING\nAll business logic: completely unaffected by CSS.\nOnly visual appearance is impacted.',
        question:'Does the pink button bug break any checkout logic?',
        options:['A — Yes, checkout is broken','B — No, all logic works perfectly'],
        correct:1, points:2, explanation:'No functional impact. Checkout works perfectly. Users can complete purchases.' },
      { id:'c3', label:'Clue 3 — Financial Risk',
        text:'Users can see products: YES\nUsers can add to cart: YES\nUsers can checkout: YES\nUsers can pay: YES\nUsers receive confirmation: YES\nDifference: pink buttons instead of red buttons.\nFinancial risk to users: NONE',
        question:'Will users lose money because of this CSS bug?',
        options:['A — Yes, financial risk to users','B — No, zero financial risk'],
        correct:1, points:2, explanation:'Zero financial risk. Users lose nothing. Pink vs red buttons is purely cosmetic.' }
    ],
    answer:'deploy', explanation:'DEPLOY — Pure cosmetic issue. Buttons work, checkout works, payments work. Ship the release and fix the CSS color in a hotfix.' },

  { id:'l3-6', level:3, round:6, levelName:'Digital Forensic Trail', type:'forensic_trail',
    title:'Mission 6: The SQL Injection Scare',
    body:"The WAF is blocking legitimate users. Investigate whether this is a security victory or a dangerous misconfiguration.",
    clues:[
      { id:'c1', label:'Clue 1 — WAF Alert',
        text:"WAF alert log:\nBLOCKED: Search query containing \"O'Brian\"\nWAF rule triggered: apostrophe character detected\nRule intent: block SQL injection attempts\nO'Brian is a legitimate Irish surname.\nThe user was searching for their own name.",
        question:"WAF blocked a search for \"O'Brian\". Real attack or false positive?",
        options:["A — Real SQL injection attack blocked","B — False Positive — legitimate user blocked"],
        correct:1, points:2, explanation:"False positive. O'Brian is a real surname. The WAF regex is too aggressive." },
      { id:'c2', label:'Clue 2 — Scope',
        text:"WAF rule blocks ALL apostrophe characters in search.\nAffected surnames: O'Brien, O'Reilly, D'Angelo, D'Souza...\nCommon Irish, Italian, French surnames.\nEstimated: 3-5% of user base cannot use search.",
        question:"Are ALL users with apostrophes in their names blocked from searching?",
        options:["A — Yes, all apostrophe names blocked","B — No, only some affected"],
        correct:0, points:2, explanation:"Yes — any name with an apostrophe triggers the WAF block." },
      { id:'c3', label:'Clue 3 — Security Posture',
        text:"The search field code: NOT sanitized against SQL injection.\nWAF is the ONLY protection layer.\nIf we bypass WAF: search vulnerable to real SQL injection.\nCorrect fix: parameterized queries in the code.\nFix time: 2-3 hours.",
        question:"Is the search field code sanitized against SQL injection?",
        options:["A — Yes, it is sanitized","B — No, WAF is the only protection"],
        correct:1, points:2, explanation:"Not sanitized. Bypassing WAF without fixing code = open SQL injection vulnerability." }
    ],
    answer:'delay', explanation:'DELAY — The search field is not sanitized. Bypassing the WAF without fixing the underlying code leaves you vulnerable to real SQL injection. Fix parameterized queries first, then update WAF rule.' },

  { id:'l3-7', level:3, round:7, levelName:'Digital Forensic Trail', type:'forensic_trail',
    title:'Mission 7: The Disk Space Devourer',
    body:'Log files are consuming disk space at an alarming rate. Investigate the timeline and decide.',
    clues:[
      { id:'c1', label:'Clue 1 — Timeline',
        text:'Disk capacity: 50 GB total\nLog growth rate: 10 GB per hour\nCurrent usage: 20 GB used\nAvailable space: 30 GB remaining\nWhen disk hits 100%: total system crash.',
        question:'Logs at 10GB/hour, 30GB remaining. How long until disk is full?',
        options:['A — 10 hours left','B — 5 hours left','C — 3 hours left','D — 1 hour left'],
        correct:1, points:2, explanation:'30 GB ÷ 10 GB/hour = 3 hours until total system crash.' },
      { id:'c2', label:'Clue 2 — Log Options',
        text:'Option A: Turn off logging entirely.\nProblem: Compliance regulations require audit logs.\nTurning off logs = regulatory violation.\nOption B: Reduce log verbosity (DEBUG → INFO).\nThis requires a redeploy.',
        question:'Can we simply turn off logs to save disk space?',
        options:['A — Yes, turn them off','B — No — compliance requires audit logs'],
        correct:1, points:2, explanation:'Cannot turn off logs — compliance regulations mandate audit logging.' },
      { id:'c3', label:'Clue 3 — Current Impact',
        text:'Application response time: NORMAL (120ms)\nDatabase queries: NORMAL\nUser experience: CURRENTLY FINE\nBUT: disk fills in ~3 hours at current rate.\nWhen disk hits 100%: app crashes, data corruption risk.\nRecovery from disk-full crash: 45-60 minutes minimum.',
        question:'Is application performance currently affected by the disk issue?',
        options:['A — Yes, app is slow now','B — Not yet — but crash in ~3 hours'],
        correct:1, points:2, explanation:'Not yet affected — but the clock is ticking. 3 hours until total crash.' }
    ],
    answer:'delay', explanation:'DELAY — System crash in approximately 3 hours. Fix log verbosity, add log rotation, or expand disk before deploying anything new. A disk-full crash takes 45-60 minutes to recover from.' },

  { id:'l3-8', level:3, round:8, levelName:'Digital Forensic Trail', type:'forensic_trail',
    title:'Mission 8: The IE11 Layout',
    body:'A layout issue has been reported on Internet Explorer 11. Investigate whether this warrants blocking the release.',
    clues:[
      { id:'c1', label:'Clue 1 — Traffic Share',
        text:'Chrome: 68% | Safari: 18% | Firefox: 9% | Edge: 4.9%\nInternet Explorer 11: 0.1% of all traffic\n\nIE11 is a 10-year-old browser, no longer supported by Microsoft.',
        question:'IE11 accounts for 0.1% of traffic. How would you classify this?',
        options:['A — Low impact — 0.1% is negligible','B — High impact — must fix before release'],
        correct:0, points:2, explanation:'0.1% is a negligible amount of traffic. Extremely limited impact.' },
      { id:'c2', label:'Clue 2 — Bug Type',
        text:'Navigation layout: visually scrambled on IE11.\nButtons: present but misaligned.\nCheckout flow: fully functional.\nAll clicks: register correctly.\nAll transactions: process successfully.\nData integrity: not affected.',
        question:'IE11 layout is scrambled but logic works. Is this cosmetic or functional?',
        options:['A — Cosmetic only — layout wrong, logic works','B — Functional — logic is broken'],
        correct:0, points:2, explanation:'Cosmetic only. The layout looks bad on IE11 but all functionality works correctly.' },
      { id:'c3', label:'Clue 3 — Modern Browsers',
        text:'Chrome 90+: ✓ Perfect\nSafari 14+: ✓ Perfect\nFirefox 88+: ✓ Perfect\nEdge 90+: ✓ Perfect\nIE11: ✗ Layout scrambled (cosmetic only)\n\nMicrosoft officially ended IE11 support in June 2022.',
        question:'Do Chrome, Safari and other modern browsers work correctly?',
        options:['A — Yes, all modern browsers perfect','B — No, multiple browsers affected'],
        correct:0, points:2, explanation:'All modern browsers work perfectly. Only the abandoned IE11 has a cosmetic layout issue.' }
    ],
    answer:'deploy', explanation:"DEPLOY — 0.1% of users on an unsupported, abandoned browser have a cosmetic layout issue. All modern browsers work perfectly. Don't hold back 99.9% of users for IE11." },

  // ════════════════════════════════════════════════════
  //  LEVEL 4 — THE BLACKBOX PROTOCOL (6 rounds)
  //  Caesar Cipher — Shift 3 backward to decode
  // ════════════════════════════════════════════════════

  { id:'l4-1', level:4, round:1, levelName:'The BlackBox Protocol', type:'decoder',
    title:'Intercept Alpha',
    body:"BlackBox has intercepted an encrypted transmission from the production deployment channel.\n\nAll Level 4 transmissions use Caesar Cipher — Shift 3 backward.\n(Each letter shifts back 3: D→A, E→B, F→C...)\n\nDecode the message to determine your deployment decision.",
    encodedText:'PLQRU XL EXJ IRXQG. EDFNHQG ZRUNV ILQH.',
    shiftValue:3,
    decodedText:'MINOR UI BUG FOUND. BACKEND WORKS FINE.',
    hint:'Shift each letter BACK by 3. Example: D→A, E→B, P→M, L→I, Q→N...',
    answer:'deploy', explanation:'DEPLOY — Decoded: "MINOR UI BUG FOUND. BACKEND WORKS FINE." A minor UI bug with a working backend is not a release blocker. Ship it.' },

  { id:'l4-2', level:4, round:2, levelName:'The BlackBox Protocol', type:'decoder',
    title:'Intercept Bravo',
    body:"BlackBox intercept — encrypted transmission on secure channel.\n\nCaesar Cipher — Shift 3 backward.\n\nDecode the message before deciding.",
    encodedText:'GDWDEDVH FRUUXSWLRQ. UHFRYHULQJ IURP EDFNXS.',
    shiftValue:3,
    decodedText:'DATABASE CORRUPTION. RECOVERING FROM BACKUP.',
    hint:'Shift each letter BACK by 3. G→D, D→A, W→T...',
    answer:'delay', explanation:'DELAY — Decoded: "DATABASE CORRUPTION. RECOVERING FROM BACKUP." Never deploy while a backup restoration is in progress. Wait for full recovery confirmation.' },

  { id:'l4-3', level:4, round:3, levelName:'The BlackBox Protocol', type:'decoder',
    title:'Intercept Charlie',
    body:"BlackBox intercept — high-priority encrypted transmission.\n\nCaesar Cipher — Shift 3 backward.\n\nDecode immediately.",
    encodedText:'VHFXULWB EUHDFK. VHDO DOO HQGSRLQWV.',
    shiftValue:3,
    decodedText:'SECURITY BREACH. SEAL ALL ENDPOINTS.',
    hint:'Shift each letter BACK by 3. V→S, H→E, F→C...',
    answer:'delay', explanation:'DELAY — Decoded: "SECURITY BREACH. SEAL ALL ENDPOINTS." Active security breach. All deployments halt immediately. Contain first.' },

  { id:'l4-4', level:4, round:4, levelName:'The BlackBox Protocol', type:'decoder',
    title:'Intercept Delta',
    body:"BlackBox intercept — transmission from QA lead on secure channel.\n\nCaesar Cipher — Shift 3 backward.\n\nDecode and decide.",
    encodedText:'WHVWV SDVVHG ZLWK ZDUQLQJV. SHUIRUPDQFH LV VWDEOH.',
    shiftValue:3,
    decodedText:'TESTS PASSED WITH WARNINGS. PERFORMANCE IS STABLE.',
    hint:'Shift each letter BACK by 3. W→T, H→E, V→S...',
    answer:'deploy', explanation:'DEPLOY — Decoded: "TESTS PASSED WITH WARNINGS. PERFORMANCE IS STABLE." Tests passed and performance is stable. Warnings are non-blocking. Ship it.' },

  { id:'l4-5', level:4, round:5, levelName:'The BlackBox Protocol', type:'decoder',
    title:'Intercept Echo',
    body:"BlackBox intercept — urgent transmission on engineering channel.\n\nCaesar Cipher — Shift 3 backward.\n\nDecode before time runs out.",
    encodedText:'XQUHSRUWHG DSL FKDQJH. EUHDNLQJ FKDQJHV GHWHFWHG.',
    shiftValue:3,
    decodedText:'UNREPORTED API CHANGE. BREAKING CHANGES DETECTED.',
    hint:'Shift each letter BACK by 3. X→U, Q→N, U→R...',
    answer:'delay', explanation:'DELAY — Decoded: "UNREPORTED API CHANGE. BREAKING CHANGES DETECTED." Breaking API changes without documentation = downstream systems will fail. Delay until documented.' },

  { id:'l4-6', level:4, round:6, levelName:'The BlackBox Protocol', type:'decoder',
    title:'Final Intercept — The Last Call',
    body:"FINAL ROUND — The BlackBox Protocol\n\nBlackBox has captured the final transmission of the operation.\n\nCaesar Cipher — Shift 3 backward.\n\nDecode it. The fate of FlowPay depends on your final decision.",
    encodedText:'ORJ OHYHO LV VHW WR GHEXJ. GLVN VSDFH LV ORZ.',
    shiftValue:3,
    decodedText:'LOG LEVEL IS SET TO DEBUG. DISK SPACE IS LOW.',
    hint:'Shift each letter BACK by 3. O→L, R→O, J→G...',
    answer:'delay', explanation:'DELAY — Decoded: "LOG LEVEL IS SET TO DEBUG. DISK SPACE IS LOW." DEBUG logging + low disk space = disk-full crash incoming. Fix log level and disk space first.' }

];

module.exports = SCENARIOS;
