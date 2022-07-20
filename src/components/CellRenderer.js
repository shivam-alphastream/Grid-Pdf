import React from "react";
import "../App.css";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
const filter = createFilterOptions();
const SelectedEditor = React.forwardRef((props, ref) => {
  const [value, setValue] = React.useState();
  const [open, toggleOpen] = React.useState(false);
  const [dialogValue, setDialogValue] = React.useState({
    name: "",
    id: "",
  });
  const handleClose = () => {
    setDialogValue({
      id: "",
      name: "",
    });
    toggleOpen(false);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    setValue({
      name: dialogValue.name,
      id: parseInt(dialogValue.id, 10),
    });
    handleClose();
  };
  const createInitialState = () => {
    return {
      value: props["value"],
      id: props["data"]["tagId"] || 0,
      dropdownValues: props["data"]["sTags"] || [],
    };
  };
  const initialState = createInitialState();
  const refInput = React.useRef(null);
  // console.log(initialState.value, initialState.dropdownValues.length === 0);
  const opt =
    initialState.dropdownValues.length > 0 &&
    initialState.dropdownValues.map((item, idx) => {
      return item;
    });
  if (
    initialState.value !== null &&
    initialState.value !== "" &&
    initialState.dropdownValues.length === 0
  ) {
    return <span>{initialState.value}</span>;
  }

  return (
    <React.Fragment>
      <Autocomplete
        defaultValue={dialogValue.name}
        onChange={(event, newValue) => {
          if (typeof newValue === "string") {
            setTimeout(() => {
              toggleOpen(true);
              setDialogValue({
                name: newValue,
                id: "",
              });
            });
          } else if (newValue && newValue.inputValue) {
            toggleOpen(true);
            setDialogValue({
              name: newValue.inputValue,
              id: "",
            });
          } else {
            setValue(newValue);
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);
          if (params.inputValue !== "") {
            filtered.push({
              inputValue: params.inputValue,
              name: `Add "${params.inputValue}"`,
            });
          }

          return filtered;
        }}
        options={opt}
        getOptionLabel={(option) => {
          if (typeof option === "string") {
            return option;
          }
          if (option.inputValue) {
            return option.inputValue;
          }
          return option.name;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        renderOption={(props, option) => <li {...props}>{option.name}</li>}
        sx={{ width: 300 }}
        freeSolo
        renderInput={(params) => (
          <TextField {...params} label="Select a Tag" size="small" variant="outlined"
          inputProps={{
            ...params.inputProps,
            style: {fontSize: '11px', padding: '1px', height: '100%'},
          }}
          InputLabelProps={{...params.InputLabelProps, style: {fontSize: '11px'}}} />
        )}
      />
      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add a new Tag</DialogTitle>
          <DialogContent>
            <DialogContentText>Add new Tags</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              value={dialogValue.name}
              onChange={(event) =>
                setDialogValue({
                  ...dialogValue,
                  name: event.target.value,
                })
              }
              label="name"
              type="text"
              variant="standard"
            />
            <TextField
              margin="dense"
              id="id"
              value={dialogValue.id}
              onChange={(event) =>
                setDialogValue({
                  ...dialogValue,
                  id: event.target.value,
                })
              }
              label="id"
              type="number"
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">Add</Button>
          </DialogActions>
        </form>
      </Dialog>
    </React.Fragment>
  );
});

export default SelectedEditor;
