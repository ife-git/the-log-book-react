import { EventEmitter } from "node:events";
import { sendEmail } from "../services/resendService.js";

export const appEvents = new EventEmitter();

// ===== USER EVENTS =====
appEvents.on("user:registered", async (user) => {
  // Send welcome email
  await sendEmail({
    to: user.email,
    subject: "🎉 Welcome to The Log Book!",
    html: `
      <h2>Welcome ${user.name}!</h2>
      <p>Thank you for joining The Log Book. Start logging your ideas, lessons, and thoughts today!</p>
      <p>Your username is: ${user.username}</p>
      <p><a href="${process.env.BASE_URL}/notes.html">Start Writing →</a></p>
    `,
  });

  console.log(`📧 Welcome email sent to ${user.email}`);
});

appEvents.on("user:login", async (user) => {
  await sendEmail({
    to: user.email,
    subject: "Log In Attempt!",
    html: `
      <h2>Hey there 👋, ${user.name}!</h2>
      <p>Your account has been logged into, just making sure it is you.</p>
      <p>If it is not you, contact our customer service :+234 (0)80-xxxx-xxxx!</p>
      <p><a href="${process.env.BASE_URL}/notes.html">Start Writing →</a></p>
    `,
  });
  console.log(`🔓 User logged in: ${user.email}`);
  // Could add email notification here too
});

// ===== NOTE EVENTS =====
appEvents.on("note:created", async (note, user) => {
  await sendEmail({
    to: user.email,
    subject: "📝 New Note Created",
    html: `
      <h2>Hey there 👋, ${user.name}!</h2>
      <p> You created a new note titled: "${note.title}</p>
      <p>It has been saved to your Log Book 📖.</p>
      <p><a href="${process.env.BASE_URL}/notes.html">View All Notes →</a></p>
    `,
  });

  console.log(`📧 Note confirmation sent to ${user.email}`);
});

appEvents.on("note:updated", async (note, user) => {
  await sendEmail({
    to: user.email,
    subject: "📝 Note Edited",
    html: `
      <h2>Hey there 👋, ${user.name}!"</h2>
      <p> Your note titled: "${note.title} was edited.</p>
      <p>It has been saved to your Log Book 📖.</p>
      <p><a href="${process.env.BASE_URL}/notes.html">View All Notes →</a></p>
    `,
  });
  console.log(`✏️ Note updated: ${note.title} by ${user.email}`);
});

appEvents.on("note:deleted", async (noteTitle, user) => {
  await sendEmail({
    to: user.email,
    subject: "🗑️ Note Deleted",
    html: `
      <h2>Hey there 👋, ${user.name}. Your note "${noteTitle}" has been deleted</h2>
      <p>This note was removed from your Log Book 📖.</p>
      <p><a href="${process.env.BASE_URL}/upload.html">Create a new note →</a></p>
    `,
  });
});

// ===== BONUS: DAILY REMINDER (if you add cron later) =====
appEvents.on("daily:reminder", async (user) => {
  await sendEmail({
    to: user.email,
    subject: "💭 What did you learn today?",
    html: `
      <h2>Hey ${user.name}!</h2>
      <p>Don't forget to log your thoughts in The Log Book today.</p>
      <p><a href="${process.env.BASE_URL}/upload.html">Add Entry →</a></p>
    `,
  });
});
