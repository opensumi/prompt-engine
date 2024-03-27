import fs from "node:fs/promises";
import nunjunks from "nunjucks";
import { parse } from "yaml";

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
    if (filePath.endsWith(".yml")) {
      const file = await fs.readFile(filePath, "utf-8");
      const data = parse(file);
      return this.render(data);
    }
    throw new Error("Unsupported file type");
  }
}
