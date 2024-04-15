import * as a from "./actions";
import { Action, isValidArrayOfActions } from "./core";
import { NotAnArrayOfActionsError, RequiredParamError } from "./errors";
import { PuppeteerLifeCycleEvent, ClickOpts, GetValueFromParamsFunction, GetActionOutputOpts, ArrayGeneratorFunction, VarsHandlerFunction, PrimitiveType, GetTextContentOpts } from "./types";

export function Click(selector: string, opts: ClickOpts = { clickCount: 1 }) {
  if (!selector) throw new RequiredParamError("selector").withBuilderName(Click.name);
  return new a.Click(selector, opts).withName(`${Click.name}: ${selector}`);
}

export function GoTo(url: string) {
  if (!url) throw new RequiredParamError("url").withBuilderName(GoTo.name);
  return new a.GoTo(url).withName(`${GoTo.name}: ${url}`);
}

export function CurrentUrl() {
  return new a.CurrentUrl().withName(`${CurrentUrl.name}`);
}

export function Reload() {
  return new a.Reload().withName(Reload.name);
}

export function F5() {
  return new a.Reload().withName(F5.name);
}

export function WaitForTimeout(timeout: number) {
  if (!timeout) throw new RequiredParamError("timeout").withBuilderName(WaitForTimeout.name);
  return new a.WaitForTimeout(timeout).withName(`${WaitForTimeout.name}: ${timeout}`);
}

export function BringToFront() {
  return new a.BringToFront().withName(`${BringToFront.name}`);
}

export function ScreenShot(selector: string, saveTo: string | Action = "./tmp/temp.png", type: "png" | "jpeg" | "webp" = "png") {
  if (typeof saveTo == "object" && (saveTo as Action).isAction) {
    return new a.ScreenShotWithPathIsActionOutput(selector, saveTo, type).withName(`${ScreenShot.name}: ${selector} > ${saveTo}`);
  }
  return new a.ScreenShot(selector, saveTo as string, type).withName(`${ScreenShot.name}: ${selector} > ${saveTo}`);
}

export function WaitForNavigation(waitUntil: PuppeteerLifeCycleEvent = "networkidle0") {
  return new a.WaitForNavigation(waitUntil).withName(`${WaitForNavigation.name}: ${waitUntil}`);
}

/** @deprecated use Params instead */
export function GetValueFromParams(getter: GetValueFromParamsFunction) {
  if (!getter) throw new RequiredParamError("getter").withBuilderName(GetValueFromParams.name);
  return new a.GetParamsValueByFunction(getter).withName(`${GetValueFromParams.name}: ${String(getter)}`);
}

export function Params(pathOrFunction: string | GetValueFromParamsFunction) {
  if (!pathOrFunction) throw new RequiredParamError("getter").withBuilderName(Params.name);
  if (typeof pathOrFunction == "function") return new a.GetParamsValueByFunction(pathOrFunction).withName(`${Params.name}: ${String(pathOrFunction)}`);
  return new a.GetParamsValueByPath(pathOrFunction as string).withName(`${Params.name}: ${pathOrFunction}`);
}

export function GetValueFromOutput(opts: GetActionOutputOpts) {
  if (!opts) throw new RequiredParamError("opts").withBuilderName(GetValueFromParams.name);
  return new a.GetActionOutput(opts).withName(`${GetValueFromOutput.name}: ${JSON.stringify(opts)}`);
}

export function GetOutputFromPreviousAction() {
  return GetValueFromOutput({ fromCurrent: -1 });
}

/** @deprecated use TextContent instead */
export function GetTextContent(selector: string, opts?: GetTextContentOpts) {
  if (!selector) throw new RequiredParamError("selector").withBuilderName(GetTextContent.name);
  return new a.GetTextContent(selector, opts).withName(`${GetTextContent.name}: ${selector}`);
}

export function TextContent(selector: string, opts?: GetTextContentOpts) {
  if (!selector) throw new RequiredParamError("selector").withBuilderName(TextContent.name);
  return new a.GetTextContent(selector, opts).withName(`${TextContent.name}: ${selector}`);
}

