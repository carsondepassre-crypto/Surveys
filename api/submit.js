import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const QUESTIONS_TEXT = {
  1: [
    ["Do you know the name of your merchant services representative?","Have you spoken with your representative in the past 12 months?","Does your provider proactively contact you to review your account?","Can you easily reach a live person when you need support?","Are support issues typically resolved within 24 hours?"],
    ["Do you understand how your processing fees are calculated?","Have your rates been reviewed within the last 12 months?","Can your provider explain every fee on your statement?","Have you received a savings analysis recently?","Are you confident you are not overpaying?"],
    ["Can your current system accept mobile payments?","Do you have online payment capabilities?","Can customers pay through text or email invoices?","Does your system integrate with your software?","Are you satisfied with your current equipment?"],
    ["Has your provider discussed surcharge programs?","Has your provider discussed cash discounting?","Has your provider reviewed debit pricing with you?","Have you explored ways to reduce processing expenses?","Has your provider shown you annual savings opportunities?"],
    ["Are you confident your payment environment is PCI compliant?","Has your provider discussed fraud prevention tools?","Do you know how to respond to a chargeback?","Have security features been reviewed within the last year?"],
    ["Would you recommend your current processor to another business owner?","Do you believe your provider understands your business?","Do you feel your provider is helping your business grow?","If given the opportunity, would you consider reviewing alternative options?"]
  ],
  2: [
    ["Is your BigHouse rep responsive when you reach out?","Does your BigHouse account manager regularly check in with you about your account and business needs?","Are support issues usually resolved quickly?","Do you clearly understand your statement and the fees you're charged?","Do you feel you're getting good value for what you pay?","Is your equipment and technology keeping up with your business?","Has BigHouse helped you cut costs or grow since you started?","Do you feel like a valued customer, not just an account number?","Would you recommend BigHouse to another business owner?","Is there anything BigHouse could be doing differently?"]
  ],
  3: [
    ["Does your vendor actively help identify new merchant opportunities within your portfolio?","Does your vendor provide co-marketing and lead-generation support for bankers and treasury teams?","Are your branch teams equipped with easy referral tools and merchant prospecting resources from your vendor?","Does your vendor support outbound sales efforts, joint calls, or banker introductions?","Can your vendor help target high-opportunity verticals and local business segments?","Does your vendor have a strategy for increasing merchant-services penetration across your existing business clients?"],
    ["Does your vendor support in-person, ecommerce, mobile, and recurring payments?","Does your vendor offer integrated and embedded payments options?","Does your vendor offer invoicing, billing, virtual terminal, and customer payment-portal tools?","Does your vendor have products designed for a range of business verticals?","Can merchants choose from a variety of modern point of sale, software integrations, and omnichannel solutions through your vendor?","Can merchants bring their own devices or maintain existing software relationships with your vendor?","Do your vendor's product offerings help you insulate your portfolio against large fintechs?","Does your vendor offer same-day and split-funding settlement options?"],
    ["Are your bankers confident introducing and discussing your vendor's merchant services?","Is your team converting 50% or more of new business clients to your vendor's merchant services?","Do your bankers and leadership know your vendor's sales professionals by name?","Are your vendor's sales professionals in your branches every week?","Together with your bankers, is your vendor's sales team converting 50% or more of new business clients to merchant services?","Are your vendor's sales professionals meeting your clients in person?","Are in-person cost-savings reviews happening regularly with your vendor?","Are you actively growing existing relationships through your vendor?"],
    ["Is your vendor's relationship manager in touch with you regularly and meaningfully?","Does your vendor's relationship manager drive banker trainings, engagement, and co-selling?","Can your leadership view portfolio performance and merchant trends from your vendor?","Does your vendor provide regular strategic business-review support?","Do merchants receive strong reporting and operational insights from your vendor?"],
    ["Are your vendor's PCI, SOC 1, SOC 2, and security audits current and accessible?","Does your vendor handle underwriting, compliance, settlement, and support in-house?","Does your vendor manage reserves, holds, fraud monitoring, and chargebacks with best practices?","Can your vendor support annual vendor reviews and due diligence thoroughly and quickly?"],
    ["Is your vendor's compensation structured clearly?","Are your vendor's partner payouts clear, predictable, and timely?","Are your vendor's policies for reserves, holds, fraud monitoring, and chargebacks clearly defined and managed with best practices?","Is pricing transparency strong from your vendor for both your institution and the merchant?"],
    ["Is your vendor's merchant support truly in-house?","Does your vendor handle onboarding, implementation, and issue resolution?","Are your vendor's support teams experienced with financial institutions and their clients?","Does your vendor provide dedicated financial institution partner support and escalation paths?"],
    ["Are you hearing nothing but glowing reviews from your business clients who process with your vendor?","Have you received strong feedback that your vendor is highly responsive to merchants?","Does your vendor deliver processing uptime reliable at 99.999%?","Are outages handled and communicated well by your vendor?","Does your vendor's funding speed meet the needs of your clients (e.g., same-day or weekend funding)?"]
  ]
};

