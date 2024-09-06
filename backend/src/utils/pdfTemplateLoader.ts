import fs from "fs/promises";
import path from "path";

export async function loadPDFTemplate(
  templateName: string,
  data: Record<string, string>
) {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "pdf",
    `${templateName}.html`
  );
  let template = await fs.readFile(templatePath, "utf8");

  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`::${key.toUpperCase()}::`, "g");
    template = template.replace(regex, value);
  });

  return template;
}
