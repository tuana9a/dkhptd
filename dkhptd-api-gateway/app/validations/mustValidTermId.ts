import match from "./mustMatchRegex";

const matchTermId = match(/^\d+\w*$/);

export default (name: string, input) => matchTermId(name, input);
