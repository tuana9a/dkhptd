import { Injectable } from "@angular/core";

class Opts {
  domain?: string;
  expires?: string;
  path?: string;
}

@Injectable({
  providedIn: "root",
})
export class CookieUtils {
  public get(name: string) {
    const cookies = document.cookie.split(";");
    const cookieName = `${name}=`;

    for (let i = 0; i < cookies.length; i += 1) {
      const c = cookies[i].replace(/^\s+/g, "");
      if (c.indexOf(cookieName) == 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
    return "";
  }

  public delete(name: string, opts = new Opts()) {
    opts.expires = "Thu, 01 Jan 1970 00:00:00 UTC";
    this.set(name, "", opts);
  }

  public set(name: string, value: string, opts = new Opts()) {
    let suffix = "";
    if (opts?.domain) suffix += `domain=${opts.domain};`;
    if (opts?.expires) suffix += `expires=${opts.expires};`;
    suffix += `path=${opts.path ? opts.path : "/"};`;
    document.cookie = `${name}=${value};${suffix}`;
  }
}
