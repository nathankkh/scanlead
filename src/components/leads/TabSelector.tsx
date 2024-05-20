import QrVideo from './QrVideo';
import ExistingLeads from './ExistingLeads';
import { useState } from 'react';
import Tab, { tabClasses } from '@mui/joy/Tab';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';

function TabSelector({ setShowUser }) {
  const [selectedTab, setSelectedTab] = useState(0); // 0 for existing leads, 1 for camera
  const [leadsPerPage, setLeadsPerPage] = useState(10); // 10 leads per page
  function handleTabChange(tabNum) {
    setSelectedTab(tabNum);
    setShowUser(tabNum === 0);
  }

  return (
    <>
      <div style={{ paddingBottom: '4rem' }}>
        {selectedTab === 0 && (
          <ExistingLeads leadsPerPage={leadsPerPage} setLeadsPerPage={setLeadsPerPage} />
        )}
        {selectedTab === 1 && <QrVideo />}
      </div>

      <Tabs
        defaultValue={0}
        onChange={(_, value) => handleTabChange(value)}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      >
        <TabList
          disableUnderline
          variant="soft"
          tabFlex={1}
          sx={{
            p: 0.5,
            gap: 0.5,
            bgcolor: 'background.level2',
            [`& .${tabClasses.root}[aria-selected="true"]`]: {
              bgcolor: '#5b5a72'
            }
          }}
        >
          <Tab
            disableIndicator
            variant={selectedTab == 0 ? 'solid' : 'plain'}
            sx={{ borderRadius: 'xl' }}
          >
            Display Leads
          </Tab>
          <Tab
            disableIndicator
            variant={selectedTab == 1 ? 'solid' : 'plain'}
            sx={{ borderRadius: 'xl' }}
          >
            Scan Lead
          </Tab>
        </TabList>
      </Tabs>
    </>
  );
}

export default TabSelector;
