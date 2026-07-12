/* eslint-disable react/prop-types */

export default function SaveBar({ saveBar }) {
    const {
        formKey: saveBarFormKey,
        formRef: saveBarFormRef,
        triggerInputProps: saveBarTriggerInputProps,
        handleSubmit: handleSaveBarSubmit,
        handleDiscard: handleSaveBarDiscard,
    } = saveBar;

    return (
        <form
            key={saveBarFormKey}
            ref={saveBarFormRef}
            data-save-bar
            onSubmit={handleSaveBarSubmit}
            onReset={handleSaveBarDiscard}
        >
            {/* Start----Hidden checkbox dirty flag for Shopify data-save-bar */}
            <input {...saveBarTriggerInputProps} />
            {/* End----Hidden checkbox dirty flag for Shopify data-save-bar */}
        </form>
    )
}
