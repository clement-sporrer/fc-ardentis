import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";
import { HeadProvider } from "./seo/HeadProvider";
import { createHeadManager } from "./seo/headManager";

export async function render(url: string): Promise<{ appHtml: string; headHtml: string }> {
  const head = createHeadManager();
  const appHtml = renderToString(
    <HeadProvider manager={head}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </HeadProvider>
  );
  return { appHtml, headHtml: head.toHeadHtml() };
}


