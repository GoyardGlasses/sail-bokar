// Global JSX typings for TSX files in this project
// This keeps the TypeScript server from complaining about JSX elements

export {}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}
