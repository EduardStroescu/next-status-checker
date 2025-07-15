"use client";

declare global {
  interface Window {
    __resource?: [ArrayBuffer, ArrayBuffer, ArrayBuffer];
  }
}

import { ComponentType, createElement, FormEvent, useMemo } from "react";
import satori, { Font, type SatoriOptions } from "satori";
import { LiveProvider, LiveContext, withLive } from "react-live";
import { useEffect, useState, useRef, useContext, useCallback } from "react";
import { createPortal } from "react-dom";
import Editor, {
  type OnChange,
  type OnMount,
  type Monaco,
} from "@monaco-editor/react";
import * as fflate from "fflate";
import { Base64 } from "js-base64";

import {
  type TabsData,
  playgroundTabs,
  previewTabs,
} from "../_utils/generator-data";
import { type apis } from "../_utils/twemoji";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { Slider } from "@/components/ui/slider";
import { Tabs } from "./Tabs";
import { serializeReactElement } from "../_utils/server-utils";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  fetchFont,
  initDefaultFonts,
  isClassComponent,
  loadDynamicAsset,
  resolveReactElement,
} from "@/app/generator/og/_utils/client-utils";
import { env } from "@/env/client";
import { generateFontConfig } from "@/app/generator/og/_utils/shared-utils";
import Link from "next/link";

const cardNames = Object.keys(playgroundTabs);
let editedCards: TabsData = { ...playgroundTabs };

// For sharing & resuming.
const currentOptions = {};
let overrideOptions: {
  width: number;
  height: number;
  debug: boolean;
  emojiType: keyof typeof apis;
  fontEmbed: boolean;
  fonts: Font[] | undefined;
} | null = null;

const loadDefaultFonts = initDefaultFonts();

