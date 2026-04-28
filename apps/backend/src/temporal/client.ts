import { Client, Connection } from "@temporalio/client";
import { env } from "../config/env";

let temporalClient: Client | undefined;

export async function getTemporalClient(): Promise<Client> {
  if (temporalClient) {
    return temporalClient;
  }

  const connection = await Connection.connect({ address: env.temporalAddress });
  temporalClient = new Client({ connection });
  return temporalClient;
}
