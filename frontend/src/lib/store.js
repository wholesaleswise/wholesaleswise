import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "./services/auth";
import { productApi } from "./services/product";
import { categoryApi } from "./services/category";
import cartApi from "./services/cart";
import { addressApi } from "./services/address";
import websiteInfoApi from "./services/websiteInfo";
import { bannerApi } from "./services/banner";
import socialLinkApi from "./services/socialLink";
import orderApi from "./services/order";
import termsConditionApi from "./services/termsCondition";
import privacyPolicyApi from "./services/privacyPolicy";
import contactApi from "./services/contact";
import aboutApi from "./services/about";
import { couponApi } from "./services/coupon";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [addressApi.reducerPath]: addressApi.reducer,
    [websiteInfoApi.reducerPath]: websiteInfoApi.reducer,
    [bannerApi.reducerPath]: bannerApi.reducer,
    [socialLinkApi.reducerPath]: socialLinkApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [termsConditionApi.reducerPath]: termsConditionApi.reducer,
    [privacyPolicyApi.reducerPath]: privacyPolicyApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [aboutApi.reducerPath]: aboutApi.reducer,
    [couponApi.reducerPath]: couponApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      productApi.middleware,
      categoryApi.middleware,
      cartApi.middleware,
      addressApi.middleware,
      websiteInfoApi.middleware,
      bannerApi.middleware,
      socialLinkApi.middleware,
      orderApi.middleware,
      termsConditionApi.middleware,
      privacyPolicyApi.middleware,
      contactApi.middleware,
      aboutApi.middleware,
      couponApi.middleware
    ),
});

setupListeners(store.dispatch);
