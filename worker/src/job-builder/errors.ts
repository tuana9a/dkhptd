/* eslint-disable max-classes-per-file */

export class JobBuilderError extends Error {
  builderName: string;

  withBuilderName(builderName: string) {
    this.builderName = builderName;
    return this;
  }
}

export class InvalidGetActionOutputOptsError extends JobBuilderError {
  value;

  constructor(value) {
    super(`Ivalid GetActionOutputOpts value: ${value}`);
    this.value = value;
  }
}

export class InvalidJobError extends JobBuilderError {
  constructor(jobName: string) {
    super(`Invalid job "${jobName}"`);
  }
}

export class NotAnActionError extends JobBuilderError {
  ilegalValue;

  constructor(ilegalValue) {
    super(`${ilegalValue} is not a Action`);
    this.ilegalValue = ilegalValue;
  }
}

export class NotAnArrayOfActionsError extends JobBuilderError {
  ilegalValue;

  constructor(ilegalValue) {
    super(`${ilegalValue} is not an array of Actions`);
    this.ilegalValue = ilegalValue;
  }
}

// TODO: input and supported values in opts constructor
export class NotInSupportedValuesError extends JobBuilderError {
  input;

  supportedValues: [];

  constructor(supportedValues: [], input) {
    super(`${input} not in ${supportedValues}`);
    this.supportedValues = supportedValues;
    this.input = input;
  }
}

export class RequiredParamError extends JobBuilderError {
  paramName: string;

  constructor(paramName: string) {
    super(`${paramName} is undefined`);
    this.paramName = paramName;
  }
}

export class StackMustBeArrayOfAction extends JobBuilderError {
  constructor(stacks) {
    super(`${stacks} must be array of actions`);
  }
}