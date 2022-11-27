import consumeDKHPTDJobResult from "./consumeDKHPTDJobResult";
import consumeDKHPTDJobV1Result from "./consumeDKHPTDJobV1Result";
import consumeDKHPTDJobV2Result from "./consumeDKHPTDJobV2Result";
import consumeParseCTRXslxJobResult from "./consumeParseCTRXslxJobResult";
import consumeWorkerDoing from "./consumeWorkerDoing";
import consumeWorkerPing from "./consumeWorkerPing";

export default {
  setup() {
    consumeDKHPTDJobResult.setup();
    consumeDKHPTDJobV1Result.setup();
    consumeDKHPTDJobV2Result.setup();
    consumeParseCTRXslxJobResult.setup();
    consumeWorkerDoing.setup();
    consumeWorkerPing.setup();
  }
};