const CATEGORIES = {
  1: ["Service & Support", "Pricing Transparency", "Technology & Payment Options", "Cost Reduction Opportunities", "Security & Compliance", "Overall Relationship"],
  3: ["Proactive Engagement", "Comprehensive Solutions", "Strong Banker Engagement", "Partner Management", "Compliance & Risk", "Revenue Model", "Service & Support", "Merchant Satisfaction"]
};

const EMAILS = {
  1: "sales@bighousepaymentsolutions.com",
  2: "sales@bighousepaymentsolutions.com,taylor@bighousepaymentsolutions.com",
  3: "james@bighousepaymentsolutions.com"
};

function ratingLabel(percent){
  if(percent>=90) return "Strong";
  if(percent>=71) return "Good";
  if(percent>=50) return "Moderate";
  return "At Risk";
}

function buildEmailPhase1or3(data, phase) {
  const answers = data.answers;
  const cats = CATEGORIES[phase];
  const qtext = QUESTIONS_TEXT[phase];
  const total = phase === 1 ? 28 : 44;
  let yesTotal = 0;
  Object.keys(answers).forEach(k => { if (answers[k] === "yes") yesTotal++; });
  const percent = Math.round((yesTotal / total) * 100);

  const infoLabel = phase === 1 ? "MERCHANT INFO" : "INSTITUTION INFO";
  const nameLabel = phase === 1 ? "Business Name" : "Institution Name";

  let body = `${infoLabel}
=====================================
${nameLabel}: ${data.business || "Anonymous"}
Email: ${data.email || "Not provided"}
Phone: ${data.phone || "Not provided"}

OVERALL SCORE: ${percent}/100 (${ratingLabel(percent)})
=====================================

SCORE BY CATEGORY
=====================================
`;
  let catIndex = 0;
  cats.forEach(cat => {
    let catYes = 0;
    const qs = qtext[catIndex];
    for (let i = 0; i < qs.length; i++) {
      if (answers[catIndex + ":" + i] === "yes") catYes++;
    }
    body += `${cat}: ${catYes}/${qs.length}\n`;
    catIndex++;
  });
  return body;
}

function buildEmailPhase2(data) {
  const answers = data.answers;
  const allQs = QUESTIONS_TEXT[2][0];

  let points = 0;
  for (let i = 0; i < 9; i++) { if (answers["0:" + i] === "yes") points++; }
  if (answers["0:9"] === "no") points++;
  const percent = Math.round((points / 10) * 100);

  let yesQ = [], noQ = [], notSureQ = [];
  Object.keys(answers).forEach(key => {
    if (key.startsWith("0:")) {
      const qIdx = parseInt(key.split(":")[1]);
      const q = allQs[qIdx];
      if (answers[key] === "yes") yesQ.push(q);
      else if (answers[key] === "no") noQ.push(q);
      else if (answers[key] === "notsure") notSureQ.push(q);
    }
  });

  let body = `CUSTOMER INFO
=====================================
Business Name: ${data.business || "Anonymous"}
Email: ${data.email || "Not provided"}
Phone: ${data.phone || "Not provided"}

SATISFACTION SCORE: ${points}/10 (${percent}%)
=====================================

SUMMARY
=====================================
Yes: ${yesQ.length}
No: ${noQ.length}
Not Sure: ${notSureQ.length}

BREAKDOWN
=====================================
YES (${yesQ.length}):
`;
  yesQ.forEach(q => body += `- ${q}\n`);
  body += `\nNO (${noQ.length}):\n`;
  noQ.forEach(q => body += `- ${q}\n`);
  body += `\nNOT SURE (${notSureQ.length}):\n`;
  notSureQ.forEach(q => body += `- ${q}\n`);

  if (data.feedback) {
    body += `\nWHAT COULD WE DO DIFFERENTLY?
=====================================
"${data.feedback}"\n`;
  }
  return body;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { phase, business, email, phone, answers, feedback } = req.body;
  if (!phase || !answers) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    let emailBody = "";
    let subject = "";
    if (phase === "1") {
      emailBody = buildEmailPhase1or3({ business, email, phone, answers }, 1);
      subject = `New Merchant Survey - ${business || "Anonymous"}`;
    } else if (phase === "2") {
      emailBody = buildEmailPhase2({ business, email, phone, answers, feedback });
      subject = `Customer Feedback - ${business || "Anonymous"}`;
    } else if (phase === "3") {
      emailBody = buildEmailPhase1or3({ business, email, phone, answers }, 3);
      subject = `Financial Institution Evaluation - ${business || "Anonymous"}`;
    }
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: EMAILS[phase],
      subject: subject,
      text: emailBody
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
