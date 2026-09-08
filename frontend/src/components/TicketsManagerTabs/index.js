import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";



import {
  Add as AddIcon,
} from "@mui/icons-material";

import { makeStyles } from "../../styles/makeStyles";
import Paper from '@mui/material/Paper';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Badge from '@mui/material/Badge';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import GroupIcon from '@mui/icons-material/Group';
import toastError from '../../errors/toastError';
import api from '../../services/api';
import { Snackbar, IconButton, Tooltip, Button, Grid } from "@mui/material";
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import ChatIcon from '@mui/icons-material/Chat';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NewTicketModal from '../NewTicketModal';
import TicketsList from '../TicketsListCustom';
import TicketsListGroup from '../TicketsListGroup';

import TabPanel from '../TabPanel';

import { i18n } from '../../translate/i18n';
import { AuthContext } from '../../context/Auth/AuthContext';
import { Can } from '../Can';
import TicketsQueueSelect from '../TicketsQueueSelect';
import { TagsFilter } from '../TagsFilter';
import { UsersFilter } from '../UsersFilter';

import { DatePickerMoment } from '../DatePickerMoment';
//import NewTicketGroupModal from '../NewTicketGroup';

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: 'relative',
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  tabsHeader: {
    flex: 'none',
    backgroundColor: theme.palette.background.default,
  },

  settingsIcon: {
    alignSelf: 'center',
    marginLeft: 'auto',
    padding: 8,
  },

  tab: {
    minWidth: 60,
    width: 60,
  },

  ticketOptionsBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
  },

  serachInputWrapper: {
    flex: 1,
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    borderRadius: 40,
    padding: 4,
    marginRight: theme.spacing(1),
  },

  searchIcon: {
    color: theme.palette.primary.main,
    marginLeft: 6,
    marginRight: 6,
    alignSelf: 'center',
  },

  searchInput: {
    flex: 1,
    border: 'none',
    borderRadius: 25,
    outline: 'none',
  },

  snackbar: {
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: theme.palette.primary.main,
    color: "white",
    borderRadius: 30,
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.8em",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "1em",
    },
  },

  yesButton: {
    backgroundColor: "#FFF",
    color: "rgba(0, 100, 0, 1)",
    padding: "4px 4px",
    fontSize: "1em",
    fontWeight: "bold",
    textTransform: "uppercase",
    marginRight: theme.spacing(1),
    "&:hover": {
      backgroundColor: "darkGreen",
      color: "#FFF",
    },
    borderRadius: 30,
  },
  noButton: {
    backgroundColor: "#FFF",
    color: "rgba(139, 0, 0, 1)",
    padding: "4px 4px",
    fontSize: "1em",
    fontWeight: "bold",
    textTransform: "uppercase",
    "&:hover": {
      backgroundColor: "darkRed",
      color: "#FFF",
    },
    borderRadius: 30,
  },

  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    padding: 7,
    marginRight: 6,
    color: theme.palette.mode === "dark" ? "#f8fafc" : "#0f172a",
    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark" ? "rgba(16, 185, 129, 0.18)" : "rgba(16, 185, 129, 0.12)",
      color: "#10b981",
      transform: "scale(1.05)",
    },
  },
  actionIcon: {
    fontSize: 20,
  },
  tabLabelContainer: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontSize: "0.82rem",
    fontWeight: 700,
    letterSpacing: "0.4px",
  },
  tabCounterBadge: {
    backgroundColor: "#10b981",
    color: "#ffffff",
    fontSize: "0.72rem",
    fontWeight: 700,
    height: 18,
    minWidth: 18,
    borderRadius: 9,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 5px",
    lineHeight: 1,
    boxShadow: "0 2px 6px rgba(16, 185, 129, 0.35)",
  },

  badge: {
    right: '-10px',
  },
  show: {
    display: 'block',
  },
  hide: {
    display: 'none !important',
  },
}));

