export const GA_TRACKING_ID = `${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`;

export const loadGA = () => {
  if (typeof window === "undefined") return;

  if (document.getElementById("ga-script")) return;

  const script1 = document.createElement("script");
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  script1.async = true;
  script1.id = "ga-script";
  document.head.appendChild(script1);

  const script2 = document.createElement("script");
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_TRACKING_ID}', {
      page_path: window.location.pathname,
    });
  `;
  document.head.appendChild(script2);
};

export const pageview = (url) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
};
