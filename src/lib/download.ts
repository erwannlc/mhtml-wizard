import type { FileData } from "@/components/FileConverter";
import { ZIP_FILE_NAME } from "@/constants";
import { BlobWriter, BlobReader, ZipWriter } from "@zip.js/zip.js";
import { parseDate } from "./utils";

async function getZipFileBlob(files: File[]) {
  const zipWriter = new ZipWriter(new BlobWriter("application/zip"));

  const addFilesArray = Array.from(files).map(async file => {
    await zipWriter.add(file.name, new BlobReader(file));
  });

  await Promise.all(addFilesArray);
  return zipWriter.close();
}

function downloadFile(blob: Blob, zipFileName: string) {
  if (blob) {
    const anchor = document.createElement("a");
    const clickEvent = new MouseEvent("click");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = zipFileName;
    anchor.dispatchEvent(clickEvent);
  }
}

async function downloadZipFiles(files: File[], zipFileName: string) {
  const blob = await getZipFileBlob(files);
  downloadFile(blob, zipFileName);
}

export async function onZipDownload(filesData: FileData[]) {
  const filesPromises = filesData.map(async fileData => {
    const newfile = new Blob([fileData.html], {
      type: "text/html",
    });
    const filename = fileData.filename + ".html";
    const url = URL.createObjectURL(newfile);
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename);
  });
  const files = await Promise.all(filesPromises);
  const zipFilename = `${ZIP_FILE_NAME}-${parseDate()}`;
  await downloadZipFiles(files, zipFilename);
}

export async function onDownload(fileData: FileData) {
  const newfile = new Blob([fileData.html], {
    type: "text/html",
  });
  const filename = fileData.filename + ".html";
  const anchor = document.createElement("a");
  const clickEvent = new MouseEvent("click");
  anchor.href = URL.createObjectURL(newfile);
  anchor.download = filename;
  anchor.dispatchEvent(clickEvent);
}
