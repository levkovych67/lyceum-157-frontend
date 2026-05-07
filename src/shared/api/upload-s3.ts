export type PresignedUploadDto = {
  url: string;
  s3Key: string;
  requiredHeaders: Record<string, string>;
  expiresAt: string;
};

export function uploadToS3(
  presigned: PresignedUploadDto,
  file: File,
  signal?: AbortSignal,
  onProgress?: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presigned.url);
    Object.entries(presigned.requiredHeaders).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`S3 upload failed: ${xhr.status}`));
    xhr.onerror = () => reject(new Error("S3 network error"));
    signal?.addEventListener("abort", () => {
      xhr.abort();
      reject(new DOMException("aborted", "AbortError"));
    });
    xhr.send(file);
  });
}
