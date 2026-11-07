
import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({
  title = "FreshCart | Fresh Groceries Online",
  description = "Shop fresh fruits, vegetables, dairy products and daily essentials online at FreshCart. Enjoy great offers and convenient grocery shopping.",
  image = "/og-image.jpg",
  url = "https://your-domain.com/",
  noIndex = false,
}) => {
  const siteUrl = "https://your-domain.com";
  const canonicalUrl = new URL(url, siteUrl).href;
  const imageUrl = new URL(image, siteUrl).href;

  return (
    <Helmet>
      <title>{title}</title>

      <meta name="description" content={description} />

      <meta
        name="robots"
        content={noIndex ? "noindex, nofollow" : "index, follow"}
      />

      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="FreshCart" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

export default SEO;
