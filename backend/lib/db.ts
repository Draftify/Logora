import { Client } from "@opensearch-project/opensearch";
import { config } from "../config/config";

export const db = new Client({
  node: config.db.url,
  auth: {
    username: config.db.username,
    password: config.db.password,
  },
});
