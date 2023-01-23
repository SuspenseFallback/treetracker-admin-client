import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Autocomplete from '@material-ui/lab/Autocomplete';
import SelectOrg from './common/SelectOrg';
import FilterModel, {
  ALL_ORGANIZATIONS,
  ALL_SPECIES,
  SPECIES_ANY_SET,
  SPECIES_NOT_SET,
  ALL_TAGS,
  TAG_NOT_SET,
  ANY_TAG_SET,
} from '../models/Filter';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import React, { useContext, useEffect, useState } from 'react';
import {
  convertDateToDefaultSqlDate,
  getDateFormatLocale,
  getDatePickerLocale,
} from '../common/locale';
import {
  datePickerDefaultMinDate,
  tokenizationStates,
} from '../common/variables';

import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';
import { CircularProgress } from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import SelectOrg from './common/SelectOrg';
import { SpeciesContext } from '../context/SpeciesContext';
import { TagsContext } from '../context/TagsContext';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

export const FILTER_WIDTH = 330;

const styles = (theme) => {
  return {
    root: {},
    drawer: {
      flexShrink: 0,
    },
    drawerPaper: {
      width: FILTER_WIDTH,
      padding: theme.spacing(3, 2, 2, 2),
      /*
       * boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)',
       * */
    },
    close: {
      color: theme.palette.grey[500],
    },
    inputContainer: {
      margin: theme.spacing(1),
      '&>*': {
        display: 'inline-flex',
        width: 160,
        margin: theme.spacing(1.5, 1),
      },
    },
    apply: {
      width: 90,
      height: 36,
    },
    autocompleteInputRoot: {
      padding: `${theme.spacing(0, 12, 0, 1)} !important`,
    },
    noSpecies: {
      fontStyle: 'italic',
    },
  };
};

const stringToDate = (string) => {
  if (!string) {
    return false;
  } else {
    return new Date(
      parseInt(string.substring(0, 4)),
      parseInt(string.substring(5, 7)) - 1,
      parseInt(string.substring(8, 10))
    );
  }
};

