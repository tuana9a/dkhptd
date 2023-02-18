import { cfg, CollectionName } from "./cfg";
import { mongoConnectionPool } from "./connections";
import { Settings } from "./entities";
import { toNormalizedString } from "./utils";

class CachedSettings {
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
    this.settings.addTermIds(Array.from(new Set(termIds.map(x => toNormalizedString(x)))).sort(((a, b) => a.localeCompare(b))));
  }

  replaceTermIds(termIds: string[]) {
    this.settings.replaceTermIds(Array.from(new Set(termIds.map(x => toNormalizedString(x)))).sort(((a, b) => a.localeCompare(b))));
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

export const cachedSettings = new CachedSettings();
