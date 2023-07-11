import { useState, useEffect } from 'react';
import {
  getCurrentUserEmail,
  deleteLead,
  subscribeToCollection
} from '../../firebase-setup/firebase-functions';
import Modal from 'react-modal';
import LeadForm from './results/LeadForm';

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

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
};

function ExistingLeads() {
  const [leads, setLeads] = useState<Lead[]>([]); // Array containing each lead as an {} object
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadsPerPage, setLeadsPerPage] = useState(12);
  const [selectedLead, setSelectedLead] = useState<Lead>(); // {} object, to be used when editing / deleting
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

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
    //TODO: Consider running only on refresh button click; update ONLY with changes
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
    const index = e.target.parentNode.parentNode.dataset.index;
    setSelectedLead(leads[index]);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setSelectedLead(undefined);
  }

  function handleDelete(e) {
    try {
      const index = e.target.parentNode.parentNode.dataset.index;
      const id = leads[index].id;
      const collectionName = getCurrentUserEmail();
      const docName = collectionName + '_' + id; //FIXME: Possible bug if document isn't added to firebase correctly.
      console.log(docName);
      deleteLead(collectionName, docName).then(() => {
        alert('Deleted!');
      }); //TODO: add toast message
    } catch (error) {
      console.log(error);
      alert('Error deleting, please try again!');
    }
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
          <label htmlFor="row-count">Rows to show: </label>
          <select
            id="row-count"
            onChange={(e) => {
              setLeadsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset page number to 1 when changing rows to show
            }}
            value={leadsPerPage}
          >
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
                {lead.name ? properCase(lead.name) : lead.id} - {properCase(lead.experience)}
                <div className="lead-button-container">
                  <button className="edit-button" onClick={handleEdit}>
                    Edit
                  </button>
                  <button className="delete-button" onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              </div>
            ))) || <p>No leads yet!</p>}
        </div>

        {/* This displays the page numbers at the bottom of the page */}
        <div className="page-select">
          <ul>
            {Array(Math.ceil(filteredLeads.length / leadsPerPage)).map((_, index) => (
              <li
                key={index}
                className={currentPage === index + 1 ? 'active' : ''}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <hr />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <button onClick={handleCloseModal}>X</button>
        {isModalOpen && (
          <LeadForm leadFields={selectedLead} afterSubmit={() => handleCloseModal()} />
        )}
      </Modal>
    </>
  );
}

export default ExistingLeads;
