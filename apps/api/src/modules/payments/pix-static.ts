import * as QRCode from "qrcode";

/**
 * Gerador de Pix estático (BR Code / EMV) escaneável, sem depender de gateway.
 * Monta o payload "copia-e-cola" do Pix conforme o padrão do Banco Central
 * (Manual BR Code / EMV QRCPS-MPM) e calcula o CRC16-CCITT-FALSE.
 */

export interface BuildPixPayloadParams {
  key: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  txid: string;
}

/** Campo EMV: id + tamanho (2 dígitos) + valor. */
function emv(id: string, value: string): string {
  return id + String(value.length).padStart(2, "0") + value;
}

/** Remove acentos/diacríticos e caracteres fora do ASCII imprimível. */
function normalize(value: string, maxLength: number): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim()
    .slice(0, maxLength);
}

/** Sanitiza o txid: alfanumérico, sem espaços, máx 25; "***" quando vazio. */
function normalizeTxid(txid: string): string {
  const clean = (txid || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 25);
  return clean.length > 0 ? clean : "***";
}

/**
 * CRC16-CCITT-FALSE: polinômio 0x1021, init 0xFFFF, sem reflexão.
 * Retorna 4 dígitos hexadecimais maiúsculos.
 */
export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Monta o BR Code EMV do Pix estático. */
export function buildPixPayload(params: BuildPixPayloadParams): string {
  const { key, merchantName, merchantCity, amount, txid } = params;

  // 26 — Merchant Account Information (GUI + chave Pix).
  const merchantAccountInfo = emv("00", "br.gov.bcb.pix") + emv("01", key);

  // 62 — Additional Data Field Template (txid).
  const additionalData = emv("05", normalizeTxid(txid));

  let payload =
    emv("00", "01") +
    emv("26", merchantAccountInfo) +
    emv("52", "0000") +
    emv("53", "986");

  if (amount > 0) {
    payload += emv("54", amount.toFixed(2));
  }

  payload +=
    emv("58", "BR") +
    emv("59", normalize(merchantName, 25)) +
    emv("60", normalize(merchantCity, 15)) +
    emv("62", additionalData);

  // O campo CRC ("63" + tamanho "04") entra antes do cálculo,
  // e o CRC é calculado sobre toda a string incluindo "6304".
  payload += "6304";
  return payload + crc16(payload);
}

/**
 * Gera o QR Code do payload e retorna SOMENTE o base64 (sem o prefixo
 * `data:image/png;base64,`), pois o consumidor (payment-drawer) já adiciona
 * esse prefixo ao montar o `src` da imagem.
 */
export async function pixQrCodeBase64(payload: string): Promise<string> {
  const dataUrl = await QRCode.toDataURL(payload, { margin: 1, width: 320 });
  return dataUrl.replace(/^data:image\/png;base64,/, "");
}
