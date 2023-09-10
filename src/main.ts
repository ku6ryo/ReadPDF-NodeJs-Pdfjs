import fs from "fs/promises"
import path from "path"
import * as pdfjs from "pdfjs-dist"

async function main() {
  const sampleFile = "sample.pdf"
  const sampleFilePath = path.join(__dirname, sampleFile)
  const pdfData = new Uint8Array(await fs.readFile(sampleFilePath))
  const pdfDocument = await pdfjs.getDocument({data: pdfData}).promise
  const totalPageCount = pdfDocument.numPages
  const title = await new Promise<string>(async (resolve) => {
    const { info } = await pdfDocument.getMetadata()
    if ("Title" in info && typeof info.Title === "string") {
      resolve(info.Title)
    } else {
      resolve("")
    }
  });
  if (totalPageCount === 0) {
    throw new Error("PDF has no pages")
  }
  const page = await pdfDocument.getPage(1)
  const content = await page.getTextContent()
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
  console.log("Page Count: " + totalPageCount)
  console.log("Text: " + text)
}

main()