declare module '*.css';
interface Window {
  electron: any;
  api: {
    snapWindow: () => void;
    onTelemetry: (callback: (data: any) => void) => void;
    resizeWindow: (width: number, height: number) => void; // <--- ADD THIS
  };
}