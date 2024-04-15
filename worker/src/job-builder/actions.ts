/* eslint-disable max-classes-per-file */
import lodash from "lodash";
import { Action, createNestedContextFromAction, isValidArrayOfActions, runNestedAction, runNestedContext } from "./core";
import { InvalidGetActionOutputOptsError, NotAnArrayOfActionsError } from "./errors";
import { PuppeteerLifeCycleEvent, ClickOpts, ArrayGeneratorFunction, GetActionOutputOpts, GetValueFromParamsFunction, VarsHandlerFunction, GetTextContentOpts } from "./types";

export type CreateActionFunction = (...params) => Action;

export class Break extends Action {
  constructor() {
    super(Break.name);
  }

  async run() {
    // empty current context.stacks
    // every actions left will be drop
    this.currentContext.stacks = [];
    this.currentContext.isBreak = true;
  }
}

export class BringToFront extends Action {
  constructor() {
    super(BringToFront.name);
  }

  async run() {
    await this.page.bringToFront();
  }
}

export class Click extends Action {
  selector: string;

  opts?: ClickOpts;

  constructor(selector: string, opts: ClickOpts) {
    super(Click.name);
    this.selector = selector;
    this.opts = opts;
  }

  async run() {
    await this.page.click(this.selector, this.opts);
  }
}

export class CurrentUrl extends Action {
  constructor() {
    super(CurrentUrl.name);
  }

  async run() {
    const url = this.page.url(); // page.url not return promise
    return url;
  }
}

/** @deprecated use ForV2 instead */
export class For extends Action {
  generator: [] | ArrayGeneratorFunction | Action;

  eachRun: (CreateActionFunction | Action)[];

  constructor(generator: [] | ArrayGeneratorFunction | Action) {
    super(For.name);
    this.generator = generator;
    this.eachRun = []; // IMPORTANT
  }

  Each(actions: (CreateActionFunction | Action)[]) {
    // each can be function or action mixed so can not check it
    this.eachRun = actions;
    return this;
  }

  async run() {
    let iterators: [] = [];
    let output = [];
    if ((this.generator as Action).isAction) {
      iterators = await runNestedAction(this, this.generator as Action);
      output = iterators;
    } else if (Array.isArray(this.generator as [])) {
      iterators = this.generator as [];
      output = iterators;
    } else {
      iterators = await (this.generator as ArrayGeneratorFunction)();
      output = (iterators as ArrayGeneratorFunction[]).map((x) => String(x));
    }
    const eachRun: (CreateActionFunction | Action)[] = Array.from((this.eachRun as (CreateActionFunction | Action)[]));
    let contextStepIdx = 0;
    // current implemetation of loop is simple
    // each loop create new context and run immediately
    // no previous stack is used
    for (const i of iterators) {
      const nestedContext = createNestedContextFromAction(this, contextStepIdx);
      for (const run of eachRun) {
        // use .unshift will make stacks works like normal
        if ((run as Action).isAction) {
          nestedContext.stacks.unshift((run as Action));
        } else {
          const newAction = await (run as CreateActionFunction)(i);
          nestedContext.stacks.unshift(newAction);
        }
      }
      await runNestedContext(nestedContext);
      contextStepIdx = nestedContext.currentStepIdx;
      if (nestedContext.isBreak) {
        break;
      }
    }
    return output;
  }
}

export class ForRunner extends Action {
  eachRun: (CreateActionFunction | Action)[];

  iterators: [];

  currentIteratorIndex: number;

  currentContextStepIdx: number;

  constructor({ iterators, eachRun, currentContextStepIdx, currentIteratorIndex }: {
    eachRun: (CreateActionFunction | Action)[];

    iterators: [];

    currentIteratorIndex: number;

    currentContextStepIdx: number;
  }) {
    super(ForRunner.name);
    this.eachRun = eachRun;
    this.iterators = iterators;
    this.currentContextStepIdx = currentContextStepIdx;
    this.currentIteratorIndex = currentIteratorIndex;
  }

