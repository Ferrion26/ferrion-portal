import crypto from "crypto";

// Collector API keys are high-entropy generated secrets (not user-chosen
// passwords), so a fast SHA-256 hash is appropriate here — unlike User.passwordHash,
// which uses bcrypt to slow down brute-forcing of low-entropy human passwords.
const KEY_PREFIX = "fcs_"; // "ferrion collector secret"

export function generateApiKey() {
  const raw = `${KEY_PREFIX}${crypto.randomBytes(32).toString("base64url")}`;
  return { raw, hash: hashApiKey(raw) };
}

export function hashApiKey(raw: string) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
