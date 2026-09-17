const { spawn } = require("child_process");

const port = process.env.PORT || 3000;

const command = process.platform === "win32" ? "cmd" : "npx";
const args =
  process.platform === "win32"
    ? ["/c", "npx.cmd", "next", "start", "-p", String(port)]
    : ["next", "start", "-p", String(port)];

const child = spawn(command, args, {
  stdio: "inherit",
  env: process.env
});

child.on("error", (error) => {
  console.error("Failed to start Next.js:", error);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});