  async run() {
    const eachRun: (CreateActionFunction | Action)[] = Array.from(this.eachRun as (CreateActionFunction | Action)[]);
    const element = this.iterators[this.currentIteratorIndex];
    const nestedContext = createNestedContextFromAction(this, this.currentContextStepIdx);

    // create new context with actions from each run, just create not run immediately
    for (const run of eachRun) {
      // use .unshift will make stacks works like normal
      if ((run as Action).isAction) {
        // direct action
        nestedContext.stacks.unshift((run as Action));
      } else {
        // create action from function
        const newAction = (run as CreateActionFunction)(element, this.currentIteratorIndex, this.iterators);
        nestedContext.stacks.unshift(newAction);
      }
    }

    // wait for new context with each actions to run
    await runNestedContext(nestedContext);

    // check if continue to create for runner for next loop or not
    if (!nestedContext.isBreak && this.currentIteratorIndex < this.iterators.length - 1) {
      // push ForRunner and repeat if match condition (loop simulation)
      const runner = new ForRunner({
        eachRun: this.eachRun,
        iterators: this.iterators,
        currentContextStepIdx: nestedContext.currentStepIdx,
        currentIteratorIndex: this.currentIteratorIndex + 1
      }).withName(ForRunner.name);
      this.currentContext.stacks.push(runner);
    }
  }
}

// TODO: 3 types of For
/**
 * this 'for' implementation: push ForRunner every iteration
 */
export class ForV2 extends Action {
  generator: [] | ArrayGeneratorFunction | Action;

  eachRun: (CreateActionFunction | Action)[];

  constructor(generator: [] | ArrayGeneratorFunction | Action) {
    super(ForV2.name);
    this.generator = generator;
    this.eachRun = []; // IMPORTANT
  }

  Each(actions: (CreateActionFunction | Action)[]) {
    // each can be function or action mixed so can not check it
    this.eachRun = actions;
    return this;
  }

  async run() {
    let iterators: [] = [];
    let output = [];
    if ((this.generator as Action).isAction) {
      // create array from action
      iterators = await runNestedAction(this, this.generator as Action);
      output = iterators;
    } else if (Array.isArray(this.generator as [])) {
      // direct array
      iterators = this.generator as [];
      output = iterators;
    } else {
      // create array from function (supplier)
      iterators = await (this.generator as ArrayGeneratorFunction)();
      output = (iterators as ArrayGeneratorFunction[]).map((x) => String(x));
    }
    const eachRun: (CreateActionFunction | Action)[] = Array.from((this.eachRun as (CreateActionFunction | Action)[]));
    const runner = new ForRunner({
      eachRun: eachRun,
      iterators: iterators,
      currentContextStepIdx: 0,
      currentIteratorIndex: 0
    }).withName(ForRunner.name);
    this.currentContext.stacks.push(runner);
    return output;
  }
}

export class GetActionOutput extends Action {
  opts: GetActionOutputOpts;

  constructor(opts: GetActionOutputOpts) {
    super(GetActionOutput.name);
    this.opts = opts;
  }

  async run() {
    if (Number.isSafeInteger(this.opts.direct)) {
      const value = this.currentContext.logs[this.opts.direct].output;
      return value;
    }
    if (Number.isSafeInteger(this.opts.fromCurrent)) {
      const value = this.currentContext.logs[this.currentContext.currentStepIdx + this.opts.fromCurrent].output;
      return value;
    }
    throw new InvalidGetActionOutputOptsError(this.opts);
  }
}

export class GetTextContent extends Action {
  selector: string;
  opts?: GetTextContentOpts;

  constructor(selector: string, opts?: GetTextContentOpts) {
    super(GetTextContent.name);
    this.selector = selector;
    this.opts = opts;
  }

  async run() {
    const content: string = await this.page.$eval(this.selector, (e: Element) => e.textContent);
    return this.opts?.trim ? content.trim() : content;
  }
}

export class GetParamsValueByFunction extends Action {
  getter: GetValueFromParamsFunction;

  constructor(getter: GetValueFromParamsFunction) {
    super(GetParamsValueByFunction.name);
    this.getter = getter;
  }

  async run() {
    const value = await this.getter(this.currentContext.params);
    return value;
  }
}

export class GetParamsValueByPath extends Action {
  path: string;

  constructor(path: string) {
    super(GetParamsValueByPath.name);
    this.path = path;
  }

  async run() {
    const value = lodash.get(this.currentContext.params, this.path);
    return value;
  }
}

export class GoTo extends Action {
  url: string;

  constructor(url: string) {
    super(GoTo.name);
    this.url = url;
  }

  async run() {
    await this.page.goto(this.url);
    return this.url;
  }
}

export class If extends Action {
  value;

  thenActions: Action[];

  elseActions: Action[];

  constructor(value) {
    super(If.name);
    this.value = value;
    this.thenActions = []; // IMPORTANT
    this.elseActions = []; // IMPORTANT
  }

  Then(actions: Action[]) {
    this.thenActions = actions;
    if (!isValidArrayOfActions(actions)) {
      throw new NotAnArrayOfActionsError(actions).withBuilderName(this.name);
    }
    return this;
  }

