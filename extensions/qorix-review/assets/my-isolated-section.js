(() => {
  const elementName = "qorix-review-hub-widget";

  class QorixReviewHubWidget extends HTMLElement {
    connectedCallback() {
      this.applyLayoutWidth();
      this.attachShadowRoot();
      this.initializeAlpine();
      queueMicrotask(() => this.applyLayoutWidth());
    }

    applyLayoutWidth() {
      this.style.setProperty("display", "block", "important");
      this.style.setProperty("width", "100%", "important");
      this.style.setProperty("max-width", "100%", "important");
      this.style.setProperty("min-width", "0", "important");

      const parent = this.parentElement;
      if (parent) {
        parent.style.setProperty("display", "block", "important");
        parent.style.setProperty("width", "100%", "important");
        parent.style.setProperty("max-width", "100%", "important");
        parent.style.setProperty("min-width", "0", "important");
        parent.style.setProperty("box-sizing", "border-box", "important");
      }

      const appBlock = this.closest(".shopify-app-block");
      if (appBlock) {
        // appBlock.style.setProperty("display", "block", "important");
        // appBlock.style.setProperty("width", "100%", "important");
        // appBlock.style.setProperty("max-width", "100%", "important");
        // appBlock.style.setProperty("min-width", "0", "important");
        // appBlock.style.setProperty("box-sizing", "border-box", "important");
      }
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
