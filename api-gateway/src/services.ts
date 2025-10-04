import { cfg, CollectionName } from "./cfg";
import { mongoConnectionPool } from "./connections";
import { Settings } from "./entities";
import { toNormalizedString } from "./utils";

class SettingsService {
  settings: Settings;

  constructor() {
    this.settings = new Settings();
  }

  async loadFromDb() {
    const doc = await mongoConnectionPool.getClient()
      .db(cfg.DATABASE_NAME)
      .collection(CollectionName.SETTINGS)
      .findOne();
    this.settings = new Settings(doc);
  }

  addTermIds(termIds: string[]) {
    this.settings.termIds = Array.from(new Set([...this.settings.termIds, ...termIds].map(x => toNormalizedString(x)).filter(x => x).sort(((a, b) => a.localeCompare(b)))))
  }

  setTermIds(termIds: string[]) {
    this.settings.termIds = termIds;
  }

  getTermIds() {
    return this.settings.termIds;
  }

  async save() {
    return mongoConnectionPool.getClient()
      .db(cfg.DATABASE_NAME)
      .collection(CollectionName.SETTINGS)
      .replaceOne({}, this.settings, { upsert: true });
  }
}

export const settingsService = new SettingsService();
