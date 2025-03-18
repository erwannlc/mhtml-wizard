"use client";
import type { ChangeEvent, DragEvent } from "react";
import { useState } from "react";
import { useLanguage } from "@/LanguageContext";

import { convert } from "mhtml-to-html/browser";
import { cn, parseFilename } from "@/lib/utils";
import { CloudIcon } from "@/assets/icons";
import { ErrorNotification } from "./ErrorNotification";
import LoadingDots from "./loaders/LoadingDots";

export interface FileData {
  html: string;
  filename: string;
  title: string;
  faviconUrl?: string;
}

export default function FileConverter({
  addPage,
  checkDuplicates,
}: {
  addPage: (fileData: FileData, isFirst: boolean) => void;
  checkDuplicates: (filename: string) => boolean;
}) {
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const { TITLE, FORMATS, ERROR } = useLanguage();

  function handleFile(files: FileList | null) {
    setError("");
    setLoading(true);
    if (files) {
      for (const [i, file] of Array.from(files).entries()) {
        if (file) {
          const { extension, filename } = parseFilename(file.name);
          if (!(extension === ".mht" || extension === ".mhtml")) {
            return onError(ERROR.FILE_TYPE);
          }
          const check = checkDuplicates(filename);
          if (check) return onError(ERROR.DUPLICATE_FILE);
          const reader = new FileReader();
          reader.onload = async () => {
            const result = reader.result as string;
            const html = await convert(result);
            const fileData: FileData = {
              filename,
              html: await convert(result),
              faviconUrl: (await getFavicon(html)) || "",
              title: getTitle(filename) + "...",
            };
            addPage(fileData, i === 0);
          };
          reader.readAsText(file);
        } else return onError(ERROR.FILE_READ);
      }
    }
  }

  function onError(error: string) {
    setLoading(false);
    setError(error);
  }

  function onDrag(e: DragEvent<HTMLDivElement>, isActive: boolean) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(isActive);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    onDrag(e, false);
    const files = e.dataTransfer.files;
    handleFile(files);
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.currentTarget.files;
    handleFile(files);
  }

  return (
    <div className="shadow-converter bg-accent p-4 py-8 md:p-12 md:pb-16 w-full max-w-[36rem] rounded-md">
      <form className="grid md:gap-8 gap-6 relative">
        <div>
          <div className="mb-12 mt-1">
            <h2 className="md:text-xl text-lg font-semibold leading-7">{TITLE}</h2>
            <p className="md:text-sm text-xs leading-5 text-converterGrey mt-1">
              {FORMATS}
            </p>
          </div>

          <label
            htmlFor="file"
            className="relative mt-4 flex flex-col justify-center h-40 md:h-72 rounded-md border-converterBorder transition-all duration-250 z-50 cursor-pointer hover:bg-converterHover hover:shadow-xs group"
            onClick={e => e.stopPropagation()}
          >
            <div
              className="absolute rounded-md w-full h-full z-5"
              onDragOver={e => onDrag(e, true)}
              onDragEnter={e => onDrag(e, true)}
              onDragLeave={e => onDrag(e, false)}
              onDrop={onDrop}
            />
            <DragZone dragActive={dragActive} isLoading={loading} />
          </label>

          <input
            id="file"
            name="file"
            type="file"
            accept=".mht,.mhtml"
            className="sr-only" // i.e. not visible
            multiple
            onChange={onInputChange}
            onClick={e => e.stopPropagation()}
          />
        </div>

        {error && <ErrorNotification title="Erreur" description={error} />}
      </form>
    </div>
  );
}

function DragZone({
  dragActive,
  isLoading,
}: {
  dragActive: boolean;
  isLoading: boolean;
}) {
  const { ACCESSIBILTY, INSTRUCTIONS } = useLanguage();
  return (
    <div
      className={cn(
        "absolute flex flex-col justify-center items-center pl-10 pr-10 rounded-md w-full h-full transition-all z-3",
        {
          "border-2 border-black": dragActive,
          "bg-white/80": isLoading,
          "bg-white opacity-100 hover:bg-converterHover": !isLoading,
        }
      )}
    >
      {isLoading ? (
        <LoadingDots color="#808080" />
      ) : (
        <>
          <CloudIcon
            className={cn(
              "h-7 w-7 text-converterGrey transition-all duration-300 group-hover:scale-110 group-active:scale-95 scale-100",
              {
                "scale: 110": dragActive,
              }
            )}
          />
          <p className="mt-2 text-sm leading-5 text-center text-converterGrey">
            {INSTRUCTIONS}
          </p>
          <span className="sr-only">{ACCESSIBILTY}</span>
        </>
      )}
    </div>
  );
}

async function getFavicon(htmlContent: string) {
  const doc = new DOMParser().parseFromString(htmlContent, "text/html");
  const iconURL = doc.querySelector('link[href][rel*="icon"]')?.getAttribute("href");
  if (!iconURL) return "";
  const isIcon = await testFavicon(iconURL);
  return isIcon ? iconURL : "";
}

function testFavicon(iconURL: string) {
  return new Promise(resolve => {
    const img = document.createElement("img");
    img.src = iconURL;
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
  });
}

function getTitle(filename: string) {
  const words = filename.split(" ");
  const firstWord = cropWord(words[0]);
  if (firstWord) return firstWord;
  const secondWord = cropWord(words[1]);
  if (secondWord) return secondWord;
  return "";
}

function cropWord(word: string) {
  if (!word) return null;
  if (word.length > 2) {
    if (word.length > 10) {
      if (word.includes("_")) {
        return word.split("_")[0];
      } else if (word.includes("-")) {
        return word.split("-")[0];
      } else return word.slice(0, 10);
    } else return word;
  } else return null;
}
