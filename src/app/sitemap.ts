import type { MetadataRoute } from "next";
import { BASE_URL } from "./lib/config/settings";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
      alternates: {
        languages: {
          en: `${BASE_URL}/en`,
          ja: `${BASE_URL}/ja`,
        },
      },
    },
    {
      url: `${BASE_URL}/ja`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
      alternates: {
        languages: {
          en: `${BASE_URL}/en`,
          ja: `${BASE_URL}/ja`,
        },
      },
    },
    {
      url: `${BASE_URL}/en/account`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/account`,
          ja: `${BASE_URL}/ja/account`,
        },
      },
    },
    {
      url: `${BASE_URL}/ja/account`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/account`,
          ja: `${BASE_URL}/ja/account`,
        },
      },
    },
    {
      url: `${BASE_URL}/en/account-closed`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/account-closed`,
          ja: `${BASE_URL}/ja/account-closed`,
        },
      },
    },
    {
      url: `${BASE_URL}/ja/account-closed`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/account-closed`,
          ja: `${BASE_URL}/ja/account-closed`,
        },
      },
    },
    {
      url: `${BASE_URL}/en/add`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/add`,
          ja: `${BASE_URL}/ja/add`,
        },
      },
    },
    {
      url: `${BASE_URL}/ja/add`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/add`,
          ja: `${BASE_URL}/ja/add`,
        },
      },
    },
    {
      url: `${BASE_URL}/en/add-to`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/add-to`,
          ja: `${BASE_URL}/ja/add-to`,
        },
      },
    },
    {
      url: `${BASE_URL}/ja/add-to`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/add-to`,
          ja: `${BASE_URL}/ja/add-to`,
        },
      },
    },
    {
      url: `${BASE_URL}/en/collection`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/collection`,
          ja: `${BASE_URL}/ja/collection`,
        },
      },
    },
    {
      url: `${BASE_URL}/ja/collection`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/collection`,
          ja: `${BASE_URL}/ja/collection`,
        },
      },
    },
    {
      url: `${BASE_URL}/en/dictionary`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/dictionary`,
          ja: `${BASE_URL}/ja/dictionary`,
        },
      },
    },
    {
      url: `${BASE_URL}/ja/dictionary`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/dictionary`,
          ja: `${BASE_URL}/ja/dictionary`,
        },
      },
    },
    {
      url: `${BASE_URL}/en/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/login`,
          ja: `${BASE_URL}/ja/login`,
        },
      },
    },
    {
      url: `${BASE_URL}/ja/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/login`,
          ja: `${BASE_URL}/ja/login`,
        },
      },
    },
    {
      url: `${BASE_URL}/en/sign-up`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/sign-up`,
          ja: `${BASE_URL}/ja/sign-up`,
        },
      },
    },
    {
      url: `${BASE_URL}/ja/sign-up`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/sign-up`,
          ja: `${BASE_URL}/ja/sign-up`,
        },
      },
    },
  ];
}
