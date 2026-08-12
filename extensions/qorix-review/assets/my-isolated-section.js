(() => {
  const elementName = "qorix-review-hub-widget";

  class QorixReviewHubWidget extends HTMLElement {
    connectedCallback() {
      this.attachShadowRoot();
      this.initializeAlpine();
    }

    attachShadowRoot() {
      if (this.shadowRoot) return;

      const shadow = this.attachShadow({ mode: "open" });
      shadow.append(...this.childNodes);
    }

    initializeAlpine() {
      if (this.alpineInitialized || !this.shadowRoot || !window.Alpine) return;

      window.Alpine.initTree(this.shadowRoot);
      this.alpineInitialized = true;
    }
  }

  const initializeSections = () => {
    document.querySelectorAll(elementName).forEach((section) => {
      section.initializeAlpine();
    });
  };

  document.addEventListener("alpine:init", initializeSections);
  document.addEventListener("alpine:initialized", initializeSections);

  if (!customElements.get(elementName)) {
    customElements.define(elementName, QorixReviewHubWidget);
  }

  if (window.Alpine) {
    queueMicrotask(initializeSections);
  }
})();
