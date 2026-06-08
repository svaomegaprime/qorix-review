import { useCallback, useRef, useState } from "react";

const DEFAULT_TRIGGER_NAME = "saveBarChangeTrigger";
const DEFAULT_TRIGGER_VALUE = "changed";

const getSaveBarFormData = (form) => (
    Object.fromEntries(new FormData(form).entries())
);

export function useSaveBarTrigger({
    triggerName = DEFAULT_TRIGGER_NAME,
    triggerValue = DEFAULT_TRIGGER_VALUE,
    onSubmit,
    onDiscard,
} = {}) {
    const [formVersion, setFormVersion] = useState(0);
    const formRef = useRef(null);
    const triggerRef = useRef(null);
    const resetSourceRef = useRef(null);

    const rearmForm = useCallback(() => {
        window.setTimeout(() => {
            setFormVersion((version) => version + 1);
        }, 0);
    }, []);

    const cleanForm = useCallback((form, source) => {
        resetSourceRef.current = source;
        form.reset();
        resetSourceRef.current = null;
        rearmForm();
    }, [rearmForm]);

    const triggerChange = useCallback(() => {
        const triggerCheckbox = triggerRef.current;

        if (!triggerCheckbox) {
            return;
        }

        triggerCheckbox.checked = true;
        triggerCheckbox.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        triggerCheckbox.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }, []);

    const handleSubmit = useCallback((event) => {
        event.preventDefault();

        const formData = getSaveBarFormData(event.currentTarget);
        onSubmit?.(formData, event);

        cleanForm(event.currentTarget, "save");
    }, [cleanForm, onSubmit]);

    const handleDiscard = useCallback((event) => {
        if (resetSourceRef.current === "save") {
            return;
        }

        const formData = getSaveBarFormData(event.currentTarget);
        onDiscard?.(formData, event);

        rearmForm();
    }, [onDiscard, rearmForm]);

    const triggerSubmit = useCallback(() => {
        formRef.current?.requestSubmit();
    }, []);

    const triggerDiscard = useCallback(() => {
        formRef.current?.reset();
    }, []);

    return {
        formKey: formVersion,
        formRef,
        triggerRef,
        triggerInputProps: {
            ref: triggerRef,
            type: "checkbox",
            name: triggerName,
            value: triggerValue,
            defaultChecked: false,
            hidden: true,
        },
        triggerChange,
        triggerSubmit,
        triggerDiscard,
        handleSubmit,
        handleDiscard,
    };
}
