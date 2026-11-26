/** Save an existing ALMA mascot as a genuine PNG accepted by profile uploads. */
export async function avatarFile(color: string): Promise<File> {
  const mascot = document.querySelector<SVGSVGElement>('svg[viewBox="0 0 170 190"]');
  if (!mascot || !/^#[0-9a-f]{6}$/i.test(color)) throw new Error("Avatar is unavailable.");
  const svg = mascot.cloneNode(true) as SVGSVGElement;
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.querySelector("path")?.setAttribute("fill", color);
  svg.querySelectorAll("[class]").forEach(element => element.removeAttribute("class"));
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" }));
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to render the avatar."));
      image.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = 340;
    canvas.height = 380;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to render the avatar.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const png = await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Unable to save the avatar.")), "image/png"));
    return new File([png], "alma-avatar.png", { type: "image/png" });
  } finally { URL.revokeObjectURL(url); }
}
