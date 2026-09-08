import path from "path";
import {
  MAX_UPLOAD_SIZE_BYTES,
  resolveInsideFolder,
  sanitizeUploadFileName,
  uploadFileFilter,
  uploadLimits,
  UploadError
} from "../../helpers/UploadSecurity";

const publicFolder = path.resolve("/srv/app/public");

const fakeFile = (originalname: string, mimetype = "application/octet-stream") =>
  ({ originalname, mimetype } as Express.Multer.File);

const runFilter = (file: Express.Multer.File) => {
  const cb = jest.fn();
  uploadFileFilter({} as any, file, cb);
  return cb;
};

describe("resolveInsideFolder", () => {
  it("resolves a normal subfolder", () => {
    const folder = resolveInsideFolder(publicFolder, "company5", "quick");

    expect(folder).toEqual(path.resolve(publicFolder, "company5", "quick"));
  });

  it("rejects a segment that escapes the base folder", () => {
    // Era o vetor real: typeArch="../../.." escrevia arquivo fora de /public.
    expect(() =>
      resolveInsideFolder(publicFolder, "company5", "../../../etc")
    ).toThrow(UploadError);
  });

  it("rejects an absolute segment", () => {
    expect(() => resolveInsideFolder(publicFolder, "/etc/passwd")).toThrow(
      UploadError
    );
  });

  it("rejects a segment that walks out and back in", () => {
    expect(() =>
      resolveInsideFolder(publicFolder, "..", "outra-pasta")
    ).toThrow(UploadError);
  });
});

describe("sanitizeUploadFileName", () => {
  it("keeps a normal file name and its extension", () => {
    expect(sanitizeUploadFileName("Relatorio Final.pdf")).toEqual(
      "Relatorio_Final.pdf"
    );
  });

  it("strips posix directory traversal", () => {
    expect(sanitizeUploadFileName("../../server.js")).toEqual("server.js");
  });

  it("strips windows directory traversal", () => {
    expect(sanitizeUploadFileName("..\\..\\server.js")).toEqual("server.js");
  });

  it("strips nested paths, keeping only the base name", () => {
    expect(sanitizeUploadFileName("/etc/cron.d/evil.txt")).toEqual("evil.txt");
  });

  it("does not produce a name starting with a dot", () => {
    expect(sanitizeUploadFileName(".htaccess").startsWith(".")).toBe(false);
  });

  it("falls back to a default name when there is nothing usable", () => {
    expect(sanitizeUploadFileName("")).toEqual("arquivo");
  });

  it("caps very long names", () => {
    const long = `${"a".repeat(500)}.png`;

    expect(sanitizeUploadFileName(long).length).toBeLessThanOrEqual(124);
  });
});

describe("uploadFileFilter", () => {
  it("accepts an image", () => {
    const cb = runFilter(fakeFile("foto.jpg", "image/jpeg"));

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it("accepts a document sent as octet-stream", () => {
    const cb = runFilter(fakeFile("contrato.pdf"));

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it("accepts a spreadsheet used for contact import", () => {
    const cb = runFilter(fakeFile("contatos.csv", "text/csv"));

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it("rejects an executable script extension", () => {
    const cb = runFilter(fakeFile("shell.php", "image/jpeg"));

    expect(cb.mock.calls[0][0]).toBeInstanceOf(UploadError);
  });

  it("rejects a javascript file", () => {
    const cb = runFilter(fakeFile("payload.js", "text/javascript"));

    expect(cb.mock.calls[0][0]).toBeInstanceOf(UploadError);
  });

  it("rejects svg, which executa script quando servido do mesmo domínio", () => {
    const cb = runFilter(fakeFile("logo.svg", "image/svg+xml"));

    expect(cb.mock.calls[0][0]).toBeInstanceOf(UploadError);
  });

  it("rejects a file with no extension", () => {
    const cb = runFilter(fakeFile("arquivo", "image/png"));

    expect(cb.mock.calls[0][0]).toBeInstanceOf(UploadError);
  });

  it("rejects an allowed extension carrying a disallowed mime type", () => {
    const cb = runFilter(fakeFile("planilha.csv", "application/x-httpd-php"));

    expect(cb.mock.calls[0][0]).toBeInstanceOf(UploadError);
  });

  it("does not let a double extension smuggle a script through", () => {
    const cb = runFilter(fakeFile("foto.png.php", "image/png"));

    expect(cb.mock.calls[0][0]).toBeInstanceOf(UploadError);
  });
});

describe("uploadLimits", () => {
  it("enforces a file size limit", () => {
    expect(uploadLimits.fileSize).toEqual(MAX_UPLOAD_SIZE_BYTES);
    expect(uploadLimits.fileSize).toBeGreaterThan(0);
  });

  it("enforces a file count limit", () => {
    expect(uploadLimits.files).toBeGreaterThan(0);
  });
});
