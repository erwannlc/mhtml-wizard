"use client";
import type { ChangeEvent, DragEvent } from "react";
import { useState } from "react";
import { useLanguage } from "@/LanguageContext";

import { convert } from "mhtml-to-html/browser";
import { cn, parseFilename } from "@/lib/utils";
import { ErrorNotification } from "./ErrorNotification";
import LoadingDots from "./loaders/LoadingDots";
import { Info, WandSparkles } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";

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
  const [info, setInfo] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const { TITLE, FORMATS, INFO, ERROR } = useLanguage();

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
    setInfo(false);
    setError(error);
  }

  function onDrag(e: DragEvent<HTMLLabelElement>, isActive: boolean) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(isActive);
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    onDrag(e, false);
    const files = e.dataTransfer.files;
    handleFile(files);
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.currentTarget.files;
    handleFile(files);
  }

  return (
    <Card className="shadow-xl bg-accent w-full h-full md:max-w-[70%] md:mt-[5dvh] md:mb-[5dvh] p-[5vmin] border-none rounded-md">
      <CardHeader className="p-0">
        <CardTitle className="md:text-xl text-lg flex items-baseline gap-2">
          {TITLE}{" "}
          <Info
            className="h-4 w-4 cursor-pointer"
            onClick={() => {
              setInfo(b => !b);
              setError("");
            }}
          />
        </CardTitle>
        <CardDescription className="text-black/55">{FORMATS}</CardDescription>
        <>
          {error && <ErrorNotification title="Erreur" description={error} />}
          {info && (
            <Alert variant="default" className="mt-2">
              <Info className="h-4 w-4" />
              <AlertDescription className="block">
                {INFO[0]}{" "}
                <a
                  target="_blank"
                  href="https://github.com/gildas-lormeau/mhtml-to-html"
                  className="text-accent-foreground"
                >
                  {INFO[1]}
                </a>{" "}
                {INFO[2]}
              </AlertDescription>
            </Alert>
          )}
        </>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <label
          htmlFor="file"
          className="relative flex flex-col justify-center h-full md:min-h-[100px] border border-gray-200 z-50 cursor-pointer rounded-md group"
          onClick={e => e.stopPropagation()}
          onDragOver={e => onDrag(e, true)}
          onDragEnter={e => onDrag(e, true)}
          onDragLeave={e => onDrag(e, false)}
          onDrop={onDrop}
        >
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
      </CardContent>
    </Card>
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
        "absolute w-full h-full bg-white flex flex-col justify-center items-center gap-4 text-gray-500 inset-shadow-sm inset-shadow-accent rounded-md transition-all duration-250 z-3",
        {
          "border-2 border-gray-500 text-gray-700 bg-gray-50": dragActive,
          "group-hover:text-gray-700 hover:bg-gray-50 active:scale-98": !dragActive,
          "bg-gray-50": isLoading,
        }
      )}
    >
      {isLoading ? (
        <LoadingDots color="#808080" />
      ) : (
        <>
          <WandSparkles
            className={cn(
              "h-7 w-7 transition-all duration-250 origin-[20%_70%] scale-100",
              {
                "scale-110": dragActive,
                "group-hover:scale-98 group-hover:animate-wiggle group-active:scale-95 group-active:rotate-25":
                  !dragActive,
              }
            )}
          />
          <p className="mt-2 text-sm leading-5 text-center">{INSTRUCTIONS}</p>
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
