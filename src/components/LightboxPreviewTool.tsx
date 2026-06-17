import type Konva from "konva";
import {
  Download,
  ImageIcon,
  Moon,
  RotateCcw,
  Send,
  Sun,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Group,
  Image,
  Layer,
  Rect,
  Stage,
  Text,
  Transformer,
} from "react-konva";

type PreviewMode = "face" | "shopfront";
type LightingMode = "day" | "night";
type FrameStyle = "black" | "white" | "deep-wood" | "brushed-metal";

type DimensionsMm = {
  width: number;
  height: number;
};

type Cabinet = {
  faceColor: string;
  frameColor: string;
  frameStyle: FrameStyle;
  lightingMode: LightingMode;
};

type BaseDesignElement = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
};

type TextDesignElement = BaseDesignElement & {
  type: "text";
  text: string;
  fill: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: "normal" | "bold";
};

type ImageDesignElement = BaseDesignElement & {
  type: "image";
  src: string;
  fileName: string;
  mimeType: string;
};

type DesignElement = TextDesignElement | ImageDesignElement;

type ShopfrontImage = {
  src: string;
  fileName: string;
  width: number;
  height: number;
};

type SignTransform = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

type PreviewAttachment = {
  previewImageDataUrl: string;
  previewDesignJson: string;
  previewMode: PreviewMode;
  attachedAt: string;
};

const PREVIEW_UPDATED_EVENT = "lightbox-preview:updated";
const PREVIEW_CLEARED_EVENT = "lightbox-preview:cleared";
const PREVIEW_STORAGE_KEY = "commercial-lightbox-preview";

const LOGICAL_SIGN_WIDTH = 1000;
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_ATTACHMENT_BYTES = 2.5 * 1024 * 1024;
const MAX_EXPORT_EDGE = 1800;
const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

const frameStyles: Array<{ label: string; value: FrameStyle }> = [
  { label: "Black", value: "black" },
  { label: "White", value: "white" },
  { label: "Deep wood", value: "deep-wood" },
  { label: "Brushed metal", value: "brushed-metal" },
];

const initialDimensions: DimensionsMm = {
  width: 2400,
  height: 600,
};

const initialCabinet: Cabinet = {
  faceColor: "#fff7e3",
  frameColor: "#181512",
  frameStyle: "deep-wood",
  lightingMode: "night",
};

function classNames(...tokens: Array<string | false | undefined>) {
  return tokens.filter(Boolean).join(" ");
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function getSignRatio(dimensions: DimensionsMm) {
  const ratio = dimensions.width / Math.max(dimensions.height, 1);
  return Math.min(6, Math.max(1.8, ratio || 4));
}

function getLogicalSignHeight(dimensions: DimensionsMm) {
  return LOGICAL_SIGN_WIDTH / getSignRatio(dimensions);
}

function getFrameInset(logicalHeight: number) {
  return Math.round(Math.max(24, Math.min(52, logicalHeight * 0.095)));
}

function createInitialElements(dimensions: DimensionsMm): DesignElement[] {
  const logicalHeight = getLogicalSignHeight(dimensions);
  const frameInset = getFrameInset(logicalHeight);
  const faceWidth = LOGICAL_SIGN_WIDTH - frameInset * 2;
  const faceHeight = logicalHeight - frameInset * 2;
  const width = Math.min(420, faceWidth * 0.58);
  const height = Math.min(96, faceHeight * 0.5);

  return [
    {
      id: "sample-text",
      type: "text",
      text: "YOUR SIGN",
      x: frameInset + (faceWidth - width) / 2,
      y: frameInset + (faceHeight - height) / 2,
      width,
      height,
      rotation: 0,
      opacity: 1,
      fill: "#151515",
      fontSize: Math.max(28, Math.min(66, faceHeight * 0.36)),
      fontFamily: "Inter, Arial, sans-serif",
      fontStyle: "bold",
    },
  ];
}

function estimateDataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
}

function stripRuntimeImageData(elements: DesignElement[]) {
  return elements.map((element) => {
    if (element.type === "text") return element;

    const { src: _src, ...serializableElement } = element;
    return serializableElement;
  });
}

function getDefaultSignTransform(
  stageWidth: number,
  stageHeight: number,
  signRatio: number,
): SignTransform {
  const width = Math.round(stageWidth * 0.54);
  return {
    x: Math.round(stageWidth * 0.23),
    y: Math.round(stageHeight * 0.2),
    width,
    height: Math.round(width / signRatio),
    rotation: 0,
  };
}

