export type Banner = {
  id: string;
  image: string | null;
  alt: string;
  fit?: "contain" | "cover";
};

export const BANNERS: Banner[] = [
  {
    id: "deluxe mixed pizza",
    image: "/images/banners/Deluxe Mixed Pizza.png",
    alt: "Deluxe mixed pizza banner",
    fit: "contain",
  },
  {
    id: "island delight pizza",
    image: "/images/banners/Island Delight Pizza.png",
    alt: "Island delight pizza banner",
    fit: "contain",
  },
  {
    id: "double pepperoni",
    image: "/images/banners/Double Pepperroni Pizza.png",
    alt: "Double pepperoni banner",
    fit: "contain",
  },
];
