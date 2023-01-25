import { ObjectId } from "mongodb";
import BaseResponse from "./payloads/BaseResponse";

export class SafeError extends Error {
  code: number;

  __isSafeError: boolean;

  constructor(message: string) {
    super(message);
    this.__isSafeError = true;
  }

  toBaseResponse() {
    return new BaseResponse().failed().msg(this.message).codee(this.code);
  }
}

export class CompareFailedError extends SafeError {
  value;

  comparator;

  path;

  constructor(name: string, value?, comparator?) {
    super("COMPARE_FAILED");
    this.path = name;
    this.value = value;
    this.comparator = comparator;
  }
}

export class EmptyStringError extends SafeError {
  path: string;
  value;

  constructor(name: string, value?) {
    super("EMPTY_STRING");
    this.path = name;
    this.value = value;
  }
}

export class FaslyValueError extends SafeError {
  value;
  path: string;

  constructor(name: string, value?) {
    super("FALSY_VALUE");
    this.path = name;
    this.value = value;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ message: this.message, value: this.value }).msg(this.message);
  }
}

export class InvalidClassIdsError extends SafeError {
  value;

  constructor(value?) {
    super("INVALID_CLASS_IDS");
    this.value = value;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ message: this.message, value: this.value }).msg(this.message);
  }
}

export class InvalidCttSisPassswordError extends SafeError {
  value;

  constructor(value?) {
    super("INVALID_CTT_SIS_PASSWORD");
    this.value = value;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ message: this.message, value: this.value }).msg(this.message);
  }
}

export class InvalidCttSisUsernameError extends SafeError {
  value;

  constructor(value?) {
    super("INVALID_CTT_SIS_USERNAME");
    this.value = value;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ message: this.message, value: this.value }).msg(this.message);
  }
}

export class InvalidTermIdError extends SafeError {
  value;

  constructor(value?) {
    super("INVALID_TERM_ID");
    this.value = value;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ message: this.message, value: this.value }).msg(this.message);
  }
}

export class InvalidValueError extends SafeError {
  value;

  constructor(value?) {
    super("INVALID_VALUE");
    this.value = value;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ message: this.message, value: this.value }).msg(this.message);
  }
}

export class JobNotFoundError extends SafeError {
  jobId: string | ObjectId;

  constructor(jobId: string | ObjectId) {
    super("JOB_NOT_FOUND");
    this.jobId = jobId;
  }

  toBaseResponse(): BaseResponse<unknown> {
    return new BaseResponse().failed(this.jobId).msg(this.message);
  }
}

export class MissingRequestBodyDataError extends SafeError {
  constructor() {
    super("MISSING_REQUEST_BODY_DATA");
  }
}

export class MissingTimeToStartError extends SafeError {
  constructor() {
    super("MISSING_TIME_TO_START");
  }

  toBaseResponse(): BaseResponse<unknown> {
    return new BaseResponse().failed().msg(this.message);
  }
}

export class NotAnArrayError extends SafeError {
  path: string;
  value;

  constructor(name: string, value?) {
    super("NOT_AN_ARRAY");
    this.path = name;
    this.value = value;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ message: this.message, value: this.value }).msg(this.message);
  }
}

export class RequireLengthFailed extends SafeError {
  path: string;
  input;
  comparator;

  constructor(name: string, input?, comparator?) {
    super("REQUIRE_LENGTH_FAILED");
    this.path = name;
    this.input = input;
    this.comparator = comparator;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ input: this.input, comparator: this.comparator }).msg(this.message);
  }
}

export class RequireMatchFailed extends SafeError {
  path: string;
  input;
  regex: RegExp;


  constructor(name: string, regex?: RegExp, input?) {
    super("REQUIRE_MATCH_FAILED");
    this.path = name;
    this.input = input;
    this.regex = regex;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ input: this.input, regex: this.regex }).msg(this.message);
  }
}

export class TypeMismatchError extends SafeError {
  value;
  type;
  path: string;

  constructor(name: string, type, value?) {
    super("TYPE MISMATCH");
    this.path = name;
    this.value = value;
    this.type = type;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ path: this.path, value: this.value, type: this.type }).msg(this.message);
  }
}

export class UsernameExistedError extends SafeError {
  username: string;

  constructor(username: string) {
    super("USERNAME_EXISTED");
    this.username = username;
  }

  toBaseResponse() {
    return new BaseResponse().failed(this.username).msg(this.message);
  }
}

export class UsernameNotFoundError extends SafeError {
  accountId: string | ObjectId;

  constructor(accountId?: string | ObjectId) {
    super("USERNAME_NOT_FOUND");
    this.accountId = accountId;
  }

  toBaseResponse(): BaseResponse<unknown> {
    return new BaseResponse().failed(this.accountId).msg(this.message);
  }
}

export class WrongPasswordError extends SafeError {
  accountId: string | ObjectId;

  constructor(accountId?: string | ObjectId) {
    super("WRONG_PASSWORD");
    this.accountId = accountId;
  }

  toBaseResponse(): BaseResponse<unknown> {
    return new BaseResponse().failed(this.accountId).msg(this.message);
  }
}