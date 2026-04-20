/**
 * MultiSelectModal - A reusable modal for multi-select dropdown with optional sorting
 */
import React, { useState, useEffect } from "react";
// Modal components
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
// Form components
import FormControl from "@mui/material/FormControl";
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// Icons
import { MdDragIndicator } from "react-icons/md";
// Sortable List
import SortableList, { SortableItem } from 'react-easy-sort';
import { arrayMoveImmutable } from 'array-move';

/**
 * Warning component for items that are selected but not in available options
 */
function UnavailableItemsWarning({ unavailableItems, onRemoveItem, onRemoveAll }) {
  if (!unavailableItems || unavailableItems.length === 0) {
    return null;
  }

  return (
    <Alert
      severity="warning"
      sx={{ mb: 2 }}
      action={
        <Button
          color="inherit"
          size="small"
          onClick={onRemoveAll}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Remove All
        </Button>
      }
    >
      <AlertTitle>Unavailable Items</AlertTitle>
      <Typography variant="body2" sx={{ mb: 1 }}>
        The following items no longer exist and must be removed before you can continue:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
        {unavailableItems.map((item) => (
          <Chip
            key={item}
            label={item}
            onDelete={() => onRemoveItem(item)}
            deleteIcon={<DeleteIcon />}
            color="warning"
            variant="outlined"
            sx={{
              textDecoration: 'line-through',
              '& .MuiChip-label': { color: 'error.main' }
            }}
          />
        ))}
      </Box>
    </Alert>
  );
}

/**
 * Checkbox-based multi-select component
 */
function SelectValueGroup(props) {
  const [item, setItem] = React.useState(props.selectedOptions);

  const handleChange = (event) => {
    const { target: { value } } = event;
    setItem(typeof value === 'string' ? value.split(',') : value);
  };

  useEffect(() => {
    setItem(props.selectedOptions);
  }, [props.selectedOptions]);

  useEffect(() => {
    props.setSelectedOptions(item);
  }, [item]);

  return (
    <FormControl sx={{ width: '100%' }} disabled={props.disabled}>
      <InputLabel id="multiselect-label">{props.label}</InputLabel>
      <Select
        labelId="multiselect-label"
        id="multiselect"
        multiple
        value={item || []}
        onChange={handleChange}
        input={<OutlinedInput label={props.label} />}
        renderValue={(selected) => selected.join(', ')}
        disabled={props.disabled}
      >
        {props.options.map((element) => (
          <MenuItem key={element} value={element}>
            <Checkbox checked={item ? item.indexOf(element) > -1 : false} />
            <ListItemText
              primary={element}
              {...(props.showSecondaryText && {
                secondary: props.secondaryTextMap?.[element],
              })}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

/**
 * Drag-and-drop sortable list component
 */
function OrderItems(props) {
  const [items, setItems] = React.useState(props.selectedOptions);

  const onSortEnd = (oldIndex, newIndex) => {
    if (props.disabled) return;
    setItems((array) => arrayMoveImmutable(array, oldIndex, newIndex));
  };

  useEffect(() => {
    props.setSelectedOptions(items);
  }, [items]);

  useEffect(() => {
    setItems(props.selectedOptions);
  }, [props.selectedOptions]);

  // react-easy-sort appends a cloned element to document.body with
  // position:fixed and z-index:1000.  MUI Dialog has z-index:1300, so the
  // clone ends up *behind* the dialog backdrop — visually flying to the
  // top-left corner.  We observe body for the clone being added and bump
  // its z-index above the dialog.
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (
            node.nodeType === 1 &&
            node.classList?.contains('esq-sortable-item') &&
            node.parentNode === document.body
          ) {
            node.style.zIndex = '100000';
          }
        });
      });
    });
    observer.observe(document.body, { childList: true });
    return () => observer.disconnect();
  }, []);

  return (
    <SortableList
      onSortEnd={onSortEnd}
      className="list"
      draggedItemClassName="dragged"
      style={{
        height: 300,
        overflowY: "scroll",
        overflowX: "hidden",
        opacity: props.disabled ? 0.5 : 1,
        pointerEvents: props.disabled ? 'none' : 'auto',
      }}
    >
      {items.map((item) => (
        <SortableItem key={item} disabled={props.disabled}>
          <div
            className="esq-sortable-item"
            style={{
              backgroundColor: '#ebebeb',
              padding: '10px',
              margin: '5px 0',
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              cursor: props.disabled ? 'not-allowed' : 'grab',
            }}
          >
            <MdDragIndicator style={{ marginRight: '10px' }} />
            {item}
          </div>
        </SortableItem>
      ))}
    </SortableList>
  );
}

