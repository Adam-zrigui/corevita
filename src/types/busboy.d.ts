declare module "busboy" {
  import type { IncomingHttpHeaders } from "http";
  import type { Readable, Writable } from "stream";

  type FileInfo = {
    filename: string;
    encoding: string;
    mimeType: string;
  };

  type BusboyInstance = Writable & {
    on(event: "file", listener: (name: string, file: Readable, info: FileInfo) => void): BusboyInstance;
    on(event: "finish", listener: () => void): BusboyInstance;
    on(event: "error", listener: (error: Error) => void): BusboyInstance;
  };

  function Busboy(options: { headers: IncomingHttpHeaders }): BusboyInstance;

  export default Busboy;
}
