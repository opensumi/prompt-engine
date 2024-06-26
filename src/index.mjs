import { load as loadToml } from "js-toml";
import fs from "node:fs/promises";
import path from "node:path";
import nunjunks from "nunjucks";
import { parse as parseYaml } from "yaml";
import { exists } from "./fse.mjs";

export class PromptEngine {
  actions = [];

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

  buildPrompt() {
    let prompt = this.template;
    if (this.actions && this.actions.length > 0) {
      let actionsPrompt = `执行这些步骤: \n`;
      this.actions.forEach((action, idx) => {
        actionsPrompt += `${idx + 1}. ${action}\n`;
      });
      prompt += actionsPrompt;
    }

    if (this.outputStyle) {
      let outputPrompt = `\n请确保你的输出格式满足以下要求：\n${this.outputStyle}`;

      prompt += outputPrompt;
    }

    return prompt;
  }

  render(obj) {
    return this.env.renderString(this.buildPrompt(), obj).trim();
  }

  async renderFile(filePath) {
    if (!await exists(filePath)) {
      throw new Error("File not found");
    }

    const file = await fs.readFile(filePath, "utf-8");

    let data;
    if (filePath.endsWith(".yml")) {
      data = parseYaml(file);
    } else if (filePath.endsWith(".json")) {
      data = JSON.parse(file);
    } else if (filePath.endsWith(".toml")) {
      data = loadToml(file);
    } else {
      throw new Error("Unsupported file type");
    }

    return this.render(data);
  }

  async renderFolder(folderPath, outFolder, options) {
    if (!await exists(folderPath)) {
      throw new Error("Folder not found: " + folderPath);
    }

    if (await exists(outFolder)) {
      if (options.clearOutput) {
        await fs.rm(outFolder, { recursive: true });
        await fs.mkdir(outFolder, { recursive: true });
      }
    } else {
      await fs.mkdir(outFolder, { recursive: true });
    }

    const files = await fs.readdir(folderPath);

    for (const file of files) {
      const target = path.join(folderPath, file);
      // check is a dir
      if ((await fs.stat(target)).isDirectory()) {
        await this.renderFolder(target, path.join(outFolder, file), options);
      } else {
        const result = await this.renderFile(target);
        await fs.writeFile(path.join(outFolder, file + ".out"), result);
      }
    }
  }

  addAction(action) {
    this.actions.push(action);
  }

  setOutputStyle(style) {
    this.outputStyle = style;
  }
}
