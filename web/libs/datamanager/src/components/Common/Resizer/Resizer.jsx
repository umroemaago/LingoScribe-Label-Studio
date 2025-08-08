import React from "react";
import { Block, Elem } from "../../../utils/bem";
import "./Resizer.scss";

const calculateWidth = (width, minWidth, maxWidth, initialX, currentX) => {
  try {
    const offset = currentX - initialX;
    return Math.max(minWidth ?? 30, Math.min(width + offset, maxWidth ?? 400));
  } catch (error) {
    console.warn('Width calculation error:', error);
    return minWidth ?? 30;
  }
};

export const Resizer = ({
  children,
  style,
  handleStyle,
  initialWidth = 200,
  className,
  type,
  minWidth = 50,
  maxWidth = 400,
  showResizerLine,
  onResize: onResizeCallback,
  onResizeFinished,
  onReset,
}) => {
  // Use static defined values instead of reading from DOM
  const [width, setWidth] = React.useState(initialWidth);
  const [isResizing, setIsResizing] = React.useState(false);
  const resizeHandler = React.useRef();

  React.useEffect(() => {
    try {
      // Use static validation instead of DOM checks
      if (initialWidth && !isNaN(initialWidth)) {
        const newWidth = Math.max(minWidth, Math.min(initialWidth, maxWidth));
        setWidth(newWidth);
        onResizeCallback?.(newWidth);
      }
    } catch (error) {
      console.warn('Resizer initialWidth error:', error);
    }
  }, [initialWidth, minWidth, maxWidth, onResizeCallback]);

  const handleResize = React.useCallback(
    (evt) => {
      try {
        evt.stopPropagation();
        evt.preventDefault();

        const initialX = evt.pageX;
        let newWidth = width;

        const onResize = (evt) => {
          try {
            newWidth = calculateWidth(width, minWidth, maxWidth, initialX, evt.pageX);
            setWidth(newWidth);
            onResizeCallback?.(newWidth);
          } catch (error) {
            console.warn('Resize error:', error);
          }
        };

        const stopResize = (evt) => {
          try {
            document.removeEventListener("mousemove", onResize);
            document.removeEventListener("mouseup", stopResize);
            document.body.style.removeProperty("user-select");

            newWidth = calculateWidth(width, minWidth, maxWidth, initialX, evt.pageX);

            setIsResizing(false);
            if (newWidth !== width) {
              setWidth(newWidth);
              onResizeFinished?.(newWidth);
            }
          } catch (error) {
            console.warn('Stop resize error:', error);
            setIsResizing(false);
          }
        };

        document.addEventListener("mousemove", onResize);
        document.addEventListener("mouseup", stopResize);
        document.body.style.userSelect = "none";
        setIsResizing(true);
      } catch (error) {
        console.warn('Handle resize error:', error);
      }
    },
    [width, minWidth, maxWidth, onResizeCallback, onResizeFinished]
  );

  // Use static width calculation - no DOM access
  const safeWidth = React.useMemo(() => {
    try {
      if (width === null || width === undefined || isNaN(width)) {
        return initialWidth;
      }
      return Math.max(minWidth, Math.min(width, maxWidth));
    } catch (error) {
      console.warn('Safe width calculation error:', error);
      return initialWidth;
    }
  }, [width, initialWidth, minWidth, maxWidth]);

  return (
    <Block name="resizer" mix={className} style={{ width: `${safeWidth}px` }}>
      <Elem name="content" style={style ?? {}}>
        {children}
      </Elem>

      <Elem
        name="handle"
        ref={resizeHandler}
        style={handleStyle}
        mod={{ resizing: showResizerLine !== false && isResizing, quickview: type === "quickview" }}
        onMouseDown={handleResize}
        onDoubleClick={() => onReset?.()}
      />
    </Block>
  );
};