import { faker } from "@faker-js/faker";

export type NewsLanguage =
  | "ar"
  | "de"
  | "en"
  | "es"
  | "fr"
  | "he"
  | "it"
  | "nl"
  | "no"
  | "pt"
  | "ru"
  | "sv"
  | "ud"
  | "zh";

export type NewsSortBy = "relevancy" | "popularity" | "publishedAt";

export type NewsSearchField = "title" | "description" | "content";

export type EverythingParams = {
  q?: string;
  searchIn?: string;
  sources?: string;
  domains?: string;
  excludeDomains?: string;
  from?: string;
  to?: string;
  language?: NewsLanguage;
  sortBy?: string;
  pageSize?: number;
  page?: number;
};

export type EverythingTestData = {
  testName: string;
  params: EverythingParams;
  expectedStatus: number;
  expectedApiStatus: "ok" | "error";
  expectArticles: boolean;
  expectedErrorCode?: string;
};

function getIsoDate(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);

  return date.toISOString().split("T")[0];
}

const today = getIsoDate(0);
const yesterday = getIsoDate(-1);
const sevenDaysAgo = getIsoDate(-7);
const fourteenDaysAgo = getIsoDate(-14);
const tomorrow = getIsoDate(1);

faker.seed(12345);

const keyword = (): string =>
  faker.helpers.arrayElement([
    "Apple",
    "Microsoft",
    "Google",
    "technology",
    "business",
    "artificial intelligence",
  ]);

export const everythingTestData: EverythingTestData[] = [
  {
    testName: "search Apple news published today",
    params: {
      q: "Apple",
      from: today,
      to: today,
      sortBy: "publishedAt",
      pageSize: 10,
    },
    expectedStatus: 200,
    expectedApiStatus: "ok",
    expectArticles: false,
  },

  {
    testName: "search technology news published yesterday",
    params: {
      q: "technology",
      from: yesterday,
      to: yesterday,
      sortBy: "popularity",
      pageSize: 10,
    },
    expectedStatus: 200,
    expectedApiStatus: "ok",
    expectArticles: false,
  },

  {
    testName: "search news from the last seven days",
    params: {
      q: keyword(),
      from: sevenDaysAgo,
      to: today,
      sortBy: "relevancy",
      pageSize: 20,
    },
    expectedStatus: 200,
    expectedApiStatus: "ok",
    expectArticles: true,
  },

  {
    testName: "search keyword only in article titles",
    params: {
      q: "Apple",
      searchIn: "title",
      from: sevenDaysAgo,
      to: today,
      language: "en",
      pageSize: 10,
    },
    expectedStatus: 200,
    expectedApiStatus: "ok",
    expectArticles: false,
  },

  {
    testName: "search keyword in title and description",
    params: {
      q: "technology",
      searchIn: "title,description",
      from: fourteenDaysAgo,
      to: today,
      sortBy: "publishedAt",
      pageSize: 15,
    },
    expectedStatus: 200,
    expectedApiStatus: "ok",
    expectArticles: true,
  },

  {
    testName: "search news from specific domains",
    params: {
      q: "technology",
      domains: "techcrunch.com,engadget.com",
      from: fourteenDaysAgo,
      to: today,
      sortBy: "publishedAt",
      pageSize: 20,
    },
    expectedStatus: 200,
    expectedApiStatus: "ok",
    expectArticles: false,
  },

  {
    testName: "exclude a domain from search results",
    params: {
      q: "technology",
      excludeDomains: "bbc.co.uk",
      from: sevenDaysAgo,
      to: today,
      language: "en",
      pageSize: 20,
    },
    expectedStatus: 200,
    expectedApiStatus: "ok",
    expectArticles: true,
  },

  {
    testName: "use advanced boolean search syntax",
    params: {
      q: "crypto AND (ethereum OR litecoin) NOT bitcoin",
      from: sevenDaysAgo,
      to: today,
      sortBy: "relevancy",
      pageSize: 10,
    },
    expectedStatus: 200,
    expectedApiStatus: "ok",
    expectArticles: false,
  },

  {
    testName: "search the second page of results",
    params: {
      q: "Google",
      from: sevenDaysAgo,
      to: today,
      pageSize: 5,
      page: 2,
    },
    expectedStatus: 200,
    expectedApiStatus: "ok",
    expectArticles: false,
  },

  {
    testName: "search using maximum page size",
    params: {
      q: "technology",
      from: sevenDaysAgo,
      to: today,
      pageSize: 100,
    },
    expectedStatus: 200,
    expectedApiStatus: "ok",
    expectArticles: true,
  },

  {
    testName: "search news using future date",
    params: {
      q: "Apple",
      from: tomorrow,
      to: tomorrow,
      sortBy: "publishedAt",
      pageSize: 10,
    },
    expectedStatus: 200,
    expectedApiStatus: "ok",
    expectArticles: false,
  },

  {
    testName: "reject page number less than one",
    params: {
      q: "Apple",
      page: 0,
      pageSize: 10,
    },
    expectedStatus: 400,
    expectedApiStatus: "error",
    expectArticles: false,
    expectedErrorCode: "pageCannotBeLessThanOne",
  },

  {
    testName: "reject page size greater than one hundred",
    params: {
      q: "Apple",
      pageSize: 101,
    },
    expectedStatus: 400,
    expectedApiStatus: "error",
    expectArticles: false,
    expectedErrorCode: "pageSizeTooBig",
  },

  {
    testName: "reject request without search criteria",
    params: {
      from: yesterday,
      to: today,
      pageSize: 10,
    },
    expectedStatus: 400,
    expectedApiStatus: "error",
    expectArticles: false,
    expectedErrorCode: "parametersMissing",
  },
];
