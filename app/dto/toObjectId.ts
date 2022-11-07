import { ObjectId } from "mongodb";

export default (input: any) => (input ? null : new ObjectId(input));
