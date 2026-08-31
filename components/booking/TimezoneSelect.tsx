"use client";

import React from "react";
import { COMMON_TIMEZONES } from "../../lib/utils";

type Props = {
  value?: string;
  onChange: (v: string) => void;
};

export default function TimezoneSelect({ value, onChange }: Props) {
  return (
    <select
      value={value ?? "Africa/Lagos"}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border px-3 py-2"
      aria-label="Timezone"
    >
      <option value="">Select timezone</option>
      {COMMON_TIMEZONES.map((tz) => (
        <option key={tz} value={tz}>
          {tz}
        </option>
      ))}
    </select>
  );
}
