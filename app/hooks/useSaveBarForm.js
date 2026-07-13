import { useCallback, useEffect, useRef, useState } from "react";

export const DEFAULT_SAVE_BAR_ID = "leave-confirm-save-bar";

function serialize(value) {
  return JSON.stringify(value ?? null);
}

function setSaveBarVisibility(id, visible) {
  if (typeof shopify === "undefined" || !shopify.saveBar) return;
  const operation = visible ? shopify.saveBar.show : shopify.saveBar.hide;
  operation.call(shopify.saveBar, id);
}

/**
 * Own the saved baseline and Shopify save-bar lifecycle for a controlled form.
 *
 * @param {{
 *   value: any,
 *   initialValue: any,
 *   fetcher: { state: string, data?: any },
 *   onSave: (value: any) => void,
 *   onDiscard: (savedValue: any) => void,
 *   getSavedValue?: (data: any, submittedValue: any) => any,
 *   onSaved?: (savedValue: any) => void,
 *   id?: string,
 * }} options
 */
export function useSaveBarForm({
  value,
  initialValue,
  fetcher,
  onSave,
  onDiscard,
  getSavedValue,
  onSaved,
  id = DEFAULT_SAVE_BAR_ID,
}) {
  const [savedValue, setSavedValue] = useState(initialValue);
  const submittedValueRef = useRef(value);
  const handlersRef = useRef({ onSave, onDiscard, getSavedValue, onSaved });
  handlersRef.current = { onSave, onDiscard, getSavedValue, onSaved };

  const initialSignature = serialize(initialValue);
  const valueSignature = serialize(value);
  const savedSignature = serialize(savedValue);
  const isDirty = valueSignature !== savedSignature;

  useEffect(() => {
    setSavedValue(initialValue);
  }, [initialSignature]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSaveBarVisibility(id, isDirty);
    return () => setSaveBarVisibility(id, false);
  }, [id, isDirty]);

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data?.ok) return;

    const submittedValue = submittedValueRef.current;
    const nextSavedValue = handlersRef.current.getSavedValue
      ? handlersRef.current.getSavedValue(fetcher.data, submittedValue)
      : submittedValue;

    setSavedValue(nextSavedValue);
    handlersRef.current.onSaved?.(nextSavedValue);
    setSaveBarVisibility(id, false);
  }, [fetcher.state, fetcher.data, id]);

  const handleSave = useCallback(() => {
    submittedValueRef.current = value;
    handlersRef.current.onSave(value);
  }, [value]);

  const handleDiscard = useCallback(() => {
    handlersRef.current.onDiscard(savedValue);
    setSaveBarVisibility(id, false);
  }, [id, savedValue]);

  return { handleDiscard, handleSave, isDirty, savedValue };
}
