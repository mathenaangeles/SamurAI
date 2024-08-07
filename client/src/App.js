import { Route, Routes, Link } from 'react-router-dom';
import { Box, AppBar, Typography, Drawer, Toolbar, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Badge, Button} from '@mui/material';
import { Gavel, TableRows, Bookmark, Notifications , History } from '@mui/icons-material';

import Assistant from './pages/Assistant';
import ProjectList from './pages/ProjectList';
import ProjectForm from './pages/ProjectForm';
import ProjectDetail from './pages/ProjectDetail';
import Library from './pages/Library';

import Logo from "./assets/white-logo.png";
import ProfilePicture from "./assets/john-doe.jpg";
import CompanyPicture from "./assets/company.jpg";


const drawerWidth = 250;

function App() {
  return (
    <div className="App">
        <Box sx={{ display: 'flex' }}>
          <AppBar
            position="fixed"
            sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`,  boxShadow: 'none'}}
          >
            <Toolbar>
              <Box sx={{ flexGrow: 1 }}></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <History/>
                <Badge badgeContent={1} color="error">
                  <Notifications/>
                </Badge>
                <Box/>
                <Avatar alt="John Doe" src={ProfilePicture} />
              </Box>
            </Toolbar>
          </AppBar>
          <Drawer
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                padding: "10px"
              },
            }}
            variant="permanent"
            anchor="left"
          >
            <Box p={1}>
              <img src={Logo} alt="logo" style={{ width: '160px', height: 'auto' }}/>
            </Box>
            <Box className="organization-menu" sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar alt="Organization" src={CompanyPicture} />
              <Box sx={{ marginLeft: 2  }}>
                <Typography variant="body2"><b>Organization</b></Typography>
                <Typography variant="body1">Company Inc.</Typography>
              </Box>
            </Box>
            <List className="drawer-list">
            <Typography px={2} py={1}>
                <b>General</b>
              </Typography>
              <ListItem key="assistant" disablePadding>
                <Link to={'/'} className="link"> 
                  <ListItemButton className="list-item-button">
                    <ListItemIcon><Gavel/> </ListItemIcon>
                    <ListItemText primary="Assistant">
                    </ListItemText>
                  </ListItemButton>
                </Link>
              </ListItem>
              <ListItem key="projectInventory" disablePadding>
                <Link to={'/projects'}  className="link">
                    <ListItemButton className="list-item-button">
                      <ListItemIcon><TableRows/> </ListItemIcon>
                      <ListItemText primary="Inventory">
                      </ListItemText>
                    </ListItemButton>
                  </Link>
              </ListItem>
            </List>
            <Divider/>
            <List className="drawer-list">
              <Typography px={2} py={1}>
                <b>Database</b>
              </Typography>
              <ListItem key="library" disablePadding>
                <Link to={'/library'}  className="link">
                  <ListItemButton className="list-item-button">
                    <ListItemIcon><Bookmark/> </ListItemIcon>
                    <ListItemText primary="Library">
                    </ListItemText>
                  </ListItemButton>
                </Link>
              </ListItem>
            </List>
          </Drawer>
        </Box>
        <Box component="main" sx={{ flexGrow: 1, ml: `${drawerWidth}px`, mt: '40px' }}>
          <Routes>
            <Route path="/" element={<Assistant/>}></Route>
            <Route path="/projects" element={<ProjectList/>}></Route>
            <Route path="/form" element={<ProjectForm/>}></Route>
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/library" element={<Library/>}></Route>
          </Routes>
        </Box>
    </div>
  );
}

export default App;
