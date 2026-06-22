"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
  selectClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import type { HrmAssetRecord } from "@/features/workspace/data/hrm-assets-demo";

export type AssetFormValues = {
  name: string;
  category: string;
  tag: string;
  serial: string;
  value: number;
  location: string;
  vendor: string;
};

const CATEGORIES = ["Laptop", "Phone", "Monitor", "Accessory", "Other"];

const EMPTY: AssetFormValues = {
  name: "",
  category: "Laptop",
  tag: "",
  serial: "",
  value: 0,
  location: "Mumbai HQ",
  vendor: "",
};

type Props = {
  open: boolean;
  suggestedTag: string;
  onClose: () => void;
  onSubmit: (values: AssetFormValues) => void;
};

export function AssetFormModal({ open, suggestedTag, onClose, onSubmit }: Props) {
  const [values, setValues] = useState<AssetFormValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof AssetFormValues, string>>>({});

  useEffect(() => {
    if (!open) return;
    setValues({ ...EMPTY, tag: suggestedTag });
    setErrors({});
  }, [open, suggestedTag]);

  const set = <K extends keyof AssetFormValues>(key: K, value: AssetFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<keyof AssetFormValues, string>> = {};
    if (!values.name.trim()) next.name = "Give this asset a name";
    if (!values.tag.trim()) next.tag = "Asset tag is required";
    if (!values.serial.trim()) next.serial = "Serial number helps with audits";
    if (values.value <= 0) next.value = "Enter a book value greater than zero";
    if (!values.location.trim()) next.location = "Where is this asset stored?";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit(values);
    onClose();
  };

  return (
    <EnterpriseFormModal open={open} title="Register new asset" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-500">
          Add equipment to your register. You can assign a custodian after saving.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Asset name" htmlFor="asset-name" error={errors.name}>
            <input
              id="asset-name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder='e.g. MacBook Pro 14"'
              className={inputClassName}
            />
          </FormField>
          <FormField label="Category" htmlFor="asset-category">
            <select
              id="asset-category"
              value={values.category}
              onChange={(e) => set("category", e.target.value)}
              className={selectClassName}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Asset tag" htmlFor="asset-tag" error={errors.tag}>
            <input id="asset-tag" value={values.tag} onChange={(e) => set("tag", e.target.value)} className={inputClassName} />
          </FormField>
          <FormField label="Serial number" htmlFor="asset-serial" error={errors.serial}>
            <input id="asset-serial" value={values.serial} onChange={(e) => set("serial", e.target.value)} className={inputClassName} />
          </FormField>
          <FormField label="Book value (INR)" htmlFor="asset-value" error={errors.value}>
            <input
              id="asset-value"
              type="number"
              value={values.value || ""}
              onChange={(e) => set("value", Number(e.target.value) || 0)}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Location" htmlFor="asset-location" error={errors.location}>
            <input id="asset-location" value={values.location} onChange={(e) => set("location", e.target.value)} className={inputClassName} />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Vendor (optional)" htmlFor="asset-vendor">
              <input id="asset-vendor" value={values.vendor} onChange={(e) => set("vendor", e.target.value)} className={inputClassName} />
            </FormField>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#191970] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12124a]"
          >
            Add to register
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}

export function assetFormToRecord(values: AssetFormValues, id: string): HrmAssetRecord {
  return {
    id,
    name: values.name.trim(),
    tag: values.tag.trim(),
    category: values.category,
    custodian: "—",
    custodianRole: "—",
    department: "—",
    serial: values.serial.trim(),
    value: values.value,
    currency: "INR",
    condition: "Good",
    location: values.location.trim(),
    status: "available",
    custodyRisk: "Low",
    issuedAt: "—",
    vendor: values.vendor.trim() || undefined,
    purchaseDate: new Date().toLocaleDateString(undefined, { month: "short", year: "numeric" }),
    specs: [],
    notes: "Newly registered · assign custodian when ready",
  };
}
