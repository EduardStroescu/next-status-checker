import { createElement, ReactElement, ReactNode } from "react";
import { Font } from "satori";
import { generateFontConfig } from "@/app/generator/og/_utils/shared-utils";

export async function loadGoogleFont(font: Omit<Font, "data">, text?: string) {
  let url = `https://fonts.googleapis.com/css2?family=${generateFontConfig([
    font,
  ])}`;

  if (text) {
    url = `https://fonts.googleapis.com/css2?family=${generateFontConfig([
      font,
    ])}&text=${encodeURIComponent(text)}`;
  }

  const css = await (
    await fetch(url, {
      headers: {
        // Make sure it returns TTF.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    })
  ).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status == 200) {
      return {
        ...font,
        data: await response.arrayBuffer(),
      };
    }
  }

  throw new Error("Failed to load font data");
}

type SerializableReactElement =
  | string
  | number
  | {
      type: string | null; // DOM elements have string type, others null
      props: {
        [key: string]: unknown;
        children?: SerializableReactElement | SerializableReactElement[];
      };
    }
  | null;

type ReactElementProps = {
  children?: ReactNode;
  [key: string]: unknown;
};

export function serializeReactElement(
  element: ReactNode
): SerializableReactElement {
  if (typeof element === "string" || typeof element === "number") {
    return element;
  }

  if (!element || typeof element !== "object" || !("type" in element)) {
    return null;
  }

  const reactElement = element as ReactElement<ReactElementProps>;
  const { type, props } = reactElement;

  const serializedProps: Record<string, unknown> = {};
  for (const key in props) {
    if (key === "children") continue; // handled separately
    const value = props[key];
    if (
      typeof value === "function" ||
      typeof value === "undefined" ||
      typeof value === "symbol"
    ) {
      continue; // skip unserializable props
    }
    serializedProps[key] = value;
  }

  const children = props?.children;

  return {
    type: typeof type === "string" ? type : null, // only serialize DOM elements
    props: {
      ...serializedProps,
      children: Array.isArray(children)
        ? children.map(serializeReactElement)
        : serializeReactElement(children),
    },
  };
}

export function deserializeReactElement(
  tree: SerializableReactElement
): ReactElement {
  if (typeof tree === "string" || typeof tree === "number")
    return tree as unknown as ReactElement;

  if (!tree || typeof tree !== "object") return null as unknown as ReactElement;

  const { type, props } = tree;
  if (!type) return null as unknown as ReactElement;

  const { children, ...otherProps } = props ?? {};

  return createElement(
    type,
    otherProps,
    Array.isArray(children)
      ? children.map(deserializeReactElement)
      : children
      ? deserializeReactElement(children)
      : children
  );
}
