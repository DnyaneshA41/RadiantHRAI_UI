export async function getCroppedImage(image, crop, fileName = "organization-logo.png") {
  if (!image || !crop || !image.naturalWidth || !image.naturalHeight) {
    throw new Error("Invalid image or crop selection.");
  }

  // Actual displayed dimensions
  const displayedWidth = image.getBoundingClientRect().width;
  const displayedHeight = image.getBoundingClientRect().height;

  // Convert percentage crop values into displayed-image pixels
  const pixelCrop =
    crop.unit === "%"
      ? {
          x: (crop.x / 100) * displayedWidth,
          y: (crop.y / 100) * displayedHeight,
          width: (crop.width / 100) * displayedWidth,
          height: (crop.height / 100) * displayedHeight,
        }
      : crop;

  // Scale displayed pixels to original image pixels
  const scaleX = image.naturalWidth / displayedWidth;
  const scaleY = image.naturalHeight / displayedHeight;

  const sourceX = pixelCrop.x * scaleX;
  const sourceY = pixelCrop.y * scaleY;
  const sourceWidth = pixelCrop.width * scaleX;
  const sourceHeight = pixelCrop.height * scaleY;

  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error("Please select a valid crop area.");
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to create image canvas.");
  }

  canvas.width = Math.round(sourceWidth);
  canvas.height = Math.round(sourceHeight);

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error("Failed to generate cropped image."));
      }
    }, "image/png");
  });

  const file = new File([blob], fileName, {
    type: "image/png",
  });

  return {
    file,
    preview: URL.createObjectURL(file),
  };
}