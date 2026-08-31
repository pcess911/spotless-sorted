"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
};

export default function BookingDatePicker({ selected, onChange, minDate }: Props) {
  const [startDate, setStartDate] = useState<Date | null>(selected ?? null);

  return (
    <DatePicker
      selected={startDate}
      onChange={(date) => {
        setStartDate(date);
        onChange(date);
      }}
      minDate={minDate ?? new Date()}
      placeholderText="Select a date"
      className="w-full rounded-md border px-3 py-2"
      dateFormat="yyyy-MM-dd"
    />
  );
}
