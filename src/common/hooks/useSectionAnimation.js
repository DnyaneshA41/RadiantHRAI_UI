import { useLayoutEffect, useRef } from "react";

function useSectionAnimation(isOpen) {
  const contentRef = useRef(null);
  const originalPadding = useRef(null);

  useLayoutEffect(() => {
    const element = contentRef.current;

    if (!element) return;

    let frameId;

    // Save the original CSS padding once.
    if (originalPadding.current === null) {
      const styles = window.getComputedStyle(element);

      originalPadding.current = {
        top: styles.paddingTop,
        bottom: styles.paddingBottom,
      };
    }

    const { top, bottom } = originalPadding.current;

    const handleTransitionEnd = (event) => {
      if (
        event.target !== element ||
        event.propertyName !== "height"
      ) {
        return;
      }

      if (isOpen) {
        // Allow the open section to adjust to its content.
        element.style.height = "auto";
      }
    };

    element.addEventListener("transitionend", handleTransitionEnd);

    if (isOpen) {
      // Begin with no height or vertical padding.
      element.style.height = "0px";
      element.style.paddingTop = "0px";
      element.style.paddingBottom = "0px";

      void element.offsetHeight;

      frameId = requestAnimationFrame(() => {
        // Restore padding and expand in the same animation.
        element.style.paddingTop = top;
        element.style.paddingBottom = bottom;
        element.style.height = `${element.scrollHeight}px`;
      });
    } else {
      // Capture the current visible height.
      element.style.height =
        `${element.getBoundingClientRect().height}px`;

      void element.offsetHeight;

      frameId = requestAnimationFrame(() => {
        // Collapse height and padding together.
        element.style.height = "0px";
        element.style.paddingTop = "0px";
        element.style.paddingBottom = "0px";
      });
    }

    return () => {
      element.removeEventListener(
        "transitionend",
        handleTransitionEnd
      );

      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isOpen]);

  return contentRef;
}

export default useSectionAnimation;
