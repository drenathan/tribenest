import { logger } from "@src/utils/logger";
import {
  ExternalOrderDetails,
  ExternalProduct,
  ExternalStore,
  ExternalStoreArgs,
  ExternalStoreDetails,
  ExternalStoreProvider,
  GetShippingCostInput,
  GetShippingCostResult,
} from "./ExternalStore";
import axios, { AxiosError, AxiosInstance } from "axios";
import { ValidationError } from "@src/utils/app_error";
import { uniqBy } from "lodash";

type PrintfulSyncProduct = {
  id: number;
  name: string;
  thumbnail_url: string;
  variants: number;
  is_ignored: boolean;
};
type GetProductsResponse = {
  code: number;
  result: PrintfulSyncProduct[];
};

type GetProductResponse = {
  code: number;
  result: {
    sync_product: PrintfulSyncProduct;
    sync_variants: PrintfulSyncProductVariant[];
  };
};

type PrintfulSyncProductVariant = {
  id: number;
  retail_price: string;
  currency: string;
  size: string;
  color: string;
  name: string;
  is_ignored: boolean;
  availability_status: string;
  files: {
    type: "preview" | "default";
    preview_url: string;
    mime_type: string;
    size: number;
  }[];
};

type PrintfulResponse = {
  code: number;
  result: any;
};

type GetCatalogProductsResponse = {
  data: {
    colors: {
      name: string;
      value: string;
    }[];
  }[];
};

export class ExternalStorePrintful extends ExternalStore {
  public provider = ExternalStoreProvider.Printful;
  private client: AxiosInstance;
  private clientV2: AxiosInstance;

  constructor(args: ExternalStoreArgs) {
    super(args);
    this.client = axios.create({
      baseURL: "https://api.printful.com",
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
      },
    });

    this.clientV2 = axios.create({
      baseURL: "https://api.printful.com/v2",
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
      },
    });
  }

  private async request<T>(requestFunction: () => Promise<any>): Promise<T> {
    try {
      const { data } = await requestFunction();

      return data.result;
    } catch (error) {
      const message = (error as AxiosError<PrintfulResponse>)?.response?.data?.result;
      if (message) {
        error = new ValidationError(`Printful Error: ${message}`);
      }
      logger.error(`Failed to fetch data from Printful: ${error}`);
      throw error;
    }
  }

  public async getProducts(offset = 0, limit = 10): Promise<ExternalProduct[]> {
    const result = await this.request<PrintfulSyncProduct[]>(() =>
      this.client.get<PrintfulSyncProduct[]>("/store/products", {
        params: {
          offset,
          limit,
        },
      }),
    );

    return Promise.all(
      result
        .filter((product) => !product.is_ignored)
        .map(async (product) => {
          const { data: productData } = await this.client.get<GetProductResponse>(`/store/products/${product.id}`);
          return {
            id: product.id.toString(),
            name: product.name,
            coverImage: product.thumbnail_url,
            variants: productData.result.sync_variants
              .filter((variant) => !variant.is_ignored)
              .map((variant) => ({
                id: variant.id.toString(),
                name: variant.name,
                availabilityStatus: variant.availability_status,
                size: variant.size,
                color: variant.color,
                price: Number(variant.retail_price),
                images: variant.files.filter((file) => file.type === "preview").map((file) => file.preview_url),
              })),
          };
        }),
    );
  }

  public async validateAccessToken(): Promise<boolean> {
    const { data } = await this.client.get("/store/products", {
      params: {
        limit: 1,
        offset: 0,
      },
    });
    return data.code === 200;
  }

  public async getStoreDetails(): Promise<ExternalStoreDetails> {
    const result = await this.request<{ name: string; id: number }[]>(() => this.client.get("/stores"));

    if (result.length === 0) {
      throw new ValidationError("Store not found");
    }

    return {
      name: result[0].name,
      externalId: result[0].id.toString(),
    };
  }

  private async getCatalogProducts(
    page = 1,
    previous: GetCatalogProductsResponse["data"] = [],
  ): Promise<GetCatalogProductsResponse["data"]> {
    const limit = 100;
    const offset = (page - 1) * limit;

    const { data } = await this.clientV2.get<GetCatalogProductsResponse>("/catalog-products", {
      params: {
        limit,
        offset,
      },
    });

    previous.push(...data.data);

    if (data.data.length < limit) {
      return previous;
    }

    return this.getCatalogProducts(page + 1, previous);
  }

  public async getDefaults(): Promise<Record<string, any>> {
    const products = await this.getCatalogProducts();
    const colors = uniqBy(
      products.flatMap((item) => item.colors),
      "name",
    );

    return {
      colors,
    };
  }

  public async getShippingCost(input: GetShippingCostInput): Promise<GetShippingCostResult> {
    const result = await this.request<{ retail_costs: { shipping: string }; id: number }>(() =>
      this.client.post("/orders", {
        recipient: {
          name: input.recipient.name,
          address1: input.recipient.address1,
          city: input.recipient.city,
          state_code: input.recipient.stateCode,
          country_code: input.recipient.countryCode,
          zip: input.recipient.zip,
        },
        items: input.items.map((item) => ({
          sync_variant_id: Number(item.productVariantId),
          quantity: item.quantity,
        })),
      }),
    );

    return {
      shippingCost: Number(result.retail_costs.shipping),
      externalId: result.id.toString(),
    };
  }

  public async confirmOrder(orderId: string): Promise<void> {
    const result = await this.request<void>(() => this.client.post(`/orders/${orderId}/confirm`));
    return result;
  }

  public async getOrderDetails(orderId: string): Promise<ExternalOrderDetails> {
    console.log(`/orders/${orderId}`, "orders");
    const result = await this.request<ExternalOrderDetails>(() => this.client.get(`/orders/${orderId}`));
    return result;
  }

  public async setupWebhook(webhookUrl: string): Promise<void> {
    const result = await this.request<void>(() =>
      this.client.post("/webhooks", {
        url: webhookUrl,
        types: ["order_failed", "order_canceled", "order_updated"],
      }),
    );
    return result;
  }
}
