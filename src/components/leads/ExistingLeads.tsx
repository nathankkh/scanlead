import { useState, useEffect } from 'react';
import {
  getCurrentUserEmail,
  deleteLead,
  subscribeToCollection
} from '../../firebase-setup/firebase-functions';
import LeadForm from './results/LeadForm';

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
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import ModalDialog from '@mui/joy/ModalDialog';

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
}

function ExistingLeads({ leadsPerPage, setLeadsPerPage }) {
  const [leads, setLeads] = useState<Lead[]>([]); // Array containing each lead as an {} object
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // const [leadsPerPage, setLeadsPerPage] = useState(10);
  const [selectedLead, setSelectedLead] = useState<Lead>(); // {} object, to be used when editing
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(''); //TODO: consider useRef. Will likely require a button to search; won't have realtime update of displayed leads

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
    function handleTabClose() {
      unsubscribe();
    }

    // Adds event listener for beforeunload event (when tab is closed)
    window.addEventListener('beforeunload', handleTabClose);
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
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
    // remove one level of parentNode if not using MUI
    const index = e.target.parentNode.parentNode.parentNode.dataset.index; // returns the index of THE CURRENT PAGE. Requires setSelectedLead to index based on `currentLeads`.
    // index = leadsPerPage * (currentPage - 1) + Number(index); // returns the index of the selected lead from the entire array. Use if following line indexes on `leads`
    setSelectedLead(currentLeads[index]);
    setIsEditModalOpen(true);
  }

  function handleCloseEditModal() {
    setIsEditModalOpen(false);
    setSelectedLead(undefined);
  }

  function handleDeleteClick(e) {
    // remove one level of parentNode if not using MUI
    const index = e.target.parentNode.parentNode.parentNode.dataset.index; // sRequires setSelectedLead to index based on `currentLeads`.
    // index = leadsPerPage * (currentPage - 1) + Number(index); // returns the index of the selected lead from the entire array.
    console.log(currentLeads[index]);
    setSelectedLead(currentLeads[index]);
    setIsDeleteModalOpen(true);
  }

  function confirmDelete() {
    try {
      const id = selectedLead?.id;
      console.log(id);
      const collectionName = getCurrentUserEmail();
      const docName = collectionName.split('@')[0] + '_' + id; //FIXME: Possible bug depending on how a Lead is added to firestore
      console.log(docName);
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

  function clearSearch() {
    setSearchQuery('');
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              endDecorator={
                <IconButton variant="plain" onClick={clearSearch}>
                  X
                </IconButton>
              }
            />
          </Grid>

          <Grid xs={5}>
            <FormLabel>Leads per page:</FormLabel>
            <FormLabel />
            <Select
              defaultValue={leadsPerPage.toString()}
              onChange={(_, value) => {
                const pageNum = Number(value);
                setLeadsPerPage(pageNum);
                setCurrentPage(1);
              }}
            >
              <Option value="3">3</Option>
              <Option value="10">10</Option>
              <Option value="20">20</Option>
              <Option value="50">50</Option>
              <Option value="100">100</Option>
            </Select>
          </Grid>
        </Grid>

        {/* Creates a Table and populates rows based on `currentLeads` */}
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
                  <td>{lead.name != '' ? properCase(lead.name) : lead.id}</td>
                  <td>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'right' }}>
                      <Button size="sm" variant="outlined" color="neutral" onClick={handleEdit}>
                        Edit
                      </Button>
                      <Button size="sm" variant="soft" color="danger" onClick={handleDeleteClick}>
                        Delete
                      </Button>
                    </Box>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )) || (
          <div>
            <Typography sx={{ pt: 1 }}>No leads yet!</Typography>
          </div>
        )}

        {/* Pagination; this displays the page numbers at the bottom of the page */}
        <Stack
          id="page-select"
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ flexWrap: 'wrap', gap: 1 }}
        >
          {Array.from(Array(Math.ceil(filteredLeads.length / leadsPerPage)).keys()).map(
            (_, index) => (
              <Button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                variant={currentPage === index + 1 ? 'solid' : 'outlined'}
                color="neutral"
              >
                {index + 1}
              </Button>
            )
          )}
        </Stack>
      </Box>

      <Modal aria-labelledby="edit-modal" open={isEditModalOpen} onClose={handleCloseEditModal}>
        <ModalDialog>
          <ModalClose
            variant="outlined"
            sx={{
              top: 'calc(-1/4 * var(--IconButton-size))',
              right: 'calc(-1/4 * var(--IconButton-size))',
              boxShadow: '0 2px 12px 0 rgba(0 0 0 / 0.2)',
              borderRadius: '50%',
              bgcolor: 'background.surface'
            }}
          />

          <LeadForm leadFields={selectedLead} afterSubmit={() => handleCloseEditModal()} />
        </ModalDialog>
      </Modal>
      <Modal aria-labelledby="delete-modal" open={isDeleteModalOpen} onClose={cancelDelete}>
        <ModalDialog
          role="alertdialog"
          variant="outlined"
          sx={(theme) => ({
            [theme.breakpoints.only('xs')]: {
              top: 'unset',
              bottom: 0,
              left: 0,
              right: 0,
              borderRadius: 0,
              transform: 'none',
              maxWidth: 'unset'
            }
          })}
        >
          <Typography id="modal-title" level="h6">
            <b>Are you sure?</b>
          </Typography>
          <Typography>
            This action cannot be undone! This will permanently delete the lead.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              gap: 1,
              pt: 1.5
            }}
          >
            <Button onClick={cancelDelete} size="md" variant="outlined" color="neutral">
              Cancel
            </Button>
            <Button onClick={confirmDelete} size="md" variant="solid" color="danger">
              Delete
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
}

export default ExistingLeads;