function sanitizeSvg(svgText: string) {
  const unsafePattern =
    /<script|<\/script|<foreignObject|<\/foreignObject|on[a-z]+\s*=|javascript:/i;

  if (unsafePattern.test(svgText)) {
    throw new Error(
      "SVG files with scripts or embedded HTML are not supported.",
    );
  }

  return svgText.trim();
}

function svgToDataUrl(svgText: string) {
  const bytes = new TextEncoder().encode(svgText);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return `data:image/svg+xml;base64,${btoa(binary)}`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read the image file."));
      }
    };
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read the SVG file."));
      }
    };
    reader.onerror = () => reject(new Error("Could not read the SVG file."));
    reader.readAsText(file);
  });
}

function loadImageMetadata(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      resolve({
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      });
    };
    image.onerror = () => reject(new Error("Could not load the image."));
    image.src = src;
  });
}

async function fileToImageData(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Use an image smaller than ${formatBytes(MAX_UPLOAD_BYTES)}.`,
    );
  }

  if (!IMAGE_MIME_TYPES.has(file.type)) {
    throw new Error("Upload PNG, JPG, WebP, or SVG artwork.");
  }

  const src =
    file.type === "image/svg+xml"
      ? svgToDataUrl(sanitizeSvg(await readFileAsText(file)))
      : await readFileAsDataUrl(file);
  const metadata = await loadImageMetadata(src);

  return {
    src,
    fileName: file.name,
    mimeType: file.type,
    width: metadata.width,
    height: metadata.height,
  };
}

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width));
    });

    observer.observe(node);
    setWidth(Math.round(node.getBoundingClientRect().width));

    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

function useCanvasImage(src?: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }

    const nextImage = new window.Image();
    nextImage.onload = () => setImage(nextImage);
    nextImage.onerror = () => setImage(null);
    nextImage.src = src;

    return () => {
      nextImage.onload = null;
      nextImage.onerror = null;
    };
  }, [src]);

  return image;
}

function ToolbarButton({
  children,
  isActive,
  onClick,
  title,
  type = "button",
}: {
  children: ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  title?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      className={classNames(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] transition-[background-color,color,scale,box-shadow] duration-150 ease-out active:scale-[0.96]",
        isActive
          ? "bg-stone-950 text-white shadow-[0_0_0_1px_rgba(0,0,0,0.16),0_10px_26px_rgba(0,0,0,0.16)]"
          : "bg-white text-stone-800 hover:bg-amber-50",
      )}
    >
      {children}
    </button>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
      {children}
    </span>
  );
}

function NumberField({
  label,
  min,
  onChange,
  value,
}: {
  label: string;
  min: number;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || min)}
        className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-semibold tabular-nums text-stone-950 shadow-[0_1px_1px_rgba(0,0,0,0.04)_inset] transition-[border-color,box-shadow] focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/15"
      />
    </div>
  );
}

function ColorField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex h-11 items-center gap-2 rounded-lg bg-white px-2 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="size-8 rounded-md border-0 bg-transparent p-0"
          aria-label={label}
        />
        <span className="font-mono text-xs font-semibold uppercase tabular-nums text-stone-600">
          {value}
        </span>
      </div>
    </div>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: FrameStyle) => void;
  options: Array<{ label: string; value: FrameStyle }>;
  value: FrameStyle;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as FrameStyle)}
        className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-semibold text-stone-950 shadow-[0_1px_1px_rgba(0,0,0,0.04)_inset] transition-[border-color,box-shadow] focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function UploadButton({
  accept,
  children,
  onChange,
}: {
  accept: string;
  children: ReactNode;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
      />
      <ToolbarButton onClick={() => inputRef.current?.click()}>
        {children}
      </ToolbarButton>
    </>
  );
}

function SignGraphic({
  cabinet,
  elements,
  interactive,
  logicalHeight,
  onChangeElement,
  onSelect,
  selectedId,
}: {
  cabinet: Cabinet;
  elements: DesignElement[];
  interactive: boolean;
  logicalHeight: number;
  onChangeElement?: (element: DesignElement) => void;
  onSelect?: (id: string) => void;
  selectedId?: string;
}) {
  const frameInset = getFrameInset(logicalHeight);
  const faceX = frameInset;
  const faceY = frameInset;
  const faceWidth = LOGICAL_SIGN_WIDTH - frameInset * 2;
  const faceHeight = logicalHeight - frameInset * 2;
  const cornerRadius = Math.max(16, Math.min(28, logicalHeight * 0.05));
  const innerRadius = Math.max(9, cornerRadius - frameInset * 0.18);
  const isNight = cabinet.lightingMode === "night";
  const isWood = cabinet.frameStyle === "deep-wood";
  const isMetal = cabinet.frameStyle === "brushed-metal";
  const frameFill =
    cabinet.frameStyle === "white"
      ? "#f9f7f2"
      : cabinet.frameStyle === "brushed-metal"
        ? "#a7a29a"
        : cabinet.frameStyle === "deep-wood"
          ? "#382111"
          : cabinet.frameColor;

  return (
    <Group>
      {isNight && (
        <Rect
          x={faceX}
          y={faceY}
          width={faceWidth}
          height={faceHeight}
          cornerRadius={innerRadius}
          fill={cabinet.faceColor}
          opacity={0.58}
          shadowColor={cabinet.faceColor}
          shadowBlur={42}
          shadowOpacity={0.7}
        />
      )}
      <Rect
        x={0}
        y={0}
        width={LOGICAL_SIGN_WIDTH}
        height={logicalHeight}
        cornerRadius={cornerRadius}
        fill={frameFill}
        fillLinearGradientStartPoint={
          isWood || isMetal ? { x: 0, y: 0 } : undefined
        }
        fillLinearGradientEndPoint={
          isWood || isMetal
            ? { x: LOGICAL_SIGN_WIDTH, y: logicalHeight }
            : undefined
        }
        fillLinearGradientColorStops={
          isWood
            ? [0, "#1f130b", 0.34, "#5b3219", 0.68, "#2a180d", 1, "#6a4221"]
            : isMetal
              ? [0, "#7c7972", 0.28, "#dad6cc", 0.56, "#918d85", 1, "#f1ede4"]
              : undefined
        }
        shadowColor="#000000"
        shadowBlur={isNight ? 28 : 18}
        shadowOpacity={isNight ? 0.32 : 0.18}
        shadowOffsetY={isNight ? 10 : 7}
      />
      {isWood &&
        [0.22, 0.46, 0.7].map((position) => (
          <Rect
            key={position}
            x={32}
            y={logicalHeight * position}
            width={LOGICAL_SIGN_WIDTH - 64}
            height={3}
            cornerRadius={2}
            fill="#8b5a2e"
            opacity={0.35}
          />
        ))}
      <Rect
        x={faceX}
        y={faceY}
        width={faceWidth}
        height={faceHeight}
        cornerRadius={innerRadius}
        fill={cabinet.faceColor}
        opacity={isNight ? 0.98 : 1}
        shadowColor={isNight ? cabinet.faceColor : "#000000"}
        shadowBlur={isNight ? 22 : 3}
        shadowOpacity={isNight ? 0.42 : 0.08}
        shadowOffsetY={isNight ? 0 : 1}
      />
      <Rect
        x={faceX + 8}
        y={faceY + 8}
        width={faceWidth - 16}
        height={Math.max(8, faceHeight * 0.18)}
        cornerRadius={Math.max(6, innerRadius - 6)}
        fill="#ffffff"
        opacity={isNight ? 0.18 : 0.26}
      />
      <Group
        clip={{
          x: faceX,
          y: faceY,
          width: faceWidth,
          height: faceHeight,
        }}
      >
        {elements.map((element) =>
          element.type === "text" ? (
            <EditableTextElement
              key={element.id}
              element={element}
              interactive={interactive}
              isSelected={selectedId === element.id}
              onChange={onChangeElement}
              onSelect={onSelect}
            />
          ) : (
            <EditableImageElement
              key={element.id}
              element={element}
              interactive={interactive}
              isSelected={selectedId === element.id}
              onChange={onChangeElement}
              onSelect={onSelect}
            />
          ),
        )}
      </Group>
    </Group>
  );
}

function EditableTextElement({
  element,
  interactive,
  isSelected,
  onChange,
  onSelect,
}: {
  element: TextDesignElement;
  interactive: boolean;
  isSelected: boolean;
  onChange?: (element: DesignElement) => void;
  onSelect?: (id: string) => void;
}) {
  const shapeRef = useRef<Konva.Text | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        ref={shapeRef}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        opacity={element.opacity}
        text={element.text}
        fill={element.fill}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fontStyle={element.fontStyle}
        align="center"
        verticalAlign="middle"
        draggable={interactive}
        onClick={() => onSelect?.(element.id)}
        onTap={() => onSelect?.(element.id)}
        onDragEnd={(event) =>
          onChange?.({
            ...element,
            x: event.target.x(),
            y: event.target.y(),
          })
        }
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);

          onChange?.({
            ...element,
            x: node.x(),
            y: node.y(),
            width: Math.max(72, node.width() * scaleX),
            height: Math.max(40, node.height() * scaleY),
            fontSize: Math.max(18, element.fontSize * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {interactive && isSelected && (
        <Transformer
          name="preview-selection"
          ref={transformerRef}
          rotateEnabled
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
            "middle-left",
            "middle-right",
          ]}
          borderStroke="#f59e0b"
          anchorFill="#ffffff"
          anchorStroke="#f59e0b"
          anchorSize={9}
          boundBoxFunc={(_, newBox) =>
            newBox.width < 72 || newBox.height < 40 ? _ : newBox
          }
        />
      )}
    </>
  );
}

function EditableImageElement({
  element,
  interactive,
  isSelected,
  onChange,
  onSelect,
}: {
  element: ImageDesignElement;
  interactive: boolean;
  isSelected: boolean;
  onChange?: (element: DesignElement) => void;
  onSelect?: (id: string) => void;
}) {
  const image = useCanvasImage(element.src);
  const shapeRef = useRef<Konva.Image | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      {image ? (
        <Image
          ref={shapeRef}
          image={image}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          rotation={element.rotation}
          opacity={element.opacity}
          draggable={interactive}
          onClick={() => onSelect?.(element.id)}
          onTap={() => onSelect?.(element.id)}
          onDragEnd={(event) =>
            onChange?.({
              ...element,
              x: event.target.x(),
              y: event.target.y(),
            })
          }
          onTransformEnd={() => {
            const node = shapeRef.current;
            if (!node) return;

            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);

            onChange?.({
              ...element,
              x: node.x(),
              y: node.y(),
              width: Math.max(32, node.width() * scaleX),
              height: Math.max(32, node.height() * scaleY),
              rotation: node.rotation(),
            });
          }}
        />
      ) : (
        <Rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          rotation={element.rotation}
          fill="#d6d3d1"
          opacity={0.7}
        />
      )}
      {interactive && isSelected && image && (
        <Transformer
          name="preview-selection"
          ref={transformerRef}
          rotateEnabled
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
            "middle-left",
            "middle-right",
          ]}
          borderStroke="#f59e0b"
          anchorFill="#ffffff"
          anchorStroke="#f59e0b"
          anchorSize={9}
          boundBoxFunc={(_, newBox) =>
            newBox.width < 32 || newBox.height < 32 ? _ : newBox
          }
        />
      )}
    </>
  );
}

function ShopfrontBackground({
  image,
  stageHeight,
  stageWidth,
}: {
  image?: ShopfrontImage;
  stageHeight: number;
  stageWidth: number;
}) {
  const canvasImage = useCanvasImage(image?.src);

  if (canvasImage && image) {
    const imageRatio = image.width / Math.max(image.height, 1);
    const stageRatio = stageWidth / Math.max(stageHeight, 1);
    const coverScale =
      imageRatio > stageRatio
        ? stageHeight / image.height
        : stageWidth / image.width;
    const width = image.width * coverScale;
    const height = image.height * coverScale;

    return (
      <Image
        image={canvasImage}
        x={(stageWidth - width) / 2}
        y={(stageHeight - height) / 2}
        width={width}
        height={height}
      />
    );
  }

  return (
    <Group>
      <Rect width={stageWidth} height={stageHeight} fill="#d8d4ca" />
      <Rect
        x={stageWidth * 0.06}
        y={stageHeight * 0.12}
        width={stageWidth * 0.88}
        height={stageHeight * 0.68}
        fill="#f8f5ed"
        shadowColor="#000000"
        shadowBlur={24}
        shadowOpacity={0.18}
        shadowOffsetY={10}
      />
      <Rect
        x={stageWidth * 0.06}
        y={stageHeight * 0.11}
        width={stageWidth * 0.88}
        height={stageHeight * 0.1}
        fill="#473f37"
      />
      <Rect
        x={stageWidth * 0.14}
        y={stageHeight * 0.36}
        width={stageWidth * 0.3}
        height={stageHeight * 0.33}
        fill="#26313a"
        opacity={0.82}
      />
      <Rect
        x={stageWidth * 0.5}
        y={stageHeight * 0.34}
        width={stageWidth * 0.34}
        height={stageHeight * 0.35}
        fill="#344653"
        opacity={0.72}
      />
      <Rect
        y={stageHeight * 0.8}
        width={stageWidth}
        height={stageHeight * 0.2}
        fill="#37332e"
      />
    </Group>
  );
}

function ShopfrontSign({
  cabinet,
  elements,
  logicalHeight,
  onChange,
  signTransform,
}: {
  cabinet: Cabinet;
  elements: DesignElement[];
  logicalHeight: number;
  onChange: (transform: SignTransform) => void;
  signTransform: SignTransform;
}) {
  const groupRef = useRef<Konva.Group | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    if (selected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selected]);

  return (
    <>
      <Group
        ref={groupRef}
        x={signTransform.x}
        y={signTransform.y}
        rotation={signTransform.rotation}
        scaleX={signTransform.width / LOGICAL_SIGN_WIDTH}
        scaleY={signTransform.height / logicalHeight}
        draggable
        onClick={() => setSelected(true)}
        onTap={() => setSelected(true)}
        onDragEnd={(event) =>
          onChange({
            ...signTransform,
            x: event.target.x(),
            y: event.target.y(),
          })
        }
        onTransformEnd={() => {
          const node = groupRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(signTransform.width / LOGICAL_SIGN_WIDTH);
          node.scaleY(signTransform.height / logicalHeight);

          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(120, LOGICAL_SIGN_WIDTH * scaleX),
            height: Math.max(40, logicalHeight * scaleY),
            rotation: node.rotation(),
          });
        }}
      >
        <SignGraphic
          cabinet={cabinet}
          elements={elements}
          interactive={false}
          logicalHeight={logicalHeight}
        />
      </Group>
      {selected && (
        <Transformer
          name="preview-selection"
          ref={transformerRef}
          rotateEnabled
          keepRatio={false}
          borderStroke="#f59e0b"
          anchorFill="#ffffff"
          anchorStroke="#f59e0b"
          anchorSize={9}
          boundBoxFunc={(_, newBox) =>
            newBox.width < 120 || newBox.height < 40 ? _ : newBox
          }
        />
      )}
    </>
  );
}

export default function LightboxPreviewTool() {
  const [mode, setMode] = useState<PreviewMode>("face");
  const [dimensions, setDimensions] = useState<DimensionsMm>(initialDimensions);
  const [cabinet, setCabinet] = useState<Cabinet>(initialCabinet);
  const [elements, setElements] = useState<DesignElement[]>(() =>
    createInitialElements(initialDimensions),
  );
  const [selectedId, setSelectedId] = useState("sample-text");
  const [shopfrontImage, setShopfrontImage] = useState<ShopfrontImage>();
  const [signTransform, setSignTransform] = useState<SignTransform | null>(
    null,
  );
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const signStageRef = useRef<Konva.Stage | null>(null);
  const mockupStageRef = useRef<Konva.Stage | null>(null);
  const signWrap = useElementSize<HTMLDivElement>();
  const mockupWrap = useElementSize<HTMLDivElement>();
  const signRatio = getSignRatio(dimensions);
  const logicalHeight = getLogicalSignHeight(dimensions);
  const signStageWidth = Math.max(320, Math.min(860, signWrap.width || 760));
  const signStageHeight = Math.round(signStageWidth / signRatio);
  const signScale = signStageWidth / LOGICAL_SIGN_WIDTH;
  const mockupStageWidth = Math.max(
    320,
    Math.min(900, mockupWrap.width || 760),
  );
  const mockupStageHeight = Math.round(
    Math.min(560, Math.max(260, mockupStageWidth * 0.62)),
  );
  const activeSignTransform = useMemo(
    () =>
      signTransform ||
      getDefaultSignTransform(mockupStageWidth, mockupStageHeight, signRatio),
    [mockupStageHeight, mockupStageWidth, signRatio, signTransform],
  );
  const selectedElement = elements.find((element) => element.id === selectedId);

  useEffect(() => {
    const clearStatus = () => setStatus("");
    window.addEventListener(PREVIEW_CLEARED_EVENT, clearStatus);
    return () => window.removeEventListener(PREVIEW_CLEARED_EVENT, clearStatus);
  }, []);

  function updateCabinet(nextCabinet: Partial<Cabinet>) {
    setCabinet((current) => ({ ...current, ...nextCabinet }));
  }

  function updateElement(nextElement: DesignElement) {
    setElements((current) =>
      current.map((element) =>
        element.id === nextElement.id ? nextElement : element,
      ),
    );
  }

  function addTextElement() {
    const newElement: TextDesignElement = {
      id: createId("text"),
      type: "text",
      text: "NEW TEXT",
      x: LOGICAL_SIGN_WIDTH * 0.34,
      y: logicalHeight * 0.38,
      width: LOGICAL_SIGN_WIDTH * 0.32,
      height: Math.max(64, logicalHeight * 0.18),
      rotation: 0,
      opacity: 1,
      fill: "#151515",
      fontSize: Math.max(28, logicalHeight * 0.14),
      fontFamily: "Inter, Arial, sans-serif",
      fontStyle: "bold",
    };

    setElements((current) => [...current, newElement]);
    setSelectedId(newElement.id);
  }

  async function addArtwork(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    setStatus("");

    try {
      const image = await fileToImageData(file);
      const maxWidth = LOGICAL_SIGN_WIDTH * 0.34;
      const maxHeight = logicalHeight * 0.54;
      const scale = Math.min(
        maxWidth / image.width,
        maxHeight / image.height,
        1,
      );
      const width = Math.max(72, image.width * scale);
      const height = Math.max(48, image.height * scale);
      const newElement: ImageDesignElement = {
        id: createId("image"),
        type: "image",
        src: image.src,
        fileName: image.fileName,
        mimeType: image.mimeType,
        x: (LOGICAL_SIGN_WIDTH - width) / 2,
        y: (logicalHeight - height) / 2,
        width,
        height,
        rotation: 0,
        opacity: 1,
      };

      setElements((current) => [...current, newElement]);
      setSelectedId(newElement.id);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not upload that artwork.",
      );
    }
  }

  async function uploadShopfront(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    setStatus("");

    try {
      const image = await fileToImageData(file);
      setShopfrontImage({
        src: image.src,
        fileName: image.fileName,
        width: image.width,
        height: image.height,
      });
      setMode("shopfront");
      setSignTransform(null);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not upload that shopfront photo.",
      );
    }
  }

  function deleteSelectedElement() {
    if (!selectedId) return;

    setElements((current) =>
      current.filter((element) => element.id !== selectedId),
    );
    setSelectedId("");
  }

  function resetDesign() {
    const resetElements = createInitialElements(initialDimensions);

    setDimensions(initialDimensions);
    setCabinet(initialCabinet);
    setElements(resetElements);
    setSelectedId(resetElements[0]?.id || "");
    setShopfrontImage(undefined);
    setSignTransform(null);
    setError("");
    setStatus("");
  }

  function buildDesignJson(activeMode: PreviewMode) {
    return JSON.stringify({
      version: 1,
      dimensionsMm: dimensions,
      cabinet,
      elements: stripRuntimeImageData(elements),
      shopfront:
        activeMode === "shopfront"
          ? {
              image: shopfrontImage
                ? {
                    fileName: shopfrontImage.fileName,
                    width: shopfrontImage.width,
                    height: shopfrontImage.height,
                  }
                : null,
              signTransform: activeSignTransform,
            }
          : undefined,
    });
  }

  function getActiveStage(activeMode = mode) {
    return activeMode === "face"
      ? signStageRef.current
      : mockupStageRef.current;
  }

  function exportStageDataUrl(activeMode: PreviewMode, forAttachment: boolean) {
    const stage = getActiveStage(activeMode);
    if (!stage) throw new Error("The preview is still loading.");

    const edge = Math.max(stage.width(), stage.height());
    const pixelRatio = Math.max(1, Math.min(3, MAX_EXPORT_EDGE / edge));
    const selectionNodes = stage.find(".preview-selection");
    const previousVisibility = selectionNodes.map((node) => node.visible());

    selectionNodes.forEach((node) => {
      node.visible(false);
    });
    stage.batchDraw();

    try {
      const pngDataUrl = stage.toDataURL({
        mimeType: "image/png",
        pixelRatio,
      });

      if (
        !forAttachment ||
        estimateDataUrlBytes(pngDataUrl) <= MAX_ATTACHMENT_BYTES
      ) {
        return pngDataUrl;
      }

      const jpegDataUrl = stage.toDataURL({
        mimeType: "image/jpeg",
        quality: 0.86,
        pixelRatio: Math.max(1, Math.min(pixelRatio, 2)),
      });

      if (estimateDataUrlBytes(jpegDataUrl) <= MAX_ATTACHMENT_BYTES) {
        return jpegDataUrl;
      }

      return stage.toDataURL({
        mimeType: "image/jpeg",
        quality: 0.78,
        pixelRatio: 1,
      });
    } finally {
      selectionNodes.forEach((node, index) => {
        node.visible(previousVisibility[index] ?? true);
      });
      stage.batchDraw();
    }
  }

  function attachToQuote() {
    setError("");
    setStatus("");

    try {
      const previewImageDataUrl = exportStageDataUrl(mode, true);
      const bytes = estimateDataUrlBytes(previewImageDataUrl);

      if (bytes > MAX_ATTACHMENT_BYTES) {
        throw new Error("The preview image is still too large to attach.");
      }

      const attachment: PreviewAttachment = {
        previewImageDataUrl,
        previewDesignJson: buildDesignJson(mode),
        previewMode: mode,
        attachedAt: new Date().toISOString(),
      };

      localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(attachment));
      window.dispatchEvent(
        new CustomEvent<PreviewAttachment>(PREVIEW_UPDATED_EVENT, {
          detail: attachment,
        }),
      );
      setStatus("Preview attached to the quote form.");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not attach this preview.",
      );
    }
  }

  function downloadPreview() {
    setError("");
    setStatus("");

    try {
      const dataUrl = exportStageDataUrl(mode, false);
      const link = document.createElement("a");
      link.download =
        mode === "face"
          ? "lightbox-sign-face.png"
          : "lightbox-shopfront-mockup.png";
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not download this preview.",
      );
    }
  }

  return (
    <div className="rounded-lg bg-white p-4 text-stone-950 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_20px_70px_rgba(0,0,0,0.12)] sm:p-6">
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">
              Preview tool
            </p>
            <h2 className="mt-2 text-balance text-2xl font-semibold text-stone-950">
              Build a quick lightbox mockup.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-lg bg-stone-100 p-1">
            <button
              type="button"
              onClick={() => setMode("face")}
              className={classNames(
                "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition-[background-color,color,scale,box-shadow] active:scale-[0.96]",
                mode === "face"
                  ? "bg-white text-stone-950 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                  : "text-stone-600 hover:text-stone-950",
              )}
            >
              <ImageIcon size={16} />
              Sign face
            </button>
            <button
              type="button"
              onClick={() => setMode("shopfront")}
              className={classNames(
                "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition-[background-color,color,scale,box-shadow] active:scale-[0.96]",
                mode === "shopfront"
                  ? "bg-white text-stone-950 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                  : "text-stone-600 hover:text-stone-950",
              )}
            >
              <Upload size={16} />
              Shopfront
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Width mm"
              min={300}
              value={dimensions.width}
              onChange={(width) =>
                setDimensions((current) => ({ ...current, width }))
              }
            />
            <NumberField
              label="Height mm"
              min={150}
              value={dimensions.height}
              onChange={(height) =>
                setDimensions((current) => ({ ...current, height }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ColorField
              label="Face"
              value={cabinet.faceColor}
              onChange={(faceColor) => updateCabinet({ faceColor })}
            />
            <ColorField
              label="Frame"
              value={cabinet.frameColor}
              onChange={(frameColor) => updateCabinet({ frameColor })}
            />
          </div>

          <SelectField
            label="Frame style"
            options={frameStyles}
            value={cabinet.frameStyle}
            onChange={(frameStyle) => updateCabinet({ frameStyle })}
          />

          <div>
            <FieldLabel>Lighting</FieldLabel>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-stone-100 p-1">
              <button
                type="button"
                onClick={() => updateCabinet({ lightingMode: "day" })}
                className={classNames(
                  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition-[background-color,color,scale,box-shadow] active:scale-[0.96]",
                  cabinet.lightingMode === "day"
                    ? "bg-white text-stone-950 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                    : "text-stone-600 hover:text-stone-950",
                )}
              >
                <Sun size={16} />
                Day
              </button>
              <button
                type="button"
                onClick={() => updateCabinet({ lightingMode: "night" })}
                className={classNames(
                  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition-[background-color,color,scale,box-shadow] active:scale-[0.96]",
                  cabinet.lightingMode === "night"
                    ? "bg-white text-stone-950 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                    : "text-stone-600 hover:text-stone-950",
                )}
              >
                <Moon size={16} />
                Night
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <ToolbarButton onClick={addTextElement}>
              <Type size={16} />
              Add text
            </ToolbarButton>
            <UploadButton
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={addArtwork}
            >
              <Upload size={16} />
              Artwork
            </UploadButton>
            <UploadButton
              accept="image/png,image/jpeg,image/webp"
              onChange={uploadShopfront}
            >
              <ImageIcon size={16} />
              Photo
            </UploadButton>
          </div>

          {selectedElement?.type === "text" && (
            <div className="space-y-3 rounded-lg bg-stone-50 p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
              <div>
                <FieldLabel>Selected text</FieldLabel>
                <input
                  type="text"
                  value={selectedElement.text}
                  onChange={(event) =>
                    updateElement({
                      ...selectedElement,
                      text: event.target.value,
                    })
                  }
                  className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-semibold text-stone-950 shadow-[0_1px_1px_rgba(0,0,0,0.04)_inset] transition-[border-color,box-shadow] focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/15"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ColorField
                  label="Text color"
                  value={selectedElement.fill}
                  onChange={(fill) =>
                    updateElement({ ...selectedElement, fill })
                  }
                />
                <NumberField
                  label="Size"
                  min={12}
                  value={Math.round(selectedElement.fontSize)}
                  onChange={(fontSize) =>
                    updateElement({ ...selectedElement, fontSize })
                  }
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <ToolbarButton onClick={deleteSelectedElement}>
              <Trash2 size={16} />
              Delete
            </ToolbarButton>
            <ToolbarButton onClick={resetDesign}>
              <RotateCcw size={16} />
              Reset
            </ToolbarButton>
          </div>

          <div className="flex flex-wrap gap-2">
            <ToolbarButton onClick={downloadPreview}>
              <Download size={16} />
              Download
            </ToolbarButton>
            <ToolbarButton onClick={attachToQuote} isActive>
              <Send size={16} />
              Attach
            </ToolbarButton>
          </div>

          {status && (
            <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-900 shadow-[0_0_0_1px_rgba(15,118,110,0.16)]">
              {status}
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 shadow-[0_0_0_1px_rgba(185,28,28,0.14)]">
              {error}
            </p>
          )}
        </aside>

        <div className="min-w-0">
          <div
            className={classNames(
              "rounded-lg p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.08)]",
              mode === "face"
                ? cabinet.lightingMode === "night"
                  ? "bg-stone-950"
                  : "bg-[#eee8dc]"
                : "bg-stone-200",
            )}
          >
            <div className={mode === "face" ? "block" : "hidden"}>
              <div ref={signWrap.ref} className="overflow-x-auto">
                <Stage
                  ref={signStageRef}
                  width={signStageWidth}
                  height={signStageHeight}
                >
                  <Layer>
                    <Rect
                      width={signStageWidth}
                      height={signStageHeight}
                      fill={
                        cabinet.lightingMode === "night" ? "#15110d" : "#eee8dc"
                      }
                    />
                    <Group scaleX={signScale} scaleY={signScale}>
                      <SignGraphic
                        cabinet={cabinet}
                        elements={elements}
                        interactive
                        logicalHeight={logicalHeight}
                        onChangeElement={updateElement}
                        onSelect={setSelectedId}
                        selectedId={selectedId}
                      />
                    </Group>
                  </Layer>
                </Stage>
              </div>
            </div>

            <div className={mode === "shopfront" ? "block" : "hidden"}>
              <div ref={mockupWrap.ref} className="overflow-x-auto">
                <Stage
                  ref={mockupStageRef}
                  width={mockupStageWidth}
                  height={mockupStageHeight}
                  onMouseDown={(event) => {
                    if (event.target === event.target.getStage()) {
                      setSelectedId("");
                    }
                  }}
                >
                  <Layer>
                    <ShopfrontBackground
                      image={shopfrontImage}
                      stageHeight={mockupStageHeight}
                      stageWidth={mockupStageWidth}
                    />
                    <ShopfrontSign
                      cabinet={cabinet}
                      elements={elements}
                      logicalHeight={logicalHeight}
                      signTransform={activeSignTransform}
                      onChange={(transform) => setSignTransform(transform)}
                    />
                  </Layer>
                </Stage>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-stone-600 sm:grid-cols-3">
            <div className="rounded-lg bg-stone-50 p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-stone-500">
                Size
              </span>
              <p className="mt-1 font-semibold tabular-nums text-stone-950">
                {dimensions.width} x {dimensions.height} mm
              </p>
            </div>
            <div className="rounded-lg bg-stone-50 p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-stone-500">
                Layers
              </span>
              <p className="mt-1 font-semibold tabular-nums text-stone-950">
                {elements.length}
              </p>
            </div>
            <div className="rounded-lg bg-stone-50 p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-stone-500">
                Mode
              </span>
              <p className="mt-1 font-semibold text-stone-950">
                {mode === "face" ? "Sign face" : "Shopfront mockup"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
