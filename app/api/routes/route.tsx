import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const getRoutes = () => {
  const pagesDir = path.join(process.cwd(), "app");
  const apiDir = path.join(process.cwd(), "app/api");

  const getFiles = (dir: string, basePath = ""): string[] => {
    return fs.existsSync(dir)
      ? fs.readdirSync(dir).flatMap((file) => {
          const filePath = path.join(dir, file);
          const relativePath = path.join(basePath, file.replace(/\.tsx?$/, "").replace(/page$/, ""));
          return fs.statSync(filePath).isDirectory() ? getFiles(filePath, relativePath) : [relativePath];
        })
      : [];
  };

  return {
    pageRoutes: getFiles(pagesDir),
    apiRoutes: getFiles(apiDir, "/api"),
  };
};

export async function GET() {
  return NextResponse.json(getRoutes());
}
