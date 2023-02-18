/**
 * Thanks this tutorial https://www.tutorialspoint.com/encrypt-and-decrypt-data-in-nodejs
 * @author Mayank Agarwal
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

class Cypher {
  secret: string;
  _iv: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  iv(iv: string) {
    this._iv = iv;
    return this;
  }

  encrypt(text: string) {
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(this.secret, "hex"), Buffer.from(this._iv, "hex"));
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString("hex");
  }

  decrypt(text: string) {
    const encryptedText = Buffer.from(text, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(this.secret, "hex"), Buffer.from(this._iv, "hex"));
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}

export const c = (secret: string) => new Cypher(secret);
