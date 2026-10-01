import { useState } from "react";

function ProductThumbnail({ src, alt }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
      {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}

      <img
        src={src}
        alt={alt}
        width="48"
        height="48"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-150 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export default ProductThumbnail;
