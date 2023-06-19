import QrUpload from './QrUpload';
//import QrVideo from './QrVideo.backup';
import QrVideo from './QrVideo';
import ExistingLeads from './ExistingLeads';

function LeadsContainer() {
  // REFACTOR: Set qrResult state here, pass setter function to children as props
  return (
    <>
      <QrVideo />
      <QrUpload />
      <ExistingLeads />
      <hr />
    </>
  );
}

export default LeadsContainer;
