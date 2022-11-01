class UsernameExistedError extends Error {
  constructor(username) {
    super("USERNAME_EXISTED");
    this.username = username;
  }
}

module.exports = UsernameExistedError;
