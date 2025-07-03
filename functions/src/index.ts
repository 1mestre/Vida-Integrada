import {onRequest} from "firebase-functions/v2/https";
import * as puppeteer from "puppeteer";
import * as fs from "fs";
import * as path from "path";

const readTemplate = (): string => {
  const templatePath = path.join(
    __dirname,
    "../contrato-template.html",
  );
  return fs.readFileSync(templatePath, "utf8");
};

export const generateContractPDF = onRequest(
  {timeoutSeconds: 300, memory: "1GiB"},
  async (request, response) => {
    // --- INICIO DE LA CORRECCIÓN DE CORS ---
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    // Ajuste menor de capitalización para seguir el estándar
    response.set("Access-Control-Allow-Headers", "Content-Type");

    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }
    // --- FIN DE LA CORRECCIÓN DE CORS ---

    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const data = request.body;
    let html = readTemplate();

    const agreementDate = new Date().toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });

    html = html.replace(/{{clientName}}/g, data.clientName || "N/A");
    html = html.replace(/{{orderNumber}}/g, data.orderNumber || "N/A");
    html = html.replace(/{{agreementDate}}/g, agreementDate);
    html = html.replace(/{{producerEmail}}/g, data.producerEmail || "N/A");

    const browser = await puppeteer.launch({args: ["--no-sandbox"]});
    const page = await browser.newPage();

    await page.setContent(html, {waitUntil: "networkidle0"});

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    const fileName = `Contrato-${data.clientName}.pdf`;
    response.setHeader("Content-Type", "application/pdf");
    response.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`,
    );
    response.send(pdfBuffer);
  },
);
