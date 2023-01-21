import { ObjectId } from "mongodb";
import BaseEntity from "./BaseEntity";

export default class AccountPreference extends BaseEntity {
  termId: string;
  wantedSubjectIds: string[];
  ownerAccountId: ObjectId;

  constructor({ _id, termId: termId, wantedSubjectIds, ownerAccountId }: {
    _id?: ObjectId;
    termId?: string;
    ownerAccountId: ObjectId;
    wantedSubjectIds?: string[];
  }) {
    super(_id);
    this.termId = termId;
    this.wantedSubjectIds = wantedSubjectIds;
    this.ownerAccountId = ownerAccountId;
  }
}
