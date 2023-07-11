import LeadForm from './results/LeadForm';
import Modal from 'react-modal';
import config from '../../../config';
import { useState } from 'react';

function LeadModal({ isOpen, onClose, lead }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  if (!isOpen) return null;

  function handleCloseModal() {
    setIsModalOpen(false);
  }

  return (
    <>
      <div className="modal-container">
        <div className="modal-header">
          <h2>Edit Lead</h2>
          <button className="modal-close-button" onClick={onClose}>
            X
          </button>
        </div>

        <LeadForm
          leadFields={lead}
          afterSubmit={() => window.location.reload() /* FIXME: set modal to false*/}
        />

        <Modal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          style={config.modalStyles}
          contentLabel="Example Modal"
        >
          <button onClick={handleCloseModal}>X</button>
          {isModalOpen && (
            <LeadForm leadFields={lead} afterSubmit={() => handleCloseModal()} />
          )}
        </Modal>
      </div>
    </>
  );
}

export default LeadModal;
