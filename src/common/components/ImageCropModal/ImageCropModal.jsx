
import { useEffect, useRef, useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { FiX, FiRotateCcw } from "react-icons/fi";
import { getCroppedImage } from "../../utils/getCroppedImage";
import "./ImageCropModal.css";

const createInitialCrop = (width, height) => {
  const crop = makeAspectCrop(
    {
      unit: "%",
      width: 80,
    },
    width / height,
    width,
    height
  );

  return centerCrop(crop, width, height);
};

const ImageCropModal = ({
  isOpen,
  imageFile,
  imageUrl,
  fileName = "cropped-image.png",
  title = "Crop Image",
  aspectRatio,
  onSave,
  onCancel,
}) => {
  const imageRef = useRef(null);
  const temporaryPreviewRef = useRef(null);

  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const source = imageUrl || temporaryPreviewRef.current;

  useEffect(() => {
    if (!isOpen) return;

    setCrop(undefined);
    setCompletedCrop(null);
    setIsSaving(false);
    setError("");

    if (imageFile) {
      const previewUrl = URL.createObjectURL(imageFile);
      temporaryPreviewRef.current = previewUrl;

      return () => {
        URL.revokeObjectURL(previewUrl);
        temporaryPreviewRef.current = null;
      };
    }
  }, [isOpen, imageFile]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !isSaving) {
        onCancel?.();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isSaving, onCancel]);

  const handleImageLoad = (event) => {
    const image = event.currentTarget;

    imageRef.current = image;

    const initialCrop = aspectRatio
      ? makeAspectCrop(
          {
            unit: "%",
            width: 80,
          },
          aspectRatio,
          image.width,
          image.height
        )
      : {
          unit: "%",
          x: 10,
          y: 10,
          width: 80,
          height: 80,
        };

    setCrop(
      aspectRatio
        ? centerCrop(initialCrop, image.width, image.height)
        : initialCrop
    );

    setCompletedCrop(null);
    setError("");
  };

  const handleReset = () => {
    const image = imageRef.current;

    if (!image) return;

    if (aspectRatio) {
      const initialCrop = makeAspectCrop(
        {
          unit: "%",
          width: 80,
        },
        aspectRatio,
        image.width,
        image.height
      );

      setCrop(centerCrop(initialCrop, image.width, image.height));
    } else {
      setCrop({
        unit: "%",
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      });
    }

    setCompletedCrop(null);
    setError("");
  };

  const handleSave = async () => {
    if (!imageRef.current || !completedCrop) {
      setError("Please select a crop area before saving.");
      return;
    }

    if (completedCrop.width <= 0 || completedCrop.height <= 0) {
      setError("Please select a valid crop area.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const result = await getCroppedImage(
        imageRef.current,
        completedCrop,
        fileName
      );

      await onSave?.(result);
    } catch (saveError) {
      setError(saveError.message || "Unable to crop the image.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || (!imageUrl && !imageFile)) {
    return null;
  }

  return (
    <div
      className="image-crop-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onCancel?.();
        }
      }}
    >
      <div
        className="image-crop-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-crop-title"
      >
        <div className="image-crop-header">
          <div>
            <h3 id="image-crop-title">{title}</h3>
            <p>Adjust the selection to crop your image.</p>
          </div>

          <button
            type="button"
            className="image-crop-close"
            onClick={onCancel}
            disabled={isSaving}
            aria-label="Close crop modal"
          >
            <FiX />
          </button>
        </div>

        <div className="image-crop-body">
          <div className="image-crop-instructions">
            Drag the crop area to adjust the image selection.
          </div>

          <div className="image-crop-image-container">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(pixelCrop, percentCrop) => {
                setCompletedCrop(percentCrop);
              }}
              aspect={aspectRatio}
              keepSelection
            >
              <img
                src={source}
                alt="Image to crop"
                onLoad={handleImageLoad}
                className="image-crop-image"
              />
            </ReactCrop>
          </div>

          {error && (
            <p className="image-crop-error" role="alert">
              {error}
            </p>
          )}

          <div className="image-crop-file-info">
            <span>Selected file</span>
            <strong>
              {imageFile?.name || fileName}
            </strong>
          </div>
        </div>

        <div className="image-crop-footer">
          <button
            type="button"
            className="image-crop-reset"
            onClick={handleReset}
            disabled={isSaving}
          >
            <FiRotateCcw />
            Reset
          </button>

          <div className="image-crop-actions">
            <button
              type="button"
              className="image-crop-cancel"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="image-crop-save"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Cropping..." : "Crop & Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
