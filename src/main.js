import { logger } from "./applications/logging.js";
import { web } from "./applications/web.js";

web.listen(300, () => {
    logger.info("App start");
})