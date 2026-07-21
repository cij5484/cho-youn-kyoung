import { useState, type CSSProperties, type ImgHTMLAttributes } from 'react';

type SafeImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string;
  fallbackClassName?: string;
  fallbackLabel?: string;
  objectPosition?: CSSProperties['objectPosition'];
};

export function SafeImage({ src, alt, className, fallbackClassName, fallbackLabel, objectPosition, style, ...props }: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>();
  const failed = Boolean(src && failedSrc === src);

  if (!src || failed) {
    return fallbackLabel ? <span className={fallbackClassName} aria-label={fallbackLabel}>{fallbackLabel}</span> : null;
  }

  return <img {...props} className={className} src={src} alt={alt} style={{ ...style, objectPosition }} onError={() => setFailedSrc(src)} />;
}
