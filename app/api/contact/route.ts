import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const RECIPIENT_EMAIL = "mirlabs11@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message content is required." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    // Log the contact submission in the console
    console.log("[Contact Submission Received]:", {
      timestamp: new Date().toISOString(),
      to: RECIPIENT_EMAIL,
      from: `${trimmedName} <${trimmedEmail}>`,
      message: trimmedMessage,
    });

    let emailSent = false;

    // Option 1: Direct Gmail SMTP (via GMAIL_USER & GMAIL_APP_PASS)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"MIR Labs Portfolio" <${process.env.GMAIL_USER}>`,
          to: process.env.CONTACT_RECEIVER_EMAIL || RECIPIENT_EMAIL,
          replyTo: trimmedEmail,
          subject: `✨ New Portfolio Inquiry from ${trimmedName}`,
          text: `You received a new message from your portfolio contact form:\n\nName: ${trimmedName}\nEmail: ${trimmedEmail}\n\nMessage:\n${trimmedMessage}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
              <h2 style="color: #111827; margin-bottom: 20px;">New Message from MIR Labs Portfolio</h2>
              <p style="margin: 8px 0;"><strong>Sender Name:</strong> ${trimmedName}</p>
              <p style="margin: 8px 0;"><strong>Sender Email:</strong> <a href="mailto:${trimmedEmail}" style="color: #2563eb;">${trimmedEmail}</a></p>
              <div style="margin-top: 20px; padding: 16px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; font-weight: bold; color: #374151;">Message Content:</p>
                <p style="margin: 0; white-space: pre-wrap; color: #1f2937; line-height: 1.6;">${trimmedMessage}</p>
              </div>
              <p style="margin-top: 24px; font-size: 12px; color: #9ca3af; text-align: center;">
                You can directly reply to this email to respond to ${trimmedName}.
              </p>
            </div>
          `,
        });

        emailSent = true;
        console.log("[Gmail SMTP] Email successfully dispatched to inbox!");
      } catch (gmailErr) {
        console.error("[Gmail SMTP Error]:", gmailErr);
      }
    }

    // Option 2: Resend API (via RESEND_API_KEY)
    if (!emailSent && process.env.RESEND_API_KEY) {
      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "MIR Labs Portfolio <onboarding@resend.dev>",
            to: [process.env.CONTACT_RECEIVER_EMAIL || RECIPIENT_EMAIL],
            reply_to: trimmedEmail,
            subject: `✨ New Portfolio Inquiry from ${trimmedName}`,
            text: `Name: ${trimmedName}\nEmail: ${trimmedEmail}\n\nMessage:\n${trimmedMessage}`,
          }),
        });

        if (resendRes.ok) {
          emailSent = true;
          console.log("[Resend API] Email successfully sent!");
        } else {
          const errData = await resendRes.json();
          console.warn("[Resend Warning]:", errData);
        }
      } catch (resendErr) {
        console.error("[Resend API Error]:", resendErr);
      }
    }

    return NextResponse.json(
      { success: true, message: "Thank you! Your message has been sent successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again or reach out directly." },
      { status: 500 }
    );
  }
}
