import LeadForm from './results/LeadForm';

function LeadsEditModal({ isOpen, onClose, lead }) {
  if (!isOpen) return null;

  //TODO: Make this pop up
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
      </div>
    </>
  );
}

export default LeadsEditModal;
