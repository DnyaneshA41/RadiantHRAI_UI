
import { useEffect, useRef, useState } from "react";
import { FiEye, FiX } from "react-icons/fi";

// =====================================================
// NORMALIZE IMAGE SOURCE
// Supports API Base64 strings, data URLs, HTTP URLs,
// Blob URLs, and Base64 strings with whitespace.
// =====================================================

const normalizeImageUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const image = value.trim();

  // Already a Base64 data URL.
  if (/^data:image\//i.test(image)) {
    return image;
  }

  // Existing URL or temporary Blob URL.
  if (/^(https?:\/\/|blob:)/i.test(image)) {
    return image;
  }

  // Remove a possible Base64 prefix for processing.
  const base64 = image.replace(/\s/g, "");

  // PNG
  if (base64.startsWith("iVBOR")) {
    return `data:image/png;base64,${base64}`;
  }

  // JPEG
  if (base64.startsWith("/9j/")) {
    return `data:image/jpeg;base64,${base64}`;
  }

  // GIF
  if (base64.startsWith("R0lGOD")) {
    return `data:image/gif;base64,${base64}`;
  }

  // WebP
  if (base64.startsWith("UklGR")) {
    return `data:image/webp;base64,${base64}`;
  }

  // SVG Base64
  if (base64.startsWith("PHN2Zy")) {
    return `data:image/svg+xml;base64,${base64}`;
  }

  // Unknown format: do not treat arbitrary Base64
  // content as a relative URL.
  return "";
};

function FormFileUpload({
  label,
  name,
  value,
  onChange,
  preview = "",
  accept = "image/png,image/jpeg,image/jpg",
  error = "",
  required = false,
  savedFileName = "",
  onPreview,
  onFileSelect,
}) {
  const inputRef = useRef(null);

  const [localPreview, setLocalPreview] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState("");

  // =====================================================
  // TEMPORARY PREVIEW FOR SELECTED FILES
  // =====================================================

  useEffect(() => {
    if (!(value instanceof Blob) || preview) {
      setFilePreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(value);

    setFilePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [value, preview]);

  // =====================================================
  // IMAGE SOURCE
  // Priority:
  // 1. Parent-provided cropped preview
  // 2. Temporary URL for selected File
  // 3. API Base64 string or existing URL
  // =====================================================

  const rawImageSource =
    preview ||
    filePreviewUrl ||
    (typeof value === "string" ? value : "");

  const imageUrl = normalizeImageUrl(rawImageSource);

  const displayName =
    value instanceof File ? value.name : savedFileName;

  // =====================================================
  // FILE SELECTION
  // =====================================================

  const handleChange = (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    // Allow selecting the same file again.
    input.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    // Let Organization.jsx handle cropping when configured.
    if (onFileSelect) {
      onFileSelect(file);
      return;
    }

    // Preserve compatibility with other upload components.
    if (onChange) {
      onChange({
        target: {
          name,
          value: file,
          type: "file",
          files: [file],
        },
      });
    }
  };

  // =====================================================
  // OPEN PREVIEW
  // =====================================================

  const handlePreview = () => {
    if (!imageUrl) return;

    if (onPreview) {
      onPreview(imageUrl);
      return;
    }

    setLocalPreview(true);
  };

  const closePreview = () => {
    setLocalPreview(false);
  };

  // =====================================================
  // CLOSE PREVIEW WITH ESCAPE
  // =====================================================

  useEffect(() => {
    if (!localPreview) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setLocalPreview(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [localPreview]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="hrms-form-group">
      {label && (
        <label
          className="hrms-form-label"
          htmlFor={`${name}-file`}
        >
          {label}
          {required && (
            <span className="hrms-required">*</span>
          )}
        </label>
      )}

      <div className="hrms-file-input-row">
        <input
          ref={inputRef}
          id={`${name}-file`}
          type="file"
          name={name}
          accept={accept}
          className="hrms-native-file-input"
          onChange={handleChange}
        />

        <button
          type="button"
          className="hrms-file-choose"
          onClick={() => inputRef.current?.click()}
        >
          Choose file
        </button>

        <span
          className="hrms-file-name"
          title={displayName || "No file chosen"}
        >
          {displayName || "No file chosen"}
        </span>

        <button
          type="button"
          className="hrms-file-preview-button"
          onClick={handlePreview}
          disabled={!imageUrl}
          title={`Preview ${label || "file"}`}
          aria-label={`Preview ${label || "file"}`}
        >
          <FiEye size={21} />
        </button>
      </div>

      {savedFileName && (
        <div className="hrms-file-saved">
          Saved: <strong>{savedFileName}</strong>
        </div>
      )}

      {error && (
        <span className="hrms-form-error">
          {error}
        </span>
      )}

      {/* IMAGE PREVIEW MODAL */}
      {localPreview && imageUrl && (
        <div
          className="hrms-file-preview-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePreview();
            }
          }}
        >
          <div
            className="hrms-file-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${label || "Image"} preview`}
          >
            <div className="hrms-file-preview-header">
              <strong>
                {label || "Image"} Preview
              </strong>

              <button
                type="button"
                className="hrms-file-preview-close"
                onClick={closePreview}
                aria-label="Close preview"
              >
                <FiX size={21} />
              </button>
            </div>

            <div className="hrms-file-preview-content">
              <img
                key={imageUrl}
                src={imageUrl}
                alt={`${label || "Image"} preview`}
                onLoad={(event) => {
                  const img = event.currentTarget;

                  console.log("Preview image loaded:", {
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    src: img.currentSrc,
                  });
                }}
                onError={(event) => {
                  console.error(
                    "Preview image failed to load:",
                    event.currentTarget.currentSrc
                  );
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormFileUpload;
