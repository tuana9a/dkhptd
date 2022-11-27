import itsTimeToSendDKHPTDJob from "./itsTimeToSendDKHPTDJob";
import itsTimeToSendDKHPTDJobV1 from "./itsTimeToSendDKHPTDJobV1";
import itsTimeToSendDKHPTDJobV2 from "./itsTimeToSendDKHPTDJobV2";

export default {
  setup() {
    itsTimeToSendDKHPTDJob.setup();
    itsTimeToSendDKHPTDJobV1.setup();
    itsTimeToSendDKHPTDJobV2.setup();
  }
};