const TicketsManagerTabs = () => {
  const classes = useStyles();
  const history = useHistory();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [searchParam, setSearchParam] = useState('');
  const [tab, setTab] = useState('open');
  const [tabOpen, setTabOpen] = useState('open');
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  //const [newTicketGroupModalOpen, setNewTicketGroupModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const searchInputRef = useRef();
  const { user } = useContext(AuthContext);
  const { profile } = user;

  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: '',
    until: '',
  });

  const [setClosedBox, setClosed] = useState(false);
  const [setGroupBox, setGroup] = useState(false);

  useEffect(() => {
    async function fetchData() {
      let settingIndex;

      try {
        const { data } = await api.get('/settings/');
        settingIndex = data.filter((s) => s.key === 'viewclosed');
      } catch (err) {
        toastError(err);
      }

      if (settingIndex[0]?.value === 'enabled') {
        setClosed(true);
      } else {
        if (user.profile === 'admin') {
          setClosed(true);
        } else {
          setClosed(false);
        }
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      let settingIndex;

      try {
        const { data } = await api.get('/settings/');
        settingIndex = data.filter((s) => s.key === 'viewgroups');
      } catch (err) {
        toastError(err);
      }

      if (settingIndex[0]?.value === 'enabled') {
        setGroup(true);
      } else {
        if (user.profile === 'admin') {
          setGroup(true);
        } else {
          setGroup(false);
        }
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (
      user.profile.toUpperCase() === 'ADMIN'
    ) {
      setShowAllTickets(true);
    }
  }, []);

  useEffect(() => {
    if (tab === 'search') {
      searchInputRef.current.focus();
    }
  }, [tab]);

  let searchTimeout;

  const handleSelectedDate = (value, range) => {
    setSelectedDateRange({ ...selectedDateRange, [range]: value });
  };

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    clearTimeout(searchTimeout);

    if (searchedTerm === '') {
      setSearchParam(searchedTerm);
      setTab('open');
      return;
    }

    searchTimeout = setTimeout(() => {
      setSearchParam(searchedTerm);
    }, 500);
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleSnackbarOpen = () => {
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };


  const CloseAllTicket = async () => {
    try {
      const { data } = await api.post("/tickets/closeAll", {
        status: tabOpen,
        selectedQueueIds,
      });

      handleSnackbarClose();

    } catch (err) {
      console.log("Error: ", err);
    }
  };

  const handleChangeTabOpen = (e, newValue) => {
    setTabOpen(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  {/*const handleCloseOrOpenTicketGroup = (ticket) => {
    setNewTicketGroupModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };*/}

  const handleSelectedTags = (selecteds) => {
    const tags = selecteds.map((t) => t.id);
    setSelectedTags(tags);
  };

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    setSelectedUsers(users);
  };

  return (
    <Paper elevation={0} variant='outlined' className={classes.ticketsWrapper}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(ticket) => {
          // console.log('ticket', ticket);
          handleCloseOrOpenTicket(ticket);
        }}
      />

      {/*<NewTicketGroupModal
        modalOpen={newTicketGroupModalOpen}
        onClose={(ticket) => {
          handleCloseOrOpenTicketGroup(ticket);
        }}
      />*/}

      {setClosedBox && (
        <>
          <Paper elevation={0} square className={classes.tabsHeader}>
            <Tabs
              value={tab}
              onChange={handleChangeTab}
              variant='fullWidth'
              indicatorColor='primary'
              textColor='primary'
              aria-label='icon label tabs example'
            >
              <Tab
                value={'open'}
                icon={<ChatIcon />}
                classes={{ root: classes.tab }}
              />
              {setGroupBox && (
                <Tab
                  value={'group'}
                  icon={<GroupIcon />}
                  classes={{ root: classes.tab }}
                />
              )}
              <Tab
                value={'closed'}
                icon={<DoneAllIcon />}
                classes={{ root: classes.tab }}
              />
              <Tab
                value={'search'}
                icon={<SearchIcon />}
                classes={{ root: classes.tab }}
              />
            </Tabs>
          </Paper>
        </>
      )}

      {!setClosedBox && (
        <>
          <Paper elevation={0} square className={classes.tabsHeader}>
            <Tabs
              value={tab}
              onChange={handleChangeTab}
              variant='fullWidth'
              indicatorColor='primary'
              textColor='primary'
              aria-label='icon label tabs example'
            >
              <Tab
                value={'open'}
                icon={<ChatIcon />}
                classes={{ root: classes.tab }}
              />
              {setGroupBox && (
                <Tab
                  value={'group'}
                  icon={<GroupIcon />}
                  classes={{ root: classes.tab }}
                />
              )}
            </Tabs>
          </Paper>
        </>
      )}

      <Paper square elevation={0} className={classes.ticketOptionsBox}>
        {tab === 'search' ? (
          <div className={classes.serachInputWrapper}>
            <SearchIcon className={classes.searchIcon} />
            <InputBase
              className={classes.searchInput}
              inputRef={searchInputRef}
              placeholder={i18n.t('tickets.search.placeholder')}
              type='search'
              onChange={handleSearch}
            />
          </div>
        ) : (
          <>
            {(tab === 'open' || tab === 'closed') && (
              <Tooltip title={i18n.t("tickets.inbox.newTicket")} arrow placement="top">
                <IconButton
                  className={classes.actionButton}
                  onClick={() => setNewTicketModalOpen(true)}
                >
                  <AddIcon className={classes.actionIcon} />
                </IconButton>
              </Tooltip>
            )}
            <Snackbar
              open={snackbarOpen}
              onClose={handleSnackbarClose}
              message={i18n.t("tickets.inbox.closedAllTickets")}
              ContentProps={{
                className: classes.snackbar,
              }}
              action={
                <>
                  <Button
                    className={classes.yesButton}
                    size="small"
                    onClick={CloseAllTicket}
                  >
                    {i18n.t("tickets.inbox.yes")}
                  </Button>
                  <Button
                    className={classes.noButton}
                    size="small"
                    onClick={handleSnackbarClose}
                  >
                    {i18n.t("tickets.inbox.no")}
                  </Button>
                </>
              }
            />
            {user.profile === "admin" && (
              <Tooltip title={i18n.t("tickets.inbox.closedAll")} arrow placement="top">
                <IconButton
                  className={classes.actionButton}
                  onClick={handleSnackbarOpen}
                >
                  <PlaylistAddCheckOutlinedIcon className={classes.actionIcon} style={{ color: "#10b981" }} />
                </IconButton>
              </Tooltip>
			)}
            <Can
              role={user.profile}
              perform='tickets-manager:showall'
              yes={() => (
                <FormControlLabel
                  label={i18n.t('tickets.buttons.showAll')}
                  labelPlacement='start'
                  control={
                    <Switch
                      size='small'
                      checked={showAllTickets}
                      onChange={() =>
                        setShowAllTickets((prevState) => !prevState)
                      }
                      name='showAllTickets'
                      color='primary'
                    />
                  }
                />
              )}
            />
          </>
        )}
        <TicketsQueueSelect
          style={{ marginLeft: 6 }}
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => setSelectedQueueIds(values)}
        />
      </Paper>
      <TabPanel value={tab} name='open' className={classes.ticketsWrapper}>
        <Tabs
          value={tabOpen}
          onChange={handleChangeTabOpen}
          indicatorColor='primary'
          textColor='primary'
          variant='fullWidth'
        >
          <Tab
            label={
              <span className={classes.tabLabelContainer}>
                <span>{i18n.t('ticketsList.assignedHeader')}</span>
                {openCount > 0 && (
                  <span className={classes.tabCounterBadge}>
                    {openCount}
                  </span>
                )}
              </span>
            }
            value={'open'}
          />
          <Tab
            label={
              <span className={classes.tabLabelContainer}>
                <span>{i18n.t('ticketsList.pendingHeader')}</span>
                {pendingCount > 0 && (
                  <span className={classes.tabCounterBadge}>
                    {pendingCount}
                  </span>
                )}
              </span>
            }
            value={'pending'}
          />
        </Tabs>
        <Paper className={classes.ticketsWrapper}>
          <TicketsList
            status='open'
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle('open')}
          />
          <TicketsList
            status='pending'
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle('pending')}
          />
        </Paper>
      </TabPanel>

      <TabPanel value={tab} name='group' className={classes.ticketsWrapper}>
        <Tabs
          value={tabOpen}
          onChange={handleChangeTabOpen}
          indicatorColor='primary'
          textColor='primary'
          variant='fullWidth'
        >
          <Tab
            label={
              <span className={classes.tabLabelContainer}>
                <span>{i18n.t('ticketsList.assignedHeader')}</span>
                {openCount > 0 && (
                  <span className={classes.tabCounterBadge}>
                    {openCount}
                  </span>
                )}
              </span>
            }
            value={'open'}
          />
          <Tab
            label={
              <span className={classes.tabLabelContainer}>
                <span>{i18n.t('ticketsList.pendingHeader')}</span>
                {pendingCount > 0 && (
                  <span className={classes.tabCounterBadge}>
                    {pendingCount}
                  </span>
                )}
              </span>
            }
            value={'pending'}
          />
        </Tabs>
        <Paper className={classes.ticketsWrapper}>
          <TicketsListGroup
            status='open'
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle('open')}
          />
          <TicketsListGroup
            status='pending'
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle('pending')}
          />
        </Paper>
      </TabPanel>

      <TabPanel value={tab} name='closed' className={classes.ticketsWrapper}>
        <TicketsList
          status='closed'
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
        {setGroupBox && (
          <TicketsListGroup
            status='closed'
            showAll={true}
            selectedQueueIds={selectedQueueIds}
          />
        )}
      </TabPanel>
      <TabPanel value={tab} name='search' className={classes.ticketsWrapper}>
        <TagsFilter onFiltered={handleSelectedTags} />
        {(profile === 'admin') && (
          <UsersFilter onFiltered={handleSelectedUsers} />
        )}
        <TicketsList
          dateRange={selectedDateRange}
          searchParam={searchParam}
          showAll={true}
          tags={selectedTags}
          users={selectedUsers}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
    </Paper>
  );
};

export default TicketsManagerTabs;
