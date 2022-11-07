export default class LoginWithUsernamePasswordRequest {
  username: string;
  password: string;

  constructor({ username, password }) {
    this.username = username;
    this.password = password;
  }
}
