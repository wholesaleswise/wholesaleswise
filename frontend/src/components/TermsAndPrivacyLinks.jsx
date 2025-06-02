import React from "react";

const TermsAndPrivacyLinks = () => {
  return (
    <div className="text-center mt-8 text-xs text-muted-foreground px-4 md:px-6 ">
      By clicking continue, you agree to our
      <a target="_blank" href="/terms-condition" className=" mx-1 text-primary">
        Terms of Service
      </a>
      and
      <a target="_blank" href="/privacy-policy" className=" ml-1 text-primary">
        Privacy Policy
      </a>
      .
    </div>
  );
};

export default TermsAndPrivacyLinks;
