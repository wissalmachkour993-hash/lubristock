import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const IMAGES: Record<string, string[]> = {
  engin: [
    "C:\\Users\\len\\.cursor\\projects\\c-Users-len-Downloads-b-262S7dIolg7\\assets\\c__Users_len_AppData_Roaming_Cursor_User_workspaceStorage_859c5b02d19e99842cf8a67f77f6ca06_images_image-67afbf8c-8805-4eb7-8db2-e9053ffa1ee4.png",
    "C:\\Users\\len\\.cursor\\projects\\c-Users-len-Downloads-b-262S7dIolg7\\assets\\c__Users_len_AppData_Roaming_Cursor_User_workspaceStorage_859c5b02d19e99842cf8a67f77f6ca06_images_image-893a68be-1aed-4b9e-8a6c-6f2c2ee64698.png",
  ],
  site: [
    "C:\\Users\\len\\.cursor\\projects\\c-Users-len-Downloads-b-262S7dIolg7\\assets\\c__Users_len_AppData_Roaming_Cursor_User_workspaceStorage_859c5b02d19e99842cf8a67f77f6ca06_images_image-e06b2441-a8c3-4a9b-9ec3-eee58e653bad.png",
    "C:\\Users\\len\\.cursor\\projects\\c-Users-len-Downloads-b-262S7dIolg7\\assets\\c__Users_len_AppData_Roaming_Cursor_User_workspaceStorage_859c5b02d19e99842cf8a67f77f6ca06_images_image-03b9f9a8-8d40-4d6f-8a8d-2cc0801508d8.png",
  ],
  ocp: [
    "C:\\Users\\len\\.cursor\\projects\\c-Users-len-Downloads-b-262S7dIolg7\\assets\\c__Users_len_AppData_Roaming_Cursor_User_workspaceStorage_859c5b02d19e99842cf8a67f77f6ca06_images_image-2216212e-b03b-4ff6-95c6-eb09dcb65889-ef4756c7-765a-4bd2-a0a7-dd090e049c40.png",
  ],
};

function contentTypeFor(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ image: string }> }
) {
  const { image } = await params;
  const imageCandidates = IMAGES[image];

  if (!imageCandidates?.length) {
    return new NextResponse("Image introuvable", { status: 404 });
  }

  for (const imagePath of imageCandidates) {
    try {
      const file = await fs.readFile(imagePath);
      return new NextResponse(file, {
        headers: {
          "Content-Type": contentTypeFor(imagePath),
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch {
      // essaie la prochaine image candidate
    }
  }

  return new NextResponse("Image indisponible", { status: 404 });
}
