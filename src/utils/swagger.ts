import { version } from "@root/package.json";
import logger from "@utils/logger";
import config from "config";
import { Express } from "express";
import swaggerJSdoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";

const port = config.get<number>("port");

// const options: swaggerJSdoc.Options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "ChateeApp API Documentation",
//       version,
//     },
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT",
//         },
//       },
//     },
//     security: [
//       {
//         bearerAuth: [],
//       },
//     ],
//   },
//   apis: [
//     "./src/routes/*.ts",
//     "./src/schema/*.ts"
  
//   ],
// };

export default (app: Express) => {
  // const specs = swaggerJSdoc(options);
  const swaggerDocument = YAML.load("./src/swagger.yaml");
  logger.info(`Swagger Docs: http://localhost:${port}/api-docs`);
  app.use(
    "/api-docs",
    swaggerUI.serve,
    swaggerUI.setup(swaggerDocument, {
      // Custom configuration options
      customSiteTitle: "ChateeApp API Documentation", // Set the custom page title
    })
  );
};
