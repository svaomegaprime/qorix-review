import { useEffect } from "react";

export default function SupportBox() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("tawk-script")) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.id = "tawk-script";
    script.async = true;
    script.src = "https://embed.tawk.to/6a24f3df76fe291c2c566cbf/1jqg5h984";
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    document.body.appendChild(script);
  }, []);

  return null;
}