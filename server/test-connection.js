import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// FORCE GOOGLE DNS - THIS IS THE KEY!
dns.setServers(["8.8.8.8", "8.8.4.4"]);

async function testConnection() {
  console.log("🔌 Testing MongoDB connection...");
  console.log("URI:", process.env.MONGODB_URI?.replace(/:[^:@]*@/, ":****@"));

  // Test DNS resolution first
  const hostname = "notes.hzawcoj.mongodb.net";
  console.log(`\n🔍 Testing DNS for ${hostname}...`);

  dns.resolve(hostname, (err, addresses) => {
    if (err) {
      console.log("❌ DNS resolve failed:", err.code);
    } else {
      console.log("✅ DNS resolve succeeded:", addresses);
    }
  });

  dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
    if (err) {
      console.log("❌ SRV resolve failed:", err.code);
    } else {
      console.log("✅ SRV resolve succeeded:", addresses);
    }

    // Now try mongoose connection
    mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => {
        console.log("✅ SUCCESS! Connected to MongoDB");
        process.exit(0);
      })
      .catch((err) => {
        console.error("❌ Connection failed:", err.message);
        process.exit(1);
      });
  });
}

testConnection();
