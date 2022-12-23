export default class AccountPreference {
  _id?: string;
  termId: string;
  wantedSubjectIds: string[];
  ownerAccountId?: string;

  constructor({ _id, termId: termId, wantedSubjectIds, ownerAccountId }: {
    _id?: string;
    termId: string;
    ownerAccountId?: string;
    wantedSubjectIds: string[];
  }) {
    this._id = _id;
    this.termId = termId;
    this.wantedSubjectIds = wantedSubjectIds;
    this.ownerAccountId = ownerAccountId;
  }
}
