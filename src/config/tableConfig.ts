import type { CardConfig } from "../config/types";

export const tableConfigs: CardConfig[] = [
  {
    id: "table01",
    type: "table",
    size: "xxl",
    rowSpan: 4,
    csvUrl:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQLjue9MJvewUb1ZK7TZ4XgVjM0vRsfb07tPzDTbkGWNzfWAtLfY-NsRHZv5W-HM9W87vorat1fGnz8/pub?gid=1082926189&single=true&output=csv",
    showCardHeader: true,
    showCardHeaderBorder: true,
    showCardActionButton: false,
    showDropdownMenu: false,
    showTotal: false,
    showTrend: false,
    parserType: "table",
  },

  {
    id: "creativesCard",
    type: "creative",
    size: "xxl",
    rowSpan: 3,
    csvUrl: "undefined",
    showCardHeader: true,
    showCardHeaderBorder: false,
    showCardActionButton: false,
    showDropdownMenu: false,
    showTotal: false,
    showTrend: false,
    thumbnailUrls: [
      "https://hzhstorage.blob.core.windows.net/digital-import/input/7736041479/14.jpg?sv=2018-03-28&sr=b&sig=ux8oogH1u%2BBDqA5Leqbw8C0QVT6gK%2B1uNa3rEzF16BI%3D&se=2025-08-05T23%3A24%3A56Z&sp=r",
      "https://hzhstorage.blob.core.windows.net/digital-import/input/7741685766/9.jpg?sv=2018-03-28&sr=b&sig=JEjfhAMTDPrDZ6sKOIeeMSZvutVF6QevIWT75MrfPlg%3D&se=2025-08-05T23%3A24%3A56Z&sp=r",
      "https://hzhstorage.blob.core.windows.net/digital-import/input/7741805009/9.jpg?sv=2018-03-28&sr=b&sig=cvkqYeY67gFN00nfs6fl8CDM11YBdzgHOGpeQFhYtf0%3D&se=2025-08-05T23%3A24%3A56Z&sp=r",
      "https://hzhstorage.blob.core.windows.net/digital-import/input/7747341859/7747341859.jpeg?sv=2018-03-28&sr=b&sig=u5jmiE4ixYIp%2F2zN2jQvoKbDveVptiTbYX4b8A%2FSBqo%3D&se=2025-08-05T23%3A24%3A56Z&sp=r",
      "https://hzhstorage.blob.core.windows.net/digital-import/input/7741872694/6.jpg?sv=2018-03-28&sr=b&sig=Tl1LO2Gsji1PQzdTL%2FMOZhbDDxSt1BFHDHuG8iFZJuc%3D&se=2025-08-05T23%3A24%3A56Z&sp=r",
      "https://hzhstorage.blob.core.windows.net/tvcreativefiles/S1O4LR0O/15_full.jpg?sv=2018-03-28&sr=b&sig=FS1YIVK2bIkFjV%2FuAp9wt6cEwIlfZsx%2FD03DWO1bwh8%3D&se=2025-08-05T23%3A24%3A56Z&sp=r",
      "https://hzhstorage.blob.core.windows.net/tvcreativefiles/S9P5S9A2/13_full.jpg?sv=2018-03-28&sr=b&sig=ymzmQTdxaHXlOAIk%2F9zIYdFzmThvvNjBi3QrKLbPA1k%3D&se=2025-08-05T23%3A24%3A56Z&sp=r",
      "https://hzhstorage.blob.core.windows.net/tvcreativefiles/SFP7R87U/14_full.jpg?sv=2018-03-28&sr=b&sig=4blVvDXtH%2FWndvTdWJ%2BJZE00iB81qRfo3FswXqYqadE%3D&se=2025-08-05T23%3A24%3A56Z&sp=r",
      "https://hzhstorage.blob.core.windows.net/tvcreativefiles/SEO55FV2/9_full.jpg?sv=2018-03-28&sr=b&sig=GMfUIs8SKpvKoDvIvtrOkkeEYndr7NtDsyieavg2yGQ%3D&se=2025-08-05T23%3A24%3A56Z&sp=r",
      "https://hzhstorage.blob.core.windows.net/tvcreativefiles/S5P7N9MS/9_full.jpg?sv=2018-03-28&sr=b&sig=ajcNCN9SFiGurWKkMRvMliHJNxc7q2fVTU9jjiXX9rQ%3D&se=2025-08-05T23%3A24%3A56Z&sp=r",
    ],
    mediaUrls: [
      "https://hzhstorage.blob.core.windows.net/digital-import/input/7736041479/7736041479.mp4?sv=2018-03-28&sr=b&sig=HrL43KMw9dPesz7N03lga2WmNVhC8awWYj4MnU8cyzQ%3D&se=2025-08-06T01%3A55%3A15Z&sp=r",

      "https://hzhstorage.blob.core.windows.net/digital-import/input/7741685766/7741685766.mp4?sv=2018-03-28&sr=b&sig=jEqsgUcL4d6gBMc%2FX0I6YkbNZElx4%2Ff%2FUulRM8JgCkc%3D&se=2025-08-06T02%3A46%3A39Z&sp=r",

      "https://hzhstorage.blob.core.windows.net/digital-import/input/7741805009/7741805009.mp4?sv=2018-03-28&sr=b&sig=zRT5KR%2BaA7PwKHy1v4kl1BrGF1wMxBvfPfvykRPu6N8%3D&se=2025-08-06T02%3A47%3A20Z&sp=r",

      "https://hzhstorage.blob.core.windows.net/digital-import/input/7747341859/7747341859.jpeg?sv=2018-03-28&sr=b&sig=IwPMtXAuJz0N2D2FGrpr7JzLhJFxbaDikekmvEcjn0I%3D&se=2025-08-06T02%3A53%3A07Z&sp=r",

      "https://hzhstorage.blob.core.windows.net/digital-import/input/7741872694/7741872694.mp4?sv=2018-03-28&sr=b&sig=peoJGG3mlgXCIk834HmjOAhbpF8DhUl1bb5DN5fQkdw%3D&se=2025-08-06T02%3A52%3A37Z&sp=r",

      "https://hzhstorage.blob.core.windows.net/tvcreativefiles/S1O4LR0O.mp4?sv=2018-03-28&sr=b&sig=1X1Lfs880HDWzwkO6jQKfVAu8ocwpM%2B4%2BqBQQfoEQjU%3D&se=2025-08-06T02%3A52%3A16Z&sp=r",

      "https://hzhstorage.blob.core.windows.net/tvcreativefiles/S9P5S9A2.mp4?sv=2018-03-28&sr=b&sig=ZM8d6wOyn853jCXQ33VWdQDZ1ZOQc6bIOv25e2ildZM%3D&se=2025-08-06T02%3A51%3A58Z&sp=r",

      "https://hzhstorage.blob.core.windows.net/tvcreativefiles/SFP7R87U.mp4?sv=2018-03-28&sr=b&sig=zy2RIeocijJPseHrMBWYfJrj1TE5xosUkz9SdMqnv74%3D&se=2025-08-06T02%3A51%3A21Z&sp=r",

      "https://hzhstorage.blob.core.windows.net/tvcreativefiles/SEO55FV2.mp4?sv=2018-03-28&sr=b&sig=P%2FFJpjf%2BLEx7S1dFRBuU8qtFkiZeIr6K9ASpfp7sQpY%3D&se=2025-08-06T02%3A51%3A43Z&sp=r",

      "https://hzhstorage.blob.core.windows.net/tvcreativefiles/S5P7N9MS.mp4?sv=2018-03-28&sr=b&sig=KBcXqs6nhQ0F4YSciRFbN48ckTLhu3WNCuDvZPJDCKU%3D&se=2025-08-06T02%3A50%3A53Z&sp=r",
    ],
  },
];