/**
 * Main MultiSelectModal component
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Array<string>} props.options - Available options to select from
 * @param {Array<string>} props.selectedValues - Currently selected values
 * @param {Function} props.onSave - Callback with selected values when saved
 * @param {boolean} props.sortable - Whether to enable drag-and-drop sorting
 * @param {string} props.title - Modal title
 * @param {string} props.label - Label for the select input
 * @param {boolean} props.showSecondaryText - Whether to show secondary text in options
 * @param {Object} props.secondaryTextMap - Map of option -> secondary text
 */
function MultiSelectModal(props) {
  const {
    open = false,
    onClose,
    options = [],
    selectedValues = [],
    onSave,
    sortable = false,
    title = "Select Options",
    label = "Options",
    showSecondaryText = false,
    secondaryTextMap = {}
  } = props;

  const [valueSelected, setValueSelected] = useState(selectedValues);
  const [itemsToSort, setItemsToSort] = useState([]);
  const [finalOrder, setFinalOrder] = useState([]);
  const [disableSave, setDisableSave] = useState(true);
  const [unavailableItems, setUnavailableItems] = useState([]);

  // Calculate unavailable items (selected but not in options)
  useEffect(() => {
    if (selectedValues && options) {
      const unavailable = selectedValues.filter(
        (item) => !options.includes(item)
      );
      setUnavailableItems(unavailable);
    } else {
      setUnavailableItems([]);
    }
  }, [selectedValues, options]);

  const hasUnavailableItems = unavailableItems.length > 0;

  // Handler to remove a single unavailable item
  const handleRemoveUnavailableItem = (itemToRemove) => {
    setUnavailableItems((prev) => prev.filter((item) => item !== itemToRemove));
    setValueSelected((prev) => prev ? prev.filter((item) => item !== itemToRemove) : []);
  };

  // Handler to remove all unavailable items
  const handleRemoveAllUnavailable = () => {
    const availableOnly = valueSelected ? valueSelected.filter(
      (item) => options.includes(item)
    ) : [];
    setUnavailableItems([]);
    setValueSelected(availableOnly);
  };

  useEffect(() => {
    if (selectedValues) {
      setValueSelected(selectedValues);
    }
  }, [selectedValues]);

  const hasNoOptions = !options || options.length === 0;

  // Enable/disable save button
  useEffect(() => {
    if (!hasUnavailableItems && (finalOrder.length > 0 || hasNoOptions)) {
      setDisableSave(false);
    } else {
      setDisableSave(true);
    }
  }, [finalOrder, hasUnavailableItems, hasNoOptions]);

  const handleSave = () => {
    // Pass empty array to clear cell when no options available
    const result = hasNoOptions && finalOrder.length === 0 ? [] : finalOrder;
    onSave(result);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      aria-labelledby="multiselect-dialog-title"
      open={open}
      onClose={onClose}
    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="multiselect-dialog-title">
        {title}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        {/* Warning for unavailable items */}
        <UnavailableItemsWarning
          unavailableItems={unavailableItems}
          onRemoveItem={handleRemoveUnavailableItem}
          onRemoveAll={handleRemoveAllUnavailable}
        />

        <Divider style={{ marginTop: '5px', marginBottom: '25px' }}>
          Select <Chip label={label} size="small" />
        </Divider>

        {/* Message when no options available */}
        {hasNoOptions && !hasUnavailableItems && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              No options available. Click "Save changes" to clear the cell.
            </Typography>
          </Alert>
        )}

        {sortable ? (
          <>
            <SelectValueGroup
              options={options}
              selectedOptions={valueSelected}
              setSelectedOptions={setItemsToSort}
              label={label}
              showSecondaryText={showSecondaryText}
              secondaryTextMap={secondaryTextMap}
              disabled={hasUnavailableItems}
            />

            <Divider style={{ marginTop: '35px', marginBottom: '15px' }}>Order List</Divider>
            <OrderItems
              selectedOptions={itemsToSort}
              setSelectedOptions={setFinalOrder}
              disabled={hasUnavailableItems}
            />
          </>
        ) : (
          <SelectValueGroup
            options={options}
            selectedOptions={valueSelected}
            setSelectedOptions={setFinalOrder}
            label={label}
            showSecondaryText={showSecondaryText}
            secondaryTextMap={secondaryTextMap}
            disabled={hasUnavailableItems}
          />
        )}
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button autoFocus disabled={disableSave} onClick={handleSave}>
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MultiSelectModal;
