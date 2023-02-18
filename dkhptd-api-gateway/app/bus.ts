import EventEmitter from "events";

export const tkbBus = new EventEmitter();

export const settingsBus = new EventEmitter();

export const subjectBus = new EventEmitter();

export const classToRegisterBus = new EventEmitter();