import QrUpload from './QrUpload';
import QrVideo from './QrVideo';
import ExistingLeads from './ExistingLeads';

function LeadsContainer() {
  return (
    <>
      <QrVideo />
      <QrUpload />
      <ExistingLeads />
    </>
  );
}

export default LeadsContainer;
