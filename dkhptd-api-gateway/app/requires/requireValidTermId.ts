import requireMatch from "./requireMatch";

const matchTermId = requireMatch(/^\d+\w*$/);

export default (name: string, input) => matchTermId(name, input);