function Filter(props) {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  const speciesContext = useContext(SpeciesContext);
  const tagsContext = useContext(TagsContext);
  const { classes, filter } = props;
  const filterOptionAll = 'All';
  const dateStartDefault = null;
  const dateEndDefault = null;

  const [uuid, setUUID] = useState(
    url.searchParams.get('uuid') || filter?.uuid || ''
  );
  const [captureId, setCaptureId] = useState(
    url.searchParams.get('captureId') || filter?.captureId || ''
  );
  const [growerId, setGrowerId] = useState(
    url.searchParams.get('growerId') || filter?.planterId || ''
  );
  const [deviceId, setDeviceId] = useState(
    url.searchParams.get('deviceId') || filter?.deviceIdentifier || ''
  );
  const [growerIdentifier, setGrowerIdentifier] = useState(
    url.searchParams.get('growerIdentifier') || filter?.planterIdentifier || ''
  );
  const [endDate, setEndDate] = useState(filter?.endDate || endDateDefault);
  const [speciesId, setSpeciesId] = useState(filter?.speciesId || ALL_SPECIES);
  const [tag, setTag] = useState(null);
  const [tagSearchString, setTagSearchString] = useState('');
  const [organizationId, setOrganizationId] = useState(
    url.searchParams.get('organizationId') ||
      filter.organizationId ||
      ALL_ORGANIZATIONS
  );
  const [tokenId, setTokenId] = useState(
    url.searchParams.get('tokenId') || filter?.tokenId || filterOptionAll
  );

  useEffect(() => {
    const filter = new FilterModel();
    filter.uuid = uuid;
    filter.captureId = captureId;
    filter.planterId = growerId;
    filter.deviceIdentifier = deviceId;
    filter.planterIdentifier = growerIdentifier;
    filter.dateStart = dateStart ? formatDate(dateStart) : undefined;
    filter.dateEnd = dateEnd ? formatDate(dateEnd) : undefined;
    filter.speciesId = speciesId;
    filter.tagId = tag ? tag.id : 0;
    filter.organizationId = organizationId;
    filter.stakeholderUUID = stakeholderUUID;
    filter.tokenId = tokenId;
    filter.verifyStatus = verifyStatus;
    props.onSubmit && props.onSubmit(filter);
  }, []);

  const handleDateStartChange = (date) => {
    setDateStart(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const formatDate = (date) => {
    return convertDateToDefaultSqlDate(date);
  };

  function handleSubmit(e) {
    e.preventDefault();
    // save the filer to context for editing & submit
    const test = {
      uuid: uuid.trim(),
      captureId: captureId.trim(),
      grower_account_id: growerId.trim(),
      device_identifier: deviceId.trim(),
      wallet: wallet.trim(),
      startDate: startDate ? formatDate(startDate) : undefined,
      endDate: endDate ? formatDate(endDate) : undefined,
      species_id: speciesId,
      tag_id: tag ? tag.id : undefined,
      organization_id: organizationId,
      tokenId: tokenId.trim(),
    };
    const filter = new FilterModel(test);

    props.onSubmit && props.onSubmit(filter);

    handleQuerySearchParams('uuid', uuid);
    handleQuerySearchParams('captureId', captureId);
    handleQuerySearchParams('deviceId', deviceId);
    handleQuerySearchParams('growerIdentifier', growerIdentifier);
    handleQuerySearchParams('growerId', growerId);
    handleQuerySearchParams(
      'dateStart',
      dateStart ? formatDate(dateStart) : ''
    );
    handleQuerySearchParams('dateEnd', dateEnd ? formatDate(dateEnd) : '');
    handleQuerySearchParams('speciesId', speciesId);
    handleQuerySearchParams('growerIdentifier', growerIdentifier);
    handleQuerySearchParams('tag', tag);
    handleQuerySearchParams('tagSearchString', tagSearchString);
    handleQuerySearchParams('organizationId', organizationId);
    handleQuerySearchParams('stakeholderUUID', stakeholderUUID);
    handleQuerySearchParams('tokenId', tokenId);
  }

  function handleReset() {
    // reset form values, except 'approved' and 'active' which we'll keep
    setUUID('');
    setCaptureId('');
    setGrowerId('');
    setDeviceId('');
    setWallet('');
    setStartDate(startDateDefault);
    setEndDate(endDateDefault);
    setSpeciesId(ALL_SPECIES);
    setTag(null);
    setTagSearchString('');
    setOrganizationId(ALL_ORGANIZATIONS);
    setTokenId(filterOptionAll);
    const filter = new FilterModel();
    props.onSubmit && props.onSubmit(filter);
  }

  const handleQuerySearchParams = (name, value) => {
    if (params.has(name) && value == '') {
      url.searchParams.delete(name);
      window.history.pushState({}, '', url.search);
    } else if (!params.has(name) && value == '') {
      return;
    } else if (!params.get(name)) {
      url.searchParams.append(name, value);
      window.history.pushState({}, '', url.search);
    } else if (params.get(name)) {
      url.searchParams.set(name, value);
      window.history.pushState({}, '', url.search);
    }
  };

  return (
    <>
      {
        <form onSubmit={handleSubmit}>
          <Grid container wrap="nowrap" direction="row">
            <Grid item className={classes.inputContainer}>
              <TextField
                select
                htmlFor="token-status"
                id="token-status"
                label="Token Status"
                value={tokenId}
                onChange={(e) => {
                  setTokenId(e.target.value);
                }}
              >
                {[
                  filterOptionAll,
                  tokenizationStates.NOT_TOKENIZED,
                  tokenizationStates.TOKENIZED,
                ].map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>
              <MuiPickersUtilsProvider
                utils={DateFnsUtils}
                locale={getDatePickerLocale()}
              >
                <KeyboardDatePicker
                  margin="normal"
                  id="start-date-picker"
                  htmlFor="start-date-picker"
                  label="Start Date"
                  format={getDateFormatLocale()}
                  value={startDate}
                  onChange={handleStartDateChange}
                  maxDate={endDate || Date()} // Don't allow selection after today
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                />
                <KeyboardDatePicker
                  margin="normal"
                  id="end-date-picker"
                  htmlFor="end-date-picker"
                  label="End Date"
                  format={getDateFormatLocale()}
                  value={endDate}
                  onChange={handleEndDateChange}
                  minDate={startDate || datePickerDefaultMinDate}
                  maxDate={Date()} // Don't allow selection after today
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                />
              </MuiPickersUtilsProvider>
              <TextField
                htmlFor="wallet"
                id="wallet"
                label="Wallet"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
              />
              <TextField
                htmlFor="grower-id"
                id="grower-id"
                label="Grower Account ID"
                placeholder="e.g. 2, 7"
                value={growerId}
                onChange={(e) => setGrowerId(e.target.value)}
              />
              <TextField
                htmlFor="capture-id"
                id="capture-id"
                label="Capture Reference ID"
                placeholder="e.g. 80"
                value={captureId}
                onChange={(e) => setCaptureId(e.target.value)}
              />
              <TextField
                htmlFor="uuid"
                id="uuid"
                label="Capture ID (uuid)"
                placeholder=""
                value={uuid}
                onChange={(e) => setUUID(e.target.value)}
              />
              <TextField
                htmlFor="device-identifier"
                id="device-identifier"
                label="Device Identifier"
                placeholder="e.g. 1234abcd"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              />
              <TextField
                data-testid="species-dropdown"
                select
                htmlFor="species"
                id="species"
                label="Species"
                value={speciesId}
                onChange={(e) => setSpeciesId(e.target.value)}
              >
                {speciesContext.isLoading ? (
                  <CircularProgress />
                ) : (
                  [
                    { id: ALL_SPECIES, name: 'All' },
                    { id: SPECIES_ANY_SET, name: 'Any set' },
                    {
                      id: SPECIES_NOT_SET,
                      name: 'Not set',
                    },
                    ...speciesContext.speciesList,
                  ].map((species) => (
                    <MenuItem
                      data-testid="species-item"
                      key={species.id}
                      value={species.id}
                    >
                      {species.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
              <Autocomplete
                data-testid="tag-dropdown"
                label="Tag"
                htmlFor="tag"
                id="tag"
                classes={{
                  inputRoot: classes.autocompleteInputRoot,
                }}
                options={[
                  {
                    id: ALL_TAGS,
                    name: 'All',
                    isPublic: true,
                    status: 'active',
                    owner_id: null,
                  },
                  {
                    id: TAG_NOT_SET,
                    name: 'Not set',
                    isPublic: true,
                    status: 'active',
                    owner_id: null,
                  },
                  {
                    id: ANY_TAG_SET,
                    name: 'Any tag set',
                    isPublic: true,
                    status: 'active',
                    owner_id: null,
                  },
                  ...tagsContext.tagList.filter((t) =>
                    t.name
                      .toLowerCase()
                      .startsWith(tagSearchString.toLowerCase())
                  ),
                ]}
                value={tag}
                defaultValue={'All'}
                getOptionLabel={(tag) => tag.name}
                onChange={(_oldVal, newVal) => {
                  //triggered by onInputChange
                  setTag(newVal);
                }}
                onInputChange={(_oldVal, newVal) => {
                  setTagSearchString(newVal);
                }}
                renderInput={(params) => {
                  return <TextField {...params} label="Tag" />;
                }}
                getOptionSelected={(option, value) => option.id === value.id}
              />
              <SelectOrg
                orgId={organizationId}
                handleSelection={(org) => {
                  setOrganizationId(org.stakeholder_uuid);
                }}
              />
            </Grid>
            <Grid className={classes.inputContainer}>
              <Button
                className={classes.apply}
                type="submit"
                label="submit"
                htmlFor="submit"
                id="submit"
                variant="outlined"
                color="primary"
                onClick={(e) => handleSubmit(e)}
              >
                Apply
              </Button>
              <Button
                className={classes.apply}
                label="reset"
                htmlFor="reset"
                id="reset"
                variant="outlined"
                color="primary"
                onClick={handleReset}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      }
    </>
  );
}

export default withStyles(styles)(Filter);
