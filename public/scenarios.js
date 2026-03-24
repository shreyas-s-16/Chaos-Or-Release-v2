// ═══════════════════════════════════════════════════════
//  CHAOS OR RELEASE — SERVER-SIDE SCENARIOS
//  FlowPay Master Handbook Edition · 30 Rounds
//  CLIENT VERSION — No answers, no decodedText
// ═══════════════════════════════════════════════════════

const SCENARIOS = [

  // ═══════════════════════════════════════════════════
  //  LEVEL 1 — THE GROWTH SPURT (12 rounds · 45s each)
  // ═══════════════════════════════════════════════════

  {
    level: 1, round: 1, levelName: 'The Growth Spurt', type: 'text',
    title: 'Q1 — Influencer Spike',
    body: 'FlowPay just got featured by a top influencer. Traffic is up 400%.\n\n→ Minor UI misalignment detected on iPhone 12 bezels\n→ Core payment flow: 100% functional\n→ Android, Web, iOS 14+: all perfect\n→ Millions of new users are trying to sign up RIGHT NOW\n\nDeploy or Delay?',
    explanation: 'DEPLOY — A cosmetic bezel misalignment on one phone model does not justify losing a viral growth moment. Ship it.'
  },

  {
    level: 1, round: 2, levelName: 'The Growth Spurt', type: 'text',
    title: 'Q2 — Ghost Refund',
    body: 'A bug is issuing ghost refunds to 1 in every 500 transactions.\n\n→ $10,000 drained from company account in last 2 hours\n→ Rate accelerating as transaction volume grows\n→ Fix requires 45 minutes\n→ Every minute of delay costs more money\n\nDeploy or Delay?',
    explanation: 'DELAY — A financial logic bug draining cash is a P0 emergency. Stop the bleeding before it becomes fatal.'
  },

  {
    level: 1, round: 3, levelName: 'The Growth Spurt', type: 'text',
    title: 'Q3 — Emoji Crash',
    body: 'The 🚀 rocket emoji causes the transaction history page to crash.\n\n→ Affects only users who used 🚀 in their payment notes\n→ Estimated impact: 0.3% of users\n→ Core payments, login, dashboard: all working\n→ History page crash: no data loss, just display error\n\nDeploy or Delay?',
    explanation: 'DEPLOY — An edge-case emoji display crash on a non-critical page does not block core functionality. Ship now.'
  },

  {
    level: 1, round: 4, levelName: 'The Growth Spurt', type: 'text',
    title: 'Q4 — Compliance Wall',
    body: 'Legal just flagged that updated Terms of Service MUST be live by tomorrow 9AM.\n\n→ Current release does not include the new ToS\n→ Operating without it after 9AM = regulatory violation\n→ Penalty: up to £500,000 fine\n→ ToS update takes 2 hours to integrate and test\n\nDeploy or Delay?',
    explanation: 'DELAY — Regulatory compliance is non-negotiable. A £500k fine dwarfs any feature benefit. Integrate the ToS first.'
  },

  {
    level: 1, round: 5, levelName: 'The Growth Spurt', type: 'text',
    title: 'Q5 — Dark Mode',
    body: 'Dark Mode feature is ready, but payment amount text is invisible for 0.5 seconds during the colour fade animation.\n\n→ 0.5s flash — amount is ALWAYS correct, just briefly invisible\n→ Dark Mode is opt-in — users choose it\n→ Light mode (default): completely unaffected\n→ Feature has been requested by 40,000 users\n\nDeploy or Delay?',
    explanation: 'DEPLOY — An optional feature with a 0.5s cosmetic animation glitch is not a blocker. Users who are bothered can stay on Light Mode.'
  },

  {
    level: 1, round: 6, levelName: 'The Growth Spurt', type: 'text',
    title: 'Q6 — Double-Charge',
    body: 'A caching race condition MIGHT charge users twice for the same transaction.\n\n→ Reproducible in 1 of 50 test runs\n→ Cannot predict which users will be affected\n→ Each double-charge = immediate chargeback + £25 penalty fee\n→ Fix confirmed — takes 1 hour\n\nDeploy or Delay?',
    explanation: 'DELAY — A potential double-charge is a financial and trust catastrophe. Never deploy known billing bugs into production.'
  },

  {
    level: 1, round: 7, levelName: 'The Growth Spurt', type: 'text',
    title: 'Q7 — VIP Support',
    body: 'The top 10 investors in FlowPay cannot see their dashboard after the latest update.\n\n→ These 10 accounts hold 60% of FlowPay funding\n→ Board meeting is in 3 hours\n→ They are already emailing asking what is wrong\n→ Fix takes 30 minutes\n\nDeploy or Delay?',
    explanation: 'DELAY — Losing investor confidence 3 hours before a board meeting is an existential risk. Fix it immediately.'
  },

  {
    level: 1, round: 8, levelName: 'The Growth Spurt', type: 'text',
    title: 'Q8 — Logo Swap',
    body: 'Someone uploaded a low-resolution 72dpi logo to the homepage. The correct 300dpi version is ready.\n\n→ Functional impact: zero\n→ The logo just looks slightly blurry on Retina screens\n→ New logo file is tested and ready to go\n→ Zero risk — it is just an image swap\n\nDeploy or Delay?',
    explanation: 'DEPLOY — A tested image replacement with zero functional risk should be shipped immediately. This is not a delay situation.'
  },

  {
    level: 1, round: 9, levelName: 'The Growth Spurt', type: 'text',
    title: 'Q9 — Sunday Service',
    body: 'A developer wants to move the scheduled 2AM Sunday maintenance window to RIGHT NOW (2PM Friday, peak traffic).\n\n→ Current active users: 45,000\n→ Maintenance causes 8 minutes of downtime\n→ 2AM Sunday: estimated 200 users online\n→ Reason given: "I want to go home early"\n\nDeploy or Delay?',
    explanation: 'DELAY — Running maintenance during peak traffic for personal convenience is unacceptable. Stick to the maintenance window.'
  },

  {
    level: 1, round: 10, levelName: 'The Growth Spurt', type: 'text',
    title: 'Q10 — Language Barrier',
    body: 'The French language UI is accidentally showing Spanish text in 3 non-critical tooltip labels.\n\n→ Affected: tooltip text only — no buttons, forms, or payment flows\n→ French speakers still understand the UI context\n→ Core French payment functionality: 100% correct\n→ Fix is already in the next sprint\n\nDeploy or Delay?',
    explanation: 'DEPLOY — Three wrong tooltip labels in a secondary language do not justify blocking the release. Log it and fix it in the next cycle.'
  },

  {
    level: 1, round: 11, levelName: 'The Growth Spurt', type: 'text',
    title: 'Q11 — API Leak',
    body: 'A test API key has been found hardcoded in the public frontend JavaScript bundle.\n\n→ Key is live and has full read/write access to test environment\n→ Test environment mirrors 30% of production data structure\n→ Key has been visible in public code for 72 hours\n→ Fix: rotate key + remove from code (15 minutes)\n\nDeploy or Delay?',
    explanation: 'DELAY — An exposed API key is a security incident in progress. Rotate the key and scrub the code before any deployment.'
  },

  {
    level: 1, round: 12, levelName: 'The Growth Spurt', type: 'text',
    title: 'Q12 — Slow Receipt',
    body: 'Receipt confirmation emails are taking 12 minutes to arrive instead of 12 seconds.\n\n→ Payments are processing instantly and correctly\n→ Money is transferred successfully\n→ Email delay is cosmetic — transactions are complete\n→ Email queue fix is being worked on separately\n\nDeploy or Delay?',
    explanation: 'DEPLOY — Slow email receipts are annoying but do not affect payment processing. The money moves correctly. Ship the release.'
  },

  // ═══════════════════════════════════════════════════
  //  LEVEL 2 — ARCHITECT'S ANATOMY (7 rounds · 60s each)
  //  All rounds share ONE system map — teams identify the faulty node
  //  Options: A=Load Balancer, B=App Cluster, C=Database, D=External API Gateway
  // ═══════════════════════════════════════════════════

  {
    level: 2, round: 1, levelName: "Architect's Anatomy", type: 'image_quiz',
    title: 'Q13 — The Overloaded Highway',
    body: 'Study the FlowPay system diagram carefully.\n\nREAL-TIME ALERT: Red arrows show 100% of traffic flowing to Node B. Node C is receiving 0% traffic. The system is critically unbalanced.\n\nWhich node is the SOURCE of this traffic distribution problem?',
    imageUrl: '/images/l2-system-map.svg',
    quiz: {
      question: 'Which node is causing the traffic imbalance — sending everything to B and nothing to C?',
      options: ['A — Load Balancer', 'B — App Cluster', 'C — Database', 'D — External API Gateway'],
      correct: 0
    },
    explanation: 'DELAY — The Load Balancer (A) has a misconfigured routing rule. Deploying now will overload the App Cluster. Fix the balancer first.'
  },

  {
    level: 2, round: 2, levelName: "Architect's Anatomy", type: 'image_quiz',
    title: 'Q14 — The Red Database',
    body: 'Study the FlowPay system diagram carefully.\n\nREAL-TIME ALERT: One node is pulsating red with a critical metric reading "IOPS: 99%". Input/Output operations are maxed out. Write operations are beginning to queue and fail.\n\nWhich node is at critical capacity?',
    imageUrl: '/images/l2-system-map.svg',
    quiz: {
      question: 'Which node is showing IOPS: 99% and pulsating red?',
      options: ['A — Load Balancer', 'B — App Cluster', 'C — Database', 'D — External API Gateway'],
      correct: 2
    },
    explanation: 'DELAY — The Database (C) is at 99% IOPS capacity. Deploying a new release now will push it over the edge and cause data write failures.'
  },

  {
    level: 2, round: 3, levelName: "Architect's Anatomy", type: 'image_quiz',
    title: 'Q15 — The Version Ghost',
    body: 'Study the FlowPay system diagram carefully.\n\nREAL-TIME ALERT: A version mismatch has been detected. The CDN is serving Version 2.0 assets but one node is still running Version 1.0 code. Some users see the new UI but get old API responses.\n\nWhich node is running the outdated version?',
    imageUrl: '/images/l2-system-map.svg',
    quiz: {
      question: 'Which node is stuck on Version 1.0 while the CDN has Version 2.0?',
      options: ['A — Load Balancer', 'B — App Cluster', 'C — Database', 'D — External API Gateway'],
      correct: 1
    },
    explanation: 'DEPLOY — Pushing the update to the App Cluster (B) resolves the version mismatch and aligns it with the CDN. This is the deployment itself.'
  },

  {
    level: 2, round: 4, levelName: "Architect's Anatomy", type: 'image_quiz',
    title: 'Q16 — The Forbidden Gateway',
    body: 'Study the FlowPay system diagram carefully.\n\nREAL-TIME ALERT: Every outbound request line from one node is showing a red "403 Forbidden" response. Payment processing, authentication, and email confirmations are all failing for affected users.\n\nWhich node is receiving 403 errors on every request?',
    imageUrl: '/images/l2-system-map.svg',
    quiz: {
      question: 'Which node is showing "403 Forbidden" on every outbound request?',
      options: ['A — Load Balancer', 'B — App Cluster', 'C — Database', 'D — External API Gateway'],
      correct: 3
    },
    explanation: 'DELAY — The External API Gateway (D) is returning 403 on all calls. This means payments and auth are broken. Fix the API credentials before deploying.'
  },

  {
    level: 2, round: 5, levelName: "Architect's Anatomy", type: 'image_quiz',
    title: 'Q17 — The Sawtooth Memory',
    body: 'Study the FlowPay system diagram carefully.\n\nREAL-TIME ALERT: One node\'s memory graph is showing a sharp "Sawtooth" pattern — rising steeply then dropping suddenly, repeating every 4 minutes. This indicates a memory leak with auto-restart recovery.\n\nWhich node has the sawtooth memory pattern?',
    imageUrl: '/images/l2-system-map.svg',
    quiz: {
      question: 'Which node is showing the sawtooth memory leak pattern?',
      options: ['A — Load Balancer', 'B — App Cluster', 'C — Database', 'D — External API Gateway'],
      correct: 1
    },
    explanation: 'DEPLOY — The App Cluster (B) has a manageable memory leak with auto-recovery. Deploy the fix now to resolve it cleanly rather than letting it continue crashing.'
  },

  {
    level: 2, round: 6, levelName: "Architect's Anatomy", type: 'image_quiz',
    title: 'Q18 — The European Blackout',
    body: 'Study the FlowPay system diagram carefully.\n\nREAL-TIME ALERT: A world map overlay shows "Offline" status icons appearing exclusively over European regions. All other regions (Americas, Asia, Africa) are fully operational.\n\nWhich node handles the geographic routing that would cause region-specific failures?',
    imageUrl: '/images/l2-system-map.svg',
    quiz: {
      question: 'Which node is responsible for the European region going offline?',
      options: ['A — Load Balancer', 'B — App Cluster', 'C — Database', 'D — External API Gateway'],
      correct: 3
    },
    explanation: 'DELAY — The External API Gateway (D) handles regional routing and third-party integrations like SEPA payments for Europe. It needs fixing before European users can transact.'
  },

  {
    level: 2, round: 7, levelName: "Architect's Anatomy", type: 'image_quiz',
    title: 'Q19 — Disk Full',
    body: 'Study the FlowPay system diagram carefully.\n\nREAL-TIME ALERT: One node\'s storage cylinder is shown filled completely to the brim with a bright red "DISK FULL" overlay. When disk hits 100%, the entire system crashes and all operations halt.\n\nWhich node has the disk full condition?',
    imageUrl: '/images/l2-system-map.svg',
    quiz: {
      question: 'Which node is showing the "DISK FULL" critical overlay?',
      options: ['A — Load Balancer', 'B — App Cluster', 'C — Database', 'D — External API Gateway'],
      correct: 2
    },
    explanation: 'DELAY — The Database (C) disk is full. Any write operation — payment, registration, log — will fail immediately. Clear disk space before deploying anything.'
  },

  // ═══════════════════════════════════════════════════
  //  LEVEL 3 — THE DATA TRAIL (6 missions · 90s each)
  //  3 clues per mission (+2 pts each), 2 options (A/B) per clue
  // ═══════════════════════════════════════════════════

  {
    level: 3, round: 1, levelName: 'The Data Trail', type: 'forensic_trail',
    title: 'Mission 1 — Shadow Cash',
    body: 'Anomalous financial activity detected in FlowPay transaction logs. Investigate the trail to determine severity and correct action.',
    clues: [
      {
        id: 'c1', label: 'Clue 1 — Scope of Impact',
        text: 'Forensic scan of transaction logs reveals an anomaly in the payment processing module.\n\nA: 10 users have received incorrect transaction confirmations.\nB: $10,000 has silently disappeared from the reconciliation ledger.',
        question: 'What is the true impact of this anomaly?',
        options: ['A — 10 users affected', 'B — $10,000 missing from ledger'],
        correct: 1, points: 2,
        explanation: 'The real issue is $10,000 missing from the ledger — a critical financial discrepancy.'
      },
      {
        id: 'c2', label: 'Clue 2 — Root Cause',
        text: 'Deep dive into the payment processing code reveals the source of the missing funds.\n\nA: SQL Injection vulnerability allowing transaction manipulation.\nB: Business logic error in the refund calculation formula.',
        question: 'What caused the $10,000 discrepancy?',
        options: ['A — SQL Injection', 'B — Logic Error in refund formula'],
        correct: 0, points: 2,
        explanation: 'An SQL Injection vulnerability is actively exploiting the payment system — this is a live attack.'
      },
      {
        id: 'c3', label: 'Clue 3 — Recovery Path',
        text: 'Two recovery options have been proposed by the engineering team.\n\nA: 4-hour emergency patch to fix the SQLi vulnerability and reconcile funds.\nB: 1-minute database reset that would wipe the last 24 hours of transactions.',
        question: 'Which recovery option is appropriate?',
        options: ['A — 4-hour patch and reconcile', 'B — 1-minute database reset'],
        correct: 0, points: 2,
        explanation: 'A 4-hour patch preserves transaction history. A 1-minute reset would destroy 24hrs of legitimate customer data.'
      }
    ],
    explanation: 'DELAY — Active SQL Injection draining funds requires an emergency patch. Never deploy new features during an active financial attack.'
  },

  {
    level: 3, round: 2, levelName: 'The Data Trail', type: 'forensic_trail',
    title: 'Mission 2 — Disk Eater',
    body: 'Storage alerts firing across the FlowPay infrastructure. Investigate the logs to understand what is consuming disk space and how much time remains.',
    clues: [
      {
        id: 'c1', label: 'Clue 1 — What Is Growing',
        text: 'Storage monitoring dashboard shows one category exploding in size.\n\nA: Application log files growing at 10GB per hour.\nB: User-generated content growing due to new viral feature.',
        question: 'What is consuming the disk space?',
        options: ['A — Log files (10GB/hour)', 'B — User content growth'],
        correct: 0, points: 2,
        explanation: 'Application logs are growing at 10GB per hour — an abnormal rate that points to a misconfiguration.'
      },
      {
        id: 'c2', label: 'Clue 2 — Why Logs Are Exploding',
        text: 'Engineering investigates what triggered the log explosion.\n\nA: Debug Mode was accidentally left ON in the production environment.\nB: A user has found a way to hack the logging system remotely.',
        question: 'Why are logs growing at 10GB per hour?',
        options: ['A — Debug Mode ON in production', 'B — External logging hack'],
        correct: 0, points: 2,
        explanation: 'Debug Mode logs every internal operation — in production this generates massive log volumes instantly.'
      },
      {
        id: 'c3', label: 'Clue 3 — Time Remaining',
        text: 'Current disk usage: 85%. Growth rate: 10GB/hour. Total disk: 50GB.\n\nA: Approximately 10 minutes until disk is completely full.\nB: Approximately 2 days until disk is completely full.',
        question: 'How long until the disk hits 100%?',
        options: ['A — ~10 minutes left', 'B — ~2 days left'],
        correct: 0, points: 2,
        explanation: '85% used, 7.5GB remaining, growing at 10GB/hour = ~45 minutes. Critically urgent — minutes not days.'
      }
    ],
    explanation: 'DELAY — Disk full in under an hour will crash the entire system. Turn off Debug Mode and clear logs before any deployment.'
  },

  {
    level: 3, round: 3, levelName: 'The Data Trail', type: 'forensic_trail',
    title: 'Mission 3 — Zombie API',
    body: 'Unusual traffic patterns detected on FlowPay\'s deprecated v1 API endpoint. Investigate the source and impact.',
    clues: [
      {
        id: 'c1', label: 'Clue 1 — Impact on Core System',
        text: 'Traffic analysis shows v1 API receiving unexpected load.\n\nA: The core FlowPay application is down due to this traffic.\nB: Only the deprecated v1 API endpoint is being hit — core app is unaffected.',
        question: 'Is the core application affected?',
        options: ['A — Core app is down', 'B — Only deprecated v1 API is hit'],
        correct: 1, points: 2,
        explanation: 'The deprecated v1 API is being hit but the core application remains fully operational.'
      },
      {
        id: 'c2', label: 'Clue 2 — Source of Traffic',
        text: 'Deep packet inspection reveals the source of the v1 API traffic.\n\nA: A botnet of 50,000 automated bots are hammering the endpoint.\nB: Real users with old mobile app versions that never updated.',
        question: 'Who is sending traffic to the v1 API?',
        options: ['A — Botnet attack', 'B — Real users on old app versions'],
        correct: 0, points: 2,
        explanation: 'A botnet is driving the traffic — not real users. Old app users are a minor concern; the botnet is the primary threat.'
      },
      {
        id: 'c3', label: 'Clue 3 — Mitigation Strategy',
        text: 'Two approaches proposed to handle the botnet traffic.\n\nA: Deploy a firewall rule to block the botnet IPs and rate-limit the v1 endpoint.\nB: Rewrite the entire v1 API from scratch to eliminate the attack surface.',
        question: 'Which mitigation is appropriate right now?',
        options: ['A — Firewall block and rate-limit', 'B — Rewrite entire v1 API'],
        correct: 0, points: 2,
        explanation: 'A targeted firewall block stops the attack immediately. A full API rewrite takes weeks and is not an emergency response.'
      }
    ],
    explanation: 'DEPLOY — Core app is unaffected. Block the botnet with a firewall rule and deploy. The deprecated API issue is contained.'
  },

  {
    level: 3, round: 4, levelName: 'The Data Trail', type: 'forensic_trail',
    title: 'Mission 4 — Silent Fail',
    body: 'Customer support tickets are suddenly spiking. Users are reporting an issue but no errors are showing in the monitoring dashboard. Investigate.',
    clues: [
      {
        id: 'c1', label: 'Clue 1 — What Users Are Reporting',
        text: 'Support ticket analysis over the last 2 hours.\n\nA: Users are not receiving payment receipt confirmation emails.\nB: Users report payments are not going through at all.',
        question: 'What is the primary user complaint?',
        options: ['A — No receipt emails being received', 'B — Payments failing entirely'],
        correct: 0, points: 2,
        explanation: 'Users are not receiving receipt emails. Payments are processing but confirmations are silently failing.'
      },
      {
        id: 'c2', label: 'Clue 2 — Root Cause',
        text: 'Engineering digs into the email pipeline.\n\nA: The email delivery service (Mailer) is down — queue has 50,000 undelivered emails.\nB: The database is down — emails cannot be retrieved.',
        question: 'Why are receipt emails not being sent?',
        options: ['A — Email Mailer service is down', 'B — Database is down'],
        correct: 0, points: 2,
        explanation: 'The Mailer service is offline with a growing queue of 50,000 unsent receipts. Payments are fine but evidence is missing.'
      },
      {
        id: 'c3', label: 'Clue 3 — Support Volume',
        text: 'Checking the customer support queue impact.\n\nA: 500+ support tickets already raised and growing rapidly.\nB: Zero support tickets — users have not noticed yet.',
        question: 'What is the current support ticket volume?',
        options: ['A — 500+ tickets and growing', 'B — Zero tickets raised'],
        correct: 0, points: 2,
        explanation: '500 tickets means 500 users are already concerned their payment did not go through. This is a trust and compliance issue.'
      }
    ],
    explanation: 'DELAY — 500 users think their payments failed due to missing receipts. Fix the Mailer service before deploying anything new.'
  },

  {
    level: 3, round: 5, levelName: 'The Data Trail', type: 'forensic_trail',
    title: 'Mission 5 — Memory Ghost',
    body: 'A server monitoring alert has been triggered. Investigate the telemetry data to determine severity and the right response.',
    clues: [
      {
        id: 'c1', label: 'Clue 1 — CPU Status',
        text: 'Checking CPU utilisation on the affected server.\n\nA: CPU is at 5% — completely normal and idle.\nB: CPU is at 100% — fully spiked and unresponsive.',
        question: 'What is the CPU utilisation on the affected server?',
        options: ['A — CPU at 5% (normal)', 'B — CPU at 100% (spiked)'],
        correct: 0, points: 2,
        explanation: 'CPU is normal at 5%. The problem is not compute-related — it is memory.'
      },
      {
        id: 'c2', label: 'Clue 2 — Root Cause Diagnosis',
        text: 'Correlating CPU (5%) with RAM (rising 98%) telemetry.\n\nA: Classic Memory Leak — RAM climbs continuously while CPU stays normal.\nB: High Traffic Surge — both CPU and RAM spike together.',
        question: 'What does CPU 5% + RAM 98% climbing indicate?',
        options: ['A — Memory Leak', 'B — High Traffic Surge'],
        correct: 0, points: 2,
        explanation: 'Low CPU + climbing RAM = textbook memory leak. Objects are being allocated but never garbage collected.'
      },
      {
        id: 'c3', label: 'Clue 3 — Temporary Fix',
        text: 'Engineering proposes a temporary mitigation while the leak is investigated.\n\nA: Automated server restart every 3 hours prevents RAM from hitting 100% — service stays up.\nB: No temporary fix possible — must wait for full root cause analysis (2-3 days).',
        question: 'Can a temporary fix keep the service running?',
        options: ['A — Auto-restart every 3 hours works', 'B — No temporary fix available'],
        correct: 0, points: 2,
        explanation: 'An auto-restart every 3 hours is a valid DevOps mitigation — keeps service running while the actual leak is investigated.'
      }
    ],
    explanation: 'DEPLOY — A memory leak with a working auto-restart mitigation is manageable. Deploy the fix and keep the service running.'
  },

  {
    level: 3, round: 6, levelName: 'The Data Trail', type: 'forensic_trail',
    title: 'Mission 6 — The Breach',
    body: 'A security scanner has flagged an anomaly in FlowPay\'s cloud storage configuration. Investigate immediately.',
    clues: [
      {
        id: 'c1', label: 'Clue 1 — What Was Exposed',
        text: 'Security audit of the cloud storage bucket reveals the scope of exposure.\n\nA: Customer PII (names, emails, partial card data) was publicly accessible.\nB: Company logo assets were publicly accessible.',
        question: 'What data was exposed in the storage misconfiguration?',
        options: ['A — Customer PII exposed', 'B — Logo assets exposed'],
        correct: 0, points: 2,
        explanation: 'Customer PII exposure is a GDPR/PCI-DSS critical incident. This is not a minor configuration error.'
      },
      {
        id: 'c2', label: 'Clue 2 — Root Cause',
        text: 'Investigation into what caused the data exposure.\n\nA: An S3 bucket was accidentally set to Public — all files world-readable.\nB: A CSS bug caused the wrong image to render on the profile page.',
        question: 'What caused the PII to be exposed?',
        options: ['A — S3 bucket set to Public', 'B — CSS rendering bug'],
        correct: 0, points: 2,
        explanation: 'A publicly accessible S3 bucket with customer PII is a live data breach requiring immediate incident response.'
      },
      {
        id: 'c3', label: 'Clue 3 — Response Protocol',
        text: 'Two response options are proposed.\n\nA: 2-hour security lockdown — make bucket private, audit access logs, notify affected users, file ICO report.\nB: No action required — assume no one accessed the exposed data.',
        question: 'What is the correct incident response?',
        options: ['A — 2-hour lockdown and full incident response', 'B — No action needed'],
        correct: 0, points: 2,
        explanation: 'GDPR mandates breach notification within 72 hours. Assuming no access without checking logs is grossly negligent.'
      }
    ],
    explanation: 'DELAY — Active data breach in progress. Initiate full incident response: lock bucket, audit logs, notify users, file regulatory report.'
  },

  // ═══════════════════════════════════════════════════
  //  LEVEL 4 — THE FINAL SIEGE (5 rounds · 180s each)
  //  Caesar Cipher Shift -3 (decode backward by 3)
  // ═══════════════════════════════════════════════════

  {
    level: 4, round: 1, levelName: 'The Final Siege', type: 'decoder',
    title: 'Intercept Alpha — Priority ONE',
    body: 'BlackBox has intercepted an encrypted transmission from the FlowPay operations channel.\n\nCaesar Cipher — Shift 3 backward.\n(Each letter shifts back: D→A, E→B, F→C...)\n\nDecode the message to determine your response.',
    encodedText: 'DWWDFN GHWHFWHG',
    shiftValue: 3,
    hint: 'Shift BACK by 3. D→A, W→T, W→T, D→A, F→C, N→K...',
    explanation: 'DELAY — ATTACK DETECTED. An active attack is in progress. Halt all deployments and initiate security protocols immediately.'
  },

  {
    level: 4, round: 2, levelName: 'The Final Siege', type: 'decoder',
    title: 'Intercept Bravo — URGENT',
    body: 'BlackBox intercept — critical infrastructure alert on emergency channel.\n\nCaesar Cipher — Shift 3 backward.\n\nDecode before deciding.',
    encodedText: 'VHUYHU RQ ILUH',
    shiftValue: 3,
    hint: 'Shift BACK by 3. V→S, H→E, U→R, Y→V... think what "server" encodes to.',
    explanation: 'DELAY — SERVER ON FIRE. A critical server failure is occurring. No deployments during infrastructure emergencies.'
  },

  {
    level: 4, round: 3, levelName: 'The Final Siege', type: 'decoder',
    title: 'Intercept Charlie — Status Report',
    body: 'BlackBox intercept — QA team status transmission.\n\nCaesar Cipher — Shift 3 backward.\n\nDecode to understand current readiness.',
    encodedText: 'DOO WHVWV SDVV',
    shiftValue: 3,
    hint: 'Shift BACK by 3. D→A, O→L, O→L... first word is very short.',
    explanation: 'DEPLOY — ALL TESTS PASS. QA has signed off on everything. Green light to ship.'
  },

  {
    level: 4, round: 4, levelName: 'The Final Siege', type: 'decoder',
    title: 'Intercept Delta — Security Scan',
    body: 'BlackBox intercept — security team transmission after audit.\n\nCaesar Cipher — Shift 3 backward.\n\nDecode the security clearance message.',
    encodedText: 'GDWD LV VDIH',
    shiftValue: 3,
    hint: 'Shift BACK by 3. G→D, D→A, W→T, D→A... first word is 4 letters.',
    explanation: 'DEPLOY — DATA IS SAFE. Security audit passed. Customer data is protected. Cleared for deployment.'
  },

  {
    level: 4, round: 5, levelName: 'The Final Siege', type: 'decoder',
    title: 'Final Intercept — The Last Call',
    body: 'FINAL ROUND — The Last Siege.\n\nBlackBox has captured the final transmission.\n\nCaesar Cipher — Shift 3 backward.\n\nThe fate of FlowPay depends on this decode.',
    encodedText: 'VBVWHP FULWLFDO',
    shiftValue: 3,
    hint: 'Shift BACK by 3. V→S, B→Y, V→S, W→T, H→E, P→M... what 6-letter word starts with SY?',
    explanation: 'DELAY — SYSTEM CRITICAL. The system is in a critical failure state. Deploying now would make things catastrophically worse.'
  },

];