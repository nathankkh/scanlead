import QrUpload from './QrUpload';
//import QrVideo from './QrVideo.backup';
import QrVideoNimiq from './QrVideo-nimiq';
export default function LeadsContainer() {
  return (
    <>
      <QrVideoNimiq />
      <QrUpload />
    </>
  );
}
