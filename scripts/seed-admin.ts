import "dotenv/config";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function prompt(rl: readline.Interface, q: string, opts: { hidden?: boolean } = {}) {
  if (!opts.hidden) return (await rl.question(q)).trim();

  // Hidden input via raw mode
  process.stdout.write(q);
  return new Promise<string>((resolve) => {
    const chars: string[] = [];
    const onData = (chunk: Buffer) => {
      const ch = chunk.toString("utf8");
      for (const c of ch) {
        if (c === "\r" || c === "\n") {
          process.stdin.setRawMode(false);
          process.stdin.removeListener("data", onData);
          process.stdout.write("\n");
          resolve(chars.join(""));
          return;
        } else if (c === "") {
          process.exit(130);
        } else if (c === "" || c === "\b") {
          if (chars.length) chars.pop();
        } else {
          chars.push(c);
        }
      }
    };
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onData);
  });
}

async function main() {
  const rl = readline.createInterface({ input, output });

  console.log("\n🔐 Create a BotForge super admin\n");

  const email = (await prompt(rl, "Email: ")).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error("Invalid email");
  }

  const name = await prompt(rl, "Name (optional, press Enter to skip): ");

  const password = await prompt(rl, "Password (min 8 chars, hidden): ", { hidden: true });
  if (password.length < 8) throw new Error("Password must be at least 8 characters");
  const confirm = await prompt(rl, "Confirm password: ", { hidden: true });
  if (password !== confirm) throw new Error("Passwords do not match");

  rl.close();

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    const hash = await bcrypt.hash(password, 12);
    const updated = await db.user.update({
      where: { email },
      data: { password: hash, role: "superadmin", name: name || existing.name },
    });
    console.log(`\n✓ Updated existing user ${updated.email} → superadmin`);
  } else {
    const hash = await bcrypt.hash(password, 12);
    const created = await db.user.create({
      data: { email, name: name || null, password: hash, role: "superadmin" },
    });
    console.log(`\n✓ Created superadmin ${created.email}`);
  }

  console.log("\nYou can now sign in at /login with that email and password.\n");
}

main()
  .catch((err) => {
    console.error("\n✗", err.message || err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
