"use client";

import React from "react";

type Props = {
  value?: string;
  onChange: (v: string) => void;
  startHour?: number;
  endHour?: number;
  stepMinutes?: number;
};

function buildTimes(startHour = 6, endHour = 20, step = 30) {
  const times: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += step) {
      const hh = `${h}`.padStart(2, "0");
      const mm = `${m}`.padStart(2, "0");
      times.push(`${hh}:${mm}`);
    }
  }
  return times;
}

export default function TimePicker({ value, onChange, startHour = 8, endHour = 18, stepMinutes = 30 }: Props) {
  const times = buildTimes(startHour, endHour, stepMinutes);

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border px-3 py-2"
      aria-label="Preferred time"
    >
      <option value="">Select a time</option>
      {times.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
