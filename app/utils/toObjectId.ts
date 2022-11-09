import { ObjectId } from "mongodb";

export default (input) => (input ? null : new ObjectId(input));
