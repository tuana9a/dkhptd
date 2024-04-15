import { Injectable } from "@angular/core";
import { SettingsApi } from "src/apis/settings.api";

@Injectable({
  providedIn: "root"
})
export class SettingsRepo {
  renewTokenEvery = "1m";
  refreshJobEvery = "2s";

  constructor(private settingsApi: SettingsApi) {
    this.fetchRefreshJobEvery();
    this.fetchRenewTokenEvery();
  }

  fetchRenewTokenEvery() {
    this.settingsApi.getRenewTokenEvery().subscribe(res => {
      if (res.success && res.data) {
        this.renewTokenEvery = res.data;
      }
    });
  }

  fetchRefreshJobEvery() {
    this.settingsApi.getFreshJobEvery().subscribe(res => {
      if (res.success && res.data) {
        this.refreshJobEvery = res.data;
      }
    });
  }
}