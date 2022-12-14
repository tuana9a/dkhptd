export default class Account {
  _id?: string;
  name?: string;
  username?: string;
  password?: string;

  constructor({ _id, username, name, password }: {
    _id?: string;
    username?: string;
    name?: string;
    password?: string;
  }) {
    this._id = _id;
    this.username = username;
    this.name = name;
    this.password = password;
  }
}
