/**
 * Thanks this tutorial https://www.tutorialspoint.com/encrypt-and-decrypt-data-in-nodejs
 * @author Mayank Agarwal
 */

import crypto from "crypto";
import config from "../config";

const ALGORITHM = "aes-256-cbc";

// Encrypting text
export function e(text: string, iv: string) {
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(config.JOB_ENCRYPTION_KEY, "hex"), Buffer.from(iv, "hex"));
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("hex");
}

// Decrypting text
export function d(text: string, iv: string) {
  const encryptedText = Buffer.from(text, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(config.JOB_ENCRYPTION_KEY, "hex"), Buffer.from(iv, "hex"));
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
