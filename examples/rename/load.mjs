import fs from "node:fs/promises";
import { PromptEngine } from "../../src/index.mjs";

const engine = new PromptEngine(`
我需要你的帮助，请帮我推荐 {{n | default(5)}} 个指定变量的重命名候选项。
我希望这些新的变量名能更符合代码上下文、代码风格，更有意义。

我会将代码分成三段发给你，每段代码用 --- 进行包裹。这些代码是一段 {{language}} 代码片段。
第一段代码是该变量之前的上文，第二段是变量名，第三段是该变量的下文。

---
{{above}}
---

---
{{var}}
---

---
{{below}}
---


你的任务是：
请根据上下文以及代码的作用帮我推荐一下 {{var}} 能替换成哪些变量名，将结果放在代码块中（用 \`\`\` 包裹），每行一个。
`);

// engine.setOutputStyle(`仅推荐 {{n | default(5)}} 个候选项。
// 请不要给我发代码片段，我只需要候选项。
// 你输出的结果需要每行一个候选项，不需要加序号，最后将整个结果用 \`\`\` 包裹。
// `);

await fs.rmdir("examples/rename/cases/out", { recursive: true });
await fs.mkdir("examples/rename/cases/out", { recursive: true });

const files = await fs.readdir("examples/rename/cases/in");
for (const file of files) {
  const result = await engine.renderFile(`examples/rename/cases/in/${file}`);
  console.log(`🚀 ~ result:`, result);
  await fs.writeFile(`examples/rename/cases/out/${file}.out`, result);
}
