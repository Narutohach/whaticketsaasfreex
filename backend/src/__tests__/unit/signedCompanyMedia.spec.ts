import {
  createSignedCompanyMediaUrl,
  hasValidCompanyMediaSignature
} from "../../helpers/SignedCompanyMedia";

describe("SignedCompanyMedia", () => {
  it("accepts a signature for the original company and path only", () => {
    const url = new URL(createSignedCompanyMediaUrl(7, "quick/arquivo.png")!);
    const expires = url.searchParams.get("expires");
    const signature = url.searchParams.get("signature");

    expect(
      hasValidCompanyMediaSignature(7, "quick/arquivo.png", expires, signature)
    ).toBe(true);
    expect(
      hasValidCompanyMediaSignature(8, "quick/arquivo.png", expires, signature)
    ).toBe(false);
    expect(
      hasValidCompanyMediaSignature(7, "outro-arquivo.png", expires, signature)
    ).toBe(false);
  });

  it("refuses traversal paths", () => {
    expect(createSignedCompanyMediaUrl(7, "../segredo.txt")).toBeNull();
  });
});
