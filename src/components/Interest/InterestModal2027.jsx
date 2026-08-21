import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AuthField from "../Registration/AuthField";
import GradientBorder from "../Registration/GradientBorder";
import {
  MISSISSAUGA_HIGH_SCHOOLS,
  SCHOOL_OTHER,
} from "../../data/mississaugaSchools";
import { addInterest2027 } from "../../tools/firebase";

const GRADES = ["9", "10", "11", "12", "Other"];

const inputClass =
  "w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50";

const selectClass = `${inputClass} appearance-none cursor-pointer pr-10 bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat`;

const CHEVRON_BG = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
};

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/** Classes swap, structure doesn't — see the note in AuthField.jsx. */
function RedGradientBorder({ active, children }) {
  return (
    <div
      className={
        active
          ? "relative rounded-lg p-[2px] bg-gradient-to-r from-red-500 via-red-600 to-rose-600"
          : ""
      }
    >
      <div
        className={
          active ? "relative z-10 rounded-[6px] bg-gray-950 overflow-hidden" : ""
        }
      >
        {children}
      </div>
    </div>
  );
}

function SelectField({ label, id, value, onChange, options, placeholder, error, children }) {
  const select = (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={selectClass}
      style={CHEVRON_BG}
    >
      <option value="" className="bg-gray-900 text-white">
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-gray-900 text-white">
          {opt}
        </option>
      ))}
    </select>
  );

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-white/90 mb-1">
        {label}
        <span className="text-purple-400"> *</span>
        {error && <span className="text-red-400"> required</span>}
      </label>
      <RedGradientBorder active={error}>
        {select}
        {children}
      </RedGradientBorder>
    </div>
  );
}

export default function InterestModal2027({ onClose }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    grade: "",
    school: "",
    otherSchool: "",
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const firstFieldRef = useRef(null);

  const update = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const schoolValue =
    form.school === SCHOOL_OTHER ? form.otherSchool.trim() : form.school;

  const errors = {
    fullName: !form.fullName.trim(),
    email: !isEmail(form.email),
    grade: !form.grade,
    school: !schoolValue,
  };
  const isValid = !Object.values(errors).some(Boolean);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!isValid || status === "submitting") return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      await addInterest2027({
        fullName: form.fullName,
        email: form.email,
        grade: form.grade,
        school: schoolValue,
      });
      setStatus("success");
    } catch (err) {
      // Rules failures and outages are ours to fix, not the visitor's to read.
      console.error("interest2027 signup failed", err);
      setStatus("error");
      setErrorMessage(
        "We couldn't save that right now. Please try again in a moment.",
      );
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="interest-2027-title"
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <GradientBorder className="w-full">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-4 z-20 text-2xl leading-none text-white/60 hover:text-white"
          >
            &times;
          </button>

          {status === "success" ? (
            <div className="text-center text-white">
              <h2 id="interest-2027-title" className="text-2xl font-bold mb-2">
                You're on the list!
              </h2>
              <p className="text-white/70 mb-6">
                We'll email you at{" "}
                <span className="text-fuchsia-200">{form.email.trim()}</span>{" "}
                when FraserHacks 2027 details go live.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-white text-black font-bold hover:bg-white/90"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <h2
                id="interest-2027-title"
                className="text-2xl md:text-3xl font-bold text-white mb-1 text-center"
              >
                FraserHacks 2027
              </h2>
              <p className="text-sm text-white/60 mb-6 text-center">
                Interested in next year? Drop your info and we'll reach out
                first when registration opens.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <AuthField
                  label="Full name"
                  id="interest-full-name"
                  name="fullName"
                  ref={firstFieldRef}
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="John Doe"
                  /* Field lengths match the caps in firestore.rules. */
                  maxLength={120}
                  required
                  error={submitAttempted && errors.fullName}
                />
                <AuthField
                  label="Email"
                  id="interest-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  maxLength={200}
                  required
                  error={submitAttempted && errors.email}
                  errorMessage={
                    form.email.trim() ? "enter a valid email" : "required"
                  }
                />
                <SelectField
                  label="Grade"
                  id="interest-grade"
                  value={form.grade}
                  onChange={(v) => update("grade", v)}
                  options={GRADES}
                  placeholder="Select your grade"
                  error={submitAttempted && errors.grade}
                />
                <SelectField
                  label="School"
                  id="interest-school"
                  value={form.school}
                  onChange={(v) => update("school", v)}
                  options={MISSISSAUGA_HIGH_SCHOOLS}
                  placeholder="Select your school"
                  error={submitAttempted && errors.school}
                >
                  {form.school === SCHOOL_OTHER && (
                    <input
                      type="text"
                      value={form.otherSchool}
                      onChange={(e) => update("otherSchool", e.target.value)}
                      placeholder="Please specify school name"
                      aria-label="School name (other)"
                      maxLength={120}
                      className={`${inputClass} mt-2`}
                    />
                  )}
                </SelectField>

                {status === "error" && (
                  <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full py-2 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "submitting" ? "Sending..." : "Count me in"}
                </button>
              </form>
            </>
          )}
        </GradientBorder>
      </div>
    </div>,
    document.body,
  );
}
