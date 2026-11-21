declare module "midtrans-client" {
  interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionParameter {
    transaction_details: {
      order_id: string;
      gross_amount: number;
    };
    item_details?: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
    customer_details?: {
      first_name?: string;
      email?: string;
    };
    expiry?: {
      unit: string;
      duration: number;
    };
  }

  interface TransactionResponse {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(options: SnapOptions);
    createTransaction(parameter: TransactionParameter): Promise<TransactionResponse>;
  }

  const midtransClient: { Snap: typeof Snap };
  export default midtransClient;
}
