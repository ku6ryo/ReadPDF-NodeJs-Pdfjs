import fs from "fs/promises"
import path from "path"
import * as pdfjs from "pdfjs-dist"

async function main() {
  const sampleFile = "sample.pdf"
  const sampleFilePath = path.join(__dirname, sampleFile)
  const pdfData = new Uint8Array(await fs.readFile(sampleFilePath))
  const doc = await pdfjs.getDocument({ data: pdfData }).promise
  const totalPages = doc.numPages
  const title = await new Promise<string>(async (resolve) => {
    const { info } = await doc.getMetadata()
    if ("Title" in info && typeof info.Title === "string") {
      resolve(info.Title)
    } else {
      resolve("")
    }
  })
  if (totalPages === 0) {
    throw new Error("PDF has no pages")
  }
  const page = await doc.getPage(1)
  const content = await page.getTextContent()
  // Example to get image data
  page.getOperatorList().then((ops) => {
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjs.OPS.paintImageXObject) {
        const [objId, w, h] = ops.argsArray[i]
        console.log(objId, w, h)
        page.objs.get(objId, (img) => {
          console.log(img)
        })
      }
    }
  })
  const text = (() => {
    let text = ""
    for (const item of content.items) {
      if ("str" in item) {
        text += item.str + (item.hasEOL ? "\n" : "")
      }
    }
    return text
  })()
  console.log("Title: " + title)
  console.log("Pages: " + totalPages)
  console.log("Text: " + text)
}

main()