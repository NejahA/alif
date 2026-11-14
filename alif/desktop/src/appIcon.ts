import { Image } from "@tauri-apps/api/image";
import { getCurrentWindow } from "@tauri-apps/api/window";

export type TabKey =
  | "universe"
  | "products"
  | "tasks"
  | "pomodoro"
  | "game"
  | "mahdia"
  | "diagnostics"
  | "system";

/** The program's real brand gradient, taken from `.brand-icon` in App.css. */
const BRAND = { from: "#38bdf8", to: "#6366f1" };

/** Accent colours pulled from the running program's own palette, per section. */
const SECTION: Record<TabKey, string> = {
  universe: "#38bdf8",
  products: "#fbbf24",
  tasks: "#34d399",
  pomodoro: "#f87171",
  game: "#a855f7",
  mahdia: "#818cf8",
  diagnostics: "#34d399",
  system: "#818cf8",
};

const SIZE = 256;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Draws the icon of the section the window is currently showing, in the same
 * spirit as the lucide icons the sidebar renders (box glyphs within a 100x100
 * box centred on the origin).
 */
function drawSectionGlyph(ctx: CanvasRenderingContext2D, tab: TabKey) {
  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const stroke = (draw: () => void) => {
    ctx.beginPath();
    draw();
    ctx.stroke();
  };

  switch (tab) {
    case "universe": // globe
      stroke(() => ctx.arc(0, 0, 38, 0, Math.PI * 2));
      stroke(() => ctx.ellipse(0, 0, 16, 38, 0, 0, Math.PI * 2));
      stroke(() => {
        ctx.moveTo(-38, 0);
        ctx.lineTo(38, 0);
      });
      break;

    case "products": // package box
      stroke(() => {
        ctx.moveTo(-34, -18);
        ctx.lineTo(0, -36);
        ctx.lineTo(34, -18);
        ctx.lineTo(34, 22);
        ctx.lineTo(0, 40);
        ctx.lineTo(-34, 22);
        ctx.closePath();
      });
      stroke(() => {
        ctx.moveTo(-34, -18);
        ctx.lineTo(0, 0);
        ctx.lineTo(34, -18);
      });
      stroke(() => {
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 40);
      });
      break;

    case "tasks": // check-square
      stroke(() => roundRect(ctx, -34, -34, 68, 68, 12));
      stroke(() => {
        ctx.moveTo(-16, 2);
        ctx.lineTo(-4, 16);
        ctx.lineTo(20, -14);
      });
      break;

    case "pomodoro": // timer
      stroke(() => ctx.arc(0, 8, 30, 0, Math.PI * 2));
      stroke(() => {
        ctx.moveTo(0, 8);
        ctx.lineTo(0, -12);
      });
      stroke(() => {
        ctx.moveTo(0, 8);
        ctx.lineTo(14, 18);
      });
      stroke(() => {
        ctx.moveTo(-12, -30);
        ctx.lineTo(12, -30);
      });
      stroke(() => {
        ctx.moveTo(0, -30);
        ctx.lineTo(0, -40);
      });
      break;

    case "game": // gamepad
      stroke(() => roundRect(ctx, -40, -22, 80, 46, 20));
      stroke(() => {
        ctx.moveTo(-24, 1);
        ctx.lineTo(-12, 1);
        ctx.moveTo(-18, -5);
        ctx.lineTo(-18, 7);
      });
      stroke(() => ctx.arc(17, -2, 5, 0, Math.PI * 2));
      stroke(() => ctx.arc(27, 9, 5, 0, Math.PI * 2));
      break;

    case "mahdia": // landmark
      stroke(() => {
        ctx.moveTo(-42, -20);
        ctx.lineTo(0, -44);
        ctx.lineTo(42, -20);
      });
      stroke(() => {
        ctx.moveTo(-42, -20);
        ctx.lineTo(42, -20);
      });
      stroke(() => {
        ctx.moveTo(-27, -14);
        ctx.lineTo(-27, 18);
        ctx.moveTo(-9, -14);
        ctx.lineTo(-9, 18);
        ctx.moveTo(9, -14);
        ctx.lineTo(9, 18);
        ctx.moveTo(27, -14);
        ctx.lineTo(27, 18);
      });
      stroke(() => {
        ctx.moveTo(-40, 18);
        ctx.lineTo(40, 18);
      });
      stroke(() => {
        ctx.moveTo(-44, 28);
        ctx.lineTo(44, 28);
      });
      break;

    case "diagnostics": // activity pulse
      stroke(() => {
        ctx.moveTo(-44, 0);
        ctx.lineTo(-24, 0);
        ctx.lineTo(-14, -26);
        ctx.lineTo(0, 26);
        ctx.lineTo(12, -12);
        ctx.lineTo(22, 0);
        ctx.lineTo(44, 0);
      });
      break;

    case "system": // cpu
      stroke(() => roundRect(ctx, -28, -28, 56, 56, 10));
      stroke(() => roundRect(ctx, -12, -12, 24, 24, 4));
      stroke(() => {
        for (let i = -1; i <= 1; i++) {
          const o = i * 16;
          ctx.moveTo(o, -28);
          ctx.lineTo(o, -40);
          ctx.moveTo(o, 28);
          ctx.lineTo(o, 40);
          ctx.moveTo(-28, o);
          ctx.lineTo(-40, o);
          ctx.moveTo(28, o);
          ctx.lineTo(40, o);
        }
      });
      break;
  }
}

