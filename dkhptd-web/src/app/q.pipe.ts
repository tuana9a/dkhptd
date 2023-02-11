import { Pipe, PipeTransform } from "@angular/core";
import { Q } from "src/merin";

@Pipe({
  name: "q"
})
export class QPipe implements PipeTransform {
  transform(q: Q,
    keyTranslator: (x: string) => string | undefined = x => x,
    opTranslator: (x: string) => string | undefined = x => x): unknown {
    return [keyTranslator(q.key), q.value].join(opTranslator(q.op));
  }
}
