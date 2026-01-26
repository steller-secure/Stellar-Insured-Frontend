export type PolicyCategoryId = "health" | "vehicle" | "property" | "travel" | "crypto";

export type PolicyCategoryIconKey = "heart" | "car" | "home" | "globe" | "database";

export type PolicyCategory = {
  id: PolicyCategoryId;
  title: string;
  description: string;
  icon: PolicyCategoryIconKey;
};

export type PolicyCategoryLayout = {
  leftPx: number;
  topPx: number;

  titleWidthClassName: string;

  titleLeftPx: number;

  iconTileClassName: string;

  iconTilePaddingClassName: string;

  iconSizePx: number;
};

export type PolicyCategoryWithLayout = PolicyCategory & { layout: PolicyCategoryLayout };
