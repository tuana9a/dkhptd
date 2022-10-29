class Timestamp {
  constructor(date = new Date()) {
    this.n = date.getTime();
    this.s = date.toString();
  }
}

module.exports = Timestamp;
