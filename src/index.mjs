import { load } from "js-toml";
import fs from "node:fs/promises";
import nunjunks from "nunjucks";
import { parse } from "yaml";
import { exists } from "./fse.mjs";

export class PromptEngine {
  /**
   * @param {string} template
   */
  constructor(template) {
    this.template = template;
    this.env = new nunjunks.Environment(null, {
      autoescape: false,
    });

    this.env.addFilter("default", function(value, defaultValue) {
      return value !== undefined ? value : defaultValue;
    });
  }

  render(obj) {
    return this.env.renderString(this.template, obj).trim();
  }

  async renderFile(filePath) {
    if (!await exists(filePath)) {
      throw new Error("File not found");
    }

    const file = await fs.readFile(filePath, "utf-8");

    let data;
    if (filePath.endsWith(".yml")) {
      data = parse(file);
    } else if (filePath.endsWith(".json")) {
      data = JSON.parse(file);
    } else if (filePath.endsWith(".toml")) {
      data = load(file);
    } else {
      throw new Error("Unsupported file type");
    }

    return this.render(data);
  }
}
