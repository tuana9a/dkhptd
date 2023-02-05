import { Pipe, PipeTransform } from "@angular/core";
import { Q } from "src/merin";

const opTranslate = new Map<string, string>();
opTranslate.set("==", ":");

@Pipe({
  name: "q"
})
export class QPipe implements PipeTransform {
  transform(q: Q, keyTranslate?: Map<string, string>): unknown {
    return [(keyTranslate ? keyTranslate.get(q.key) : q.key), q.value].join(opTranslate.get(q.op));
  }
}
