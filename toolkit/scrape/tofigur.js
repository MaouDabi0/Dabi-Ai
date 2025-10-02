import axios from "axios";
import FormData from "form-data";
import fileType from "file-type";

const api = axios.create({ timeout: 20000 });

export async function uploadImage(buffer) {
  const { ext } = await fileType.fromBuffer(buffer);
  const form = new FormData();
  form.append("fileToUpload", buffer, `file.${ext}`);
  form.append("reqtype", "fileupload");
  const { data } = await api.post("https://catbox.moe/user/api.php", form, {
    headers: form.getHeaders(),
    responseType: "text",
  });
  if (!data.startsWith("http")) throw new Error("Upload gagal");
  return data;
}

export async function startJob(prompt, imageUrl, apikey) {
  for (let i = 0; i < 5; i++) {
    try {
      const { data } = await api.get("https://api.fanzoffc.eu.org/api/fanzedit/start/", {
        params: { query: prompt, url: imageUrl, apikey },
      });
      if (data.success && data.taskId) return data.taskId;
    } catch {
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  return null;
}

export async function checkStatus(taskId, apikey, retries = 20, delay = 2500) {
  for (let i = 0; i < retries; i++) {
    await new Promise(r => setTimeout(r, delay));
    try {
      const res = await api.get("https://api.fanzoffc.eu.org/api/fanzedit/status/", {
        params: { taskId, apikey },
        responseType: "arraybuffer",
      });
      if (res.headers["content-type"]?.startsWith("image")) {
        return Buffer.from(res.data);
      }
    } catch {}
  }
  return null;
}