  Else(actions: Action[]) {
    if (!isValidArrayOfActions(actions)) {
      throw new NotAnArrayOfActionsError(actions).withBuilderName(this.name);
    }
    this.elseActions = actions;
    return this;
  }

  async run() {
    const output = Boolean(this.value);
    if (output) {
      this.currentContext.stacks.push(...Array.from(this.thenActions).reverse()); // copy array then reverse
    } else {
      this.currentContext.stacks.push(...Array.from(this.elseActions).reverse()); // copy array then reverse
    }
    return output;
  }
}

export class IfActionOutput extends Action {
  ifAction: Action;

  thenActions: Action[];

  elseActions: Action[];

  constructor(ifAction: Action) {
    super(IfActionOutput.name);
    this.ifAction = ifAction;
    this.thenActions = []; // IMPORTANT
    this.elseActions = []; // IMPORTANT
  }

  Then(actions: Action[]) {
    this.thenActions = actions;
    if (!isValidArrayOfActions(actions)) {
      throw new NotAnArrayOfActionsError(actions).withBuilderName(this.name);
    }
    return this;
  }

  Else(actions: Action[]) {
    if (!isValidArrayOfActions(actions)) {
      throw new NotAnArrayOfActionsError(actions).withBuilderName(this.name);
    }
    this.elseActions = actions;
    return this;
  }

  async run() {
    const output = await runNestedAction(this, this.ifAction);
    if (output) {
      this.currentContext.stacks.push(...Array.from(this.thenActions).reverse());
    } else {
      this.currentContext.stacks.push(...Array.from(this.elseActions).reverse());
    }
    return output;
  }
}

export class IsTwoValueEqual extends Action {
  value;

  otherValue;

  constructor(value, otherValue) {
    super(IsTwoValueEqual.name);
    this.value = value;
    this.otherValue = otherValue;
  }

  async run() {
    // eslint-disable-next-line eqeqeq
    const output = this.value == this.otherValue;

    return output;
  }
}

export class IsActionOutputEqualValue extends Action {
  action: Action;

  value;

  constructor(action: Action, value) {
    super(IsTwoValueEqual.name);
    this.action = action;
    this.value = value;
  }

  async run() {
    const got = await runNestedAction(this, this.action);

    // eslint-disable-next-line eqeqeq
    const output = got == this.value;

    return output;
  }
}

export class IsTwoValueStrictEqual extends Action {
  value;

  otherValue;

  constructor(value, otherValue) {
    super(IsTwoValueStrictEqual.name);
    this.value = value;
    this.otherValue = otherValue;
  }

  async run() {
    const output = this.value === this.otherValue;

    return output;
  }
}

export class IsActionOutputStrictEqualValue extends Action {
  action: Action;

  value;

  constructor(action: Action, value) {
    super(IsActionOutputStrictEqualValue.name);
    this.action = action;
    this.value = value;
  }

  async run() {
    const got = await runNestedAction(this, this.action);

    const output = got === this.value;

    return output;
  }
}

export class PageEval extends Action {
  handler: () => unknown;

  constructor(handler: () => unknown) {
    super(PageEval.name);
    this.handler = handler;
  }

  async run() {
    const output = await this.page.evaluate(this.handler);
    return output;
  }
}

export class Reload extends Action {
  constructor() {
    super(Reload.name);
  }

  async run() {
    await this.page.reload();
  }
}

export class Return extends Action {
  constructor() {
    super(Return.name);
  }

  async run() {
    this.currentContext.isReturn = true;
  }
}

export class ScreenShot extends Action {
  selector: string;

  saveTo: string;

  type: "png" | "jpeg" | "webp";

  constructor(selector: string, saveTo: string, type: "png" | "jpeg" | "webp") {
    super(ScreenShot.name);
    this.selector = selector;
    this.saveTo = saveTo;
    this.type = type;
  }

  async run() {
    const opts = { selector: this.selector, saveTo: this.saveTo, type: this.type };

    if (!opts.selector) {
      await this.page.screenshot({ path: opts.saveTo, type: opts.type });
      return opts;
    }

    const element = await this.page.$(opts.selector);
    await element.screenshot({ path: opts.saveTo, type: opts.type });
    return opts;
  }
}

export class ScreenShotWithPathIsActionOutput extends Action {
  selector: string;

  saveToAction: Action;

  type: "png" | "jpeg" | "webp";

