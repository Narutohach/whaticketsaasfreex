module.exports = {
  singleQuote: false,
  trailingComma: "none",
  arrowParens: "avoid",
  // O .gitattributes usa `* text=auto`, então em checkout no Windows os
  // arquivos ficam com CRLF em disco. Com o default "lf" o prettier acusava
  // erro em toda linha do repositório.
  endOfLine: "auto"
};
