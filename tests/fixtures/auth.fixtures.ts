import {
  APIRequestContext,
  test as base,
  request as APIRequest,
} from "@playwright/test";

type Fixtures = {
  isAuthorized: boolean;
  nonAuthRequest: APIRequestContext;
  user: string;
};

export const test = base.extend<Fixtures>({
  isAuthorized: true,
  user: process.env.CONDUIT_EMAIL,
  request: async ({ request, isAuthorized, user }, use) => {
    if (isAuthorized === true) {
      // отримаємо токен
      const token = await getToken(request, user);

      // const isValid = await isTokenValid(request, token);

      // створюємо новий контекст реквесту
      const req = await APIRequest.newContext({
        extraHTTPHeaders: {
          Authorization: `Token ${token}`,
        },
      });

      // повертаємо новий контекст
      await use(req);
    } else {
      await use(request);
    }
  },
  nonAuthRequest: async ({ request }, use) => {
    await use(request);
  },
});
