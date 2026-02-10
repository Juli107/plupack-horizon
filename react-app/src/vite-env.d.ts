/// <reference types="vite/client" />

declare module '*.glb' {
  const src: string;
  export default src;
}

declare module '*.gltf' {
  const src: string;
  export default src;
}

declare module '*.hdr' {
  const src: string;
  export default src;
}

declare module '*.exr' {
  const src: string;
  export default src;
}

declare module '@pmndrs/assets/hdri/*.exr' {
  const src: string;
  export default src;
}

declare module '*.svg?raw' {
  const content: string;
  export default content;
}