/**
 * Ex: TypeIn("#input-username", "123412341234")
 * Ex: TypeIn("#input-password", GetTextContent("#hidden-password"))
 */
export function TypeIn(selector: string, value: string | Action) {
  if (!selector) throw new RequiredParamError("selector").withBuilderName(TypeIn.name);
  if (typeof value == "object" && (value as Action).isAction) {
    return new a.TypeInActionOutput(selector, value as Action).withName(`${TypeIn.name}: ${selector}`);
  }
  return new a.TypeInDirectValue(selector, value as string).withName(`${TypeIn.name}: ${selector}`);
}

/**
 * @deprecated use Break() instead
 */
export function BreakPoint() {
  return new a.Break().withName(BreakPoint.name);
}

export function Break() {
  return new a.Break().withName(BreakPoint.name);
}

export function If(value: Action | PrimitiveType) {
  if (typeof value == "object" && (value as Action).isAction) {
    return new a.IfActionOutput(value as Action).withName(`${If.name}: ${(value as Action).name}`);
  }
  return new a.If(value).withName(`${If.name}: ${value}`);
}

export function For(value: [] | ArrayGeneratorFunction | Action) {
  return new a.ForV2(value).withName(For.name);
}

export function IsEqual(value: Action | PrimitiveType, other: PrimitiveType) {
  if (typeof value == "object" && (value as Action).isAction) {
    return new a.IsActionOutputEqualValue(value as Action, other).withName(`${IsEqual.name}: ${(value as Action).name} == ${other}`);
  }
  return new a.IsTwoValueEqual(value, other).withName(`${IsEqual.name}: ${value} == ${other}`);
}

export function IsStrictEqual(value: Action | PrimitiveType, other) {
  if (typeof value == "object" && (value as Action).isAction) {
    return new a.IsActionOutputStrictEqualValue(value as Action, other).withName(`${IsStrictEqual.name}: ${(value as Action).name} === ${other}`);
  }
  return new a.IsTwoValueStrictEqual(value, other).withName(`${IsStrictEqual.name}: ${value} === ${other}`);
}

export function PageEval(handler: () => unknown) {
  if (!handler) throw new RequiredParamError("handler").withBuilderName(PageEval.name);
  return new a.PageEval(handler).withName(`${PageEval.name}: ${handler.name}`);
}

export function SetVars(pathOrFunction: VarsHandlerFunction | string, value?: Action | PrimitiveType) {
  if (!pathOrFunction) throw new RequiredParamError("handler").withBuilderName(SetVars.name);
  if (typeof pathOrFunction == "function") {
    return new a.SetVarsByFunction(pathOrFunction).withName(`${SetVars.name}: ${pathOrFunction}`);
  }
  if (typeof pathOrFunction == "string" && (value as Action).isAction) {
    return new a.SetVarsWithActionOutput(pathOrFunction, value as Action).withName(`${SetVars.name}: ${pathOrFunction} ${(value as Action).name}`);
  }
  return new a.SetVarsDirectValue(pathOrFunction, value).withName(`${SetVars.name}: ${pathOrFunction} <direct>`);
}

export function GetVars(pathOrFunction: string | VarsHandlerFunction) {
  if (!pathOrFunction) throw new RequiredParamError("path").withBuilderName(GetVars.name);
  if (typeof pathOrFunction == "function") {
    return new a.GetVarsByFunction(pathOrFunction).withName(`${GetVars.name}: ${pathOrFunction}`);
  }
  return new a.GetVars(pathOrFunction).withName(`${GetVars.name}: ${pathOrFunction}`);
}

export function Try(actions: Action[]) {
  if (!actions) throw new RequiredParamError("actions").withBuilderName(Try.name);
  if (!isValidArrayOfActions(actions)) throw new NotAnArrayOfActionsError(actions);
  return new a.Try(actions).withName(Try.name);
}