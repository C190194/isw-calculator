// import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export function isInTauri() {
  return '__TAURI_INTERNALS__' in window
}

export async function saveJson(content: string) {
  if (isInTauri()) {
    const path = await save({
      filters: [{
        name: "json",
        extensions: ["json"]
      }]
    });
    if (path) {
      await writeTextFile(path, content);
    }
    // await invoke("write_json", { content });
  } else {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }
}

export async function readJson(): Promise<string> {
  if (isInTauri()) {
    const file = await open({
      multiple: false, directory: false, filters: [{
        name: "json",
        extensions: ["json"]
      }]
    });
    if (file) {
      return await readTextFile(file?.path);
    } else {
      throw new Error("Failed to read file");
    }
  } else {
    console.log("?")
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.style.display = 'none';
      input.accept = '.json';
      input.multiple = false;

      input.addEventListener('change', (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent<FileReader>) => {
            if (typeof e.target?.result === 'string') {
              resolve(e.target?.result);
            } else {
              reject(new Error("Failed to read the file"));
            }
          };
          reader.readAsText(file); // You can use readAsDataURL or readAsArrayBuffer as needed
        }

      });

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    })
  }
}