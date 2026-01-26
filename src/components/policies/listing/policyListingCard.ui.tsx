import React from "react";
import type { PolicyCategoryWithLayout } from "@/types/policies/policy-listing";

type PolicyCategoryId = PolicyCategoryWithLayout["id"];

export type PolicyListingCardUi = {
  cardClassName: string;
  titleClassName: string;
  descriptionClassName: string;
  iconTileClassName: string;
  iconContentNode: React.ReactNode;
  iconOverlayNode: React.ReactNode;
  ctaButtonClassName: string;
  ctaTextClassName: string;
  extraDecorationClassName?: string;
};

const BASE_CARD =
  "w-full max-w-[368px] h-80 relative rounded-[10px] outline outline-1 outline-offset-[-1px] outline-[#94BCCA] overflow-hidden";

const BASE_TITLE =
  "absolute left-[14px] top-[122px] right-[14px] h-6 text-left text-white text-xl font-bold font-['Inter']";

const BASE_DESCRIPTION =
  "absolute left-[14px] top-[169px] right-[14px] h-14 text-stone-300 text-base font-bold font-['Inter'] leading-[18px]";

const BASE_CTA_BUTTON =
  "absolute left-[14px] top-[254px] z-10 px-3.5 py-1.5 bg-white rounded-[5px] outline outline-1 outline-offset-[-1px] outline-black inline-flex flex-col justify-center items-center gap-2.5 cursor-pointer";

const BASE_CTA_TEXT =
  "w-24 h-6 text-center text-sky-400 text-base font-bold font-['Inter']";

const BASE_ICON_TILE =
  "absolute left-5 top-[23px] w-20 h-20 px-6 py-5 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-black inline-flex flex-col justify-start items-start gap-2.5 overflow-hidden";

const ICON_CLASS_NAME = "w-[34px] h-[34px]";

const HEALTH_ICON = (
  <svg className={ICON_CLASS_NAME} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6">
    <path
      d="M12 20.5s-7-4.35-7-9.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7 4.3c0 4.85-7 9.2-7 9.2z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TRAVEL_ICON = (
  <svg className={ICON_CLASS_NAME} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6">
    <circle cx="12" cy="12" r="8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 12h16M12 4a13 13 0 0 0 0 16M12 4a13 13 0 0 1 0 16" strokeLinecap="round" />
  </svg>
);

const CRYPTO_ICON = (
  <svg className={ICON_CLASS_NAME} viewBox="24.5 22.5 28.5 31.33" fill="none" stroke="white" strokeWidth="2">
    <path
      d="M51.5 28.25C51.5 30.5972 45.7916 32.5 38.75 32.5C31.7084 32.5 26 30.5972 26 28.25M51.5 28.25C51.5 25.9028 45.7916 24 38.75 24C31.7084 24 26 25.9028 26 28.25M51.5 28.25V48.0833C51.5 49.2105 50.1567 50.2915 47.7656 51.0885C45.3745 51.8856 42.1315 52.3333 38.75 52.3333C35.3685 52.3333 32.1255 51.8856 29.7344 51.0885C27.3433 50.2915 26 49.2105 26 48.0833V28.25M26 38.1667C26 39.2938 27.3433 40.3748 29.7344 41.1719C32.1255 41.9689 35.3685 42.4167 38.75 42.4167C42.1315 42.4167 45.3745 41.9689 47.7656 41.1719C50.1567 40.3748 51.5 39.2938 51.5 38.1667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const VEHICLE_ICON = (
  <svg className={ICON_CLASS_NAME} viewBox="0 0 34 34" fill="none" stroke="white" strokeWidth="2">
    <path
      d="M26.9166 24.0832H29.75C30.6 24.0832 31.1666 23.5165 31.1666 22.6665V18.4165C31.1666 17.1415 30.175 16.0082 29.0416 15.7248C26.4916 15.0165 22.6666 14.1665 22.6666 14.1665C22.6666 14.1665 20.825 12.1832 19.55 10.9082C18.8416 10.3415 17.9916 9.9165 17 9.9165H7.08331C6.23331 9.9165 5.52498 10.4832 5.09998 11.1915L3.11665 15.2998C2.92905 15.847 2.83331 16.4214 2.83331 16.9998V22.6665C2.83331 23.5165 3.39998 24.0832 4.24998 24.0832H7.08331M26.9166 24.0832C26.9166 25.648 25.6481 26.9165 24.0833 26.9165C22.5185 26.9165 21.25 25.648 21.25 24.0832M26.9166 24.0832C26.9166 22.5184 25.6481 21.2498 24.0833 21.2498C22.5185 21.2498 21.25 22.5184 21.25 24.0832M7.08331 24.0832C7.08331 25.648 8.35184 26.9165 9.91665 26.9165C11.4815 26.9165 12.75 25.648 12.75 24.0832M7.08331 24.0832C7.08331 22.5184 8.35184 21.2498 9.91665 21.2498C11.4815 21.2498 12.75 22.5184 12.75 24.0832M12.75 24.0832H21.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PROPERTY_ICON = (
  <svg className={ICON_CLASS_NAME} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6">
    <path
      d="M4 11.5l8-6 8 6V19a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const POLICY_LISTING_CARD_UI_BY_ID: Record<PolicyCategoryId, PolicyListingCardUi> = {
  health: {
    cardClassName: BASE_CARD,
    titleClassName: BASE_TITLE,
    descriptionClassName: BASE_DESCRIPTION,
    iconTileClassName: `${BASE_ICON_TILE} bg-[#0f6a79]`,
    iconContentNode: HEALTH_ICON,
    iconOverlayNode: null,
    ctaButtonClassName: BASE_CTA_BUTTON,
    ctaTextClassName: BASE_CTA_TEXT,
  },

  travel: {
    cardClassName: BASE_CARD,
    titleClassName: BASE_TITLE,
    descriptionClassName: BASE_DESCRIPTION,
    iconTileClassName: `${BASE_ICON_TILE} bg-[#3a186f]`,
    iconContentNode: TRAVEL_ICON,
    iconOverlayNode: null,
    ctaButtonClassName: BASE_CTA_BUTTON,
    ctaTextClassName: BASE_CTA_TEXT,
  },

  crypto: {
    cardClassName: BASE_CARD,
    titleClassName: BASE_TITLE,
    descriptionClassName: BASE_DESCRIPTION,
    iconTileClassName: `${BASE_ICON_TILE} bg-[#0f537a]`,
    iconContentNode: CRYPTO_ICON,
    iconOverlayNode: null,
    ctaButtonClassName: BASE_CTA_BUTTON,
    ctaTextClassName: BASE_CTA_TEXT,
  },

  vehicle: {
    cardClassName: BASE_CARD,
    titleClassName: BASE_TITLE,
    descriptionClassName: BASE_DESCRIPTION,
    iconTileClassName: `${BASE_ICON_TILE} bg-[#375126]`,
    iconContentNode: VEHICLE_ICON,
    iconOverlayNode: null,
    ctaButtonClassName: BASE_CTA_BUTTON,
    ctaTextClassName: BASE_CTA_TEXT,
    extraDecorationClassName: "absolute left-[85px] top-[45px] w-8 h-8",
  },

  property: {
    cardClassName: BASE_CARD,
    titleClassName: BASE_TITLE,
    descriptionClassName: BASE_DESCRIPTION,
    iconTileClassName: `${BASE_ICON_TILE} bg-[#a78f2f]`,
    iconContentNode: PROPERTY_ICON,
    iconOverlayNode: null,
    ctaButtonClassName: BASE_CTA_BUTTON,
    ctaTextClassName: BASE_CTA_TEXT,
  },
};
