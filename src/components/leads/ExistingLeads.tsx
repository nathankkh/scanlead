import { useState, useEffect } from 'react';
import {
  getCurrentUserEmail,
  deleteLead,
  subscribeToCollection
} from '../../firebase-setup/firebase-functions';
import LeadsEditModal from './LeadsEditModal';

interface Lead {
  id: string | number;
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

function ExistingLeads() {
  const [leads, setLeads] = useState<Lead[]>([]); // Array containing each lead as an {} object
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadsPerPage, setLeadsPerPage] = useState(12);
  const [selectedLead, setSelectedLead] = useState<Lead>(); // {} object, to be used when editing / deleting
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase())
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
        const existingLeads = querySnapshot.docs.map((snapshot) => snapshot.data());
        setLeads(existingLeads);
      },
      (error) => {
        console.log(error);
        alert('error subscribing');
      }
    );
    return () => {
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
  }

  function handleDelete(e) {
    const index = e.target.parentNode.parentNode.dataset.index;
    const id = leads[index].id;
    const collectionName = getCurrentUserEmail();
    const docName = collectionName + '_' + id; //FIXME: Possible bug if document isn't added to firebase correctly.
    console.log(docName);
    deleteLead(collectionName, docName).then(() => {
      alert('deleted');
    }); //TODO: add toast message
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
            <option value="2">2</option>
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
          </select>
        </div>

        <div className="row-container">
          {(currentLeads.length > 0 &&
            currentLeads.map((lead, index) => (
              <div key={lead.id} className="lead-box-row" data-index={index}>
                {properCase(lead.name)} - {properCase(lead.experience)}
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
      <LeadsEditModal isOpen={isModalOpen} onClose={handleCloseModal} lead={selectedLead} />
    </>
  );
}

export default ExistingLeads;
