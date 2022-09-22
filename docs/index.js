/*
(c) 2022 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const initPageTime = performance.now();

const loadWOFF2Module = import("https://scotwatson.github.io/WOFF2Editor/WOFF2.mjs");
loadWOFF2Module.then(function (module) {
  console.log(Object.getOwnPropertyNames(module));
}, fail);

const loadWindow = new Promise(function (resolve, reject) {
  window.addEventListener("load", function (evt) {
    resolve(evt);
  });
});

Promise.all( [ loadWindow, loadWOFF2Module ] ).then(start, fail).catch(fail);

function start( [ evtWindow, WOFF2 ] ) {
  const btnOpenFile = document.createElement("button");
  btnOpenFile.addEventListener("click", function () {
    const inpFile = document.createElement("input");
    inpFile.type = "file";
    inpFile.addEventListener("input", function () {
      const file = inpFile.files[0];
      file.arrayBuffer().then(parse);
    });
    document.body.appendChild(inpFile);
  });
}

const tagNames = [ "cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post", "cvt ", "fpgm", "glyf", "loca", "prep", "CFF ", "VORG", "EBDT", "EBLC", "gasp", "hdmx", "kern", "LTSH", "PCLT", "VDMX", "vhea", "vmtx", "BASE", "GDEF", "GPOS", "GSUB", "EBSC", "JSTF", "MATH", "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar", "bdat", "bloc", "bsln", "cvar", "fdsc", "feat", "fmtx", "fvar", "gvar", "hsty", "just", "lcar", "mort", "morx", "opbd", "prop", "trak", "Zapf", "Silf", "Glat", "Gloc", "Feat", "Sill" ];

function parse(buffer) {
  let offset = 0;
  const view = new DataView(buffer);
  const signature = view.getUint32(0, false);
  if (signature !== 0x774F4632) {  //'wOF2'
    throw new Error("Invalid Signature");
  }
  // The "sfnt version" of the input font.
  const flavor = view.getUint32(0x04, false);
  // Total size of the WOFF file.
  const length = view.getUint32(0x08, false);
  // Number of entries in directory of font tables.
  const numTables = view.getUint16(0x0C, false);
  // Total size needed for the uncompressed font data, including the sfnt header, directory, and font tables (including padding).
  const totalSfntSize = view.getUint32(0x10, false);
  // Total length of the compressed data block.
  const totalCompressedSize = view.getUint32(0x14, false);
  // Major version of the WOFF file.
  const majorVersion = view.getUint16(0x18, false);
  // Minor version of the WOFF file.
  const minorVersion = view.getUint16(0x1A, false);
  // Offset to metadata block, from beginning of WOFF file.
  const metaOffset = view.getUint32(0x1C, false);
  // Length of compressed metadata block.
  const metaLength = view.getUint32(0x20, false);
  // Uncompressed size of metadata block.
  const metaOrigLength = view.getUint32(0x24, false);
  // Offset to private data block, from beginning of WOFF file.
  const privOffset = view.getUint32(0x28, false);
  // Length of private data block.
  const privLength = view.getUint32(0x2C, false);
  for (let i = 0; i < numTables; ++i) {
    const flags = getUint8();
    const tagIndex = (flags & 0x3F);
    const tag = ((tagIndex !== 0x3F) ? tagNames[tagIndex] : get4Char());
    const origLength = getUintBase128();
    const transformLength = getUintBase128();
  }
  function get4Char() {
    let ret = "";
    ret += String.fromCharCode(getUint8());
    ret += String.fromCharCode(getUint8());
    ret += String.fromCharCode(getUint8());
    ret += String.fromCharCode(getUint8());
    return ret;
  }
  function getUint8() {
    const ret = view.getUint8(offset, false);
    ++offset;
    return ret;
  }
  function getUint16() {
    const ret = view.getUint16(offset, false);
    offset += 2;
    return ret;
  }
  function getUint32() {
    const ret = view.getUint32(offset, false);
    offset += 4;
    return ret;
  }
  function getUintBase128() {
    let flag;
    let value = 0;
    do {
      const thisByte = getUint8();
      flag = (thisByte & 0x80);
      value *= 0x80;
      value += (thisByte & 0x7F);
    } while (flag !== 0);
    return value;
  }
}

function fail(e) {
  console.error(e);
}
