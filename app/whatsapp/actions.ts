"use server";

import { revalidatePath } from "next/cache";
import { apiPost, apiUpload } from "@/lib/api";

export async function sendMessage(formData: FormData) {
  const threadId = String(formData.get("threadId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (threadId && body) await apiPost(`/chat/threads/${threadId}/messages`, { body });
  revalidatePath("/whatsapp");
}

export async function uploadToChat(formData: FormData) {
  const threadId = String(formData.get("threadId") ?? "");
  const file = formData.get("file");
  if (threadId && file instanceof File && file.size > 0) {
    await apiUpload(`/chat/threads/${threadId}/upload`, file);
  }
  revalidatePath("/whatsapp");
  revalidatePath("/notas");
}
