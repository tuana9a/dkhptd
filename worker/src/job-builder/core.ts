/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */

import { StackMustBeArrayOfAction } from "./errors";
import { nullify } from "./utils";
import { Page } from "puppeteer-core";
import { DoingInfo } from "./types";

export class Context {
  job: string;

  page: Page;

  libs;

  params;

  vars;

  currentStepIdx: number;

  currentNestingLevel: number;

  isBreak: boolean;

  isReturn: boolean;

  stacks: Action[];

  logs: ActionLog[];

  runContext: (context: Context) => unknown;

  onDoing: (info: DoingInfo) => unknown;

  parentAction: Action;

  constructor(o: {
    job: string;

    page: Page;

    libs;

    params;

    vars?;

    currentStepIdx: number;

    currentNestingLevel: number;

    isBreak: boolean;

    isReturn?: boolean;

    stacks: Action[];

    logs: ActionLog[];

    runContext?: (context: Context) => unknown;

    onDoing?: (info: DoingInfo) => unknown;

    parentAction?: Action;
  }) {
    this.job = o.job;
    this.page = o.page;
    this.libs = o.libs;
    this.params = o.params;
    this.vars = o.vars || {};
    this.currentStepIdx = o.currentStepIdx;
    this.currentNestingLevel = o.currentNestingLevel;
    this.isBreak = o.isBreak;
    this.isReturn = o.isReturn;
    this.stacks = o.stacks;
    this.logs = o.logs;
    this.runContext = o.runContext;
    this.onDoing = o.onDoing || (() => null);
    this.parentAction = o.parentAction;
  }
}

export class Action {
  isAction = true;

  type: string;

  currentContext: Context;

  page: Page;

  stepIdx: number;

  nestingLevel: number;

  nestingLogs: ActionLog[] = [];

  output;

  name: string;

  constructor(type: string) {
    this.type = type;
  }

  withName(name: string) {
    this.name = name;
    return this;
  }

  setContext(context: Context) {
    this.currentContext = context;
  }

  setStepIdx(step: number) {
    this.stepIdx = step;
  }

  setNestingLevel(level: number) {
    this.nestingLevel = level;
  }

  setOutput(output) {
    this.output = output;
  }

  // eslint-disable-next-line class-methods-use-this
  run(): unknown {
    return Promise.resolve(0);
  }
}

export class ActionLog {
  action: string;

  type: string;

  stepIdx: number;

  nestingLevel: number;

  nestingLogs: ActionLog[];

  output;

  error;

  at: number;

  constructor(action: Action, output?) {
    this.at = Date.now();
    this.action = action.name;
    this.type = action.type;
    this.stepIdx = action.stepIdx;
    this.nestingLevel = action.nestingLevel;
    this.nestingLogs = action.nestingLogs;
    this.output = output;
  }

  withError(error) {
    this.error = error;
    return this;
  }

  withNestingLogs(logs: ActionLog[]) {
    this.nestingLogs = logs;
    return this;
  }
}

export class Job {
  name: string;

  params;

  libs;

  actions: Action[];

  isJob: boolean;

  constructor(o: { name: string; actions: Action[] }) {
    this.name = o.name;
    this.actions = o.actions;
    this.isJob = true;
  }
}

export async function runContext(context: Context) {
  if (!context.stacks.every(x => x.isAction)) {
    throw new StackMustBeArrayOfAction(context.stacks);
  }

  let action = context.stacks.pop();

  while (action) {
    const actionName = action.name;
    action.setContext(context); // TODO: maybe mem leak with cyclic reference context -> action -> context
    action.setStepIdx(context.currentStepIdx);
    action.setNestingLevel(context.currentNestingLevel);
    action.page = context.page;
    action.output = null; // reset previous run output (ex: ForRunner will reuse previous action)
    action.nestingLogs = [];

    context.onDoing({
      job: context.job,
      action: actionName,
      stepIdx: action.stepIdx,
      nestingLevel: action.nestingLevel,
      stacks: Array.from(context.stacks).map((x) => x.name).reverse(),
      at: Date.now(),
    });

    // trust action does whatever it does
    // - recursively call runContext
    // - destroy context
    // - create nested context
    const output = await action.run();
    action.setOutput(output);
    context.logs.push(new ActionLog(action, output));

    action = context.stacks.pop();
    context.currentStepIdx += 1;
  }

  return context;
}

export async function runNestedContext(nestedContext: Context) {
  try {
    await runContext(nestedContext);
    nestedContext.parentAction.nestingLogs.push(...nestedContext.logs);
    return nestedContext;
  } catch (err) {
    nestedContext.parentAction.nestingLogs.push(...nestedContext.logs);
    throw err;
  }
}

export async function runNestedAction(parentAction: Action, nestedAction: Action) {
  const nestedContext = createNestedContextFromAction(parentAction);
  nestedContext.stacks.push(nestedAction);
  await runNestedContext(nestedContext);
  return nestedAction.output;
}

export function createNestedContextFromAction(parentAction: Action, currentStepIdx = 0) {
  const context = parentAction.currentContext;
  return new Context({
    job: context.job,
    page: context.page,
    libs: context.libs,
    params: context.params,
    currentStepIdx: currentStepIdx,
    currentNestingLevel: context.currentNestingLevel + 1, // nesting + 1
    isBreak: false,
    stacks: [],
    logs: [],
    runContext: context.runContext, // TODO: are you sure
    onDoing: context.onDoing,
    vars: context.vars,
    parentAction: parentAction,
  });
}

export function cloneContext(context: Context) {
  return new Context({
    job: context.job,
    page: context.page,
    libs: context.libs,
    params: context.params,
    currentStepIdx: context.currentStepIdx,
    currentNestingLevel: context.currentNestingLevel,
    isBreak: false,
    stacks: [],
    logs: [],
    runContext: context.runContext,
    onDoing: context.onDoing,
    vars: context.vars,
  });
}

export function destroyContext(context: Context) {
  let action = context.stacks.pop();
  while (action) {
    nullify(action);
    action = context.stacks.pop();
  }
}

export function isValidAction(action: Action) {
  if (typeof action != "object") {
    return false;
  }
  if (!action.isAction) {
    return false;
  }
  return true;
}

export function isValidArrayOfActions(actions: Action[]) {
  if (!actions) return false;
  if (!Array.isArray(actions)) return false;
  if (actions.some((x) => !isValidAction(x))) return false;
  return true;
}

export function isValidJob(action: Job) {
  if (!action.isJob) {
    return false;
  }
  return true;
}