import onClassToRegisterFileParsed from "./onClassToRegisterFileParsed";
import onClassToRegisterFileUploaded from "./onClassToRegisterFileUploaded";
import onDoing from "./onDoing";
import onNewJob from "./onNewJob";
import onNewJobResult from "./onNewJobResult";
import onNewJobV1 from "./onNewJobV1";
import onNewJobV1Result from "./onNewJobV1Result";
import onNewJobV2Result from "./onNewJobV2Result";
import onPing from "./onPing";

// TODO: on new job (rabbitmq connection pool)

export default {
  setup() {
    onClassToRegisterFileParsed.setup();
    onClassToRegisterFileUploaded.setup();
    onNewJobResult.setup();
    onNewJobV1Result.setup();
    onNewJobV2Result.setup();
    onDoing.setup();
    onPing.setup();
    onNewJob.setup();
    onNewJobV1.setup();
  }
};