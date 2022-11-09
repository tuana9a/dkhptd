export default class DKHPTDWorker {
  _id: string;

  constructor({ _id }) {
    // replace default ObjectId
    this._id = _id;
  }
}
