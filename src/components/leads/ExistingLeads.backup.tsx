import { useState, useEffect } from 'react';
import {
  getCurrentUserEmail,
  deleteLead,
  subscribeToCollection
} from '../../firebase-setup/firebase-functions';
import Modal from 'react-modal';
import LeadForm from './results/LeadForm';
import config from '../../../config';

import Button from '@mui/joy/Button';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | number;
  jobTitle: string;
  experience: string;
  fieldOfInterest: string;
  temperature: string;
  comments: string;
  timestamp: number;
  // TODO: Update interface with all relevant fields
}

function ExistingLeadsBackup() {
  const [leads, setLeads] = useState<Lead[]>([]); // Array containing each lead as an {} object
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadsPerPage, setLeadsPerPage] = useState(10);
  const [selectedLead, setSelectedLead] = useState<Lead>(); // {} object, to be used when editing
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(''); //TODO: change to useRef

  const filteredLeads = leads.filter((lead) =>
    lead.name
      ? lead.name.toLowerCase().includes(searchQuery.toLowerCase())
      : lead.id.includes(searchQuery)
  );
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  useEffect(() => {
    // Creates a listener for a given firebase collection. Returns an unsubscribe function, which runs on component unmount.
    const unsubscribe = subscribeToCollection(
      getCurrentUserEmail(),
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          const existingLeads = querySnapshot.docs.map((snapshot) => snapshot.data());
          setLeads(existingLeads);
        }
      },
      (error) => {
        console.log(error);
        alert('error subscribing');
      }
    );

    // Event listener for handling tab close event
    const handleTabClose = () => {
      unsubscribe();
    };

    // Add event listener for beforeunload event (when tab is closed)
    window.addEventListener('beforeunload', handleTabClose);
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
      unsubscribe();
    };
  }, []);

  function paginate(pageNumber) {
    setCurrentPage(pageNumber);
  }

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
    Modal.setAppElement(document.getElementById('edit-modal'));
    const index = e.target.parentNode.parentNode.dataset.index;
    setSelectedLead(leads[index]);
    setIsEditModalOpen(true);
  }

  function handleCloseEditModal() {
    setIsEditModalOpen(false);
    setSelectedLead(undefined);
  }

  function handleDelete(e) {
    Modal.setAppElement(document.getElementById('delete-modal'));
    const index = e.target.parentNode.parentNode.dataset.index;
    setSelectedLead(leads[index]);
    setIsDeleteModalOpen(true);
  }

  function confirmDelete() {
    try {
      const id = selectedLead?.id;
      const collectionName = getCurrentUserEmail();
      const docName = collectionName + '_' + id; //FIXME: Possible bug if document isn't added to firebase correctly.
      deleteLead(collectionName, docName).then(() => {
        alert('Deleted!');
      });
    } catch (error) {
      console.log(error);
      alert('Error deleting, please try again!');
    }

    setSelectedLead(undefined);
    setIsDeleteModalOpen(false);
  }

  function cancelDelete() {
    setSelectedLead(undefined);
    setIsDeleteModalOpen(false);
  }

  return (
    <>
      <h1>LEADS</h1>
      <div className="lead-box">
        <div className="lead-box-header">
          <input
            id="lead-box-search"
            placeholder="Search by Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <label htmlFor="row-count">Leads per page: </label>
          <select
            id="row-count"
            onChange={(e) => {
              setLeadsPerPage(Number(e.target.value));
              setCurrentPage(1); // Resets page number to 1 when changing rows to show
            }}
            value={leadsPerPage}
          >
            <option value="1">1</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        {/* This displays all existing leads in rows. Includes edit and delete buttons for each lead */}
        <div className="row-container">
          {(currentLeads.length > 0 &&
            currentLeads.map((lead, index) => (
              <div key={lead.id} className="lead-box-row" data-index={index}>
                {lead.name ? properCase(lead.name) : lead.id}
                <div className="lead-button-container">
                  <button className="edit-button" onClick={handleEdit}>
                    Edit
                  </button>
                  <button className="delete-button" onClick={handleDelete}>
                    Delete
                  </button>
                  <div id="delete-modal">
                    <Modal
                      isOpen={isDeleteModalOpen}
                      onRequestClose={cancelDelete}
                      style={config.modalStyles}
                      contentLabel="Delete Lead Confirmation"
                    >
                      <p>Are you sure you want to delete this lead?</p>
                      <button onClick={confirmDelete}>Delete</button>
                      <button onClick={cancelDelete}>Cancel</button>
                    </Modal>
                  </div>
                </div>
              </div>
            ))) || <p>No leads yet!</p>}
        </div>

        {/* This displays the page numbers at the bottom of the page */}

        <div id="page-select">
          {Array.from(Array(Math.ceil(filteredLeads.length / leadsPerPage)).keys()).map(
            (_, index) => (
              <Button
                key={index}
                onClick={() => paginate(index + 1)}
                variant={currentPage === index + 1 ? 'solid' : 'outlined'}
                color="neutral"
              >
                {index + 1}
              </Button>
            )
          )}

          {/* <ul>
            {Array.from(Array(Math.ceil(filteredLeads.length / leadsPerPage)).keys()).map((_, index) => (
              <li
                key={index}
                className={currentPage === index + 1 ? 'active' : ''}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </li>
            ))}
          </ul> */}
        </div>
      </div>

      <hr />
      <div id="edit-modal">
        <Modal
          isOpen={isEditModalOpen}
          onRequestClose={handleCloseEditModal}
          style={config.modalStyles}
          contentLabel="Edit Lead"
        >
          <button onClick={handleCloseEditModal}>X</button>
          {isEditModalOpen && (
            <LeadForm leadFields={selectedLead} afterSubmit={() => handleCloseEditModal()} />
          )}
        </Modal>
      </div>
    </>
  );
}

export default ExistingLeadsBackup;