function LiveEditor({ id }: { id: string }) {
  const { onChange } = useContext(LiveContext);
  const onChangeRef = useRef(onChange);
  const editorRef = useRef<Monaco["editor"]>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleBeforeMount = useCallback((monaco: Monaco) => {
    if (monaco) {
      editorRef.current = monaco.editor;
      fetch("/monaco-theme.json")
        .then((data) => data.json())
        .then((data) => {
          monaco.editor.defineTheme("IDLE", data);
          monaco.editor.setTheme("IDLE");
        });
    }
  }, []);

  const handleOnMount: OnMount = useCallback(async (monaco) => {
    if (editorContainerRef.current) {
      const relayout = ([e]: ResizeObserverEntry[]) => {
        monaco.layout({
          width: e.borderBoxSize[0].inlineSize,
          height: e.borderBoxSize[0].blockSize,
        });
      };
      const resizeObserver = new ResizeObserver(relayout);
      resizeObserver.observe(editorContainerRef.current);
    }
  }, []);

  const handleOnChange: OnChange = useCallback(
    (newCode) => {
      // Update the code in local storage to preserve the edited code.
      editedCards[id] = newCode ?? "";
      localStorage.setItem("editedCards", JSON.stringify(editedCards));
      onChange(newCode ?? "");
    },
    [id, onChange]
  );

  useEffect(() => {
    const params = new URL(String(document.location)).searchParams;
    const shared = params.get("share");
    const tab = params.get("activeCard") ?? "helloworld";

    // we just need change editedCards on mount
    if (shared) {
      try {
        const decompressedData = fflate.strFromU8(
          fflate.decompressSync(Base64.toUint8Array(shared))
        );
        let card;
        try {
          const decoded = JSON.parse(decompressedData);
          card = decoded.code;
          overrideOptions = decoded.options;
        } catch {
          card = decompressedData;
        }

        editedCards[tab] = card;
        onChangeRef.current(editedCards[tab]);
      } catch {
        toast.error("Failed to load shared data");
      }
    } else {
      let localOptions;
      let localCards;
      try {
        localOptions = localStorage.getItem("options");
        if (localOptions) {
          overrideOptions = JSON.parse(localOptions);
        }
      } catch {
        toast.error("Failed to load saved options");
      }
      try {
        localCards = localStorage.getItem("editedCards");
        if (localCards) {
          editedCards = JSON.parse(localCards);
        }
        onChangeRef.current(editedCards[tab]);
      } catch {
        toast.error("Failed to load saved data");
      }
    }
  }, []);

  const handleReset = useCallback(() => {
    editedCards[id] = playgroundTabs[id];
    localStorage.setItem("editedCards", JSON.stringify(editedCards));
    onChangeRef.current(editedCards[id]);
    if (editorRef.current) {
      editorRef.current.getModels()?.[0].setValue(editedCards[id]);
    }
    const params = new URL(String(document.location)).searchParams;
    params.delete("share");
    window.history.replaceState(null, "", `?${params.toString()}`);
    toast.success("Content reset");
  }, [id]);

  const handleShare = useCallback(() => {
    const params = new URL(String(document.location)).searchParams;
    if (!id) return;

    const code = editedCards[id];
    const compressed = Base64.fromUint8Array(
      fflate.deflateSync(
        fflate.strToU8(
          JSON.stringify({
            code,
            options: currentOptions,
          })
        )
      ),
      true
    );

    params.set("share", compressed);
    window.history.replaceState(null, "", `?${params.toString()}`);
    navigator.clipboard.writeText(window.location.href);
    toast.success("Copied to clipboard");
  }, [id]);

  return (
    <div className="flex flex-col h-[500px] xl:h-full bg-background rounded-xl rounded-tl-none border border-white overflow-auto">
      <div className="py-1 px-2 gap-2 flex justify-end bg-white text-black text-xs select-none">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2"
          onClick={handleReset}
        >
          Reset
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2"
          onClick={handleShare}
        >
          Share
        </Button>
      </div>
      <div className="flex-1">
        <div
          ref={editorContainerRef}
          className="h-full relative overflow-hidden"
        >
          <Editor
            loading={
              <Spinner fontSize={2}>{`Loading • Loading • Loading • `}</Spinner>
            }
            height="100%"
            theme="IDLE"
            defaultLanguage="javascript"
            value={editedCards[id]}
            onChange={handleOnChange}
            beforeMount={handleBeforeMount}
            onMount={handleOnMount}
            options={{
              fontFamily: "iaw-mono-var",
              fontSize: 14,
              wordWrap: "on",
              tabSize: 2,
              minimap: {
                enabled: false,
              },
              smoothScrolling: true,
              cursorSmoothCaretAnimation: "on",
              contextmenu: true,
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function EditorPanel({ activeCard }: { activeCard: string }) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();

        const params = new URL(String(document.location)).searchParams;
        const activeCard = params.get("activeCard") ?? "helloworld";
        if (!activeCard) return;

        const code = editedCards[activeCard];
        const compressed = Base64.fromUint8Array(
          fflate.deflateSync(
            fflate.strToU8(
              JSON.stringify({
                code,
                options: currentOptions,
              })
            )
          ),
          true
        );

        params.set("share", compressed);
        window.history.replaceState(null, "", `?${params.toString()}`);
        toast.success("Saved");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <Tabs
      activeTab={activeCard}
      options={cardNames}
      onChange={(name: string) => {
        const params = new URL(String(document.location)).searchParams;
        params.set("activeCard", name);
        params.delete("share");
        window.history.replaceState(null, "", `?${params.toString()}`);
      }}
    >
      <LiveEditor id={activeCard} />
    </Tabs>
  );
}

const LiveSatori = withLive(function ({
  live,
}: {
  live?: { element: ComponentType; error: string };
}) {
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(630);

  const [fonts, setFonts] = useState<SatoriOptions["fonts"] | null>(null);
  const [debug, setDebug] = useState(false);
  const [fontEmbed, setFontEmbed] = useState(true);
  const [emojiType, setEmojiType] = useState<keyof typeof apis>("twemoji");
  const [renderType, setRenderType] = useState("svg");

  const [renderError, setRenderError] = useState<string | null>(null);
  const [loadingResources, setLoadingResources] = useState(true);
  const [iframeNode, setIframeNode] = useState<HTMLElement | undefined>();
  const [scaleRatio, setScaleRatio] = useState(1);

  const [result, setResult] = useState("");
  const [renderedTimeSpent, setRenderTime] = useState<number>(0);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef([width, height]);
  sizeRef.current = [width, height];

  const updateIframeRef = useCallback(
    (node: HTMLIFrameElement) => {
      if (node && node.contentWindow?.document) {
        /* Force tailwindcss to create stylesheets on first render */
        const doc = node.contentWindow.document;

        if (
          !doc.head.querySelector("script[src='https://cdn.tailwindcss.com']")
        ) {
          const script = doc.createElement("script");
          script.src = "https://cdn.tailwindcss.com";
          doc.head.appendChild(script);
          script.addEventListener("load", () => {
            if (!node.contentWindow) return;
            (
              node.contentWindow as Window & { tailwind: { config: object } }
            ).tailwind.config = {
              plugins: [
                {
                  handler({ addBase }: { addBase: (style: object) => void }) {
                    addBase({
                      html: {
                        lineHeight: "1.2",
                      },
                    });
                  },
                },
              ],
            };
          });
        }

        const updateClass = () => {
          Array.from(doc.querySelectorAll("[tw]")).forEach((v) => {
            const tw = v.getAttribute("tw");
            if (tw) {
              v.setAttribute("class", tw);
              v.removeAttribute("tw");
            }
          });
        };

        const observer = new MutationObserver(updateClass);
        observer.observe(doc.body, { childList: true, subtree: true });
        setIframeNode(doc.body);
      }
    },
    [setIframeNode]
  );

  // INIT WITH ALL THE OVERRIDES WHEN THE WORKSPACE IS SHARED
  useEffect(() => {
    if (overrideOptions) {
      setWidth(Math.min(overrideOptions.width || 1200, 2000));
      setHeight(Math.min(overrideOptions.height || 630, 2000));
      setDebug(!!overrideOptions.debug);
      setEmojiType(overrideOptions.emojiType || "twemoji");
      setFontEmbed(!!overrideOptions.fontEmbed);
    }

    (async () => {
      if (overrideOptions?.fonts?.length) {
        const fontData = await Promise.all(
          overrideOptions.fonts.map(async (font) => {
            try {
              return await fetchFont(font);
            } catch {
              toast.error(
                <div className="flex flex-col gap-2 pl-2">
                  <p>Failed to load font:</p>
                  <ul className="list-disc list-inside">
                    <li>Name: {font?.name}</li>
                    {!!font?.style && (
                      <li>
                        Style:{" "}
                        {font.style[0].toUpperCase() + font.style.slice(1)}
                      </li>
                    )}
                    {font?.weight && <li>Weight: {font.weight}</li>}
                  </ul>
                </div>
              );
              return null;
            }
          })
        );

        const fonts = fontData.filter(Boolean);
        if (fonts.length) {
          setFonts(fonts as Font[]);
        } else {
          const defaultFonts = await loadDefaultFonts;
          setFonts(defaultFonts);
        }
      } else {
        const defaultFonts = await loadDefaultFonts;
        setFonts(defaultFonts);
      }
      setLoadingResources(false);
    })();
  }, []);

  function updateScaleRatio() {
    if (!previewContainerRef.current) return;

    const [w, h] = sizeRef.current;
    const containerWidth = previewContainerRef.current.clientWidth;
    const containerHeight = previewContainerRef.current.clientHeight;
    setScaleRatio(
      Math.min(1, Math.min(containerWidth / w, containerHeight / h))
    );
  }

  useEffect(() => {
    if (!previewContainerRef.current) return;

    const observer = new ResizeObserver(updateScaleRatio);
    observer.observe(previewContainerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    updateScaleRatio();
  }, [width, height]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // We leave a small buffer here to debounce if it's PNG.
      if (renderType === "png") {
        await new Promise((resolve) => setTimeout(resolve, 15));
      }
      if (cancelled) return;

      let _result = "";
      let _renderedTimeSpent = 0;

      if (!!live?.element && fonts) {
        const start = (
          typeof performance !== "undefined" ? performance : Date
        ).now();
        if (renderType !== "html") {
          try {
            _result = await satori(live.element.prototype.render(), {
              fonts,
              embedFont: fontEmbed,
              width,
              height,
              debug,
              loadAdditionalAsset: (code, text) =>
                loadDynamicAsset(emojiType, code, text),
            } as SatoriOptions);

            setRenderError(null);
          } catch (e: unknown) {
            const error = e as Error;
            setRenderError(error.message);
            return null;
          }
        } else {
          setRenderError(null);
        }

        _renderedTimeSpent =
          (typeof performance !== "undefined" ? performance : Date).now() -
          start;

        if (!!Object.keys(currentOptions).length) {
          localStorage.setItem(
            "options",
            JSON.stringify({
              fonts: fonts.map((font) => ({ ...font, data: undefined })),
              width,
              height,
              debug,
              emojiType,
              fontEmbed,
            })
          );
        }
      }

      Object.assign(currentOptions, {
        fonts: fonts?.map((font) => ({ ...font, data: undefined })),
        width,
        height,
        debug,
        emojiType,
        fontEmbed,
      });

      setResult(_result);
      setRenderTime(_renderedTimeSpent);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    live?.element,
    fonts,
    width,
    height,
    debug,
    emojiType,
    fontEmbed,
    renderType,
  ]);

  const handleUpdateFonts = useCallback(
    async (evt: FormEvent<HTMLFormElement>) => {
      evt.preventDefault();
      const formData = new FormData(evt.currentTarget);

      type FontWithNoData = NonNullable<Omit<Font, "data">>;

      const newData = Array.from(formData.entries()).reduce(
        (acc, [key, value]) => {
          const [fontIdx, rawKey] = key.split("-");
          const idx = Number(fontIdx);
          const name = rawKey as keyof FontWithNoData;

          if (!acc[idx]) {
            acc[idx] = {} as FontWithNoData;
          }

          const entry = acc[idx];

          if (name === "weight") {
            entry.weight = Number(value) as Font["weight"];
          } else if (name === "style") {
            entry.style = value as Font["style"];
          } else if (name === "name") {
            entry.name = value as string;
          }

          return acc;
        },
        [] as FontWithNoData[]
      );

      const newFonts = fonts
        ? await Promise.all(
            fonts.map(async (prevFont, idx) => {
              const newFont = newData[idx];
              if (
                prevFont.name.trim() === newFont.name.trim() &&
                prevFont.style === newFont.style &&
                prevFont.weight === newFont.weight
              ) {
                return prevFont;
              } else {
                try {
                  return await fetchFont(newFont);
                } catch {
                  toast.error(
                    <div className="flex flex-col gap-2 pl-2">
                      <p>Failed to load font:</p>
                      <ul className="list-disc list-inside">
                        <li>Name: {newFont?.name}</li>
                        {!!newFont?.style && (
                          <li>
                            Style:{" "}
                            {newFont.style[0].toUpperCase() +
                              newFont.style.slice(1)}
                          </li>
                        )}
                        {newFont?.weight && <li>Weight: {newFont.weight}</li>}
                      </ul>
                    </div>
                  );
                  return prevFont;
                }
              }
            })
          )
        : [];

      setFonts(newFonts);
    },
    [fonts]
  );

  const handleConfigReset = useCallback(async () => {
    setFonts(await loadDefaultFonts);
    setWidth(1200);
    setHeight(630);
    setDebug(false);
    setEmojiType("twemoji");
    setFontEmbed(true);
  }, []);

  const handleGenerateOG = useCallback(() => {
    if (!live?.element) {
      toast.error("Coult not generate OG image");
      return;
    }

    // Detect class component by presence of prototype.render
    if (isClassComponent(live.element)) {
      const instance = new live.element({});
      const reactTree = resolveReactElement(instance.render());

      const serialized = serializeReactElement(reactTree);
      const compressed = Base64.fromUint8Array(
        fflate.deflateSync(
          fflate.strToU8(
            JSON.stringify({
              code: serialized,
              options: currentOptions,
            })
          )
        ),
        true
      );

      window.open(`${window.location.origin}/api/og/${compressed}`, "_blank");
    } else {
      // Function component
      const reactTree = createElement(live.element, {});
      const serialized = serializeReactElement(reactTree);
      const compressed = Base64.fromUint8Array(
        fflate.deflateSync(
          fflate.strToU8(
            JSON.stringify({
              code: serialized,
              options: currentOptions,
            })
          )
        ),
        true
      );

      window.open(`${window.location.origin}/api/og/${compressed}`, "_blank");
    }
    toast.success("Generated OG Image");
  }, [live?.element]);

  /**
   * Should return a string similar to this:
   * https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Material+Icons
   */
  const iframeHTMLFontsURL = useMemo(() => {
    if (!fonts)
      return "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Material+Icons";

    const familyParams = generateFontConfig(fonts, true);

    return `https://fonts.googleapis.com/css2?family=${familyParams}`;
  }, [fonts]);

  /**
   * To set the first font as the default for the HTML iframe.
   */
  const defaultIframeHTMLFont = useMemo(() => {
    if (!fonts) return "Inter";

    return fonts[0].name.trim();
  }, [fonts]);

  return (
    <div className="h-auto xl:h-1/2 w-full flex-1">
      <Tabs
        options={previewTabs}
        //  'svg' | 'png' | 'html' | 'pdf'
        onChange={(text) => setRenderType(text.split(" ")[0].toLowerCase())}
      >
        <div className="flex flex-col flex-1 relative bg-gray-950 overflow-hidden mb-2.5 rounded-b-xl border border-border rounded-tr-xl">
          {(!!live?.error || !!renderError) && (
            <div className="absolute w-full h-[calc(100%-24px)] py-2.5 px-5 overflow-auto text-red-500 z-15">
              <pre className="m-0 whitespace-pre-wrap text-xs">
                {live?.error || renderError}
              </pre>
            </div>
          )}

          {loadingResources && (
            <Spinner
              fontSize={2}
              className="absolute inset-0 z-10"
            >{`Loading • Loading • Loading • `}</Spinner>
          )}

          <div
            className="relative flex w-full h-[500px] xl:h-full justify-center items-center overflow-hidden"
            ref={previewContainerRef}
            dangerouslySetInnerHTML={
              renderType !== "svg"
                ? undefined
                : {
                    __html: `<div class="content-wrapper" style="position:absolute;width:100%;height:100%;max-width:${width}px;max-height:${height}px;display:flex;align-items:center;justify-content:center">${result}</div>`,
                  }
            }
          >
            {renderType === "html" ? (
              <iframe
                ref={updateIframeRef}
                width={width}
                height={height}
                style={{
                  transform: `scale(${scaleRatio})`,
                }}
              >
                {iframeNode &&
                  createPortal(
                    <>
                      <style
                        dangerouslySetInnerHTML={{
                          __html: `@import url('${iframeHTMLFontsURL}');body{display:flex;height:100%;margin:0;tab-size:8;font-family:${defaultIframeHTMLFont};overflow:hidden}body>div,body>div *{box-sizing:border-box;display:flex}`,
                        }}
                      />
                      {!!live?.element && <live.element />}
                    </>,
                    iframeNode
                  )}
              </iframe>
            ) : null}
          </div>
          <Separator />
          <footer className="flex items-center text-xs bg-white text-black whitespace-nowrap py-1 px-2">
            <span className="whitespace-pre overflow-hidden text-ellipsis border-b">
              {renderType === "html"
                ? "[HTML] Rendered."
                : `[${renderType.toUpperCase()}] Generated in `}
            </span>
            <span className="flex-1">
              {renderType === "html"
                ? ""
                : `${~~(renderedTimeSpent * 100) / 100}ms.`}
            </span>
            <span>{`[${width}×${height}]`}</span>
          </footer>
        </div>
      </Tabs>

      <div className="flex-1 min-h-full rounded-xl bg-background border border-white overflow-hidden">
        <div className="flex items-center justify-between m-0 py-1 px-2.5 bg-white border-b-border border-b select-none">
          <h2 className="text-black text-sm font-medium uppercase -tracking-[0.02em]">
            Configurations
          </h2>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-black"
            onClick={handleConfigReset}
          >
            Reset
          </Button>
        </div>
        <div className="flex px-2.5 flex-col">
          <div className="w-full flex flex-wrap gap-4 py-[16px]">
            <div className="flex gap-2 flex-1 items-center">
              <Label htmlFor="width" className="flex-none w-[140px]">
                Container Width
              </Label>
              <Slider
                value={[width]}
                onValueChange={(e) => setWidth(e[0])}
                min={100}
                max={1200}
                step={1}
              />
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min={100}
                max={1200}
                step={1}
                className="max-w-fit"
              />
              px
            </div>
            <Separator orientation="vertical" className="hidden xl:block" />
            <div className="flex gap-2 flex-1 items-center">
              <Label htmlFor="height" className="flex-none w-[140px]">
                Container Height
              </Label>
              <Slider
                value={[height]}
                onValueChange={(e) => setHeight(e[0])}
                min={100}
                max={1200}
                step={1}
              />
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min={100}
                max={1200}
                step={1}
                className="max-w-fit"
              />
              px
            </div>
          </div>
          <Separator />
          <div className="w-full flex gap-2 py-4">
            <Label htmlFor="reset" className="flex-none w-36">
              Size
            </Label>
            <Button
              id="reset"
              onClick={() => {
                setWidth(1200);
                setHeight(630);
              }}
              size="sm"
              variant="ghost"
              className="text-xs"
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={() => {
                setWidth(1200);
                setHeight(600);
              }}
              size="sm"
              variant="ghost"
              className="text-xs"
            >
              2:1
            </Button>
            <Button
              type="button"
              onClick={() => {
                setWidth(1200);
                setHeight(630);
              }}
              size="sm"
              variant="ghost"
              className="text-xs"
            >
              1.9:1
            </Button>
          </div>
          <Separator />
          <div className="w-full flex gap-2 py-4">
            <Label htmlFor="debug" className="flex-none w-36">
              Debug Mode
            </Label>
            <Switch
              id="debug"
              checked={debug}
              onCheckedChange={() => setDebug(!debug)}
            />
          </div>
          <Separator />
          <FontConfig fonts={fonts} handleUpdateFonts={handleUpdateFonts} />
          <Separator />
          <div className="w-full flex gap-2 py-4">
            <Label htmlFor="font" className="flex-none w-36">
              Embed Font
            </Label>
            <Switch
              id="font"
              checked={fontEmbed}
              onCheckedChange={(shouldFontEmbed) =>
                setFontEmbed(shouldFontEmbed)
              }
            />
          </div>
          <Separator />
          <div className="w-full flex gap-2 py-4">
            <Label htmlFor="emoji" className="flex-none w-36">
              Emoji Provider
            </Label>
            <Select
              name="emoji"
              onValueChange={(v) => setEmojiType(v as keyof typeof apis)}
              defaultValue={emojiType}
            >
              <SelectTrigger id="emoji" size="sm">
                <SelectValue placeholder={emojiType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twemoji">Twemoji</SelectItem>
                <SelectItem value="fluent">Fluent Emoji</SelectItem>
                <SelectItem value="fluentFlat">Fluent Emoji Flat</SelectItem>
                <SelectItem value="noto">Noto Emoji</SelectItem>
                <SelectItem value="blobmoji">Blobmoji</SelectItem>
                <SelectItem value="openmoji">OpenMoji</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="w-full flex gap-2 py-4">
            <Label htmlFor="export" className="flex-none w-36">
              Export
            </Label>
            <div className="flex flex-1 flex-wrap gap-2">
              <Button
                id="export"
                variant="outline"
                size="sm"
                disabled={!result || renderType === "html"}
                onClick={() => {
                  if (!result || renderType === "html") return;

                  const link = document.createElement("a");
                  link.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                    result
                  )}`;
                  link.download = "image.svg";
                  link.rel = "noreferrer";
                  link.target = "_blank";
                  link.click();
                }}
              >
                Export SVG
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!result || renderType === "html"}
                onClick={(e) => {
                  e.preventDefault();
                  if (!result) return false;
                  window.open?.("")?.document.write(result);
                }}
              >
                View in New Tab ↗
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateOG}
                disabled={!live?.element || !!renderError}
              >
                Generate OG Image
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

function FontConfig({
  fonts,
  handleUpdateFonts,
}: {
  fonts: SatoriOptions["fonts"] | null;
  handleUpdateFonts: (evt: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      onSubmit={handleUpdateFonts}
      className="flex flex-col gap-2 py-[16px]"
    >
      {fonts?.map((font, idx) => (
        <div
          key={font.name + "-" + font.style + "-" + font.weight}
          className="flex flex-row items-center"
        >
          <Label htmlFor={`${idx}-name`} className="flex-none w-[140px]">
            Font #{idx + 1}
          </Label>
          <div className="w-full flex flex-wrap xl:flex-nowrap gap-2">
            <Input
              id={`${idx}-name`}
              name={`${idx}-name`}
              type="text"
              defaultValue={font.name}
              placeholder="e.g. Inter - Respect case|spaces|symbols •not inter/in ter/inTer etc."
            />
            <div className="flex flex-row gap-2">
              <Label htmlFor={`${idx}-style`}>Style</Label>
              <Select name={`${idx}-style`} defaultValue={font.style}>
                <SelectTrigger id={`${idx}-style`} name={`font${idx}Style`}>
                  <SelectValue placeholder={font.style} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">normal</SelectItem>
                  <SelectItem value="italic">italic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-row gap-2">
              <Label htmlFor={`${idx}-weight`}>Weight</Label>
              <Input
                name={`${idx}-weight`}
                id={`${idx}-weight`}
                type="number"
                placeholder={"400"}
                defaultValue={String(font.weight)}
              />
            </div>
          </div>
        </div>
      ))}
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="w-1/4 mx-auto mt-2"
      >
        Save
      </Button>
    </form>
  );
}

export default function Playground({ isProUser }: { isProUser: boolean }) {
  const searchParams = useSearchParams();
  const activeCard = searchParams.get("activeCard") ?? "helloworld";

  const [hydrated, setHydrated] = useState(false);

  const isMobileView = useIsMobile();

  useEffect(() => {
    setHydrated(true);
  }, []);

  /**
   * Replaces all <img src="..."> tags with proxied versions. Otherwise images won't load.
   */
  const handleTransformCode = useCallback(
    (code: string) => {
      const proxied = `${env.NEXT_PUBLIC_URL}/api/og/image-proxy?url=`;

      // Replace all img src and backgroundImage URLs in one pass using a single regex and a replacer function
      // This reduces two separate passes into one
      const urlReplaceRegex =
        /(<img[^>]*\s+src=)(["'])(.*?)\2|backgroundImage:\s*(['"`])url\((['"`]?)(.*?)\5\)\4/gi;

      let wrappedCode = code.replace(
        urlReplaceRegex,
        (
          match,
          imgStart,
          imgQuote,
          imgSrc,
          bgOuterQuote,
          bgInnerQuote,
          bgUrl
        ) => {
          if (imgSrc !== undefined) {
            // img src matched
            return `${imgStart}${imgQuote}${proxied}${encodeURIComponent(
              imgSrc
            )}${imgQuote}`;
          } else if (bgUrl !== undefined) {
            // backgroundImage matched
            return `backgroundImage: ${bgOuterQuote}url(${bgInnerQuote}${proxied}${encodeURIComponent(
              bgUrl
            )}${bgInnerQuote})${bgOuterQuote}`;
          }
          return match; // fallback, should not happen
        }
      );

      if (!isProUser) {
        // Simplify regex to find last return with JSX fragment, self-closing or normal tags or parens
        const returnJsxRegex =
          /return\s*(\(([\s\S]*?)\)|(<[a-zA-Z][^>]*\/>)|(<[a-zA-Z][\s\S]*?<\/[a-zA-Z][^>]*>)|(<>[\s\S]*?<\/>))/gm;

        const matches = [...code.matchAll(returnJsxRegex)];
        const last = matches.at(-1);

        if (last && last.index !== undefined) {
          // Extract JSX content, some captures optional, pick first non-null
          const jsxContent = last[2] ?? last[3] ?? last[4] ?? last[5];
          const start = last.index;
          const end = start + last[0].length;

          const before = code.slice(0, start);
          const after = code.slice(end);

          // Compose new code with the wrapping div and copyright img
          wrappedCode = `${before}return (\n<div style={{position: 'relative', display: 'flex', width: '100%', height: '100%'}}>\n\t${jsxContent.trim()}\n\t<img src='${proxied}https://www.whiteriverdesign.com/wp-content/uploads/2013/07/copyright.png' style={{position: 'absolute', bottom: 0, right: 0, width: 200, height: 50}} />\n</div>\n)${after}`;
        } else {
          // No return statement found, wrap whole code with div and copyright img
          wrappedCode = `<div style={{position: 'relative', display: 'flex', width: '100%', height: '100%'}}>\n${code}\n<img src='${proxied}https://www.whiteriverdesign.com/wp-content/uploads/2013/07/copyright.png' style={{position: 'absolute', bottom: 0, right: 0, width: 200, height: 50}} />\n</div>`;
        }
      }

      return wrappedCode;
    },
    [isProUser]
  );

  return (
    <div className="playground-body w-full xl:h-[100dvh] overflow-x-hidden">
      <nav className="flex gap-2 text-black bg-white px-4 items-center h-8">
        <Link href="/">
          <Image
            src="/favicon.png"
            alt="StatusChecker"
            width={20}
            height={20}
            priority
          />
        </Link>
        <h1 className="font-medium text-sm">OG Image Generator</h1>
      </nav>
      <div className="flex flex-col xl:flex-row w-full h-[calc(100%-40px)] p-2 gap-2">
        <LiveProvider
          code={editedCards[activeCard]}
          transformCode={handleTransformCode}
        >
          {hydrated && (
            <>
              {isMobileView ? (
                <LiveSatori />
              ) : (
                <EditorPanel activeCard={activeCard} />
              )}

              {isMobileView ? (
                <EditorPanel activeCard={activeCard} />
              ) : (
                <LiveSatori />
              )}
            </>
          )}
        </LiveProvider>
      </div>
    </div>
  );
}
