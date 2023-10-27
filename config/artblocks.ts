export const artblocks = [
  {
    slug: "chromie-squiggle-by-snowfro",
    address: "0x059edd72cd353df5106d2b9cc5ab83a52287ac3a",
  },
  {
    slug: "genesis-by-dca",
    address: "0x059edd72cd353df5106d2b9cc5ab83a52287ac3a",
  },
  {
    slug: "construction-token-by-jeff-davis",
    address: "0x059edd72cd353df5106d2b9cc5ab83a52287ac3a",
  },
  {
    slug: "cryptoblots-by-daim-aggott-honsch",
    address: "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270",
  },
];

export const getAddressOfArtBlock = (slug = "") => {
  const artItem = artblocks.find((item) => item.slug == slug);
  if (artItem) {
    return artItem.address;
  } else {
    return "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270";
  }
};
