/**
 * Thanks this tutorial https://www.tutorialspoint.com/encrypt-and-decrypt-data-in-nodejs
 * @author Mayank Agarwal
 */

const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";

class C {
  secret;

  constructor(secret) {
    this.secret = secret;
  }

  e(text, iv) {
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(this.secret, "hex"), Buffer.from(iv, "hex"));
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString("hex");
  }

  d(text, iv) {
    const encryptedText = Buffer.from(text, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(this.secret, "hex"), Buffer.from(iv, "hex"));
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}

module.exports.c = (secret) => new C(secret);
