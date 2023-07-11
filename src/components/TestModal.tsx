import Modal from 'react-modal';
import { useState } from 'react';
import config from '../../config';

function TestModal() {
  const [modalIsOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <>
      <button onClick={openModal}>Open Modal</button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={config.modalStyles}
        contentLabel="Example Modal"
      >
        <h2>Hello</h2>
        <button onClick={closeModal} className="modal-close-button">
          ×
        </button>
        <div>I am a modal</div>
        <form>
          <input />
          <button>sample submit</button>
        </form>
      </Modal>
    </>
  );
}

export default TestModal;
