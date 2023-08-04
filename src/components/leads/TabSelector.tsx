import QrVideo from './QrVideo';
import ExistingLeads from './ExistingLeads';
import { useState } from 'react';
import Tab from '@mui/joy/Tab';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';

function TabSelector() {
  const [selectedTab, setSelectedTab] = useState(0);

  function handleTabChange(tabNum) {
    setSelectedTab(tabNum);
  }

  return (
    <>
      <div style={{ paddingBottom: '4rem' }}>
        {selectedTab === 0 && <ExistingLeads />}
        {selectedTab === 1 && <QrVideo />}
      </div>

      <Tabs
        defaultValue={0}
        onChange={(_, value) => handleTabChange(value)}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      >
        <TabList variant="soft">
          <Tab variant={selectedTab == 0 ? 'solid' : 'plain'}>Display Leads</Tab>
          <Tab variant={selectedTab == 1 ? 'solid' : 'plain'}>Scan Lead</Tab>
        </TabList>
      </Tabs>
    </>
  );
}

export default TabSelector;