/**
 * Renders the actual "Alif Desktop" program mark — the same rounded tile,
 * sky→indigo gradient and white Arabic alif (أ) that the running window paints
 * in its sidebar — stamped with a badge for the section currently on screen.
 */
function drawIcon(tab: TabKey): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  // Brand tile, matching .brand-icon (135deg gradient, ~10/36px rounding).
  const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  gradient.addColorStop(0, BRAND.from);
  gradient.addColorStop(1, BRAND.to);
  roundRect(ctx, 0, 0, SIZE, SIZE, SIZE * 0.24);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Soft top sheen for depth.
  const sheen = ctx.createLinearGradient(0, 0, 0, SIZE);
  sheen.addColorStop(0, "rgba(255,255,255,0.28)");
  sheen.addColorStop(0.55, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fill();

  // The program's brand glyph.
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 ${SIZE * 0.5}px "Segoe UI", Tahoma, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("أ", SIZE * 0.44, SIZE * 0.45);

  // Live section badge, tinted with the program's accent for that section.
  const bx = SIZE * 0.745;
  const by = SIZE * 0.745;
  const br = SIZE * 0.205;
  ctx.beginPath();
  ctx.arc(bx, by, br, 0, Math.PI * 2);
  ctx.fillStyle = SECTION[tab];
  ctx.fill();
  ctx.lineWidth = SIZE * 0.028;
  ctx.strokeStyle = "rgba(2,6,23,0.85)";
  ctx.stroke();

  ctx.save();
  ctx.translate(bx, by);
  const s = (br * 1.12) / 100;
  ctx.scale(s, s);
  drawSectionGlyph(ctx, tab);
  ctx.restore();

  return canvas;
}

/**
 * Applies the Alif program icon to both the webview favicon and the native
 * Tauri window icon, refreshing it whenever the visible section changes.
 */
export async function updateAppIcon(tab: TabKey): Promise<void> {
  const canvas = drawIcon(tab);

  // 1. Webview favicon (works everywhere, including plain `vite`).
  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = "image/png";
  link.href = canvas.toDataURL("image/png");

  // 2. Native taskbar / window icon (only available inside Tauri).
  try {
    const ctx = canvas.getContext("2d")!;
    const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
    const rgba = new Uint8Array(data.buffer);
    const image = await Image.new(rgba, SIZE, SIZE);
    await getCurrentWindow().setIcon(image);
  } catch {
    // Running in a plain browser — no native window to update.
  }
}
