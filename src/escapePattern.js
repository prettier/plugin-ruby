/**
 * String literal syntax documentation from Ruby source (2.7.0-dev)
 *
 * Double-quote strings allow escaped characters such as <tt>\n</tt> for
 * newline, <tt>\t</tt> for tab, etc.  The full list of supported escape
 * sequences are as follows:
 *
 *   \a             bell, ASCII 07h (BEL)
 *   \b             backspace, ASCII 08h (BS)
 *   \t             horizontal tab, ASCII 09h (TAB)
 *   \n             newline (line feed), ASCII 0Ah (LF)
 *   \v             vertical tab, ASCII 0Bh (VT)
 *   \f             form feed, ASCII 0Ch (FF)
 *   \r             carriage return, ASCII 0Dh (CR)
 *   \e             escape, ASCII 1Bh (ESC)
 *   \s             space, ASCII 20h (SPC)
 *   \\             backslash, \
 *   \nnn           octal bit pattern, where nnn is 1-3 octal digits ([0-7])
 *   \xnn           hexadecimal bit pattern, where nn is 1-2 hexadecimal digits ([0-9a-fA-F])
 *   \unnnn         Unicode character, where nnnn is exactly 4 hexadecimal digits ([0-9a-fA-F])
 *   \u{nnnn ...}   Unicode character(s), where each nnnn is 1-6 hexadecimal digits ([0-9a-fA-F])
 *   \cx or \C-x    control character, where x is an ASCII printable character
 *   \M-x           meta character, where x is an ASCII printable character
 *   \M-\C-x        meta control character, where x is an ASCII printable character
 *   \M-\cx         same as above
 *   \c\M-x         same as above
 *   \c? or \C-?    delete, ASCII 7Fh (DEL)
 *
 * In addition to disabling interpolation, single-quoted strings also disable all
 * escape sequences except for the single-quote (<tt>\'</tt>) and backslash
 * (<tt>\\\\</tt>).
 */
const patterns = [
  "[abtnvfres\\\\]", // simple
  "[0-7]{1,3}", // octal bits
  "x[0-9a-fA-F]{1,2}", // hex bit
  "u[0-9a-fA-F]{4}", // unicode char
  "u\\{[0-9a-fA-F ]+\\}", // unicode chars
  "c[ -~]|C\\-[ -~]", // control
  "M\\-[ -~]", // meta
  "M\\-\\\\C\\-[ -~]|M\\-\\\\c[ -~]|c\\\\M\\-[ -~]", // meta control
  "c\\?|C\\-\\?" // delete
];

module.exports = new RegExp(`\\\\(${patterns.join("|")})`);
