import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const generateContractPDF = onRequest(
  // Mantenemos las opciones por si acaso
  {timeoutSeconds: 300, memory: "1GiB"},
  // Esta es una función de prueba muy simple
  (request, response) => {
    logger.info("¡PRUEBA INICIADA! La función simple está funcionando.",
      {structuredData: true}
    );
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    response.send("Hola desde la función de prueba!");
  },
);
