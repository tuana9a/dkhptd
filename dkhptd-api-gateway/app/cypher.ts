/**
 * Thanks this tutorial https://www.tutorialspoint.com/encrypt-and-decrypt-data-in-nodejs
 * @author Mayank Agarwal
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

class C {
  secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  e(text: string, iv: string) {
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(this.secret, "hex"), Buffer.from(iv, "hex"));
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString("hex");
  }

  d(text: string, iv: string) {
    const encryptedText = Buffer.from(text, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(this.secret, "hex"), Buffer.from(iv, "hex"));
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}

export const c = (secret: string) => new C(secret);
