import React from "react";
import FormSelect from "../Form/FormSelect";

const Filter = ({
  options = [],
  value = "",
  onChange,
  placeholder = "Select",
}) => {
  const formattedOptions = options.map((option) => ({
    value: option,
    label: option,
  }));

  const handleChange = (event) => {
    onChange?.(event.target.value);
  };

  return (
    <FormSelect
      name="filter"
      value={value}
      onChange={handleChange}
      options={formattedOptions}
      placeholder={placeholder}
    />
  );
};

export default Filter;