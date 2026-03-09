import dns from "dns";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";

// FORCE GOOGLE DNS - ADD THIS RIGHT AFTER IMPORTS!
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "logbook";
const collectionName = process.env.COLLECTION_NAME || "notes";

// Rest of your script stays exactly the same...
// Demo user credentials
const DEMO_USER = {
  name: "Demo User",
  email: "demo@logbook.com",
  username: "demo",
  password: "demo123", // This will be hashed
};

// Your old notes from data.json
const oldNotes = [
  {
    id: "1a2b3c4d",
    title: "Event delegation finally clicked",
    content:
      "Instead of adding event listeners to every child element, you can attach one listener to the parent and use event.target to figure out what was clicked. This works because of event bubbling and makes dynamic UIs much easier to manage.",
    category: "learning",
    timestamp: "7 January 2025 at 09:30",
  },
  {
    id: "2b3c4d5e",
    title: "Why I’m building projects without frameworks first",
    content:
      "Using vanilla JS and Node forces me to actually understand what the browser and server are doing. Frameworks make things faster later, but right now fundamentals matter more than speed.",
    category: "reflection",
    timestamp: "15 January 2025 at 21:12",
  },
  {
    id: "4d5e6f7g",
    title: "Idea: The Log Book",
    content:
      "A simple app to store learning notes, thoughts, bugs, and ideas in one place. The goal isn’t complexity — it’s consistency. Something I can actually use every day.",
    category: "ideas",
    timestamp: "4 February 2025 at 10:05",
  },
  {
    id: "5f6g7h8i",
    title: "Understanding Closures",
    content:
      "Closures let a function remember variables from its outer scope even after that outer function has finished executing. Super useful for private variables and callbacks.",
    category: "learning",
    timestamp: "12 February 2026 at 09:45",
  },
  {
    id: "6g7h8i9j",
    title: "Why I love writing README files",
    content:
      "Writing a good README forces me to clearly explain what my project does and how to use it. It's a mix of teaching and documenting — helps me think through my work.",
    category: "reflection",
    timestamp: "13 February 2026 at 14:20",
  },
  {
    id: "7h8i9j0k",
    title: "Idea: Daily Coding Challenge",
    content:
      "A mini-app that gives me a small coding challenge every day, tracks my streak, and shows how I improve over time. Could integrate tips and explanations for each problem.",
    category: "ideas",
    timestamp: "14 February 2026 at 11:00",
  },
  {
    id: "8i9j0k1l",
    title: "Async/Await vs Promises",
    content:
      "Async/await is syntactic sugar over promises. Makes code look synchronous but still non-blocking. Very handy for API calls or sequential async tasks.",
    category: "learning",
    timestamp: "15 February 2026 at 16:45",
  },
  {
    id: "9j0k1l2m",
    title: "Reflection on debugging mindset",
    content:
      "Instead of immediately Googling errors, I try to reason through the problem first. This builds intuition and reduces dependency on stack overflow over time.",
    category: "reflection",
    timestamp: "16 February 2026 at 19:30",
  },
  {
    id: "0k1l2m3n",
    title: "Idea: Logbook Tagging System",
    content:
      "Allow users to tag notes with multiple labels for easier searching and grouping. Maybe even color-code tags for quick visual cues 🫡.",
    category: "ideas",
    timestamp: "17 February 2026 at 16:34",
    updatedAt: "2026-02-17T15:34:22.791Z",
  },
];

async function importNotes() {
  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });

  try {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected!");

    const db = client.db(dbName);
    const usersCollection = db.collection("users");
    const notesCollection = db.collection(collectionName);

    // ===== STEP 1: Create or find demo user =====
    console.log("\n👤 Setting up demo user...");

    // Hash demo user password
    const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10);

    // Upsert demo user (create if doesn't exist)
    const demoUser = await usersCollection.findOneAndUpdate(
      { email: DEMO_USER.email },
      {
        $setOnInsert: {
          ...DEMO_USER,
          password: hashedPassword,
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    console.log(
      `✅ Demo user ready: ${DEMO_USER.email} / ${DEMO_USER.password}`,
    );
    console.log(`   User ID: ${demoUser._id}`);

    // ===== STEP 2: Clear existing notes =====
    console.log("\n🗑️  Clearing existing notes...");
    const deleteResult = await notesCollection.deleteMany({});
    console.log(`   Removed ${deleteResult.deletedCount} old notes`);

    // ===== STEP 3: Transform notes with userId =====
    console.log(`\n📝 Preparing to import ${oldNotes.length} notes...`);

    const notesToInsert = oldNotes.map((note) => {
      const mongoNote = {
        title: note.title,
        content: note.content,
        category: note.category,
        timestamp: note.timestamp,
        userId: demoUser._id, // CRITICAL: Assign to demo user!
        createdAt: new Date().toISOString(),
      };

      // If the note has updatedAt, include it
      if (note.updatedAt) {
        mongoNote.updatedAt = note.updatedAt;
      }

      // Optional: preserve original ID as a field
      mongoNote.originalId = note.id;

      return mongoNote;
    });

    // ===== STEP 4: Insert notes =====
    console.log(`💾 Inserting notes...`);
    const result = await notesCollection.insertMany(notesToInsert);

    console.log(`\n✅ SUCCESS! Imported ${result.insertedCount} notes!`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Demo User ID: ${demoUser._id}`);
    console.log(`   - Demo Email: ${DEMO_USER.email}`);
    console.log(`   - Demo Password: ${DEMO_USER.password}`);
    console.log(`   - Notes imported: ${result.insertedCount}`);

    // ===== STEP 5: Show sample notes =====
    console.log(`\n📋 Sample notes (first 3):`);
    const sampleNotes = await notesCollection
      .find({ userId: demoUser._id })
      .limit(3)
      .toArray();

    sampleNotes.forEach((note, i) => {
      console.log(`   ${i + 1}. ${note.title} (${note.category})`);
    });

    // ===== STEP 6: Count by category =====
    const categoryCount = await notesCollection
      .aggregate([
        { $match: { userId: demoUser._id } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    console.log(`\n📊 Notes by category:`);
    categoryCount.forEach((c) => {
      console.log(`   - ${c._id}: ${c.count} notes`);
    });
  } catch (err) {
    console.error("❌ Import failed:", err.message);
    if (err.code === 11000) {
      console.error("   Duplicate key error - might be email already exists");
    }
  } finally {
    await client.close();
    console.log("\n👋 Connection closed.");
  }
}

// Run the import
importNotes();
