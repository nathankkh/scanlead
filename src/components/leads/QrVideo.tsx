import QrScanner from 'qr-scanner';
import { useState, useEffect, useRef } from 'react';
import ResultContainer from './results/ResultContainer';
import config from '../../../config';

function QrVideo() {
  const [qrScanner, setQrScanner] = useState<QrScanner>(); // stores the QrScanner
  const [cameraActive, setCameraActive] = useState(false); // used to toggle
  const [hasScanned, setHasScanned] = useState(false);
  const [qrResult, setQrResult] = useState<string>(); // stores result from scanner
  const videoRef = useRef<HTMLVideoElement>(null);

  const [btnText, setBtnText] = useState('Scan QR Code');

  useEffect(() => {
    // initialise qr scanner
    const video = videoRef.current;
    if (!video) {
      alert('video is null');
      return;
    }
    const scanner = new QrScanner(
      video,
      (result: string | QrScanner.ScanResult) => {
        handleScan(result);
      },
      config.scannerOptions
    );
    setQrScanner(scanner);
    console.log('initialised qr scanner');

    return () => {
      // clean up
      scanner.destroy();
      console.log('destroyed qr scanner');
    };
  }, []);

  useEffect(() => {
    // toggles QR scanner on/off
    if (cameraActive) {
      resetState();
      qrScanner?.start();
      setBtnText('Cancel');
    } else {
      qrScanner?.stop();
      setBtnText('Scan QR Code');
    }
  }, [cameraActive, qrScanner]);

  function handleScan(result) {
    setQrResult(result.data);
    setCameraActive(false);
    setHasScanned(true);
  }

  /**
   * Hides the leadForm by setting hasScanned and QR result to an undefined value.
   */
  function resetState() {
    setHasScanned(false);
    setQrResult(undefined);
  }

  return (
    <>
      <button onClick={() => setCameraActive(!cameraActive)}>{btnText}</button>{' '}
      <div id="videoContainer" style={{ display: cameraActive ? 'block' : 'none' }}>
        <video ref={videoRef} id="qr-video" width={'250px'} height={'250px'} />
      </div>
      <br />
      {hasScanned && <ResultContainer result={qrResult} resetState={resetState} />}{' '}
      {/* TODO: pass in setHasScanned */}
    </>
  );
}

export default QrVideo;
