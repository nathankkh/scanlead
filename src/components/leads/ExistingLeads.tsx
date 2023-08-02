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
import Typography from '@mui/joy/Typography';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Table from '@mui/joy/Table';
import Box from '@mui/joy/Box';
import Grid from '@mui/joy/Grid';
import Input from '@mui/joy/Input';
import IconButton from '@mui/joy/IconButton';
import FormLabel from '@mui/joy/FormLabel';
import Stack from '@mui/joy/Stack';

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

function ExistingLeads() {
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
    // remove one level of parentNode if not using MUI
    const index = e.target.parentNode.parentNode.parentNode.dataset.index;
    setSelectedLead(leads[index]);
    setIsEditModalOpen(true);
  }

  function handleCloseEditModal() {
    setIsEditModalOpen(false);
    setSelectedLead(undefined);
  }

  function handleDelete(e) {
    Modal.setAppElement(document.getElementById('delete-modal'));
    // remove one level of parentNode if not using MUI
    const index = e.target.parentNode.parentNode.parentNode.dataset.index;
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
      <Typography level="h3" textAlign="center">
        Leads
      </Typography>
      <Box sx={{ border: 1, borderColor: 'lightgrey', borderRadius: 10, p: 1 }}>
        <Grid
          container
          spacing={1}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{}}
        >
          <Grid xs={7}>
            <FormLabel>Search:</FormLabel>
            <Input
              placeholder="Search by Name"
              variant="outlined"
              onChange={(e) => setSearchQuery(e.target.value)}
              endDecorator={<IconButton variant="plain">X</IconButton>} //TODO: IMPLEMENT CLEARING

              /* slotProps={{
          input: {
            ref: searchRef,
          },
        }} */
            />
          </Grid>
          <Grid xs={5}>
            <FormLabel>Leads per page:</FormLabel>
            <FormLabel />
            <Select
              defaultValue="10"
              onChange={(_, value) => {
                const pageNum = Number(value);
                setLeadsPerPage(pageNum);
                setCurrentPage(1);
              }}
            >
              <Option value="1">1</Option>
              <Option value="10">10</Option>
              <Option value="20">20</Option>
              <Option value="50">50</Option>
              <Option value="100">100</Option>
            </Select>
          </Grid>
        </Grid>

        {(currentLeads.length > 0 && (
          <Table
            stripe="even"
            hoverRow
            sx={{
              '& tr > *:first-of-type': {
                left: 0,
                textAlign: 'left'
              },
              '& tr > *:last-child': {
                textAlign: 'right'
              },
              alignItems: 'center'
            }}
          >
            <thead>
              <tr>
                <th>Name</th>
                <th aria-label="last"></th>
              </tr>
            </thead>

            <tbody>
              {currentLeads.map((lead, index) => (
                <tr key={index} data-index={index}>
                  <td>{properCase(lead.name)}</td>
                  <td>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="sm" variant="outlined" color="neutral" onClick={handleEdit}>
                        Edit
                      </Button>
                      <Button size="sm" variant="soft" color="danger" onClick={handleDelete}>
                        Delete
                      </Button>
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
                    </Box>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )) || (
          <p>
            <Typography>No leads yet!</Typography>
          </p>
        )}

        {/* This displays the page numbers at the bottom of the page */}
        <Stack id="page-select" direction="row" spacing={1} justifyContent="center">
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
        </Stack>
      </Box>

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

export default ExistingLeads;
