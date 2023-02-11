import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "json" })
export class ToJsonPipe implements PipeTransform {
  transform(value?: unknown, replace?: (string | number)[] | null, space?: string | number): string {
    return JSON.stringify(value, replace, space);
  }
}