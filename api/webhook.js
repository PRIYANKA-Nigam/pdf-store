import nodemailer from "nodemailer";
import https from "https";
import fs from "fs";
import path from "path";

/* =========================
   PLAN → PDF MAPPING
========================= */

const AMOUNT_MAP = {
    
  1000: [
    "https://raw.githubusercontent.com/PRIYANKA-Nigam/pdf-store/master/pdfs/pdf10a.pdf",
    "https://raw.githubusercontent.com/PRIYANKA-Nigam/pdf-store/master/pdfs/pdf10b.pdf"
  ],
   1500: [
    "https://raw.githubusercontent.com/PRIYANKA-Nigam/pdf-store/master/pdfs/pdf20c.pdf"
  ],

  2000: [
    "https://raw.githubusercontent.com/PRIYANKA-Nigam/pdf-store/master/pdfs/pdf20b.pdf"
  ],
   2500: [
    "https://raw.githubusercontent.com/PRIYANKA-Nigam/pdf-store/master/pdfs/pdf20a.pdf"
  ],

  3000: [
    "https://raw.githubusercontent.com/PRIYANKA-Nigam/pdf-store/master/pdfs/pdf30.pdf"
  ]
};

/* =========================
   WEBHOOK HANDLER
========================= */
export default async function handler(req, res) {
 // console.log("GitHub auto deploy test");
  try {
    console.log("🔔 WEBHOOK HIT");

    if (req.method !== "POST") {
      return res.status(200).send("Webhook alive");
    }

    const event = req.body?.event;   // ✅ MUST BE FIRST

    console.log("EVENT:", event);

    if (event === "payment.captured") {

      const payment = req.body.payload.payment.entity;

const email = payment.email;
const amount = Number(payment.amount); // IMPORTANT


let pdfList = [];

if (amount <= 1000) {
  pdfList = AMOUNT_MAP[1000];}
  else if (amount <= 1500) {
  pdfList = AMOUNT_MAP[1500];
} else if (amount <= 2000) {
  pdfList = AMOUNT_MAP[2000];}
  else if (amount <= 2500) {
  pdfList = AMOUNT_MAP[2500];
} else if (amount <= 3000) {
  pdfList = AMOUNT_MAP[3000];
}

//const pdfList = AMOUNT_MAP[String(amount)] || AMOUNT_MAP[amount] || [];

console.log("EVENT:", event);
console.log("AMOUNT RAW:", payment.amount);
console.log("FINAL AMOUNT:", amount);
console.log("MATCHED PDF LIST:", pdfList);

      const text = `
Thank you for your payment.

Amount Paid: ₹${amount / 100}

Download your PDFs:

${pdfList.length
  ? pdfList.map((url, i) => `${i+1}. ${url}`).join("\n")
  : "No PDFs found for this payment"}
`;
console.log("LOOKUP KEY:", amount);
console.log("MAP RESULT:", pdfList);
      const transporter = nodemailer.createTransport({
        service: "gmail",
         auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
      });

     await transporter.sendMail({
  from: "your@gmail.com",
  to: email,
  subject: "Your PDFs",
  html: `
    <h2>Thank you for your payment</h2>
    <p>Download your files:</p>

    ${pdfList.map((url, i) => `
      <a href="${url}" style="
        display:inline-block;
        padding:10px 15px;
        margin:5px;
        background:#28a745;
        color:white;
        text-decoration:none;
        border-radius:5px;
      ">
        Download PDF ${i+1}
      </a><br/>
    `).join("")}
  `
});
      console.log("✅ EMAIL SENT");
    }

    return res.status(200).send("OK");

  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err);
    return res.status(500).send(err.message);
  }
}