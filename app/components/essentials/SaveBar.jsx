/* eslint-disable react/prop-types */
import { DEFAULT_SAVE_BAR_ID } from "../../hooks/useSaveBarForm.js";

export default function SaveBar({
  onSave,
  onDiscard,
  id = DEFAULT_SAVE_BAR_ID,
  saving = false,
}) {
  return (
    <ui-save-bar id={id}>
      <button
        onClick={onSave}
        variant="primary"
        id="save-button"
        disabled={saving}
      >
        Save
      </button>
      <button onClick={onDiscard} id="discard-button" disabled={saving}>
        Discard
      </button>
    </ui-save-bar>
  );
}
