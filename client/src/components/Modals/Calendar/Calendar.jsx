import React, { useState, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./customDatePicker.css";
import { format, isToday, isTomorrow, isYesterday, isSameDay } from "date-fns";
import styles from "./Calendar.module.css";
import sprite from "../../DashboardForm/SvgIcon";
import SvgIcon from "../../DashboardForm/SvgIcon";

export const Calendar = ({ deadline, setDeadline }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const CustomInput = forwardRef(({ value: formattedDate, onClick }, ref) => {
    const displayValue = getDisplayValue(deadline, formattedDate);

    return (
      <button
        type="button"
        className={`${styles.customInput} ${isCalendarOpen ? styles.active : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onClick(e);
        }}
        ref={ref}
      >
        {displayValue}
        <div className={`${styles.arrowIcon} ${isCalendarOpen ? styles.open : ""}`}>
          <SvgIcon iconName="icon-chevron-down" className={styles.arrow} />
        </div>
      </button>
    );
  });

  const getDisplayValue = (date, formattedDate) => {
    if (isToday(date)) {
      return `Today, ${formattedDate}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow, ${formattedDate}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${formattedDate}`;
    } else {
      const dayOfWeek = format(date, "EEEE");
      return `${dayOfWeek}, ${formattedDate}`;
    }
  };

  const isPastDate = (date) => {
    const today = new Date();
    return date < today.setHours(0, 0, 0, 0);
  };

  const isSameCalendarDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Yeni dayClassName
  const getDayClassName = (date) => {
    if (isPastDate(date)) return "react-datepicker__day--disabled";
    if (deadline && isSameCalendarDay(date, deadline)) return "react-datepicker__day--selected";
    return undefined;
  };

  return (
    <DatePicker
      selected={deadline}
      dateFormat="MMMM d"
      onChange={(date) => setDeadline(date)}
      customInput={<CustomInput />}
      minDate={new Date()}
      dayClassName={getDayClassName}
      onCalendarOpen={() => setIsCalendarOpen(true)}
      onCalendarClose={() => setIsCalendarOpen(false)}
    />
  );
};
