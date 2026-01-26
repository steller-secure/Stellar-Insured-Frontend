import { PolicyCategoryId, PolicyCategoryLayout } from "@/types/policies/policy-listing";

export const POLICY_CATEGORY_LAYOUT: Record<PolicyCategoryId, PolicyCategoryLayout> = {
  health: {
    leftPx: 163,
    topPx: 302,
    titleWidthClassName: "w-56",
    titleLeftPx: -17,
    iconTileClassName: "bg-cyan-800 border border-black",
    iconTilePaddingClassName: "",
    iconSizePx: 34,
  },
  vehicle: {
    leftPx: 559,
    topPx: 302,
    titleWidthClassName: "w-60",
    titleLeftPx: -17,
    iconTileClassName: "bg-stone-700 outline outline-1 outline-offset-[-1px] outline-black",
    iconTilePaddingClassName: "px-6 py-5",
    iconSizePx: 34,
  },
  property: {
    leftPx: 964,
    topPx: 302,
    titleWidthClassName: "w-60",
    titleLeftPx: -5,
    iconTileClassName: "bg-stone-700 outline outline-1 outline-offset-[-1px] outline-black",
    iconTilePaddingClassName: "px-6 py-5",
    iconSizePx: 34,
  },
  travel: {
    leftPx: 163,
    topPx: 645,
    titleWidthClassName: "w-56",
    titleLeftPx: -17,
    iconTileClassName: "bg-purple-950 outline outline-1 outline-offset-[-1px] outline-black",
    iconTilePaddingClassName: "",
    iconSizePx: 34,
  },
  crypto: {
    leftPx: 559,
    topPx: 645,
    titleWidthClassName: "w-64",
    titleLeftPx: 5,
    iconTileClassName: "bg-cyan-800 outline outline-1 outline-offset-[-1px] outline-black",
    iconTilePaddingClassName: "",
    iconSizePx: 34,
  },
};
