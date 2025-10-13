export type Banner = {
  id: string;
  image: string | null;
  alt: string;
  fit?: "contain" | "cover";
};

export const BANNERS: Banner[] = [
  {
    id: "dubai-chocolate",
    image: "/images/banners/Dubai Chocolate.png",
    alt: "Dubai chocolate pizza banner",
    fit: "contain",
  },
  {
    id: "mint-chocolate",
    image: "/images/banners/Mint Chocolate.png",
    alt: "Mint chocolate pizza banner",
    fit: "contain",
  },
  {
    id: "rum-raisins",
    image: "/images/banners/Rum.png",
    alt: "Rum raisin celebration banner",
    fit: "contain",
  },
];
