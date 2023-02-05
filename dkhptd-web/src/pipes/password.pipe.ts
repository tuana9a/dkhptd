import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "password" })
export class PasswordPipe implements PipeTransform {
  transform(value?: string, show = false): string {
    value = String(value);
    return show ? value : Array.from(value).map(() => "x").join("");
  }
}