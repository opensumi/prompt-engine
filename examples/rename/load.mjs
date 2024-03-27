import fs from "node:fs/promises";
import { PromptEngine } from "../../src/index.mjs";

const engine = new PromptEngine(`
我需要你的帮助，请帮我推荐 {{n | default(5)}} 个指定变量的重命名候选项。

我会以将代码分成三段发给你，第一段代码是该变量之前的上文，第二段是变量名，第三段是该变量的下文。
每段代码的文本是用 --- 进行包裹的。

---
{{above | trim}}
---

---
{{var | trim}}
---

---
{{below | trim}}
---

代码使用到的语言是 {{language}}。
请根据上下文以及代码的作用帮我推荐一下 {{var}} 能替换成什么变量名，将结果放在代码块中（用 \`\`\` 包裹），每行一个。
不要输出序号，只需要输出变量名即可。
新推荐的变量名要和这个变量名的风格保持一致，语言保持一致。
`);

const files = await fs.readdir("examples/rename/cases/in");
for (const file of files) {
  const result = await engine.renderFile(`examples/rename/cases/in/${file}`);
  console.log(`🚀 ~ result:`, result);
  await fs.mkdir("examples/rename/cases/out", { recursive: true });
  await fs.writeFile(`examples/rename/cases/out/${file}.out`, result);
}