  constructor(selector: string, saveTo: Action, type: "png" | "jpeg" | "webp") {
    super(ScreenShotWithPathIsActionOutput.name);
    this.selector = selector;
    this.saveToAction = saveTo;
    this.type = type;
  }

  async run() {
    const saveTo = await runNestedAction(this, this.saveToAction);
    const opts = { selector: this.selector, saveTo: saveTo, type: this.type };

    if (!opts.selector) {
      await this.page.screenshot({ path: opts.saveTo, type: opts.type });
      return opts;
    }

    const element = await this.page.$(opts.selector);
    await element.screenshot({ path: opts.saveTo, type: opts.type });
    return opts;
  }
}

export class TypeInDirectValue extends Action {
  selector: string;

  value: string;

  constructor(selector: string, value: string) {
    super(TypeInDirectValue.name);
    this.selector = selector;
    this.value = value;
  }

  async run() {
    const text = String(this.value);
    await this.page.type(this.selector, text);
    return text;
  }
}

export class TypeInActionOutput extends Action {
  selector: string;

  action: Action;

  constructor(selector: string, action: Action) {
    super(TypeInActionOutput.name);
    this.selector = selector;
    this.action = action;
  }

  async run() {
    const output = await runNestedAction(this, this.action);
    const text = String(output);
    await this.page.type(this.selector, text);
    return text;
  }
}

export class WaitForNavigation extends Action {
  waitUntil: PuppeteerLifeCycleEvent;

  constructor(waitUntil: PuppeteerLifeCycleEvent) {
    super(WaitForNavigation.name);

    this.waitUntil = waitUntil;
  }

  async run() {
    await this.page.waitForNavigation({ waitUntil: this.waitUntil });
    return this.waitUntil;
  }
}

export class WaitForTimeout extends Action {
  timeout: number;

  constructor(timeout: number) {
    super(WaitForTimeout.name);
    this.timeout = timeout;
  }

  async run() {
    await this.page.waitForTimeout(this.timeout);
    return this.timeout;
  }
}

export class SetVarsByFunction extends Action {
  handler: VarsHandlerFunction;

  constructor(handler: VarsHandlerFunction) {
    super(SetVarsByFunction.name);
    this.handler = handler;
  }

  async run() {
    await this.handler(this.currentContext.vars);
    return this.currentContext.vars;
  }
}

export class SetVarsWithActionOutput extends Action {
  path: string;
  action: Action;

  constructor(path: string, value: Action) {
    super(SetVarsWithActionOutput.name);
    this.path = path;
    this.action = value;
  }

  async run() {
    const output = await runNestedAction(this, this.action);
    lodash.set(this.currentContext.vars, this.path, output);
    return this.currentContext.vars;
  }
}

export class SetVarsDirectValue extends Action {
  path: string;
  value;

  constructor(path: string, value) {
    super(SetVarsDirectValue.name);
    this.path = path;
    this.value = value;
  }

  async run() {
    lodash.set(this.currentContext.vars, this.path, this.value);
    return this.currentContext.vars;
  }
}

export class GetVars extends Action {
  path: string;

  constructor(path: string) {
    super(GetVars.name);
    this.path = path;
  }

  async run() {
    const output = await lodash.get(this.currentContext.vars, this.path);
    return output;
  }
}

export class GetVarsByFunction extends Action {
  handler: VarsHandlerFunction;

  constructor(handler: VarsHandlerFunction) {
    super(GetVarsByFunction.name);
    this.handler = handler;
  }

  async run() {
    const output = await this.handler(this.currentContext.vars);
    return output;
  }
}

export class Try extends Action {
  tryActions: Action[];
  catchActions: (CreateActionFunction | Action)[];

  constructor(actions: Action[]) {
    super(Try.name);
    this.tryActions = actions;
    this.catchActions = [];
  }

  Catch(actions: (CreateActionFunction | Action)[]) {
    this.catchActions = actions;
    return this;
  }

  async run() {
    const tryContext = createNestedContextFromAction(this);
    // create stacks for new context 
    for (const a of this.tryActions) {
      tryContext.stacks.unshift(a);
    }

    try {
      await runNestedContext(tryContext);
    } catch (err) {
      const catchContext = createNestedContextFromAction(this);
      // create stacks for new context 
      for (const a of this.catchActions) {
        if ((a as Action).isAction) {
          catchContext.stacks.unshift((a as Action));
        } else {
          const newAction = (a as CreateActionFunction)(err);
          catchContext.stacks.unshift(newAction);
        }
      }
      await runNestedContext(catchContext);
    }
  }
}