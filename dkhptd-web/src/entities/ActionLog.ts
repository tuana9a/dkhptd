export default class ActionLog {
  action?: string;

  type?: string;

  stepIdx?: number;

  nestingLevel?: number;

  nestingLogs?: ActionLog[];

  output?: object;

  error?: object;

  at?: number;
}
