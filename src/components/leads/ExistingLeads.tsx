import { useState, useEffect } from 'react';
import {
  getCurrentUserEmail,
  deleteLead,
  subscribeToCollection
} from '../../firebase-setup/firebase-functions';
import LeadsEditModal from './LeadsEditModal';

interface Lead {
  id: string;
  name: string;
  background: string;
  // TODO: Update interface with all relevant fields
}

function ExistingLeads() {
  const [rowsToShow, setRowsToShow] = useState(12);
  const [selectedLead, setSelectedLead] = useState<Lead>(); // {} object, to be used when editing / deleting
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]); // Array containing each lead as an {} object

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      'abc123@abc.com', //FIXME: replace with getCurrentUserEmail()
      (querySnapshot) => {
        const existingLeads = querySnapshot.docs.map((snapshot) => snapshot.data());
        setLeads(existingLeads);
      },
      (error) => {
        console.log(error);
        alert('error!');
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  function properCase(str: string) {
    return str
      .toLowerCase()
      .split(' ')
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  function handleEdit(e) {
    //FIXME: Retrieve lead from event (e) => ...
    // setSelectedLead(e);
    const index = e.target.parentNode.parentNode.dataset.index;
    setSelectedLead(leads[index]);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }

  function handleDelete(e) {
    const index = e.target.parentNode.parentNode.dataset.index;
    const id = leads[index].id;
    const collectionName = getCurrentUserEmail();
    const docName = collectionName + '_' + id;
    console.log(docName);
    deleteLead(collectionName, docName).then(() => {
      alert('deleted');
    }); //TODO: add toast message
  }

  return (
    <>
      <h1>EXISTING LEADS</h1>
      {/* Dropdown List for how many records to be shown */}
      <div className="lead-box">
        <div className="lead-box-header">
          <input id="lead-box-search" placeholder="Search by Name"></input>{' '}
          {/* TODO: Add search functionality */}
          {/* https://blog.logrocket.com/how-to-use-react-hooks-firebase-firestore/ */}
          <label htmlFor="row-numbers">Rows to show: </label>
          <select
            id="row-numbers"
            onChange={(e) => setRowsToShow(Number(e.target.value))}
            value={rowsToShow}
          >
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
          </select>
        </div>

        <div className="row-container">
          {leads.length > 0 &&
            leads.map((lead, index) => (
              <div key={lead.id} className="lead-box-row" data-index={index}>
                {properCase(lead.name)} - {properCase(lead.background)} - {lead.id}
                <div className="lead-button-container">
                  <button className="edit-button" onClick={handleEdit}>
                    Edit
                  </button>
                  <button className="delete-button" onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <hr />
      <LeadsEditModal isOpen={isModalOpen} onClose={handleCloseModal} lead={selectedLead} />
    </>
  );
}

export default ExistingLeads;
