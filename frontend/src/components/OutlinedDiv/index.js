import React from "react";

import TextField from "@mui/material/TextField";

const InputComponent = ({ inputRef, ...other }) => <div {...other} />;

const OutlinedDiv = ({
  InputProps,
  children,
  InputLabelProps,
  label,
  ...other
}) => {
  return (
    <TextField
      {...other}
      variant="outlined"
      label={label}
      multiline
      slotProps={{
        input: {
          inputComponent: InputComponent,
          ...InputProps
        },
        htmlInput: { children: children },
        inputLabel: { shrink: true, ...InputLabelProps }
      }}
    />
  );
};

export default OutlinedDiv;