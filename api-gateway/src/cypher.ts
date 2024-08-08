/**
 * Thanks this tutorial https://www.tutorialspoint.com/encrypt-and-decrypt-data-in-nodejs
 * @author Mayank Agarwal
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

class Cypher {
  __secret: string;
  __iv: string;

  constructor(secret: string, iv: string) {
    this.__secret = secret;
    this.__iv = iv;
  }

  e(text: string) {
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(this.__secret, "hex"), Buffer.from(this.__iv, "hex"));
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString("hex");
  }

  d(text: string) {
    const encryptedText = Buffer.from(text, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(this.__secret, "hex"), Buffer.from(this.__iv, "hex"));
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}

export const c = (secret: string, iv: string) => new Cypher(secret, iv);
